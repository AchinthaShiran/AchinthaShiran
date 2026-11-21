import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { readIntent } from '@/engine/input';
import { aimCamera, lookStep } from '@/engine/look';
import { angleDelta, clamp, damp } from '@/engine/math';
import { autoWalk, camera as camState, player } from '@/engine/playerState';
import { world } from '@/game/actions';
import { useGameStats } from '@/state/paint';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';

const MIN_DIST = 6;
const MAX_DIST = 24;
const INTRO_SECONDS = 6;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Third-person follow camera with drag-to-orbit, wheel/pinch zoom and a short intro fly-in. */
export function CameraRig() {
  const { camera, gl } = useThree();
  const view = useRef({
    pitch: 0.42,
    effPitch: 0.42,
    aimPitch: 0.08,
    dist: 13,
    targetDist: 13,
    lastDrag: -10,
  });
  const intro = useRef({ t: 0 });
  const target = useRef(new Vector3());
  const desired = useRef(new Vector3());
  const introStart = useRef(new Vector3(-40, 110, 190));
  const lookAt = useRef(new Vector3());

  useEffect(() => {
    const el = gl.domElement;
    let down: { x: number; y: number; id: number } | null = null;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) down = { x: e.clientX, y: e.clientY, id: e.pointerId };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
        view.current.targetDist = clamp(
          view.current.targetDist * (pinch / Math.max(1, d)),
          MIN_DIST,
          MAX_DIST,
        );
        pinch = d;
        return;
      }
      if (!down || down.id !== e.pointerId) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved > 4) camState.dragging = true;
      if (camState.dragging) {
        camState.yaw -= (e.clientX - prev.x) * 0.006;
        view.current.pitch = clamp(view.current.pitch + (e.clientY - prev.y) * 0.004, 0.12, 1.25);
        view.current.lastDrag = performance.now();
      }
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        down = null;
        // Let the click event (fired after pointerup) see the drag flag, then reset.
        window.setTimeout(() => (camState.dragging = false), 0);
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      view.current.targetDist = clamp(
        view.current.targetDist * (1 + Math.sign(e.deltaY) * 0.1),
        MIN_DIST,
        MAX_DIST,
      );
    };
    // GTA-style look: with the mouse captured, raw movement turns the camera (no dragging needed).
    const onLockedMove = (e: MouseEvent) => {
      if (!camState.locked) return;
      const v = view.current;
      const aiming = useGameStats.getState().mode;
      const next = lookStep(camState.yaw, aiming ? v.aimPitch : v.pitch, e.movementX, e.movementY, aiming);
      camState.yaw = next.yaw;
      if (aiming) v.aimPitch = next.pitch;
      else v.pitch = next.pitch;
      v.lastDrag = performance.now();
    };
    document.addEventListener('mousemove', onLockedMove);
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      document.removeEventListener('mousemove', onLockedMove);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const v = view.current;
    const ui = useUi.getState();
    const reduced = useSettings.getState().reducedMotion;

    // Gentle auto-follow: when moving forward without recent drags, swing behind the player.
    const intent = readIntent();
    const forwardish = intent.y > 0.3 || autoWalk.points.length > 0;
    if (
      ui.phase === 'play' &&
      !camState.locked &&
      forwardish &&
      player.speed > 1 &&
      performance.now() - v.lastDrag > 1500
    ) {
      camState.yaw += angleDelta(camState.yaw, player.yaw + Math.PI) * damp(0.9, dt);
    }

    // Paint mode with the mouse captured: over-the-shoulder aim camera; the centre crosshair is where shots go.
    if (camState.locked && ui.phase === 'play' && useGameStats.getState().mode) {
      const aim = aimCamera({ x: player.x, y: player.y + 1.6, z: player.z }, camState.yaw, v.aimPitch);
      desired.current.set(aim.position.x, aim.position.y, aim.position.z);
      const floor = world.collision.topAt(desired.current.x, desired.current.z);
      if (floor !== null) desired.current.y = Math.max(desired.current.y, floor + 0.6);
      camera.position.lerp(desired.current, reduced ? 1 : damp(14, dt));
      lookAt.current.set(
        camera.position.x + aim.forward.x * 40,
        camera.position.y + aim.forward.y * 40,
        camera.position.z + aim.forward.z * 40,
      );
      camera.lookAt(lookAt.current);
      v.dist = v.targetDist;
      return;
    }

    target.current.set(player.x, player.y + 1.5, player.z);
    const tx = target.current.x;
    const ty = target.current.y;
    const tz = target.current.z;
    // How far the camera can sit behind the player at a given pitch before a building/obstacle gets in the way.
    const clearDistance = (pitch: number) => {
      const cosP = Math.cos(pitch);
      const ux = Math.sin(camState.yaw) * cosP;
      const uy = Math.sin(pitch);
      const uz = Math.cos(camState.yaw) * cosP;
      for (let s = 1.2; s < v.targetDist; s += 0.5) {
        if (world.collision.obstacleAt(tx + ux * s, ty + uy * s, tz + uz * s, 1)) {
          return Math.max(MIN_DIST * 0.45, s - 0.6);
        }
      }
      return v.targetDist;
    };
    // Occlusion: first rise over the obstacle (steeper pitch), and only pull the camera in if that is not enough.
    let allowed = clearDistance(v.pitch);
    let pitch = v.pitch;
    if (allowed < v.targetDist * 0.85) {
      for (const candidate of [0.8, 1.1]) {
        if (candidate <= v.pitch) continue;
        const d = clearDistance(candidate);
        if (d > allowed) {
          allowed = d;
          pitch = candidate;
        }
        if (allowed >= v.targetDist * 0.85) break;
      }
    }
    v.effPitch += (pitch - v.effPitch) * damp(5, dt);
    // Pull in quickly when occluded, ease back out smoothly.
    v.dist += (allowed - v.dist) * damp(allowed < v.dist ? 14 : 4, dt);
    const cp = Math.cos(v.effPitch);
    desired.current.set(
      tx + Math.sin(camState.yaw) * cp * v.dist,
      ty + Math.sin(v.effPitch) * v.dist,
      tz + Math.cos(camState.yaw) * cp * v.dist,
    );
    // Keep the camera above ground (mountain tiers, cliffs).
    const ground = world.collision.topAt(desired.current.x, desired.current.z);
    if (ground !== null) desired.current.y = Math.max(desired.current.y, ground + 1.2);

    if (ui.phase === 'intro' && !reduced) {
      intro.current.t = Math.min(INTRO_SECONDS, intro.current.t + dt);
      const k = easeInOut(intro.current.t / INTRO_SECONDS);
      camera.position.lerpVectors(introStart.current, desired.current, k);
      lookAt.current.set(0, 0, 0).lerp(target.current, k);
      camera.lookAt(lookAt.current);
      return;
    }
    camera.position.lerp(desired.current, reduced ? 1 : damp(8, dt));
    camera.lookAt(target.current);
  });

  return null;
}
