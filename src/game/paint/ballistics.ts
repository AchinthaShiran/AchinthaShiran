/**
 * Paintball ballistics (ADR-007): pure functions, no rendering. Aiming marches a ray through the same
 * collision world the player walks in, so what you see is what the ball hits.
 */
import { clamp, type Vec3 } from '@/engine/math';

export const GRAVITY = 16;
export const BALL_SPEED = 38;
export const BOT_BALL_SPEED = 17;
export const BALL_RADIUS = 0.16;
export const MAX_RANGE = 90;

/** The slice of the collision world that ballistics needs. */
export interface WorldProbe {
  /** Highest walkable surface height at (x, z), or null over the void. */
  topAt(x: number, z: number): number | null;
  obstacleAt(x: number, y: number, z: number, minSize?: number): boolean;
}

export type RayKind = 'ground' | 'obstacle' | 'none';

export interface RayResult {
  /** Distance along the ray. */
  t: number;
  kind: RayKind;
}

function solidAt(world: WorldProbe, x: number, y: number, z: number): RayKind | null {
  const top = world.topAt(x, z);
  if (top !== null && y <= top) return 'ground';
  if (world.obstacleAt(x, y, z)) return 'obstacle';
  return null;
}

/** March a ray (unit `d`) until it enters ground or an obstacle; refines the hit by bisection. */
export function marchRay(world: WorldProbe, o: Vec3, d: Vec3, maxDist = MAX_RANGE, step = 0.4): RayResult {
  let prev = 0;
  for (let t = step; t <= maxDist; t += step) {
    const kind = solidAt(world, o.x + d.x * t, o.y + d.y * t, o.z + d.z * t);
    if (kind) {
      let lo = prev;
      let hi = t;
      for (let i = 0; i < 5; i++) {
        const mid = (lo + hi) / 2;
        if (solidAt(world, o.x + d.x * mid, o.y + d.y * mid, o.z + d.z * mid)) hi = mid;
        else lo = mid;
      }
      return { t: hi, kind };
    }
    prev = t;
  }
  return { t: maxDist, kind: 'none' };
}

/** Distance along a unit ray to the first intersection with a sphere, or null. */
export function raySphere(o: Vec3, d: Vec3, c: Vec3, r: number): number | null {
  const ox = o.x - c.x;
  const oy = o.y - c.y;
  const oz = o.z - c.z;
  const b = ox * d.x + oy * d.y + oz * d.z;
  const cc = ox * ox + oy * oy + oz * oz - r * r;
  const disc = b * b - cc;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  if (-b - s >= 0) return -b - s;
  return -b + s >= 0 ? -b + s : null;
}

export interface SegmentHit {
  /** Parameter along the segment (0..1) of the closest approach. */
  t: number;
  /** Distance from the sphere centre at closest approach (used for bullseye scoring). */
  dist: number;
}

/** Closest approach of segment p0→p1 to a sphere; a hit when within `r`. */
export function segmentSphere(p0: Vec3, p1: Vec3, c: Vec3, r: number): SegmentHit | null {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const dz = p1.z - p0.z;
  const len2 = dx * dx + dy * dy + dz * dz;
  const t = len2 === 0 ? 0 : clamp(((c.x - p0.x) * dx + (c.y - p0.y) * dy + (c.z - p0.z) * dz) / len2, 0, 1);
  const dist = Math.hypot(p0.x + dx * t - c.x, p0.y + dy * t - c.y, p0.z + dz * t - c.z);
  return dist <= r ? { t, dist } : null;
}

/** Initial velocity that makes a ball fly from `from` through `to` under gravity at roughly `speed`. */
export function launchVelocity(from: Vec3, to: Vec3, speed = BALL_SPEED, gravity = GRAVITY): Vec3 {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const dist = Math.max(0.5, Math.hypot(dx, dy, dz));
  const t = dist / speed;
  return { x: dx / t, y: dy / t + 0.5 * gravity * t, z: dz / t };
}
