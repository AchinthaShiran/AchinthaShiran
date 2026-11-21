/**
 * Glue between the paintball simulation, the stores, the world and the player (ADR-007).
 * Everything here is optional play: nothing in the portfolio depends on it.
 */
import { playSfx } from '@/audio/sfx';
import { camera as cameraState, player, requestTeleport } from '@/engine/playerState';
import type { Vec3 } from '@/engine/math';
import { interactWith, world } from '@/game/actions';
import { useGameStats } from '@/state/paint';
import { isUiBlocking, useUi } from '@/state/ui';
import { marchRay, MAX_RANGE, raySphere } from './ballistics';
import { type BadgeFacts, evaluateBadges, getBadge } from './badges';
import { GAME_INFO, type GameId } from './config';
import { placeHuntSpots } from './huntTargets';
import { PaintSim, type GameResult, type SimEvent } from './sim';

const col = world.collision;
const arenaZone = world.zone('arena');

/** Session-only facts for badge rules (streaks reset on reload). */
const session = { streak: 0, longestHit: 0 };

function landmarkAt(x: number, y: number, z: number): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const lm of world.interactables) {
    if (y < lm.y - 0.2 || y > lm.y + lm.height + 0.5) continue;
    const d = Math.hypot(x - lm.x, z - lm.z);
    if (d <= lm.interactRadius - 2.0 && d < bestD) {
      bestD = d;
      best = lm.id;
    }
  }
  return best;
}

export const sim = new PaintSim(
  {
    world: {
      topAt: (x, z) => col.topAt(x, z),
      obstacleAt: (x, y, z, m) => col.obstacleAt(x, y, z, m),
      move: (x, z, y, dx, dz, out) => col.move(x, z, y, dx, dz, out),
      groundAt: (x, z, y) => col.groundAt(x, z, y),
      landmarkAt,
    },
    arena: { x: arenaZone.x, y: arenaZone.y, z: arenaZone.z, radius: arenaZone.def.radius },
    huntSpots: placeHuntSpots(world),
    random: Math.random,
  },
  handleEvent,
);

/** Timestamp of the last shot, for the gun's recoil animation. */
export const recoil = { at: 0 };

const stats = () => useGameStats.getState();

function facts(extra: Partial<BadgeFacts> = {}): BadgeFacts {
  const s = stats();
  return {
    shots: s.shots,
    streak: session.streak,
    longestHit: session.longestHit,
    landmarksShot: s.landmarksShot.length,
    huntFound: s.found.length,
    huntTotal: sim.huntTotal,
    ...extra,
  };
}

function awardBadges(extra: Partial<BadgeFacts> = {}): string[] {
  const earned = evaluateBadges(new Set(stats().badges), facts(extra));
  if (earned.length === 0) return earned;
  stats().award(earned);
  playSfx('collect');
  const first = getBadge(earned[0]!);
  useUi
    .getState()
    .showToast(
      `Badge earned: ${first?.title ?? 'Challenge'}${earned.length > 1 ? ` (+${earned.length - 1})` : ''}`,
    );
  return earned;
}

function finishGame(result: GameResult): void {
  if (result.outcome === 'aborted') {
    stats().setHud(null);
    return;
  }
  const { best, bestScore } = stats().recordBest(result.game, result.score);
  const extra: Partial<BadgeFacts> =
    result.game === 'gallery'
      ? {
          gallery: {
            score: result.score,
            shots: result.shots,
            hits: result.hits,
            bullseyes: result.bullseyes,
          },
        }
      : result.game === 'arena'
        ? { arena: { outcome: result.outcome, hitsTaken: result.hitsTaken } }
        : {};
  const newBadges = awardBadges(extra);
  stats().setHud(null);
  stats().showResult({ result, best, bestScore, newBadges });
  if (result.game === 'arena' && result.outcome === 'lost') {
    // "Painted out": back to the arena gate. No lasting penalty.
    const spawn = world.zoneSpawn('arena');
    requestTeleport(spawn, spawn.yaw);
  }
}

function handleEvent(e: SimEvent): void {
  switch (e.type) {
    case 'shot':
      playSfx('shot');
      stats().addShot();
      recoil.at = performance.now();
      awardBadges();
      break;
    case 'splat':
      playSfx('splat');
      break;
    case 'target-hit':
      playSfx('target');
      session.streak++;
      session.longestHit = Math.max(session.longestHit, e.distance);
      if (e.spotId) stats().markFound(e.spotId);
      awardBadges();
      break;
    case 'miss':
      session.streak = 0;
      break;
    case 'landmark-hit':
      // Shooting an exhibit opens it, but never while a game is running.
      if (!sim.game) {
        stats().markLandmark(e.id);
        interactWith(e.id);
        awardBadges();
      }
      break;
    case 'bot-hit':
      playSfx('splat');
      break;
    case 'bot-down':
      playSfx('bot');
      break;
    case 'player-hit':
      playSfx('hit');
      stats().flashHit();
      break;
    case 'wave':
      useUi.getState().showToast(`Wave ${e.wave}!`);
      break;
    case 'game-start':
      session.streak = 0;
      stats().showResult(null);
      break;
    case 'game-end':
      finishGame(e.result);
      break;
  }
}

/* ------------------------------------------------------------------ actions */

export function setPaintMode(on: boolean): void {
  if (stats().mode === on) return;
  stats().setMode(on);
  if (on) {
    useUi.getState().showToast('Paintball gun ready: click or tap to shoot. Press F to put it away.');
  } else {
    sim.stopGame('aborted');
    stats().setHud(null);
  }
}

export const togglePaintMode = (): void => setPaintMode(!stats().mode);

/** Starts a game. Arena games need the player to be on the Splat Arena island. */
export function startGame(id: GameId): boolean {
  if (GAME_INFO[id].needsArena && player.zoneId !== 'arena') {
    useUi.getState().showToast('Head to the Splat Arena first.');
    return false;
  }
  setPaintMode(true);
  if (GAME_INFO[id].needsArena) {
    // Take position at the arena centre, facing the firing range (gallery) or north (bots).
    const theta = id === 'gallery' ? (135 * Math.PI) / 180 : 0;
    requestTeleport(world.zoneSpawn('arena'), -theta - Math.PI);
  }
  if (id === 'hunt' && stats().found.length >= sim.huntTotal) stats().resetHunt();
  sim.setFound(stats().found);
  stats().showResult(null);
  useUi.getState().closePanel();
  sim.startGame(id);
  return true;
}

export const stopGame = (): void => sim.stopGame('aborted');

/** Fires toward the point a camera ray hits (targets and bots first, then the world). */
export function shootRay(origin: Vec3, dir: Vec3): void {
  if (!stats().mode) return;
  let limit = MAX_RANGE;
  for (const t of sim.targets) {
    if (t.dead) continue;
    const d = raySphere(origin, dir, t, t.r + 0.15);
    if (d !== null && d < limit) limit = d;
  }
  for (const b of sim.bots) {
    if (b.dead) continue;
    const d = raySphere(origin, dir, { x: b.x, y: b.y + 1, z: b.z }, 0.95);
    if (d !== null && d < limit) limit = d;
  }
  const hit = marchRay(
    { topAt: (x, z) => col.topAt(x, z), obstacleAt: (x, y, z) => col.obstacleAt(x, y, z) },
    origin,
    dir,
    limit,
  );
  const t = hit.kind === 'none' ? limit : hit.t;
  const aim = { x: origin.x + dir.x * t, y: origin.y + dir.y * t, z: origin.z + dir.z * t };
  // Face the target and shoot from the gun hand.
  const yaw = Math.atan2(aim.x - player.x, aim.z - player.z);
  player.yaw = yaw;
  const muzzle = {
    x: player.x + Math.sin(yaw) * 0.7,
    y: player.y + 1.25,
    z: player.z + Math.cos(yaw) * 0.7,
  };
  sim.fire(muzzle, aim);
}

/** Closest-unfound-target hint for the hunt HUD. */
function huntHint(): string | null {
  const spot = sim.nearestUnfound(player);
  return spot
    ? `Nearest target: ${world.zone(spot.zoneId as Parameters<typeof world.zone>[0]).def.name}`
    : null;
}

let hudTimer = 0;

/** Per-frame update. The game pauses while a panel or menu is open. */
export function tickPaint(dt: number): void {
  if (!isUiBlocking()) sim.update(dt, player);
  if (sim.game && sim.game.id !== 'hunt' && player.zoneId !== 'arena') sim.stopGame('aborted');
  hudTimer += dt;
  if (hudTimer < 0.1) return;
  hudTimer = 0;
  const snap = sim.snapshot();
  stats().setHud(snap ? { ...snap, hint: snap.id === 'hunt' ? huntHint() : null } : null);
}

// Development-only hook for browser tests; removed from production builds.
if (import.meta.env.DEV) {
  Object.assign(window, {
    __paint: {
      sim,
      player,
      camera: cameraState,
      shootAt: (x: number, y: number, z: number) =>
        sim.fire({ x: player.x, y: player.y + 1.25, z: player.z }, { x, y, z }),
    },
  });
}
