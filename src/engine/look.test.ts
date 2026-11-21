import { describe, expect, it } from 'vitest';
import { AIM_PITCH, aimCamera, FOLLOW_PITCH, lookStep } from './look';

describe('lookStep', () => {
  it('turns right when the mouse moves right and looks up when it moves up', () => {
    const right = lookStep(0, 0.5, 100, 0, false, 0.01);
    expect(right.yaw).toBeCloseTo(-1); // yaw decreases → view turns right (matches drag-to-orbit)
    expect(lookStep(0, 0.5, 0, -50, true, 0.01).pitch).toBeCloseTo(0);
    expect(lookStep(0, 0.5, 0, -30, false, 0.01).pitch).toBeCloseTo(0.2);
    expect(lookStep(0, 0.5, 0, 50, false, 0.01).pitch).toBeCloseTo(1);
  });

  it('clamps pitch to the follow range, and allows looking up in aim mode', () => {
    expect(lookStep(0, 0.5, 0, -10_000, false).pitch).toBe(FOLLOW_PITCH.min);
    expect(lookStep(0, 0.5, 0, 10_000, false).pitch).toBe(FOLLOW_PITCH.max);
    expect(lookStep(0, 0.1, 0, -10_000, true).pitch).toBe(AIM_PITCH.min);
    expect(AIM_PITCH.min).toBeLessThan(0);
    expect(lookStep(0, 0.1, 0, 10_000, true).pitch).toBe(AIM_PITCH.max);
  });

  it('does not change yaw for vertical movement', () => {
    expect(lookStep(1.2, 0.4, 0, 30, true).yaw).toBe(1.2);
  });
});

describe('aimCamera', () => {
  const pivot = { x: 10, y: 2, z: -5 };

  it('sits behind the player and looks along a unit vector', () => {
    const cam = aimCamera(pivot, 0, 0, 4, 0);
    expect(cam.position.x).toBeCloseTo(10);
    expect(cam.position.z).toBeCloseTo(-1); // behind (+z) when looking toward -z
    expect(cam.forward).toEqual({ x: -0, y: -0, z: -1 });
    expect(Math.hypot(cam.forward.x, cam.forward.y, cam.forward.z)).toBeCloseTo(1);
  });

  it('shifts over the right shoulder, perpendicular to the view', () => {
    const cam = aimCamera(pivot, 0, 0, 4, 0.7);
    expect(cam.position.x).toBeCloseTo(10.7);
    expect(cam.forward.x).toBeCloseTo(0); // parallel view: the crosshair ray stays straight ahead
  });

  it('looks up when pitch is negative and down when positive', () => {
    expect(aimCamera(pivot, 0, -0.4).forward.y).toBeGreaterThan(0);
    expect(aimCamera(pivot, 0, 0.4).forward.y).toBeLessThan(0);
    expect(aimCamera(pivot, 0, 0.4).position.y).toBeGreaterThan(pivot.y);
  });

  it('turns with yaw: a quarter turn looks along the x axis', () => {
    const cam = aimCamera(pivot, Math.PI / 2, 0, 4, 0);
    expect(cam.forward.x).toBeCloseTo(-1);
    expect(cam.forward.z).toBeCloseTo(0);
  });
});
