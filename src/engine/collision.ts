/**
 * 2.5D walkable-surface collision (ADR-003).
 *
 * - Surfaces (discs and sloped strips) define where the player may stand. Leaving all surfaces is
 *   impossible, so the player can never fall off an island.
 * - A containing surface higher than `stepUp` above the player's feet acts as a wall (mountain tiers).
 * - Obstacles (circles / oriented boxes) push the player out so buildings cannot be walked through.
 */
import { clamp, type Vec2 } from './math';

export interface DiscSurface {
  readonly kind: 'disc';
  readonly cx: number;
  readonly cz: number;
  readonly r: number;
  readonly y: number;
}

export interface StripSurface {
  readonly kind: 'strip';
  readonly ax: number;
  readonly az: number;
  readonly bx: number;
  readonly bz: number;
  readonly halfWidth: number;
  readonly ay: number;
  readonly by: number;
}

export type Surface = DiscSurface | StripSurface;

export interface CircleObstacle {
  readonly kind: 'circle';
  readonly x: number;
  readonly z: number;
  readonly r: number;
  readonly y0: number;
  readonly y1: number;
}

/** Oriented box: half extents along its local X (hw) and Z (hd), rotated by `rot` around Y. */
export interface BoxObstacle {
  readonly kind: 'box';
  readonly x: number;
  readonly z: number;
  readonly hw: number;
  readonly hd: number;
  readonly rot: number;
  readonly y0: number;
  readonly y1: number;
}

export type Obstacle = CircleObstacle | BoxObstacle;

export interface CollisionOptions {
  readonly stepUp: number;
  readonly playerRadius: number;
  readonly playerHeight: number;
}

export const DEFAULT_COLLISION: CollisionOptions = { stepUp: 0.65, playerRadius: 0.45, playerHeight: 1.7 };

/** Height of `s` at (x, z), or null when the point lies outside the surface. */
export function surfaceHeightAt(s: Surface, x: number, z: number): number | null {
  if (s.kind === 'disc') {
    const dx = x - s.cx;
    const dz = z - s.cz;
    return dx * dx + dz * dz <= s.r * s.r ? s.y : null;
  }
  const abx = s.bx - s.ax;
  const abz = s.bz - s.az;
  const len2 = abx * abx + abz * abz;
  if (len2 === 0) return null;
  const t = ((x - s.ax) * abx + (z - s.az) * abz) / len2;
  if (t < 0 || t > 1) return null;
  const px = s.ax + abx * t - x;
  const pz = s.az + abz * t - z;
  if (px * px + pz * pz > s.halfWidth * s.halfWidth) return null;
  return s.ay + (s.by - s.ay) * t;
}

export class CollisionWorld {
  readonly surfaces: readonly Surface[];
  readonly obstacles: readonly Obstacle[];
  readonly options: CollisionOptions;
  private readonly scratch: Vec2 = { x: 0, z: 0 };

  constructor(surfaces: readonly Surface[], obstacles: readonly Obstacle[], options = DEFAULT_COLLISION) {
    this.surfaces = surfaces;
    this.obstacles = obstacles;
    this.options = options;
  }

  /**
   * Ground height under (x, z) for feet at height `y`: the highest surface reachable within step height.
   * Returns null if no surface contains the point, or a higher containing surface blocks it (a wall).
   */
  groundAt(x: number, z: number, y: number): number | null {
    let best = -Infinity;
    for (const s of this.surfaces) {
      const h = surfaceHeightAt(s, x, z);
      if (h === null) continue;
      if (h > y + this.options.stepUp) return null;
      if (h > best) best = h;
    }
    return best === -Infinity ? null : best;
  }

  /** Highest surface at (x, z) regardless of the player's height (for placing objects, raycast fallback). */
  topAt(x: number, z: number): number | null {
    let best: number | null = null;
    for (const s of this.surfaces) {
      const h = surfaceHeightAt(s, x, z);
      if (h !== null && (best === null || h > best)) best = h;
    }
    return best;
  }

  /** Push point `p` (mutated) out of all obstacles overlapping height band [y, y + playerHeight]. */
  resolveObstacles(p: Vec2, y: number): void {
    const r = this.options.playerRadius;
    const top = y + this.options.playerHeight;
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      for (const o of this.obstacles) {
        if (top < o.y0 || y > o.y1) continue;
        moved = (o.kind === 'circle' ? pushOutCircle(p, o, r) : pushOutBox(p, o, r)) || moved;
      }
      if (!moved) return;
    }
  }

  /**
   * Move from (x, z) by (dx, dz) with feet at `y`. Writes the accepted position into `out`.
   * Tries full move, then each axis (wall sliding). Returns false if no movement was possible.
   */
  move(x: number, z: number, y: number, dx: number, dz: number, out: Vec2): boolean {
    if (this.tryMove(x + dx, z + dz, y, out)) return true;
    if (dx !== 0 && this.tryMove(x + dx, z, y, out)) return true;
    if (dz !== 0 && this.tryMove(x, z + dz, y, out)) return true;
    out.x = x;
    out.z = z;
    return false;
  }

  /** True if a straight walk between two points at roughly constant height stays walkable. */
  isWalkable(x: number, z: number, y: number): boolean {
    const p = this.scratch;
    p.x = x;
    p.z = z;
    this.resolveObstacles(p, y);
    return Math.hypot(p.x - x, p.z - z) < 1e-3 && this.groundAt(x, z, y) !== null;
  }

  private tryMove(nx: number, nz: number, y: number, out: Vec2): boolean {
    const p = this.scratch;
    p.x = nx;
    p.z = nz;
    this.resolveObstacles(p, y);
    if (this.groundAt(p.x, p.z, y) === null) return false;
    out.x = p.x;
    out.z = p.z;
    return true;
  }
}

function pushOutCircle(p: Vec2, o: CircleObstacle, r: number): boolean {
  const dx = p.x - o.x;
  const dz = p.z - o.z;
  const min = o.r + r;
  const d2 = dx * dx + dz * dz;
  if (d2 >= min * min) return false;
  const d = Math.sqrt(d2);
  if (d < 1e-6) {
    p.x = o.x + min;
    return true;
  }
  p.x = o.x + (dx / d) * min;
  p.z = o.z + (dz / d) * min;
  return true;
}

function pushOutBox(p: Vec2, o: BoxObstacle, r: number): boolean {
  const c = Math.cos(o.rot);
  const s = Math.sin(o.rot);
  const dx = p.x - o.x;
  const dz = p.z - o.z;
  // world → local (inverse of three.js Y rotation)
  let lx = dx * c - dz * s;
  let lz = dx * s + dz * c;
  const cx = clamp(lx, -o.hw, o.hw);
  const cz = clamp(lz, -o.hd, o.hd);
  const ox = lx - cx;
  const oz = lz - cz;
  const d2 = ox * ox + oz * oz;
  if (d2 >= r * r) return false;
  if (d2 > 1e-12) {
    const d = Math.sqrt(d2);
    lx = cx + (ox / d) * r;
    lz = cz + (oz / d) * r;
  } else {
    // Centre inside the box: exit through the nearest face.
    const penX = o.hw - Math.abs(lx);
    const penZ = o.hd - Math.abs(lz);
    if (penX < penZ) lx = Math.sign(lx || 1) * (o.hw + r);
    else lz = Math.sign(lz || 1) * (o.hd + r);
  }
  // local → world
  p.x = o.x + lx * c + lz * s;
  p.z = o.z - lx * s + lz * c;
  return true;
}
