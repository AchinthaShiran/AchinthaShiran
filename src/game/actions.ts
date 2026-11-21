/**
 * High-level game actions shared by the 3D scene and the DOM UI. They combine the world, the stores
 * and the engine's mutable player state, so components stay thin.
 */
import { playSfx } from '@/audio/sfx';
import type { Vec3 } from '@/engine/math';
import { cancelAutoWalk, player, requestTeleport, setAutoWalk } from '@/engine/playerState';
import { segmentWalkable } from '@/world/build';
import { getWorld } from '@/world/build';
import { useSettings } from '@/state/settings';
import { type Destination, useUi } from '@/state/ui';
import type { ZoneId } from '@/world/types';

export const world = getWorld();

/** Click target marker for click-to-move (read by the scene). */
export const clickTarget: { point: Vec3 | null; time: number } = { point: null, time: 0 };

export function interactWith(landmarkId: string): void {
  const lm = world.landmark(landmarkId);
  if (!lm?.panel) return;
  cancelAutoWalk();
  playSfx('open');
  useUi.getState().openPanel(lm.panel, lm.id);
  if (lm.def.group) useUi.getState().setHighlightGroup(lm.def.group);
}

export function interactNearby(): void {
  const id = useUi.getState().nearbyId;
  if (id) interactWith(id);
}

const isNear = (landmarkId: string) => {
  const lm = world.landmark(landmarkId);
  if (!lm) return false;
  return Math.hypot(player.x - lm.x, player.z - lm.z) <= lm.interactRadius && Math.abs(player.y - lm.y) < 2;
};

/** Walk to a landmark via the nav graph and open it on arrival (click on a landmark). */
export function walkToLandmark(landmarkId: string): void {
  const lm = world.landmark(landmarkId);
  if (!lm?.navNodeId) return;
  if (isNear(landmarkId)) {
    interactWith(landmarkId);
    return;
  }
  const route = world.routeTo(player, lm.navNodeId);
  if (!route) {
    travelToLandmark(landmarkId, true);
    return;
  }
  playSfx('select');
  setAutoWalk(route, () => interactWith(landmarkId));
}

/** Click-to-move to an arbitrary ground point. */
export function walkToPoint(point: Vec3): void {
  clickTarget.point = point;
  clickTarget.time = performance.now();
  if (segmentWalkable(world.collision, player, point)) {
    setAutoWalk([point]);
    return;
  }
  const node = world.nearestReachableNode(point);
  const route = node ? world.routeTo(player, node.id) : null;
  if (!route) return;
  const tail = segmentWalkable(world.collision, node!, point) ? [point] : [];
  setAutoWalk([...route, ...tail]);
}

function withFade(action: () => void): void {
  const ui = useUi.getState();
  const instant = useSettings.getState().reducedMotion;
  playSfx('travel');
  if (instant) {
    action();
    return;
  }
  ui.setFading(true);
  window.setTimeout(() => {
    action();
    window.setTimeout(() => useUi.getState().setFading(false), 120);
  }, 320);
}

export function travelToZone(zoneId: ZoneId): void {
  const spawn = world.zoneSpawn(zoneId);
  useUi.getState().setOverlay(null);
  useUi.getState().closePanel();
  withFade(() => requestTeleport(spawn, spawn.yaw));
}

/** Teleport in front of a landmark; optionally open it. */
export function travelToLandmark(landmarkId: string, open = false): void {
  const lm = world.landmark(landmarkId);
  if (!lm?.approach) return;
  const target = lm.approach;
  const yaw = Math.atan2(lm.x - target.x, lm.z - target.z);
  useUi.getState().setOverlay(null);
  useUi.getState().closePanel();
  withFade(() => {
    requestTeleport(target, yaw);
    if (open) window.setTimeout(() => interactWith(landmarkId), 200);
  });
}

export function guideTo(destination: Destination): void {
  const ui = useUi.getState();
  ui.setDestination(destination);
  ui.setOverlay(null);
  ui.closePanel();
  ui.showToast(`Follow the glowing trail to ${destination.label}`);
  playSfx('select');
}

export function clearGuide(): void {
  useUi.getState().setDestination(null);
}
