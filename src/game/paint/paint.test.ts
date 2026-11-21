import { describe, expect, it } from 'vitest';
import { createRng } from '@/engine/math';
import {
  BALL_SPEED,
  GRAVITY,
  launchVelocity,
  marchRay,
  raySphere,
  segmentSphere,
  type WorldProbe,
} from './ballistics';
import { BADGES, evaluateBadges, type BadgeFacts } from './badges';
import { GALLERY_SECONDS, METER_MAX } from './config';
import { PaintSim, type GameResult, type HuntSpot, type SimEvent, type SimWorld } from './sim';

/** Flat island of radius 30 centred on the origin; optional wall obstacle. */
const flat: WorldProbe = {
  topAt: (x, z) => (Math.hypot(x, z) <= 30 ? 0 : null),
  obstacleAt: () => false,
};

const wallAt = (wx: number): WorldProbe => ({
  topAt: flat.topAt,
  obstacleAt: (x, y) => Math.abs(x - wx) < 0.5 && y < 4,
});

describe('ballistics', () => {
  it('marches a downward ray onto the ground', () => {
    const hit = marchRay(flat, { x: 0, y: 5, z: 0 }, { x: 0, y: -1, z: 0 }, 20);
    expect(hit.kind).toBe('ground');
    expect(hit.t).toBeCloseTo(5, 1);
  });

  it('stops a horizontal ray at an obstacle and reports none over open air', () => {
    const wall = marchRay(wallAt(10), { x: 0, y: 1, z: 0 }, { x: 1, y: 0, z: 0 }, 30);
    expect(wall.kind).toBe('obstacle');
    expect(wall.t).toBeCloseTo(9.5, 0);
    expect(marchRay(flat, { x: 0, y: 3, z: 0 }, { x: 1, y: 0, z: 0 }, 20).kind).toBe('none');
  });

  it('intersects rays with spheres', () => {
    expect(raySphere({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }, 1)).toBeCloseTo(9);
    expect(raySphere({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 10, y: 5, z: 0 }, 1)).toBeNull();
    expect(raySphere({ x: 0, y: 0, z: 0 }, { x: -1, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }, 1)).toBeNull();
  });

  it('detects a segment passing through a sphere and reports the closest approach', () => {
    const c = { x: 5, y: 0, z: 0 };
    const hit = segmentSphere({ x: 0, y: 0.3, z: 0 }, { x: 10, y: 0.3, z: 0 }, c, 1);
    expect(hit?.dist).toBeCloseTo(0.3);
    expect(segmentSphere({ x: 0, y: 2, z: 0 }, { x: 10, y: 2, z: 0 }, c, 1)).toBeNull();
  });

  it('launches balls that land on the aim point despite gravity', () => {
    for (const to of [
      { x: 12, y: 1.5, z: 4 },
      { x: -20, y: 2, z: 15 },
      { x: 3, y: 0.5, z: -28 },
    ]) {
      const from = { x: 0, y: 1.2, z: 0 };
      const v = launchVelocity(from, to, BALL_SPEED, GRAVITY);
      const p = { ...from };
      const vel = { ...v };
      const dt = 1 / 240;
      const total = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z) / BALL_SPEED;
      for (let t = 0; t < total; t += dt) {
        vel.y -= GRAVITY * dt;
        p.x += vel.x * dt;
        p.y += vel.y * dt;
        p.z += vel.z * dt;
      }
      expect(Math.hypot(p.x - to.x, p.y - to.y, p.z - to.z)).toBeLessThan(0.35);
    }
  });
});

describe('badges', () => {
  const base: BadgeFacts = {
    shots: 0,
    streak: 0,
    longestHit: 0,
    landmarksShot: 0,
    huntFound: 0,
    huntTotal: 13,
  };
  const earn = (f: Partial<BadgeFacts>, have: string[] = []) =>
    evaluateBadges(new Set(have), { ...base, ...f });

  it('has unique ids', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });

  it('grants trick-shot badges from session facts', () => {
    expect(earn({ shots: 1 })).toEqual(['first-splat']);
    expect(earn({ streak: 3 })).toEqual(['streak-3']);
    expect(earn({ longestHit: 30.5 })).toEqual(['long-shot']);
    expect(earn({ landmarksShot: 3 })).toEqual(['landmark-painter']);
    expect(earn({ longestHit: 30 })).toEqual([]);
  });

  it('grants gallery badges only when a round ends, with accuracy needing enough shots', () => {
    const gallery = (score: number, shots: number, hits: number, bullseyes = 0) =>
      earn({ gallery: { score, shots, hits, bullseyes } });
    expect(gallery(15, 20, 8)).toEqual(['gallery-bronze']);
    expect(gallery(30, 10, 7, 3).sort()).toEqual([
      'bullseye',
      'gallery-bronze',
      'gallery-gold',
      'sharpshooter',
    ]);
    expect(gallery(5, 4, 4)).toEqual([]); // perfect but under 10 shots
  });

  it('grants arena badges only on a win', () => {
    expect(earn({ arena: { outcome: 'won', hitsTaken: 2 } })).toEqual(['arena-cleared']);
    expect(earn({ arena: { outcome: 'won', hitsTaken: 0 } }).sort()).toEqual([
      'arena-cleared',
      'untouchable',
    ]);
    expect(earn({ arena: { outcome: 'lost', hitsTaken: 0 } })).toEqual([]);
  });

  it('grants the hunter badge once every target is found, and never twice', () => {
    expect(earn({ huntFound: 13 })).toEqual(['hunter']);
    expect(earn({ huntFound: 12 })).toEqual([]);
    expect(earn({ shots: 5 }, ['first-splat'])).toEqual([]);
  });
});

describe('paint simulation', () => {
  const spots: HuntSpot[] = [
    { id: 'hunt-a', zoneId: 'a', x: 10, y: 1.5, z: 0 },
    { id: 'hunt-b', zoneId: 'b', x: -10, y: 1.5, z: 0 },
  ];

  function setup(world: SimWorld = flatWorld(), seed = 1) {
    const events: SimEvent[] = [];
    const sim = new PaintSim(
      { world, arena: { x: 0, y: 0, z: 0, radius: 22 }, huntSpots: spots, random: createRng(seed) },
      (e) => events.push(e),
    );
    return { sim, events };
  }
  const player = { x: 0, y: 0, z: 0 };
  const of = (events: SimEvent[], type: SimEvent['type']) => events.filter((e) => e.type === type);
  const run = (sim: PaintSim, seconds: number, dt = 1 / 30) => {
    for (let t = 0; t < seconds; t += dt) sim.update(dt, player);
  };
  const muzzle = { x: 0, y: 1.25, z: 0 };

  function flatWorld(extra: Partial<SimWorld> = {}): SimWorld {
    return {
      ...flat,
      move: (x, z, _y, dx, dz, out) => {
        out.x = x + dx;
        out.z = z + dz;
        return true;
      },
      groundAt: () => 0,
      landmarkAt: () => null,
      ...extra,
    };
  }

  it('splats on the ground and reports a miss during a gallery round', () => {
    const { sim, events } = setup();
    sim.startGame('gallery');
    sim.fire(muzzle, { x: 5, y: 0, z: 10 });
    run(sim, 1.5);
    expect(sim.splats.length).toBe(1);
    expect(of(events, 'splat')).toHaveLength(1);
    expect(of(events, 'miss')).toHaveLength(1);
    expect(sim.balls).toHaveLength(0);
  });

  it('scores gallery targets by ring and removes them after the pop animation', () => {
    const { sim, events } = setup();
    sim.startGame('gallery');
    sim.targets.length = 0;
    sim.targets.push({
      id: 99,
      kind: 'gallery',
      x: 8,
      y: 1.25,
      z: 0,
      r: 0.7,
      ttl: 10,
      dead: false,
      deadT: 0,
    });
    sim.fire(muzzle, { x: 8, y: 1.25, z: 0 }); // dead centre
    run(sim, 0.6);
    const hit = of(events, 'target-hit')[0];
    expect(hit).toMatchObject({ kind: 'gallery', points: 3, bullseye: true });
    expect(sim.game?.score).toBe(3);
    expect(sim.game?.bullseyes).toBe(1);
    expect(sim.targets.find((t) => t.id === 99)).toBeUndefined();
  });

  it('gives fewer points for edge hits', () => {
    const { sim, events } = setup();
    sim.startGame('gallery');
    sim.targets.length = 0;
    sim.targets.push({ id: 7, kind: 'gallery', x: 8, y: 1.25, z: 0, r: 0.7, ttl: 10, dead: false, deadT: 0 });
    sim.fire(muzzle, { x: 8, y: 1.25, z: 0.55 }); // near the rim
    run(sim, 0.6);
    expect(of(events, 'target-hit')[0]).toMatchObject({ points: 1, bullseye: false });
  });

  it('spawns a bounded number of gallery targets and ends the round on time', () => {
    const { sim, events } = setup();
    sim.startGame('gallery');
    let peak = 0;
    for (let t = 0; t < GALLERY_SECONDS + 1; t += 1 / 30) {
      sim.update(1 / 30, player);
      peak = Math.max(peak, sim.targets.filter((x) => !x.dead).length);
    }
    expect(peak).toBeGreaterThan(0);
    expect(peak).toBeLessThanOrEqual(4);
    const end = of(events, 'game-end')[0] as { result: GameResult } | undefined;
    expect(end?.result.outcome).toBe('finished');
    expect(sim.game).toBeNull();
    expect(sim.targets).toHaveLength(0);
  });

  it('runs the hunt: paints every remaining target, remembers finds and wins', () => {
    const { sim, events } = setup();
    sim.setFound(['hunt-b']);
    sim.startGame('hunt');
    expect(sim.targets.map((t) => t.spotId)).toEqual(['hunt-a']);
    expect(sim.game).toMatchObject({ found: 1, total: 2 });
    sim.fire(muzzle, { x: 10, y: 1.5, z: 0 });
    run(sim, 0.8);
    expect(of(events, 'target-hit')[0]).toMatchObject({ kind: 'hunt', spotId: 'hunt-a' });
    const end = of(events, 'game-end')[0] as { result: GameResult };
    expect(end.result).toMatchObject({ game: 'hunt', outcome: 'won', found: 2, total: 2 });
  });

  it('finds the nearest unfound hunt target', () => {
    const { sim } = setup();
    sim.setFound([]);
    expect(sim.nearestUnfound({ x: 8, y: 0, z: 0 })?.id).toBe('hunt-a');
    sim.setFound(['hunt-a']);
    expect(sim.nearestUnfound({ x: 8, y: 0, z: 0 })?.id).toBe('hunt-b');
  });

  it('only creates enemies while the arena game runs, and removes them when it stops', () => {
    const { sim } = setup();
    run(sim, 3);
    expect(sim.bots).toHaveLength(0);
    sim.startGame('arena');
    run(sim, 3);
    expect(sim.bots.length).toBeGreaterThan(0);
    sim.stopGame();
    expect(sim.bots).toHaveLength(0);
    run(sim, 5);
    expect(sim.bots).toHaveLength(0);
  });

  it('keeps bots on the arena island', () => {
    const { sim } = setup();
    sim.startGame('arena');
    for (let t = 0; t < 40; t += 1 / 30) {
      sim.update(1 / 30, { x: 21, y: 0, z: 0 });
      for (const b of sim.bots) expect(Math.hypot(b.x, b.z)).toBeLessThanOrEqual(19.6);
    }
  });

  it('paints the player out after enough hits, ending the arena game as lost', () => {
    const { sim, events } = setup(flatWorld(), 3);
    sim.startGame('arena');
    // A stationary player is eventually hit by the bots' slow paint balls.
    for (let t = 0; t < 600 && sim.game; t += 1 / 30) sim.update(1 / 30, player);
    const hits = of(events, 'player-hit');
    expect(hits.length).toBeGreaterThanOrEqual(METER_MAX);
    const end = of(events, 'game-end')[0] as { result: GameResult };
    expect(end.result).toMatchObject({ game: 'arena', outcome: 'lost' });
    expect(end.result.hitsTaken).toBeGreaterThanOrEqual(METER_MAX);
  });

  it('lets the player clear a wave of bots with two hits each and win the arena', () => {
    const { sim, events } = setup(flatWorld(), 5);
    sim.startGame('arena');
    // Cheat-aim at each bot: fire straight at its chest until the game ends.
    for (let t = 0; t < 400 && sim.game; t += 1 / 30) {
      sim.update(1 / 30, player);
      const bot = sim.bots.find((b) => !b.dead);
      if (bot && sim.balls.filter((b) => b.owner === 'player').length < 2) {
        sim.fire(muzzle, { x: bot.x, y: bot.y + 1, z: bot.z });
      }
    }
    const end = of(events, 'game-end')[0] as { result: GameResult } | undefined;
    expect(end?.result.game).toBe('arena');
    expect(['won', 'lost']).toContain(end?.result.outcome);
    expect(of(events, 'bot-down').length).toBeGreaterThan(0);
  });

  it('reports shooting a landmark', () => {
    const { sim, events } = setup(flatWorld({ landmarkAt: (x) => (x > 5 ? 'lm-1' : null) }));
    sim.fire(muzzle, { x: 9, y: 0, z: 0 });
    run(sim, 1);
    expect(of(events, 'landmark-hit')[0]).toEqual({ type: 'landmark-hit', id: 'lm-1' });
  });

  it('stops balls on obstacles with a vertical splat', () => {
    const { sim } = setup(flatWorld({ ...wallAt(8) }));
    sim.fire({ x: 0, y: 1.25, z: 0 }, { x: 12, y: 1.25, z: 0 });
    run(sim, 1);
    expect(sim.splats).toHaveLength(1);
    expect(sim.splats[0]!.ny).toBe(0);
    expect(sim.splats[0]!.nx).toBeLessThan(0);
  });

  it('caps the number of balls in flight', () => {
    const { sim } = setup();
    for (let i = 0; i < 200; i++) sim.fire(muzzle, { x: 20, y: 5, z: 20 });
    expect(sim.balls.length).toBeLessThanOrEqual(48);
  });
});
