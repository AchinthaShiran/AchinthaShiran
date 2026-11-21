/**
 * Mutable, per-frame player state. Deliberately NOT React/Zustand state: it changes every frame and is
 * read by the camera, minimap and guide without causing re-renders. Coarse events (zone changes,
 * nearby interactable) are pushed to stores by the Player loop.
 */
import type { Vec3 } from './math';

export interface PlayerState extends Vec3 {
  yaw: number;
  vy: number;
  speed: number;
  grounded: boolean;
  zoneId: string;
}

export const player: PlayerState = {
  x: 0,
  y: 0,
  z: 0,
  yaw: Math.PI,
  vy: 0,
  speed: 0,
  grounded: true,
  zoneId: 'home',
};

/** Camera yaw is shared so movement is camera-relative and the minimap can show view direction. */
export const camera = { yaw: 0, dragging: false };

/** Auto-walk waypoints (click-to-move / walk-to-landmark). Consumed by the Player loop. */
export const autoWalk: { points: Vec3[]; onArrive: (() => void) | null } = { points: [], onArrive: null };

export function setAutoWalk(points: Vec3[], onArrive: (() => void) | null = null): void {
  autoWalk.points = points;
  autoWalk.onArrive = onArrive;
}

export function cancelAutoWalk(): void {
  autoWalk.points = [];
  autoWalk.onArrive = null;
}

/** Teleport request (travel). Set by UI, consumed by the Player loop on the next frame. */
export const teleport: { target: Vec3 | null; yaw: number } = { target: null, yaw: 0 };

export function requestTeleport(target: Vec3, yaw: number): void {
  teleport.target = { ...target };
  teleport.yaw = yaw;
  cancelAutoWalk();
}
