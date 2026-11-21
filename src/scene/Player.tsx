import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group } from 'three';
import { playSfx } from '@/audio/sfx';
import { explorer, type CharacterParts } from '@/assets/models/characters';
import { paintGun } from '@/assets/models/arena';
import { recoil } from '@/game/paint/controller';
import { useGameStats } from '@/state/paint';
import { consumeJump, hasMoveInput, readIntent } from '@/engine/input';
import { angleDelta, damp } from '@/engine/math';
import { autoWalk, camera, cancelAutoWalk, player, teleport } from '@/engine/playerState';
import { world } from '@/game/actions';
import { getSeed } from '@/content';
import { useProgress } from '@/state/progress';
import { isUiBlocking, useUi } from '@/state/ui';

const WALK_SPEED = 4.6;
const RUN_SPEED = 8.2;
const AUTO_SPEED = 6.4;
const GRAVITY = 24;
const JUMP_SPEED = 7.4;
const KILL_Y = -40;

const out = { x: 0, z: 0 };

export function Player() {
  const root = useRef<Group>(null);
  const character = useMemo(() => explorer(), []);
  const parts = character.userData.parts as CharacterParts;
  // Optional paintball marker (ADR-007): held in the right hand while paint mode is on.
  const gun = useMemo(() => {
    const g = paintGun();
    g.position.set(0, -0.58, 0);
    g.visible = false;
    parts.armR.add(g);
    return g;
  }, [parts]);
  const vel = useRef({ x: 0, z: 0 });
  const anim = useRef({ phase: 0, stuckTime: 0, lastProbe: 0, stepTimer: 0 });

  // Initial placement at Home.
  useEffect(() => {
    const s = world.spawn;
    Object.assign(player, { x: s.x, y: s.y, z: s.z, yaw: s.yaw, vy: 0, grounded: true, zoneId: 'home' });
    camera.yaw = s.yaw + Math.PI;
    useProgress.getState().visit('home');
  }, []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 12);
    const col = world.collision;
    const ui = useUi.getState();

    // 1. Teleport requests (travel / respawn)
    if (teleport.target) {
      Object.assign(player, {
        x: teleport.target.x,
        y: teleport.target.y,
        z: teleport.target.z,
        vy: 0,
        yaw: teleport.yaw,
      });
      camera.yaw = teleport.yaw + Math.PI;
      vel.current.x = vel.current.z = 0;
      teleport.target = null;
    }

    // 2. Desired horizontal velocity
    const blocked = isUiBlocking();
    let dx = 0;
    let dz = 0;
    let speed = 0;
    if (!blocked && hasMoveInput()) {
      if (autoWalk.points.length) cancelAutoWalk();
      const intent = readIntent();
      const fx = -Math.sin(camera.yaw);
      const fz = -Math.cos(camera.yaw);
      const rx = Math.cos(camera.yaw);
      const rz = -Math.sin(camera.yaw);
      dx = fx * intent.y + rx * intent.x;
      dz = fz * intent.y + rz * intent.x;
      const len = Math.hypot(dx, dz);
      speed = (intent.run ? RUN_SPEED : WALK_SPEED) * Math.min(1, len);
      if (len > 0) {
        dx /= len;
        dz /= len;
      }
    } else if (autoWalk.points.length && ui.panels.length === 0 && ui.phase === 'play') {
      const next = autoWalk.points[0]!;
      const ddx = next.x - player.x;
      const ddz = next.z - player.z;
      const dist = Math.hypot(ddx, ddz);
      if (dist < 0.45) {
        autoWalk.points.shift();
        anim.current.stuckTime = 0;
        if (autoWalk.points.length === 0) {
          const arrive = autoWalk.onArrive;
          cancelAutoWalk();
          arrive?.();
        }
      } else {
        dx = ddx / dist;
        dz = ddz / dist;
        speed = Math.min(AUTO_SPEED, dist * 6 + 1.5);
      }
    }

    const k = damp(speed > 0 ? 12 : 9, dt);
    vel.current.x += (dx * speed - vel.current.x) * k;
    vel.current.z += (dz * speed - vel.current.z) * k;

    // 3. Collide and move
    const stepX = vel.current.x * dt;
    const stepZ = vel.current.z * dt;
    const prevX = player.x;
    const prevZ = player.z;
    if (stepX !== 0 || stepZ !== 0) {
      col.move(player.x, player.z, player.y, stepX, stepZ, out);
      player.x = out.x;
      player.z = out.z;
    }
    const moved = Math.hypot(player.x - prevX, player.z - prevZ);
    player.speed = dt > 0 ? moved / dt : 0;

    // Auto-walk stuck detection: skip a waypoint, then give up.
    if (autoWalk.points.length && speed > 0 && moved < speed * dt * 0.2) {
      anim.current.stuckTime += dt;
      if (anim.current.stuckTime > 0.8) {
        anim.current.stuckTime = 0;
        if (autoWalk.points.length > 1) autoWalk.points.shift();
        else cancelAutoWalk();
      }
    }

    // 4. Vertical: gravity, jump, ground snap
    const ground = col.groundAt(player.x, player.z, player.y);
    if (player.grounded && !blocked && consumeJump()) {
      player.vy = JUMP_SPEED;
      player.grounded = false;
    }
    player.vy -= GRAVITY * dt;
    player.y += player.vy * dt;
    if (ground !== null && player.y <= ground) {
      player.y = ground;
      player.vy = 0;
      player.grounded = true;
    } else if (ground !== null && player.grounded && player.y - ground < 0.35) {
      player.y = ground; // stick to gentle downhill slopes
      player.vy = 0;
    } else {
      player.grounded = false;
    }
    if (player.y < KILL_Y || ground === null) {
      if (player.y < KILL_Y || col.topAt(player.x, player.z) === null) {
        const s = world.zoneSpawn(ui.currentZone);
        Object.assign(player, { x: s.x, y: s.y, z: s.z, vy: 0 });
      }
    }

    // 5. Facing + animation
    if (camera.locked && useGameStats.getState().mode) {
      // Aiming with the mouse captured: face where the crosshair points, strafing relative to it.
      player.yaw += angleDelta(player.yaw, camera.yaw + Math.PI) * damp(14, dt);
    } else if (player.speed > 0.3) {
      const targetYaw = Math.atan2(vel.current.x, vel.current.z);
      player.yaw += angleDelta(player.yaw, targetYaw) * damp(12, dt);
    }
    const g = root.current;
    if (g) {
      g.position.set(player.x, player.y, player.z);
      g.rotation.y = player.yaw;
    }
    const sp = Math.min(1, player.speed / RUN_SPEED);
    anim.current.phase += dt * (4 + player.speed * 1.6);
    const swing = Math.sin(anim.current.phase) * (0.25 + sp * 0.6) * (player.speed > 0.2 ? 1 : 0);
    const airborne = !player.grounded;
    parts.legL.rotation.x = airborne ? -0.5 : swing;
    parts.legR.rotation.x = airborne ? 0.3 : -swing;
    parts.armL.rotation.x = airborne ? -2.4 : -swing * 0.9;
    const aiming = useGameStats.getState().mode;
    const kickAge = (performance.now() - recoil.at) / 1000;
    const kick = kickAge < 0.15 ? (1 - kickAge / 0.15) * 0.35 : 0;
    gun.visible = aiming;
    parts.armR.rotation.x = aiming ? -1.45 + kick : airborne ? -2.4 : swing * 0.9;
    parts.body.position.y =
      player.speed > 0.2
        ? Math.abs(Math.sin(anim.current.phase)) * 0.06
        : Math.sin(state.clock.elapsedTime * 2) * 0.015;
    parts.body.rotation.x = sp * 0.12;
    if (player.grounded && player.speed > 1) {
      anim.current.stepTimer -= dt;
      if (anim.current.stepTimer <= 0) {
        playSfx('step');
        anim.current.stepTimer = 0.42 - sp * 0.12;
      }
    }

    // 6. World awareness (zone, nearby, seeds, guide) — throttled
    anim.current.lastProbe += dt;
    if (anim.current.lastProbe < 0.12) return;
    anim.current.lastProbe = 0;

    const zone = world.zoneAt(player.x, player.z);
    if (zone && zone.id !== player.zoneId) {
      player.zoneId = zone.id;
      ui.setCurrentZone(zone.id);
      useProgress.getState().visit(zone.id);
    }

    let best: string | null = null;
    let bestD = Infinity;
    for (const lm of world.interactables) {
      if (Math.abs(lm.y - player.y) > 2) continue;
      const d = Math.hypot(lm.x - player.x, lm.z - player.z);
      if (d <= lm.interactRadius && d - lm.interactRadius < bestD) {
        bestD = d - lm.interactRadius;
        best = lm.id;
      }
    }
    if (best !== ui.nearbyId) {
      if (best) playSfx('nearby');
      ui.setNearby(best);
      const group = best ? (world.landmark(best)?.def.group ?? null) : null;
      if (group || !ui.panels.length) ui.setHighlightGroup(group);
    }

    const progress = useProgress.getState();
    for (const seed of world.seeds) {
      if (progress.seeds.includes(seed.id)) continue;
      if (Math.hypot(seed.x - player.x, seed.z - player.z) < 1.4 && Math.abs(seed.y - player.y) < 2) {
        progress.collectSeed(seed.id);
        playSfx('collect');
        ui.showToast(
          `Idea Seed found: ${getSeed(seed.id)?.title ?? 'Discovery'} (${progress.seeds.length + 1}/${world.seeds.length})`,
        );
        ui.openPanel({ kind: 'seed', id: seed.id });
      }
    }

    const dest = ui.destination;
    if (dest) {
      const nodeId = world.targetNode(dest);
      const node = nodeId ? world.nav.getNode(nodeId) : undefined;
      if (
        node &&
        Math.hypot(node.x - player.x, node.z - player.z) < 2.5 &&
        Math.abs(node.y - player.y) < 1.5
      ) {
        ui.setDestination(null);
        ui.showToast(`You've arrived at ${dest.label}`);
        playSfx('collect');
      }
    }
  });

  return (
    <group ref={root}>
      <primitive object={character} />
    </group>
  );
}
