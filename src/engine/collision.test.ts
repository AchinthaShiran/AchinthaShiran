import { describe, expect, it } from 'vitest';
import { CollisionWorld, surfaceHeightAt, type Surface } from './collision';

const island: Surface = { kind: 'disc', cx: 0, cz: 0, r: 10, y: 0 };
const tier: Surface = { kind: 'disc', cx: 0, cz: 0, r: 4, y: 3 };
const ramp: Surface = { kind: 'strip', ax: 8, az: 0, bx: 4, bz: 0, halfWidth: 1, ay: 0, by: 3 };

describe('surfaceHeightAt', () => {
  it('handles discs', () => {
    expect(surfaceHeightAt(island, 3, 3)).toBe(0);
    expect(surfaceHeightAt(island, 11, 0)).toBeNull();
  });

  it('interpolates strips and respects width and ends', () => {
    expect(surfaceHeightAt(ramp, 6, 0)).toBeCloseTo(1.5);
    expect(surfaceHeightAt(ramp, 6, 1.5)).toBeNull();
    expect(surfaceHeightAt(ramp, 9, 0)).toBeNull();
  });
});

describe('CollisionWorld', () => {
  const world = new CollisionWorld(
    [island, tier, ramp],
    [
      { kind: 'circle', x: -5, z: 0, r: 1, y0: 0, y1: 3 },
      { kind: 'box', x: 0, z: -7, hw: 2, hd: 1, rot: Math.PI / 4, y0: 0, y1: 3 },
    ],
  );

  it('picks the highest reachable surface and treats higher ones as walls', () => {
    expect(world.groundAt(2, 0, 0)).toBeNull(); // tier wall at y=3 from ground level
    expect(world.groundAt(2, 0, 3)).toBe(3); // standing on the tier
    expect(world.groundAt(7, 0, 0.5)).toBeCloseTo(0.75); // on the ramp near its foot
    expect(world.groundAt(7, 0, 0)).toBeNull(); // 0.75 rise exceeds step height from y=0
  });

  it('prevents walking off the island edge', () => {
    const out = { x: 0, z: 0 };
    expect(world.move(0, 9.8, 0, 0, 1, out)).toBe(false);
    expect(out).toEqual({ x: 0, z: 9.8 });
  });

  it('slides along the edge when moving diagonally into it', () => {
    const out = { x: 0, z: 0 };
    world.move(-1, 9.9, 0, 0.5, 0.5, out);
    expect(out.x).toBeCloseTo(-0.5);
    expect(out.z).toBeCloseTo(9.9);
  });

  it('pushes the player out of circle obstacles', () => {
    const out = { x: 0, z: 0 };
    world.move(-7, 0, 0, 1.5, 0, out);
    expect(Math.hypot(out.x + 5, out.z)).toBeGreaterThanOrEqual(1 + world.options.playerRadius - 1e-6);
  });

  it('pushes the player out of rotated boxes', () => {
    const p = { x: 0, z: -7 };
    world.resolveObstacles(p, 0);
    expect(world.isWalkable(p.x, p.z, 0)).toBe(true);
  });

  it('ignores obstacles outside the vertical band', () => {
    const p = { x: -5, z: 0 };
    world.resolveObstacles(p, 10);
    expect(p).toEqual({ x: -5, z: 0 });
  });

  it('lets the player climb a ramp onto a tier', () => {
    let x = 7.9;
    let y = world.groundAt(x, 0, 0) ?? 0;
    const out = { x: 0, z: 0 };
    for (let i = 0; i < 60; i++) {
      world.move(x, 0, y, -0.1, 0, out);
      x = out.x;
      y = world.groundAt(x, 0, y) ?? y;
    }
    expect(y).toBe(3);
    expect(x).toBeLessThan(4);
  });
});
