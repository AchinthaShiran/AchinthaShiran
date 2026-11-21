/** Small dependency-free math helpers shared by engine and world code. */

export interface Vec2 {
  x: number;
  z: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const dist2 = (ax: number, az: number, bx: number, bz: number) => Math.hypot(bx - ax, bz - az);
export const dist3 = (a: Vec3, b: Vec3) => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);

/** Frame-rate independent exponential damping factor. */
export const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

/** Shortest signed angle difference in radians, result in (-PI, PI]. */
export function angleDelta(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/** Rotate a local (x,z) offset by yaw (three.js Y-rotation convention). */
export function rotateY(x: number, z: number, yaw: number): Vec2 {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return { x: x * c + z * s, z: -x * s + z * c };
}

/** Yaw (three.js convention) that makes an object at `from` face `to`, assuming its front is +Z. */
export const yawTowards = (fromX: number, fromZ: number, toX: number, toZ: number) =>
  Math.atan2(toX - fromX, toZ - fromZ);

/** Deterministic PRNG (mulberry32) so procedural decor is stable between visits. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash of a string (FNV-1a), used to seed per-zone RNGs. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
