import { Html } from '@react-three/drei';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Color, Group, InstancedMesh, Mesh, type MeshStandardMaterial, Object3D, OctahedronGeometry, RingGeometry } from 'three';
import { box, cone, group } from '@/assets/builders';
import { glowMat } from '@/assets/materials';
import { signPlane } from '@/assets/models/city';
import { palette } from '@/assets/palette';
import { walkToLandmark, world } from '@/game/actions';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';
import type { LandmarkRuntime } from '@/world/build';
import { zoneLinks } from '@/world/zones';
import { Model } from './Model';

function setCursor(on: boolean) {
  document.body.style.cursor = on ? 'pointer' : '';
}

function Landmark({ lm }: { lm: LandmarkRuntime }) {
  const inner = useRef<Group>(null);
  const hop = useRef({ last: null as string | null, start: -10 });
  const interactive = lm.panel !== null;

  useFrame(({ clock }) => {
    const g = inner.current;
    if (!g || !interactive) return;
    const ui = useUi.getState();
    const t = clock.elapsedTime;
    const reduced = useSettings.getState().reducedMotion;
    if (ui.selectedId === lm.id && hop.current.last !== lm.id) hop.current.start = t;
    hop.current.last = ui.selectedId;
    const since = t - hop.current.start;
    const hopY = !reduced && since < 0.45 ? Math.sin((since / 0.45) * Math.PI) * 0.35 : 0;
    const near = ui.nearbyId === lm.id;
    const pulse = near && !reduced ? 1 + Math.sin(t * 5) * 0.015 : 1;
    g.position.y = hopY;
    g.scale.setScalar(pulse);

    // Skill crystals glow when their category is highlighted or they are nearby.
    if (lm.def.group) {
      const glow = (g.children[0]?.children[0]?.userData.glowMaterial ?? findGlow(g)) as MeshStandardMaterial | undefined;
      if (glow) {
        const target = near ? 1.4 : ui.highlightGroup === lm.def.group ? 1.0 : 0.35;
        glow.emissiveIntensity += (target - glow.emissiveIntensity) * 0.1;
      }
    }
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive || e.delta > 6) return;
    e.stopPropagation();
    walkToLandmark(lm.id);
  };

  return (
    <group position={[lm.x, lm.y, lm.z]} rotation-y={lm.yaw} scale={lm.scale}>
      <group
        ref={inner}
        onClick={onClick}
        onPointerOver={interactive ? (e) => (e.stopPropagation(), setCursor(true)) : undefined}
        onPointerOut={interactive ? () => setCursor(false) : undefined}
      >
        <Model id={lm.def.model} props={lm.def.props} />
      </group>
    </group>
  );
}

function findGlow(g: Object3D): MeshStandardMaterial | undefined {
  let found: MeshStandardMaterial | undefined;
  g.traverse((o) => {
    if (!found && o.userData.glowMaterial) found = o.userData.glowMaterial as MeshStandardMaterial;
  });
  return found;
}

/** Floating diamonds above every interactable so visitors never guess what can be opened. */
function InteractionMarkers() {
  const ref = useRef<InstancedMesh>(null);
  const items = world.interactables;
  const dummy = useMemo(() => new Object3D(), []);
  const geometry = useMemo(() => new OctahedronGeometry(0.28, 0), []);
  const material = useMemo(() => glowMat(palette.sunshine, 1.1, { unique: true }), []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const c = new Color();
    items.forEach((_, i) => m.setColorAt(i, c.set(palette.white)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    const { nearbyId, panels } = useUi.getState();
    const reduced = useSettings.getState().reducedMotion;
    items.forEach((lm, i) => {
      const hidden = lm.id === nearbyId || panels.length > 0;
      dummy.position.set(lm.x, lm.y + lm.height + 0.9 + (reduced ? 0 : Math.sin(t * 2 + i) * 0.18), lm.z);
      dummy.rotation.set(0, reduced ? 0 : t * 1.5 + i, 0);
      dummy.scale.setScalar(hidden ? 0 : 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} frustumCulled={false} />;
}

/** Nearby state: ground ring + floating label with the interaction hint. */
function NearbyIndicator() {
  const nearbyId = useUi((s) => s.nearbyId);
  const panelsOpen = useUi((s) => s.panels.length > 0);
  const ring = useRef<Group>(null);
  const ringObject = useMemo(() => {
    const geo = new RingGeometry(0.85, 1, 32);
    geo.rotateX(-Math.PI / 2);
    const g = new Group();
    const m = new Mesh(geo, glowMat(palette.sunshine, 1.2, { opacity: 0.85 }));
    m.castShadow = false;
    g.add(m);
    return g;
  }, []);
  const lm = nearbyId ? world.landmark(nearbyId) : undefined;
  useFrame(({ clock }) => {
    if (!ring.current || !lm) return;
    const r = Math.max(1, lm.interactRadius - 2.2);
    const s = r * (1 + Math.sin(clock.elapsedTime * 4) * 0.04);
    ring.current.scale.set(s, 1, s);
  });
  if (!lm || panelsOpen) return null;
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  return (
    <>
      <group ref={ring} position={[lm.x, lm.y + 0.08, lm.z]}>
        <primitive object={ringObject} />
      </group>
      <Html position={[lm.x, lm.y + lm.height + 1.1, lm.z]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div className="world-label">
          <span className="world-label__name">{lm.def.name}</span>
          <span className="world-label__hint">
            {touch ? 'Tap' : <kbd>E</kbd>} {lm.def.hint ?? 'Open'}
          </span>
        </div>
      </Html>
    </>
  );
}

function arrowBoard(text: string, color: string): Group {
  const board = box(2.3, 0.46, 0.08, color, { p: [1.25, 0, 0] });
  const tip = cone(0.33, 0.5, 3, color, { p: [2.6, 0, 0], r: [0, 0, -Math.PI / 2] });
  const front = signPlane(text, 2.1, 0.4, color, palette.ink);
  front.position.set(1.2, 0, 0.05);
  const back = signPlane(text, 2.1, 0.4, color, palette.ink);
  back.position.set(1.2, 0, -0.05);
  back.rotation.y = Math.PI;
  return group([board, tip, front, back]);
}

const ARROW_COLORS = [palette.sunshine, palette.coral, palette.sky, palette.meadow, palette.lavender, palette.cream];

/** Signposts at Home (and wherever a `signpostPost` landmark is placed) pointing to linked zones. */
function SignpostArrows() {
  const objects = useMemo(() => {
    return world.landmarks
      .filter((l) => l.def.model === 'signpostPost')
      .map((post) => {
        const targets = zoneLinks
          .filter((k) => k.a === post.zoneId || k.b === post.zoneId)
          .map((k) => world.zone(k.a === post.zoneId ? k.b : k.a));
        const g = new Group();
        targets.forEach((zone, i) => {
          const arrow = arrowBoard(zone.def.name, ARROW_COLORS[i % ARROW_COLORS.length]!);
          // Arrows stay above head height (player ≈ 1.75) so nobody walks through them.
          arrow.position.set(0, post.height - 0.3 - i * 0.46, 0);
          arrow.rotation.y = Math.atan2(-(zone.z - post.z), zone.x - post.x);
          g.add(arrow);
        });
        g.position.set(post.x, post.y, post.z);
        return g;
      });
  }, []);
  return (
    <>
      {objects.map((o, i) => (
        <primitive key={i} object={o} />
      ))}
    </>
  );
}

/** A sign at every bridge head naming where the bridge leads. */
function BridgeSigns() {
  const objects = useMemo(() => {
    const out: Group[] = [];
    for (const b of world.bridges) {
      const len = Math.hypot(b.bx - b.ax, b.bz - b.az);
      const ux = (b.bx - b.ax) / len;
      const uz = (b.bz - b.az) / len;
      const ends = [
        { x: b.ax, y: b.ay, z: b.az, dir: 1, to: world.zone(b.b), from: world.zone(b.a) },
        { x: b.bx, y: b.by, z: b.bz, dir: -1, to: world.zone(b.a), from: world.zone(b.b) },
      ];
      for (const end of ends) {
        const px = uz * 2.6;
        const pz = -ux * 2.6;
        const x = end.x + px - ux * end.dir * 0.8;
        const z = end.z + pz - uz * end.dir * 0.8;
        const sign = signPlane(`→ ${end.to.def.name}`, 2.6, 0.55, palette.cream, palette.ink);
        sign.position.set(0, 1.9, 0.06);
        const back = box(2.8, 0.7, 0.1, palette.wood, { p: [0, 1.9, 0] });
        const post = box(0.14, 2.2, 0.14, palette.woodDark, { p: [0, 1.1, -0.1] });
        const g = group([post, back, sign], { p: [x, end.y, z] });
        g.rotation.y = Math.atan2(end.from.x - x, end.from.z - z);
        out.push(g);
      }
    }
    return out;
  }, []);
  return (
    <>
      {objects.map((o, i) => (
        <primitive key={i} object={o} />
      ))}
    </>
  );
}

export function Landmarks() {
  return (
    <>
      {world.landmarks.map((lm) => (
        <Landmark key={lm.id} lm={lm} />
      ))}
      <InteractionMarkers />
      <NearbyIndicator />
      <SignpostArrows />
      <BridgeSigns />
    </>
  );
}
