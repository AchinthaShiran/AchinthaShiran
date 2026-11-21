import type { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import { ConeGeometry, CylinderGeometry, Group, Mesh, type Object3D } from 'three';
import { bakeStatic } from '@/assets/bake';
import { blob, box, cylinder, jitter } from '@/assets/builders';
import { getModel } from '@/assets/manifest';
import { mat } from '@/assets/materials';
import { palette } from '@/assets/palette';
import { createRng, hashString } from '@/engine/math';
import { walkToPoint, world } from '@/game/actions';
import type { StripRuntime, ZoneRuntime } from '@/world/build';

const PATH_COLOR = '#EEDFB8';

/** Shared click-to-move handler: ignores drags and clicks on undersides. */
export function onGroundClick(e: ThreeEvent<MouseEvent>) {
  if (e.delta > 6) return;
  e.stopPropagation();
  const { x, z } = e.point;
  const y = world.collision.topAt(x, z);
  if (y === null || e.point.y < y - 0.6) return;
  walkToPoint({ x, y, z });
}

function islandBody(zone: ZoneRuntime): Group {
  const { radius: r, palette: pal } = zone.def;
  const seg = Math.max(14, Math.round(r * 1.4));
  const seed = hashString(zone.id);
  const rng = createRng(seed);
  const g = new Group();
  const top = new Mesh(new CylinderGeometry(r, r * 0.97, 1.0, seg), mat(pal.top));
  top.position.y = -0.5;
  top.receiveShadow = true;
  const rim = new Mesh(jitter(new CylinderGeometry(r * 0.99, r * 0.9, 1.4, seg), 0.35, seed), mat(pal.rim));
  rim.position.y = -1.6;
  const underside = new Mesh(
    jitter(new ConeGeometry(r * 0.92, r * 0.85, seg, 3), r * 0.08, seed + 1),
    mat(pal.rock),
  );
  underside.rotation.x = Math.PI;
  underside.position.y = -2.3 - (r * 0.85) / 2;
  const deep = new Mesh(
    jitter(new ConeGeometry(r * 0.45, r * 0.6, 7, 2), r * 0.06, seed + 2),
    mat(palette.rockDark),
  );
  deep.rotation.x = Math.PI;
  deep.position.set(r * 0.12, -2.3 - r * 0.85 - r * 0.15, -r * 0.08);
  g.add(top, rim, underside, deep);
  for (let i = 0; i < Math.round(r / 4); i++) {
    const a = rng() * Math.PI * 2;
    const d = r * (0.3 + rng() * 0.5);
    g.add(
      blob(
        1 + rng() * 1.6,
        pal.rock,
        Math.floor(rng() * 100),
        { p: [Math.cos(a) * d, -3 - rng() * r * 0.5, Math.sin(a) * d] },
        0.3,
        'dodeca',
      ),
    );
  }
  g.traverse((o) => {
    if (o instanceof Mesh) o.castShadow = false;
  });
  return g;
}

function Island({ zone }: { zone: ZoneRuntime }) {
  const body = useMemo(() => islandBody(zone), [zone]);
  return <primitive object={body} position={[zone.x, zone.y, zone.z]} onClick={onGroundClick} />;
}

function Tiers() {
  const group = useMemo(() => {
    const g = new Group();
    for (const t of world.tiers) {
      const zone = world.zone(t.zoneId);
      const h = t.y - t.baseY;
      const seg = Math.max(12, Math.round(t.radius * 1.3));
      const cliff = new Mesh(
        jitter(
          new CylinderGeometry(t.radius, t.radius + 0.4, h, seg, 2),
          0.25,
          hashString(`${t.zoneId}${t.y}`),
        ),
        mat(zone.def.palette.rock),
      );
      cliff.position.set(t.x, t.baseY + h / 2 - 0.15, t.z);
      cliff.castShadow = true;
      cliff.receiveShadow = true;
      const cap = new Mesh(
        new CylinderGeometry(t.radius + 0.1, t.radius + 0.1, 0.4, seg),
        mat(zone.def.palette.top),
      );
      cap.position.set(t.x, t.y - 0.2, t.z);
      cap.receiveShadow = true;
      g.add(cliff, cap);
    }
    return g;
  }, []);
  return <primitive object={group} onClick={onGroundClick} />;
}

function orientAlong(o: Object3D, s: StripRuntime, t: number) {
  o.position.set(s.ax + (s.bx - s.ax) * t, s.ay + (s.by - s.ay) * t, s.az + (s.bz - s.az) * t);
  o.lookAt(s.bx, s.by + (o.position.y - (s.ay + (s.by - s.ay) * t)), s.bz);
}

function Ramps() {
  const meshes = useMemo(() => {
    const root = new Group();
    for (const ramp of world.ramps) {
      const len = Math.hypot(ramp.bx - ramp.ax, ramp.by - ramp.ay, ramp.bz - ramp.az);
      const slab = box(2.8, 0.35, len + 0.6, palette.wood);
      orientAlong(slab, ramp, 0.5);
      slab.translateY(-0.2);
      root.add(slab);
      const steps = Math.floor(len / 0.55);
      for (let i = 0; i <= steps; i++) {
        const step = box(2.6, 0.08, 0.18, palette.woodDark);
        orientAlong(step, ramp, i / steps);
        step.translateY(0.0);
        root.add(step);
      }
      for (const side of [-1.35, 1.35]) {
        const rail = box(0.12, 0.12, len, palette.woodDark);
        orientAlong(rail, ramp, 0.5);
        rail.translateX(side);
        rail.translateY(0.8);
        root.add(rail);
      }
    }
    const g = new Group();
    bakeStatic(root).forEach((m) => g.add(m));
    return g;
  }, []);
  return <primitive object={meshes} onClick={onGroundClick} />;
}

function Bridges() {
  const group = useMemo(() => {
    const root = new Group();
    for (const b of world.bridges) {
      const len = Math.hypot(b.bx - b.ax, b.bz - b.az);
      const planks = Math.ceil(len / 0.62);
      for (let i = 0; i <= planks; i++) {
        const t = i / planks;
        const plank = box(3.3, 0.22, 0.52, i % 2 ? palette.wood : '#C99467');
        orientAlong(plank, b, t);
        plank.translateY(-0.11);
        // Small sag in the middle for a rope-bridge feel (visual only, keeps walk height within step).
        plank.translateY(-Math.sin(t * Math.PI) * 0.12);
        root.add(plank);
      }
      const posts = Math.max(2, Math.round(len / 3.2));
      const px = (b.bz - b.az) / len;
      const pz = -(b.bx - b.ax) / len;
      for (let i = 0; i <= posts; i++) {
        const t = i / posts;
        for (const side of [-1.6, 1.6]) {
          const y = b.ay + (b.by - b.ay) * t;
          root.add(
            cylinder(0.09, 0.11, 1.2, 5, palette.woodDark, {
              p: [b.ax + (b.bx - b.ax) * t + px * side, y + 0.4, b.az + (b.bz - b.az) * t + pz * side],
            }),
          );
        }
      }
      for (const side of [-1.6, 1.6]) {
        const rope = box(0.07, 0.07, len, palette.sand);
        orientAlong(rope, b, 0.5);
        rope.translateX(side);
        rope.translateY(1.0);
        root.add(rope);
      }
      // Lanterns at both ends help the routes read at a distance.
      for (const t of [0, 1]) {
        for (const side of [-1.6, 1.6]) {
          const lantern = box(
            0.3,
            0.35,
            0.3,
            mat(palette.glow, { emissive: palette.glow, emissiveIntensity: 0.9 }),
          );
          orientAlong(lantern, b, t);
          lantern.translateX(side);
          lantern.translateY(1.3);
          root.add(lantern);
        }
      }
    }
    const g = new Group();
    bakeStatic(root).forEach((m) => g.add(m));
    return g;
  }, []);
  return <primitive object={group} onClick={onGroundClick} />;
}

/** Visible routes: a soft sandy trail along every walkable nav edge inside a zone. */
function Paths() {
  const group = useMemo(() => {
    const root = new Group();
    const pathMat = mat(PATH_COLOR);
    const seen = new Set<string>();
    for (const e of world.navEdges) {
      if (e.a.zoneId !== e.b.zoneId || Math.abs(e.a.y - e.b.y) > 0.3) continue;
      const len = Math.hypot(e.b.x - e.a.x, e.b.z - e.a.z);
      if (len < 0.1) continue;
      const strip = box(1.05, 0.06, len, pathMat);
      strip.position.set((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2 + 0.02, (e.a.z + e.b.z) / 2);
      strip.rotation.y = Math.atan2(e.b.x - e.a.x, e.b.z - e.a.z);
      root.add(strip);
      for (const n of [e.a, e.b]) {
        if (seen.has(n.id)) continue;
        seen.add(n.id);
        root.add(cylinder(0.6, 0.6, 0.06, 8, pathMat, { p: [n.x, n.y + 0.02, n.z] }));
      }
    }
    const g = new Group();
    bakeStatic(root).forEach((m) => {
      m.castShadow = false;
      g.add(m);
    });
    return g;
  }, []);
  return <primitive object={group} onClick={onGroundClick} />;
}

function Decor({ quality }: { quality: 'low' | 'high' }) {
  const group = useMemo(() => {
    const root = new Group();
    world.decor.forEach((d, i) => {
      if (quality === 'low' && (d.kind === 'flower' || d.kind === 'mushroom') && i % 2 === 0) return;
      const entry = getModel(d.kind);
      if (entry.source.kind !== 'procedural') return;
      const o = entry.source.build({ seed: d.seed });
      o.position.set(d.x, d.y, d.z);
      o.rotation.y = d.yaw;
      o.scale.multiplyScalar(d.scale);
      root.add(o);
    });
    const g = new Group();
    bakeStatic(root).forEach((m) => g.add(m));
    return g;
  }, [quality]);
  return <primitive object={group} />;
}

export function Terrain({ quality }: { quality: 'low' | 'high' }) {
  return (
    <>
      {world.zones.map((z) => (
        <Island key={z.id} zone={z} />
      ))}
      <Tiers />
      <Ramps />
      <Bridges />
      <Paths />
      <Decor quality={quality} />
    </>
  );
}
