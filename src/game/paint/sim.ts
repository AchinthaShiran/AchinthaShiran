/**
 * Paintball simulation (ADR-007): balls, targets, paint-bots and the three games. Plain data in, plain data
 * out - no rendering - so it is fully unit-testable. The scene mirrors `PaintSim` state each frame.
 */
import type { Vec3 } from '@/engine/math';
import {
  BALL_SPEED,
  BOT_BALL_SPEED,
  GRAVITY,
  launchVelocity,
  segmentSphere,
  type WorldProbe,
} from './ballistics';
import {
  ARENA_WAVES,
  BOT_COLOR,
  BOT_HP,
  GALLERY_MAX_TARGETS,
  GALLERY_SECONDS,
  MAX_BALLS,
  MAX_SPLATS,
  METER_DRAIN_SECONDS,
  METER_MAX,
  SPLAT_COLORS,
  type GameId,
} from './config';

export type { GameId } from './config';
export type Outcome = 'finished' | 'won' | 'lost' | 'aborted';

export interface SimWorld extends WorldProbe {
  move(x: number, z: number, y: number, dx: number, dz: number, out: { x: number; z: number }): boolean;
  groundAt(x: number, z: number, y: number): number | null;
  /** Interactive landmark whose body contains the point, if any. */
  landmarkAt(x: number, y: number, z: number): string | null;
}

export interface HuntSpot {
  readonly id: string;
  readonly zoneId: string;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface SimEnv {
  world: SimWorld;
  arena: { x: number; y: number; z: number; radius: number };
  huntSpots: readonly HuntSpot[];
  random: () => number;
}

export interface Ball {
  id: number;
  owner: 'player' | 'bot';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  /** Distance flown so far, in metres. */
  dist: number;
  color: number;
}

export interface Splat {
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
  size: number;
  color: number;
  age: number;
}

export interface Burst {
  x: number;
  y: number;
  z: number;
  color: number;
  age: number;
}

export interface Target {
  id: number;
  kind: 'gallery' | 'hunt';
  x: number;
  y: number;
  z: number;
  r: number;
  ttl: number;
  dead: boolean;
  deadT: number;
  spotId?: string;
  slide?: { cx: number; cz: number; tx: number; tz: number; amp: number; speed: number; phase: number };
}

export interface Bot {
  id: number;
  x: number;
  y: number;
  z: number;
  hp: number;
  cooldown: number;
  strafe: number;
  yaw: number;
  flash: number;
  dead: boolean;
  deadT: number;
  speed: number;
}

export interface GameState {
  id: GameId;
  time: number;
  score: number;
  shots: number;
  hits: number;
  bullseyes: number;
  wave: number;
  waveBreak: number;
  hitsTaken: number;
  meter: number;
  meterTimer: number;
  spawnTimer: number;
  found: number;
  total: number;
}

export interface GameSnapshot {
  id: GameId;
  score: number;
  /** Seconds left; null for untimed games. */
  timeLeft: number | null;
  wave: number;
  waves: number;
  bots: number;
  meter: number;
  found: number;
  total: number;
  shots: number;
  hits: number;
}

export interface GameResult {
  game: GameId;
  outcome: Outcome;
  score: number;
  shots: number;
  hits: number;
  bullseyes: number;
  wave: number;
  hitsTaken: number;
  found: number;
  total: number;
  seconds: number;
}

export type SimEvent =
  | { type: 'shot' }
  | { type: 'splat'; x: number; y: number; z: number }
  | {
      type: 'target-hit';
      kind: 'gallery' | 'hunt';
      points: number;
      bullseye: boolean;
      distance: number;
      spotId?: string;
    }
  | { type: 'miss' }
  | { type: 'landmark-hit'; id: string }
  | { type: 'bot-hit' }
  | { type: 'bot-down'; score: number }
  | { type: 'player-hit'; meter: number }
  | { type: 'wave'; wave: number }
  | { type: 'game-start'; game: GameId }
  | { type: 'game-end'; result: GameResult };

const POP_SECONDS = 0.4;

/** How far the ball's line of flight passes from a point (used for bullseye scoring). */
function lateralMiss(b: Ball, c: Vec3): number {
  const wx = c.x - b.x;
  const wy = c.y - b.y;
  const wz = c.z - b.z;
  const speed = Math.hypot(b.vx, b.vy, b.vz) || 1;
  const vx = b.vx / speed;
  const vy = b.vy / speed;
  const vz = b.vz / speed;
  const along = wx * vx + wy * vy + wz * vz;
  return Math.hypot(wx - along * vx, wy - along * vy, wz - along * vz);
}
const BOT_MUZZLE = 1.25;

export class PaintSim {
  readonly balls: Ball[] = [];
  readonly splats: Splat[] = [];
  readonly bursts: Burst[] = [];
  readonly targets: Target[] = [];
  readonly bots: Bot[] = [];
  game: GameState | null = null;
  /** Bumped whenever a splat is added, so the view can skip redundant uploads. */
  splatVersion = 0;

  private readonly env: SimEnv;
  private readonly emit: (event: SimEvent) => void;
  private nextId = 1;
  private colorIndex = 0;
  private splatHead = 0;
  private found = new Set<string>();
  private readonly out = { x: 0, z: 0 };

  constructor(env: SimEnv, emit: (event: SimEvent) => void) {
    this.env = env;
    this.emit = emit;
  }

  /** Hunt targets the visitor has already found (persisted by the host). */
  setFound(ids: Iterable<string>): void {
    this.found = new Set(ids);
  }

  get huntTotal(): number {
    return this.env.huntSpots.length;
  }

  /** Nearest hunt target not yet found. */
  nearestUnfound(from: Vec3): HuntSpot | undefined {
    let best: HuntSpot | undefined;
    let bestD = Infinity;
    for (const s of this.env.huntSpots) {
      if (this.found.has(s.id)) continue;
      const d = Math.hypot(s.x - from.x, s.z - from.z);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  fire(muzzle: Vec3, aim: Vec3): void {
    if (this.balls.length >= MAX_BALLS) return;
    const v = launchVelocity(muzzle, aim, BALL_SPEED, GRAVITY);
    this.balls.push({
      id: this.nextId++,
      owner: 'player',
      x: muzzle.x,
      y: muzzle.y,
      z: muzzle.z,
      vx: v.x,
      vy: v.y,
      vz: v.z,
      age: 0,
      dist: 0,
      color: this.colorIndex++ % (SPLAT_COLORS.length - 1),
    });
    if (this.game) this.game.shots++;
    this.emit({ type: 'shot' });
  }

  startGame(id: GameId): void {
    if (this.game) this.endGame('aborted');
    this.game = {
      id,
      time: 0,
      score: 0,
      shots: 0,
      hits: 0,
      bullseyes: 0,
      wave: 0,
      waveBreak: 1.5,
      hitsTaken: 0,
      meter: 0,
      meterTimer: 0,
      spawnTimer: 0.4,
      found: 0,
      total: id === 'hunt' ? this.env.huntSpots.length : 0,
    };
    if (id === 'hunt') {
      for (const spot of this.env.huntSpots) {
        if (this.found.has(spot.id)) {
          this.game.found++;
          continue;
        }
        this.targets.push({
          id: this.nextId++,
          kind: 'hunt',
          x: spot.x,
          y: spot.y,
          z: spot.z,
          r: 0.7,
          ttl: Infinity,
          dead: false,
          deadT: 0,
          spotId: spot.id,
        });
      }
    }
    this.emit({ type: 'game-start', game: id });
    if (id === 'hunt' && this.game.found >= this.game.total) this.endGame('won');
  }

  stopGame(outcome: Outcome = 'aborted'): void {
    if (this.game) this.endGame(outcome);
  }

  snapshot(): GameSnapshot | null {
    const g = this.game;
    if (!g) return null;
    return {
      id: g.id,
      score: g.score,
      timeLeft: g.id === 'gallery' ? Math.max(0, GALLERY_SECONDS - g.time) : null,
      wave: g.wave,
      waves: ARENA_WAVES.length,
      bots: this.bots.filter((b) => !b.dead).length,
      meter: g.meter,
      found: g.found,
      total: g.total,
      shots: g.shots,
      hits: g.hits,
    };
  }

  update(dt: number, player: Vec3): void {
    const steps = Math.max(1, Math.ceil(dt / (1 / 90)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      for (let b = this.balls.length - 1; b >= 0; b--) {
        const ball = this.balls[b]!;
        if (this.stepBall(ball, h, player)) this.balls.splice(b, 1);
      }
    }
    this.updateTargets(dt);
    this.updateBots(dt, player);
    this.updateGame(dt, player);
    for (const s of this.splats) s.age += dt;
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const burst = this.bursts[i]!;
      burst.age += dt;
      if (burst.age > POP_SECONDS) this.bursts.splice(i, 1);
    }
  }

  /* ------------------------------------------------------------------ balls */

  private stepBall(b: Ball, dt: number, player: Vec3): boolean {
    const p0 = { x: b.x, y: b.y, z: b.z };
    b.vy -= GRAVITY * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.z += b.vz * dt;
    b.age += dt;
    b.dist += Math.hypot(b.vx, b.vy, b.vz) * dt;
    const p1 = { x: b.x, y: b.y, z: b.z };

    if (b.owner === 'player') {
      for (const t of this.targets) {
        if (t.dead) continue;
        if (segmentSphere(p0, p1, t, t.r)) {
          this.hitTarget(t, lateralMiss(b, t), b);
          return true;
        }
      }
      for (const bot of this.bots) {
        if (bot.dead) continue;
        const hit = segmentSphere(p0, p1, { x: bot.x, y: bot.y + 1, z: bot.z }, 0.9);
        if (hit) {
          this.hitBot(bot, b);
          return true;
        }
      }
    } else if (segmentSphere(p0, p1, { x: player.x, y: player.y + 1, z: player.z }, 0.65)) {
      this.addBurst(b.x, b.y, b.z, b.color);
      this.playerHit();
      return true;
    }

    const world = this.env.world;
    const top = world.topAt(b.x, b.z);
    if (top !== null && b.y <= top + 0.02) {
      this.impact(b, top + 0.03, 0, 1, 0);
      return true;
    }
    if (world.obstacleAt(b.x, b.y, b.z)) {
      const len = Math.hypot(b.vx, b.vz) || 1;
      this.impact(b, b.y, -b.vx / len, 0, -b.vz / len);
      return true;
    }
    if (b.y < -45 || b.age > 8) {
      if (b.owner === 'player') this.missed();
      return true;
    }
    return false;
  }

  private impact(b: Ball, y: number, nx: number, ny: number, nz: number): void {
    const size = b.owner === 'player' ? 0.5 + this.env.random() * 0.5 : 0.35 + this.env.random() * 0.3;
    this.addSplat({ x: b.x, y, z: b.z, nx, ny, nz, size, color: b.color, age: 0 });
    this.emit({ type: 'splat', x: b.x, y, z: b.z });
    if (b.owner !== 'player') return;
    const landmark = this.env.world.landmarkAt(b.x, b.y, b.z);
    if (landmark) this.emit({ type: 'landmark-hit', id: landmark });
    this.missed();
  }

  private missed(): void {
    if (this.game && this.game.id !== 'arena') this.emit({ type: 'miss' });
  }

  private addSplat(s: Splat): void {
    if (this.splats.length < MAX_SPLATS) this.splats.push(s);
    else {
      this.splats[this.splatHead] = s;
      this.splatHead = (this.splatHead + 1) % MAX_SPLATS;
    }
    this.splatVersion++;
  }

  private addBurst(x: number, y: number, z: number, color: number): void {
    this.bursts.push({ x, y, z, color, age: 0 });
    if (this.bursts.length > 24) this.bursts.shift();
  }

  /* ---------------------------------------------------------------- targets */

  private hitTarget(t: Target, dist: number, b: Ball): void {
    t.dead = true;
    t.deadT = 0;
    this.addBurst(t.x, t.y, t.z, b.color);
    const g = this.game;
    if (t.kind === 'gallery') {
      const ratio = dist / t.r;
      const points = ratio < 0.3 ? 3 : ratio < 0.65 ? 2 : 1;
      if (g) {
        g.score += points;
        g.hits++;
        if (points === 3) g.bullseyes++;
      }
      this.emit({ type: 'target-hit', kind: 'gallery', points, bullseye: points === 3, distance: b.dist });
      return;
    }
    if (t.spotId) this.found.add(t.spotId);
    if (g) {
      g.found++;
      g.hits++;
    }
    this.emit({
      type: 'target-hit',
      kind: 'hunt',
      points: 1,
      bullseye: false,
      distance: b.dist,
      spotId: t.spotId,
    });
    if (g && g.found >= g.total) this.endGame('won');
  }

  private updateTargets(dt: number): void {
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i]!;
      if (t.dead) {
        t.deadT += dt;
        if (t.deadT > POP_SECONDS) this.targets.splice(i, 1);
        continue;
      }
      t.ttl -= dt;
      if (t.ttl <= 0) {
        this.targets.splice(i, 1);
        continue;
      }
      if (t.slide) {
        const s = t.slide;
        s.phase += s.speed * dt;
        const off = Math.sin(s.phase) * s.amp;
        t.x = s.cx + s.tx * off;
        t.z = s.cz + s.tz * off;
      }
    }
  }

  private spawnGalleryTarget(): void {
    const { arena, random } = this.env;
    for (let attempt = 0; attempt < 12; attempt++) {
      // The firing range fills the south-east of the arena, opposite the booth.
      const a = ((100 + random() * 70) * Math.PI) / 180;
      const r = 13 + random() * 6;
      const x = arena.x + Math.sin(a) * r;
      const z = arena.z - Math.cos(a) * r;
      const y = arena.y + 0.9 + random() * 1.3;
      if (this.targets.some((t) => !t.dead && Math.hypot(t.x - x, t.z - z) < 2.4)) continue;
      const slide = random() < 0.4;
      // Slide along the tangent of the arc.
      const tx = Math.cos(a);
      const tz = Math.sin(a);
      this.targets.push({
        id: this.nextId++,
        kind: 'gallery',
        x,
        y,
        z,
        r: 0.7,
        ttl: 2.6 + random() * 1.6,
        dead: false,
        deadT: 0,
        slide: slide
          ? { cx: x, cz: z, tx, tz, amp: 2.4, speed: 1.4 + random() * 0.8, phase: random() * Math.PI * 2 }
          : undefined,
      });
      return;
    }
  }

  /* ------------------------------------------------------------------- bots */

  private spawnBots(count: number, player: Vec3): void {
    const { arena, random, world } = this.env;
    for (let i = 0; i < count; i++) {
      let x = arena.x;
      let z = arena.z;
      for (let attempt = 0; attempt < 10; attempt++) {
        const a = random() * Math.PI * 2;
        const r = 9 + random() * (arena.radius - 13);
        x = arena.x + Math.sin(a) * r;
        z = arena.z - Math.cos(a) * r;
        if (Math.hypot(x - player.x, z - player.z) >= 10 && !world.obstacleAt(x, arena.y + 0.5, z)) break;
      }
      this.bots.push({
        id: this.nextId++,
        x,
        y: arena.y,
        z,
        hp: BOT_HP,
        cooldown: 1.6 + random() * 1.6,
        strafe: random() < 0.5 ? -1 : 1,
        yaw: 0,
        flash: 0,
        dead: false,
        deadT: 0,
        speed: 2 + random() * 0.8,
      });
    }
  }

  private hitBot(bot: Bot, b: Ball): void {
    bot.hp--;
    bot.flash = 0.25;
    this.addBurst(b.x, b.y, b.z, b.color);
    this.emit({ type: 'bot-hit' });
    if (bot.hp > 0) return;
    bot.dead = true;
    bot.deadT = 0;
    const g = this.game;
    if (g) {
      g.score += 100;
      g.hits++;
    }
    this.emit({ type: 'bot-down', score: 100 });
  }

  private updateBots(dt: number, player: Vec3): void {
    const { arena, world, random } = this.env;
    const maxR = arena.radius - 2.5;
    for (let i = this.bots.length - 1; i >= 0; i--) {
      const bot = this.bots[i]!;
      if (bot.dead) {
        bot.deadT += dt;
        if (bot.deadT > POP_SECONDS) this.bots.splice(i, 1);
        continue;
      }
      bot.flash = Math.max(0, bot.flash - dt);
      const dx = player.x - bot.x;
      const dz = player.z - bot.z;
      const d = Math.hypot(dx, dz) || 1;
      bot.yaw = Math.atan2(dx, dz);
      let mx: number;
      let mz: number;
      if (d > 11) {
        mx = dx / d;
        mz = dz / d;
      } else if (d < 6) {
        mx = -dx / d;
        mz = -dz / d;
      } else {
        mx = (-dz / d) * bot.strafe;
        mz = (dx / d) * bot.strafe;
      }
      world.move(bot.x, bot.z, bot.y, mx * bot.speed * dt, mz * bot.speed * dt, this.out);
      bot.x = this.out.x;
      bot.z = this.out.z;
      const cx = bot.x - arena.x;
      const cz = bot.z - arena.z;
      const dc = Math.hypot(cx, cz);
      if (dc > maxR) {
        bot.x = arena.x + (cx / dc) * maxR;
        bot.z = arena.z + (cz / dc) * maxR;
        bot.strafe = -bot.strafe;
      }
      bot.y = world.groundAt(bot.x, bot.z, bot.y) ?? bot.y;

      bot.cooldown -= dt;
      if (bot.cooldown <= 0 && d < 34) {
        bot.cooldown = 2.4 + random() * 1.4;
        const from = { x: bot.x, y: bot.y + BOT_MUZZLE, z: bot.z };
        const to = {
          x: player.x + (random() - 0.5) * 2.4,
          y: player.y + 1 + (random() - 0.5) * 1.2,
          z: player.z + (random() - 0.5) * 2.4,
        };
        const v = launchVelocity(from, to, BOT_BALL_SPEED, GRAVITY);
        this.balls.push({
          id: this.nextId++,
          owner: 'bot',
          ...from,
          vx: v.x,
          vy: v.y,
          vz: v.z,
          age: 0,
          dist: 0,
          color: BOT_COLOR,
        });
      }
    }
  }

  private playerHit(): void {
    const g = this.game;
    if (!g || g.id !== 'arena') return;
    g.hitsTaken++;
    g.meter++;
    g.meterTimer = 0;
    this.emit({ type: 'player-hit', meter: g.meter });
    if (g.meter >= METER_MAX) this.endGame('lost');
  }

  /* ------------------------------------------------------------------ games */

  private updateGame(dt: number, player: Vec3): void {
    const g = this.game;
    if (!g) return;
    g.time += dt;
    if (g.id === 'gallery') {
      if (g.time >= GALLERY_SECONDS) {
        this.endGame('finished');
        return;
      }
      g.spawnTimer -= dt;
      const alive = this.targets.filter((t) => !t.dead).length;
      if (g.spawnTimer <= 0 && alive < GALLERY_MAX_TARGETS) {
        this.spawnGalleryTarget();
        g.spawnTimer = 0.6 + this.env.random() * 0.7;
      }
    } else if (g.id === 'arena') {
      g.meterTimer += dt;
      if (g.meter > 0 && g.meterTimer > METER_DRAIN_SECONDS) {
        g.meter--;
        g.meterTimer = 0;
      }
      if (this.bots.every((b) => b.dead)) {
        g.waveBreak -= dt;
        if (g.waveBreak <= 0) {
          if (g.wave >= ARENA_WAVES.length) {
            this.endGame('won');
            return;
          }
          g.wave++;
          this.spawnBots(ARENA_WAVES[g.wave - 1] ?? 3, player);
          g.waveBreak = 2.5;
          if (g.wave > 1) g.score += 150;
          this.emit({ type: 'wave', wave: g.wave });
        }
      }
    }
  }

  private endGame(outcome: Outcome): void {
    const g = this.game;
    if (!g) return;
    this.game = null;
    if (g.id === 'arena' && outcome === 'won') g.score += 150 + (g.hitsTaken === 0 ? 300 : 0);
    this.targets.length = 0;
    this.bots.length = 0;
    this.emit({
      type: 'game-end',
      result: {
        game: g.id,
        outcome,
        score: g.score,
        shots: g.shots,
        hits: g.hits,
        bullseyes: g.bullseyes,
        wave: g.wave,
        hitsTaken: g.hitsTaken,
        found: g.found,
        total: g.total,
        seconds: g.time,
      },
    });
  }
}
