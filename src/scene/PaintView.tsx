import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import {
  CircleGeometry,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { getModel, type ModelKey } from '@/assets/manifest';
import { camera as camState } from '@/engine/playerState';
import { world } from '@/game/actions';
import { MAX_BALLS, MAX_SPLATS, SPLAT_COLORS } from '@/game/paint/config';
import { centerRay, fireCenter, sim, tickPaint } from '@/game/paint/controller';
import { useGameStats } from '@/state/paint';
import { useSettings } from '@/state/settings';
import { isUiBlocking } from '@/state/ui';

const POP = 0.4;
const MAX_BURSTS = 24;
type Tick = (t: number, dt: number) => void;

function build(key: ModelKey): Object3D {
  const entry = getModel(key);
  const inner = entry.source.kind === 'procedural' ? entry.source.build({}) : new Object3D();
  // Wrapper: the view positions the holder; the model's own ticks animate the inner object.
  const holder = new Group();
  holder.add(inner);
  holder.userData.age = 0;
  holder.userData.inner = inner;
  return holder;
}

function createView() {
  const root = new Group();
  const arena = world.zone('arena');

  const balls = new InstancedMesh(
    new SphereGeometry(0.16, 8, 6),
    new MeshStandardMaterial({ color: '#ffffff', roughness: 0.35 }),
    MAX_BALLS,
  );
  const splats = new InstancedMesh(
    new CircleGeometry(1, 10),
    new MeshBasicMaterial({
      color: '#ffffff',
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
    MAX_SPLATS,
  );
  const bursts = new InstancedMesh(
    new SphereGeometry(0.4, 8, 6),
    new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, depthWrite: false }),
    MAX_BURSTS,
  );
  for (const m of [balls, splats, bursts]) {
    m.frustumCulled = false;
    m.count = 0;
    m.castShadow = false;
    m.receiveShadow = false;
    root.add(m);
  }
  const targets = new Map<number, Object3D>();
  const bots = new Map<number, Object3D>();
  const dummy = new Object3D();
  const look = new Vector3();
  const tint = new Color();

  function mirror<T extends { id: number }>(
    list: readonly T[],
    live: Map<number, Object3D>,
    make: (item: T) => Object3D,
    place: (obj: Object3D, item: T, age: number) => void,
    t: number,
    dt: number,
    animate: boolean,
  ) {
    const seen = new Set<number>();
    for (const item of list) {
      seen.add(item.id);
      let obj = live.get(item.id);
      if (!obj) {
        obj = make(item);
        live.set(item.id, obj);
        root.add(obj);
      }
      obj.userData.age = (obj.userData.age as number) + dt;
      place(obj, item, obj.userData.age as number);
      if (animate) ((obj.userData.inner as Object3D | undefined)?.userData.tick as Tick | undefined)?.(t, dt);
    }
    for (const [id, obj] of live) {
      if (!seen.has(id)) {
        root.remove(obj);
        live.delete(id);
      }
    }
  }

  function sync(t: number, dt: number, camera: Vector3, animate: boolean): void {
    // Balls
    balls.count = sim.balls.length;
    sim.balls.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.setScalar(b.owner === 'bot' ? 1.5 : 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      balls.setMatrixAt(i, dummy.matrix);
      balls.setColorAt(i, tint.set(SPLAT_COLORS[b.color] ?? '#ffffff'));
    });
    balls.instanceMatrix.needsUpdate = true;
    if (balls.instanceColor) balls.instanceColor.needsUpdate = true;

    // Splat decals (ring buffer; every frame so new ones pop in)
    splats.count = sim.splats.length;
    sim.splats.forEach((s, i) => {
      dummy.position.set(s.x + s.nx * 0.03, s.y + s.ny * 0.03, s.z + s.nz * 0.03);
      look.set(dummy.position.x + s.nx, dummy.position.y + s.ny, dummy.position.z + s.nz);
      dummy.lookAt(look);
      const pop = Math.min(1, s.age / 0.12);
      dummy.scale.setScalar(s.size * (1 - (1 - pop) * (1 - pop)));
      dummy.updateMatrix();
      splats.setMatrixAt(i, dummy.matrix);
      splats.setColorAt(i, tint.set(SPLAT_COLORS[s.color] ?? '#ffffff'));
    });
    splats.instanceMatrix.needsUpdate = true;
    if (splats.instanceColor) splats.instanceColor.needsUpdate = true;

    // Bursts when something is hit
    bursts.count = sim.bursts.length;
    sim.bursts.forEach((b, i) => {
      const k = b.age / POP;
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar((0.5 + b.age * 3) * (1 - k * k));
      dummy.updateMatrix();
      bursts.setMatrixAt(i, dummy.matrix);
      bursts.setColorAt(i, tint.set(SPLAT_COLORS[b.color] ?? '#ffffff'));
    });
    bursts.instanceMatrix.needsUpdate = true;
    if (bursts.instanceColor) bursts.instanceColor.needsUpdate = true;

    mirror(
      sim.targets,
      targets,
      (tg) => build(tg.kind === 'gallery' ? 'paintTarget' : 'huntTarget'),
      (obj, tg, age) => {
        obj.position.set(tg.x, tg.y, tg.z);
        if (tg.kind === 'gallery') obj.rotation.y = Math.atan2(arena.x - tg.x, arena.z - tg.z);
        else obj.lookAt(camera.x, tg.y, camera.z);
        const pop = Math.min(1, age / 0.15);
        const gone = tg.dead ? Math.max(0.01, 1 - tg.deadT / POP) : 1;
        obj.scale.setScalar(Math.max(0.01, pop * gone));
        if (tg.dead) obj.rotation.z = tg.deadT * 6;
      },
      t,
      dt,
      animate,
    );

    mirror(
      sim.bots,
      bots,
      () => build('paintBot'),
      (obj, bot) => {
        obj.position.set(bot.x, bot.y - (bot.dead ? bot.deadT * 1.5 : 0), bot.z);
        obj.rotation.y = bot.yaw;
        const gone = bot.dead ? Math.max(0.01, 1 - bot.deadT / POP) : 1;
        obj.scale.setScalar(gone * (1 + bot.flash * 1.2));
      },
      t,
      dt,
      animate,
    );
  }

  return { root, sync };
}

/**
 * Mirrors the paintball simulation into the scene and turns clicks/taps into shots while the gun is out
 * (ADR-007). Walking and landmark clicks are disabled in paint mode by `game/actions`.
 */
export function PaintView() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const view = useMemo(createView, []);

  useEffect(() => {
    const el = gl.domElement;
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const onUp = (e: PointerEvent) => {
      if (!useGameStats.getState().mode || e.button !== 0 || camState.dragging || isUiBlocking()) return;
      fireCenter(); // always where the centre crosshair points
    };
    centerRay.get = () => {
      raycaster.setFromCamera(ndc.set(0, 0), camera);
      const { origin, direction } = raycaster.ray;
      return {
        origin: { x: origin.x, y: origin.y, z: origin.z },
        dir: { x: direction.x, y: direction.y, z: direction.z },
      };
    };
    el.addEventListener('pointerup', onUp);
    return () => {
      centerRay.get = null;
      el.removeEventListener('pointerup', onUp);
    };
  }, [camera, gl]);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    tickPaint(dt);
    view.sync(clock.elapsedTime, dt, camera.position, !useSettings.getState().reducedMotion);
  });

  return <primitive object={view.root} />;
}
