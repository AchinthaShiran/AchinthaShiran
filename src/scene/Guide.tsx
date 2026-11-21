import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  type InstancedMesh,
  type Mesh,
  Object3D,
  OctahedronGeometry,
  RingGeometry,
} from 'three';
import { glowMat, mat } from '@/assets/materials';
import { palette } from '@/assets/palette';
import type { Vec3 } from '@/engine/math';
import { player } from '@/engine/playerState';
import { clickTarget, world } from '@/game/actions';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';
import { useProgress } from '@/state/progress';
import { Model } from './Model';

const MAX_DOTS = 260;
const SPACING = 1.3;

/** Current guide route, shared with the minimap. Recomputed a few times per second. */
export const guideRoute: { points: Vec3[] } = { points: [] };

function samplePolyline(points: Vec3[], spacing: number, max: number): Vec3[] {
  const out: Vec3[] = [];
  for (let i = 0; i < points.length - 1 && out.length < max; i++) {
    const a = points[i]!;
    const b = points[i + 1]!;
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    const n = Math.max(1, Math.floor(len / spacing));
    for (let k = 0; k < n && out.length < max; k++) {
      const t = k / n;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  return out;
}

/** Glowing breadcrumb trail from the player to the selected destination + a light beacon on arrival point. */
function GuideTrail() {
  const dots = useRef<InstancedMesh>(null);
  const beacon = useRef<Mesh>(null);
  const state = useRef({ timer: 0, samples: [] as Vec3[], key: '' });
  const dummy = useMemo(() => new Object3D(), []);
  const dotGeo = useMemo(() => new OctahedronGeometry(0.22, 0), []);
  const dotMat = useMemo(() => glowMat(palette.sunshine, 1.4, { unique: true }), []);
  const beaconGeo = useMemo(() => new CylinderGeometry(0.9, 0.9, 30, 12, 1, true), []);
  const beaconMat = useMemo(
    () => glowMat(palette.sunshine, 1, { opacity: 0.22, doubleSide: true, unique: true }),
    [],
  );

  useFrame(({ clock }, dt) => {
    const mesh = dots.current;
    if (!mesh) return;
    const dest = useUi.getState().destination;
    const s = state.current;
    s.timer -= dt;
    const key = dest ? `${dest.kind}:${dest.id}` : '';
    if (!dest) {
      guideRoute.points = [];
      s.samples = [];
    } else if (s.timer <= 0 || key !== s.key) {
      s.timer = 0.4;
      const nodeId = world.targetNode(dest);
      const route = nodeId ? world.routeTo(player, nodeId) : null;
      guideRoute.points = route ? [{ x: player.x, y: player.y, z: player.z }, ...route] : [];
      s.samples = samplePolyline(guideRoute.points, SPACING, MAX_DOTS).slice(1);
    }
    s.key = key;
    const t = clock.elapsedTime;
    const reduced = useSettings.getState().reducedMotion;
    for (let i = 0; i < MAX_DOTS; i++) {
      const p = s.samples[i];
      if (!p) {
        dummy.scale.setScalar(0);
      } else {
        const wave = reduced ? 1 : 0.7 + 0.5 * Math.max(0, Math.sin(i * 0.55 - t * 6));
        dummy.position.set(p.x, p.y + 0.35 + (reduced ? 0 : Math.sin(t * 3 + i) * 0.05), p.z);
        dummy.rotation.set(0, t + i, 0);
        dummy.scale.setScalar(wave);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    const end = guideRoute.points[guideRoute.points.length - 1];
    if (beacon.current) {
      beacon.current.visible = !!end;
      if (end) beacon.current.position.set(end.x, end.y + 15, end.z);
    }
  });

  return (
    <>
      <instancedMesh ref={dots} args={[dotGeo, dotMat, MAX_DOTS]} frustumCulled={false} />
      <mesh ref={beacon} geometry={beaconGeo} material={beaconMat} visible={false} />
    </>
  );
}

/** Ripple where the visitor clicked to move. */
function ClickMarker() {
  const ref = useRef<Mesh>(null);
  const geo = useMemo(() => {
    const g = new RingGeometry(0.5, 0.7, 24);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const material = useMemo(() => mat(palette.white, { opacity: 0.9, unique: true }), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const p = clickTarget.point;
    const age = (performance.now() - clickTarget.time) / 1000;
    m.visible = !!p && age < 0.8;
    if (!p || !m.visible) return;
    m.position.set(p.x, p.y + 0.06, p.z);
    m.scale.setScalar(1 + age * 1.5);
    material.opacity = 0.9 * (1 - age / 0.8);
  });
  return <mesh ref={ref} geometry={geo} material={material} visible={false} />;
}

/** Idea Seed collectibles (optional, plan §10). */
function Seeds() {
  const collected = useProgress((s) => s.seeds);
  return (
    <>
      {world.seeds
        .filter((s) => !collected.includes(s.id))
        .map((s) => (
          <group key={s.id} position={[s.x, s.y, s.z]}>
            <Model id="ideaSeed" />
          </group>
        ))}
    </>
  );
}

export function Guide() {
  return (
    <>
      <GuideTrail />
      <ClickMarker />
      <Seeds />
    </>
  );
}
