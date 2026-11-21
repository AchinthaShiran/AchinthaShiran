import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { Group, Mesh, RingGeometry } from 'three';
import { box, cylinder, ico } from '@/assets/builders';
import { glowMat, mat } from '@/assets/materials';
import { car, floorColor } from '@/assets/models/city';
import { robot } from '@/assets/models/characters';
import { boat, pier } from '@/assets/models/horizon';
import { footbridge, waterfall } from '@/assets/models/home';
import { palette } from '@/assets/palette';
import { world } from '@/game/actions';
import { useSettings } from '@/state/settings';
import type { ZoneRuntime } from '@/world/build';
import type { ZoneFeature } from '@/world/types';
import { onGroundClick } from './Terrain';

const toRad = (d: number) => (d * Math.PI) / 180;
const polar = (zone: ZoneRuntime, a: number, r: number) => ({ x: zone.x + Math.sin(toRad(a)) * r, z: zone.z - Math.cos(toRad(a)) * r });

type Tick = (t: number, dt: number) => void;

function useTick(fn: Tick) {
  useFrame(({ clock }, dt) => {
    if (!useSettings.getState().reducedMotion) fn(clock.elapsedTime, dt);
  });
}

function Plaza({ zone, r, color }: { zone: ZoneRuntime; r: number; color: string }) {
  const m = useMemo(() => cylinder(r, r, 0.06, 20, color, { p: [zone.x, zone.y + 0.015, zone.z] }), [zone, r, color]);
  return <primitive object={m} onClick={onGroundClick} />;
}

function RingRoad({ zone, r, width, cars }: { zone: ZoneRuntime; r: number; width: number; cars: number }) {
  const { road, carObjects } = useMemo(() => {
    const geo = new RingGeometry(r - width / 2, r + width / 2, 36);
    geo.rotateX(-Math.PI / 2);
    const road = new Mesh(geo, mat('#7E7A8C'));
    road.position.set(zone.x, zone.y + 0.04, zone.z);
    road.receiveShadow = true;
    const dashes = new Group();
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      dashes.add(box(0.12, 0.02, 0.5, palette.cream, { p: [Math.cos(a) * r, 0.02, Math.sin(a) * r], r: [0, -a, 0] }));
    }
    road.add(dashes);
    const carObjects = Array.from({ length: cars }, (_, i) => {
      const c = car({ color: floorColor(i + 3) });
      const a = (i / cars) * Math.PI * 2;
      c.position.set(zone.x + Math.cos(a) * r, zone.y + 0.05, zone.z + Math.sin(a) * r);
      c.rotation.y = -a + Math.PI;
      return c;
    });
    return { road, carObjects };
  }, [zone, r, width, cars]);
  useTick((t) =>
    carObjects.forEach((c, i) => {
      const a = t * 0.35 + (i / carObjects.length) * Math.PI * 2;
      c.position.set(zone.x + Math.cos(a) * r, zone.y + 0.05, zone.z + Math.sin(a) * r);
      c.rotation.y = -a + Math.PI;
    }),
  );
  return (
    <>
      <primitive object={road} onClick={onGroundClick} />
      {carObjects.map((c, i) => (
        <primitive key={i} object={c} />
      ))}
    </>
  );
}

function River({ zone, a, r0 }: { zone: ZoneRuntime; a: number; r0: number }) {
  const group = useMemo(() => {
    const g = new Group();
    const water = mat(palette.water, { emissive: palette.water, emissiveIntensity: 0.15, roughness: 0.3 });
    const len = zone.def.radius - r0 + 0.4;
    const yaw = Math.PI - toRad(a);
    const start = polar(zone, a, r0);
    const mid = polar(zone, a, r0 + len / 2);
    const rim = polar(zone, a, zone.def.radius - 0.1);
    g.add(cylinder(1.5, 1.5, 0.05, 12, water, { p: [start.x, zone.y + 0.03, start.z] }));
    g.add(box(1.3, 0.05, len, water, { p: [mid.x, zone.y + 0.03, mid.z], r: [0, yaw, 0] }));
    for (const s of [-0.85, 0.85]) {
      const off = { x: Math.cos(-yaw) * s, z: Math.sin(-yaw) * s };
      g.add(box(0.25, 0.12, len, palette.stone, { p: [mid.x + off.x, zone.y + 0.05, mid.z + off.z], r: [0, yaw, 0] }));
    }
    const fall = waterfall();
    fall.position.set(rim.x, zone.y, rim.z);
    fall.rotation.y = yaw;
    g.add(fall);
    const fb = footbridge();
    const fbPos = polar(zone, a, r0 + len * 0.55);
    fb.position.set(fbPos.x, zone.y, fbPos.z);
    fb.rotation.y = yaw + Math.PI / 2;
    g.add(fb);
    return { g, fall };
  }, [zone, a, r0]);
  const tick = group.fall.userData.tick as Tick | undefined;
  useTick((t, dt) => tick?.(t, dt));
  return <primitive object={group.g} />;
}

function Pier({ zone, a }: { zone: ZoneRuntime; a: number }) {
  const { p, b } = useMemo(() => {
    const p = pier();
    const at = polar(zone, a, zone.def.radius - 1.5);
    p.position.set(at.x, zone.y + 0.05, at.z);
    p.rotation.y = Math.PI - toRad(a) + Math.PI;
    const b = boat();
    const boatAt = polar(zone, a + 9, zone.def.radius + 4.5);
    const holder = new Group();
    holder.position.set(boatAt.x, zone.y - 0.4, boatAt.z);
    holder.rotation.y = Math.PI - toRad(a) + Math.PI / 2;
    holder.add(b);
    return { p, b: holder };
  }, [zone, a]);
  const boatTick = (b.children[0]?.userData.tick ?? undefined) as Tick | undefined;
  useTick((t, dt) => boatTick?.(t, dt));
  return (
    <>
      <primitive object={p} />
      <primitive object={b} />
    </>
  );
}

function Robots({ zone, count, r }: { zone: ZoneRuntime; count: number; r: number }) {
  const bots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const bot = robot({ seed: i, color: [palette.metal, palette.cream, palette.lavender, palette.sky][i % 4] });
        const a = (i / count) * Math.PI * 2;
        bot.position.set(zone.x + Math.cos(a) * r, zone.y + 0.1, zone.z + Math.sin(a) * r);
        return bot;
      }),
    [count, zone, r],
  );
  useTick((t, dt) =>
    bots.forEach((bot, i) => {
      const dir = i % 2 ? 1 : -1;
      const a = t * 0.18 * dir + (i / bots.length) * Math.PI * 2;
      const rr = r + Math.sin(t * 0.5 + i) * 0.8;
      bot.position.x = zone.x + Math.cos(a) * rr;
      bot.position.z = zone.z + Math.sin(a) * rr;
      bot.rotation.y = -a + (dir > 0 ? Math.PI : 0);
      (bot.userData.tick as Tick | undefined)?.(t, dt);
      bot.position.y += zone.y;
    }),
  );
  return (
    <>
      {bots.map((b, i) => (
        <primitive key={i} object={b} />
      ))}
    </>
  );
}

/** Glowing ground lines linking crystals of the same category, and each cluster to the skill tree. */
function CrystalLinks({ zone }: { zone: ZoneRuntime }) {
  const group = useMemo(() => {
    const g = new Group();
    const crystals = world.landmarks.filter((l) => l.zoneId === zone.id && l.def.group);
    const byGroup = new Map<string, typeof crystals>();
    for (const c of crystals) byGroup.set(c.def.group!, [...(byGroup.get(c.def.group!) ?? []), c]);
    const link = (ax: number, az: number, bx: number, bz: number, color: string) => {
      const len = Math.hypot(bx - ax, bz - az);
      g.add(box(0.22, 0.05, len, glowMat(color, 0.9), { p: [(ax + bx) / 2, zone.y + 0.06, (az + bz) / 2], r: [0, Math.atan2(bx - ax, bz - az), 0] }));
    };
    for (const list of byGroup.values()) {
      const color = (list[0]?.def.props?.color as string | undefined) ?? palette.sky;
      for (let i = 1; i < list.length; i++) link(list[i - 1]!.x, list[i - 1]!.z, list[i]!.x, list[i]!.z, color);
      const head = list[Math.floor(list.length / 2)]!;
      const dx = zone.x - head.x;
      const dz = zone.z - head.z;
      const d = Math.hypot(dx, dz);
      link(head.x + (dx / d) * 1.2, head.z + (dz / d) * 1.2, zone.x - (dx / d) * 3.2, zone.z - (dz / d) * 3.2, color);
      g.add(ico(0.2, glowMat(color, 1), { p: [zone.x - (dx / d) * 3.2, zone.y + 0.2, zone.z - (dz / d) * 3.2] }));
    }
    g.traverse((o) => (o.castShadow = false));
    return g;
  }, [zone]);
  return <primitive object={group} />;
}

function Feature({ zone, feature }: { zone: ZoneRuntime; feature: ZoneFeature }) {
  switch (feature.kind) {
    case 'plaza':
      return <Plaza zone={zone} r={feature.r} color={feature.color} />;
    case 'ring-road':
      return <RingRoad zone={zone} r={feature.r} width={feature.width} cars={feature.cars} />;
    case 'river':
      return <River zone={zone} a={feature.a} r0={feature.r0} />;
    case 'pier':
      return <Pier zone={zone} a={feature.a} />;
    case 'robots':
      return <Robots zone={zone} count={feature.count} r={feature.r} />;
    case 'crystal-links':
      return <CrystalLinks zone={zone} />;
  }
}

export function Features() {
  return (
    <>
      {world.zones.flatMap((zone) =>
        (zone.def.features ?? []).map((f, i) => <Feature key={`${zone.id}-${i}`} zone={zone} feature={f} />),
      )}
    </>
  );
}
