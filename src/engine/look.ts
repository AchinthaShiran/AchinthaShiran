/**
 * Mouse-look maths (pointer lock, GTA-style). Pure functions so the feel is unit-tested:
 * - normal play: the orbit camera follows the player and the mouse turns it;
 * - paint mode: an over-the-shoulder aim camera whose centre crosshair is where shots go.
 */
import { clamp, type Vec3 } from './math';

export const LOOK_SENSITIVITY = 0.0026;
/** Pitch limits (radians, positive looks down) for the follow camera and the aim camera. */
export const FOLLOW_PITCH = { min: 0.12, max: 1.25 } as const;
export const AIM_PITCH = { min: -1.45, max: 1.45 } as const;

export interface LookAngles {
  yaw: number;
  pitch: number;
}

/** Apply a raw mouse delta (pixels): move right to turn right, move up to look up. */
export function lookStep(
  yaw: number,
  pitch: number,
  dx: number,
  dy: number,
  aiming: boolean,
  sensitivity = LOOK_SENSITIVITY,
): LookAngles {
  const range = aiming ? AIM_PITCH : FOLLOW_PITCH;
  return { yaw: yaw - dx * sensitivity, pitch: clamp(pitch + dy * sensitivity, range.min, range.max) };
}

export interface AimCamera {
  position: Vec3;
  /** Unit vector the camera looks along (the crosshair ray). */
  forward: Vec3;
}

/**
 * Over-the-shoulder camera: behind and slightly to the right of `pivot`, looking where the mouse points.
 * The camera offset from the pivot is (sin yaw·cos pitch, sin pitch, cos yaw·cos pitch), so a positive
 * pitch puts the camera higher and looks down - the same convention as the follow camera.
 */
export function aimCamera(
  pivot: Vec3,
  yaw: number,
  pitch: number,
  distance = 7.5,
  shoulder = 1.0,
): AimCamera {
  const cp = Math.cos(pitch);
  const ox = Math.sin(yaw) * cp;
  const oy = Math.sin(pitch);
  const oz = Math.cos(yaw) * cp;
  // The camera never drops below the pivot (it would sink into the ground): looking up only tilts the
  // view, looking down also lifts the camera.
  const pp = Math.max(pitch, 0);
  const pcp = Math.cos(pp);
  const rx = Math.cos(yaw);
  const rz = -Math.sin(yaw);
  return {
    position: {
      x: pivot.x + Math.sin(yaw) * pcp * distance + rx * shoulder,
      y: pivot.y + Math.sin(pp) * distance,
      z: pivot.z + Math.cos(yaw) * pcp * distance + rz * shoulder,
    },
    forward: { x: -ox, y: -oy, z: -oz },
  };
}
