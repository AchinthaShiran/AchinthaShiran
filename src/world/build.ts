/**
 * buildWorld(): pure transformation from zone config + content into the runtime World (ADR-002).
 * Scene, engine and UI all read this one immutable structure.
 */
import { getModel, type ModelKey } from '@/assets/manifest';
import type { Footprint } from '@/assets/types';
import { CollisionWorld, DEFAULT_COLLISION, type Obstacle, type Surface } from '@/engine/collision';
import { createRng, hashString, type Vec3 } from '@/engine/math';
import { NavGraph, type NavNode } from '@/engine/nav';
import type { DecorKind, LandmarkDef, PanelRef, Polar, ZoneDef, ZoneId, ZoneLink } from './types';
import { zoneLinks as defaultLinks, zones as defaultZones } from './zones';

export const RIM_MARGIN = 0.9;
const BRIDGE_HALF_WIDTH = 1.25;
const RAMP_HALF_WIDTH = 1.1;
const APPROACH_GAP = 1.5;

export interface ZoneRuntime {
  readonly def: ZoneDef;
  readonly id: ZoneId;
  readonly x: number;
  readonly z: number;
  readonly y: number;
  hubNodeId: string;
}

export interface LandmarkRuntime {
  readonly def: LandmarkDef;
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly yaw: number;
  readonly scale: number;
  readonly height: number;
  /** Radius used for proximity detection (footprint + reach). */
  readonly interactRadius: number;
  readonly panel: PanelRef | null;
  approach: Vec3 | null;
  navNodeId: string | null;
}

export interface StripRuntime {
  readonly id: string;
  readonly zoneId: ZoneId | null;
  readonly ax: number;
  readonly az: number;
  readonly ay: number;
  readonly bx: number;
  readonly bz: number;
  readonly by: number;
  readonly halfWidth: number;
}

export interface BridgeRuntime extends StripRuntime {
  readonly a: ZoneId;
  readonly b: ZoneId;
}

export interface TierRuntime {
  readonly zoneId: ZoneId;
  readonly x: number;
  readonly z: number;
  readonly y: number;
  readonly baseY: number;
  readonly radius: number;
}

export interface DecorItem {
  readonly kind: DecorKind;
  readonly zoneId: ZoneId;
  readonly seed: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly yaw: number;
  readonly scale: number;
}

export interface NavEdge {
  readonly a: NavNode;
  readonly b: NavNode;
}

export interface Spawn extends Vec3 {
  readonly yaw: number;
}

export interface World {
  readonly zones: readonly ZoneRuntime[];
  readonly landmarks: readonly LandmarkRuntime[];
  readonly interactables: readonly LandmarkRuntime[];
  readonly bridges: readonly BridgeRuntime[];
  readonly ramps: readonly StripRuntime[];
  readonly tiers: readonly TierRuntime[];
  readonly decor: readonly DecorItem[];
  readonly navEdges: readonly NavEdge[];
  readonly collision: CollisionWorld;
  readonly nav: NavGraph;
  readonly spawn: Spawn;
  zone(id: ZoneId): ZoneRuntime;
  landmark(id: string): LandmarkRuntime | undefined;
  zoneSpawn(id: ZoneId): Spawn;
  /** Zone whose island disc contains (x, z), or null on bridges. */
  zoneAt(x: number, z: number): ZoneRuntime | null;
  /** Nearest nav node reachable in a straight walkable line from p. */
  nearestReachableNode(p: Vec3): NavNode | undefined;
  /** Walkable path of points from p to a nav node (null if unreachable). */
  routeTo(p: Vec3, nodeId: string): Vec3[] | null;
  /** Nav node id the guide targets for a zone or landmark. */
  targetNode(target: { kind: 'zone'; id: ZoneId } | { kind: 'landmark'; id: string }): string | null;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const polarToLocal = ({ a, r }: Polar) => ({ x: Math.sin(toRad(a)) * r, z: -Math.cos(toRad(a)) * r });
const compassFromLocal = (x: number, z: number) => (Math.atan2(x, -z) * 180) / Math.PI;
/** Yaw making a +Z-facing model point toward compass direction `deg`. */
const yawFromCompass = (deg: number) => Math.PI - toRad(deg);

const footprintRadius = (f: Footprint | null) =>
  f === null ? 0.5 : f.kind === 'circle' ? f.r : Math.hypot(f.w, f.d) / 2;
const footprintDepth = (f: Footprint | null) => (f === null ? 0.4 : f.kind === 'circle' ? f.r : f.d / 2);

function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const abx = bx - ax;
  const abz = bz - az;
  const len2 = abx * abx + abz * abz;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / len2));
  return Math.hypot(ax + abx * t - px, az + abz * t - pz);
}

/** True if walking the straight segment a→b stays on walkable ground and clear of obstacles. */
export function segmentWalkable(col: CollisionWorld, a: Vec3, b: Vec3, step = 0.35): boolean {
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  const steps = Math.max(1, Math.ceil(len / step));
  let y = a.y;
  const p = { x: 0, z: 0 };
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = a.x + (b.x - a.x) * t;
    const z = a.z + (b.z - a.z) * t;
    const g = col.groundAt(x, z, y);
    if (g === null) return false;
    y = g;
    p.x = x;
    p.z = z;
    col.resolveObstacles(p, y);
    if (Math.hypot(p.x - x, p.z - z) > 0.05) return false;
  }
  return Math.abs(y - b.y) < 0.5;
}

export function buildWorld(
  zoneDefs: readonly ZoneDef[] = defaultZones,
  links: readonly ZoneLink[] = defaultLinks,
): World {
  const zones: ZoneRuntime[] = zoneDefs.map((def) => ({
    def,
    id: def.id,
    x: def.center[0],
    z: def.center[1],
    y: def.elevation,
    hubNodeId: '',
  }));
  const zoneMap = new Map(zones.map((z) => [z.id, z]));
  const getZone = (id: ZoneId) => {
    const z = zoneMap.get(id);
    if (!z) throw new Error(`Unknown zone "${id}"`);
    return z;
  };
  const toWorld = (zone: ZoneRuntime, local: { x: number; z: number }) => ({
    x: zone.x + local.x,
    z: zone.z + local.z,
  });

  const surfaces: Surface[] = [];
  const obstacles: Obstacle[] = [];
  const tiers: TierRuntime[] = [];
  const ramps: StripRuntime[] = [];
  const bridges: BridgeRuntime[] = [];

  // 1. Island discs, tiers and ramps
  for (const zone of zones) {
    surfaces.push({ kind: 'disc', cx: zone.x, cz: zone.z, r: zone.def.radius - RIM_MARGIN, y: zone.y });
    let prevHeight = 0;
    zone.def.tiers?.forEach((tier, ti) => {
      const y = zone.y + tier.height;
      tiers.push({
        zoneId: zone.id,
        x: zone.x,
        z: zone.z,
        y,
        baseY: zone.y + prevHeight,
        radius: tier.radius,
      });
      surfaces.push({
        kind: 'disc',
        cx: zone.x,
        cz: zone.z,
        r: tier.radius - DEFAULT_COLLISION.playerRadius,
        y,
      });
      obstacles.push({
        kind: 'circle',
        x: zone.x,
        z: zone.z,
        r: tier.radius,
        y0: zone.y - 1,
        y1: y - DEFAULT_COLLISION.stepUp - 0.05,
      });
      const topR = tier.radius - 0.8;
      const bottom = toWorld(zone, polarToLocal({ a: tier.rampAngle, r: topR + tier.rampLength }));
      const top = toWorld(zone, polarToLocal({ a: tier.rampAngle, r: topR }));
      const ramp: StripRuntime = {
        id: `${zone.id}-ramp-${ti}`,
        zoneId: zone.id,
        ax: bottom.x,
        az: bottom.z,
        ay: zone.y + prevHeight,
        bx: top.x,
        bz: top.z,
        by: y,
        halfWidth: RAMP_HALF_WIDTH,
      };
      ramps.push(ramp);
      surfaces.push({
        kind: 'strip',
        ax: ramp.ax,
        az: ramp.az,
        bx: ramp.bx,
        bz: ramp.bz,
        halfWidth: ramp.halfWidth,
        ay: ramp.ay,
        by: ramp.by,
      });
      prevHeight = tier.height;
    });
  }

  // 2. Bridges between zones
  for (const link of links) {
    const za = getZone(link.a);
    const zb = getZone(link.b);
    const dx = zb.x - za.x;
    const dz = zb.z - za.z;
    const len = Math.hypot(dx, dz);
    const ux = dx / len;
    const uz = dz / len;
    const inset = RIM_MARGIN + 0.3;
    const bridge: BridgeRuntime = {
      id: `bridge-${link.a}-${link.b}`,
      zoneId: null,
      a: link.a,
      b: link.b,
      ax: za.x + ux * (za.def.radius - inset),
      az: za.z + uz * (za.def.radius - inset),
      ay: za.y,
      bx: zb.x - ux * (zb.def.radius - inset),
      bz: zb.z - uz * (zb.def.radius - inset),
      by: zb.y,
      halfWidth: BRIDGE_HALF_WIDTH,
    };
    bridges.push(bridge);
    surfaces.push({
      kind: 'strip',
      ax: bridge.ax,
      az: bridge.az,
      bx: bridge.bx,
      bz: bridge.bz,
      halfWidth: bridge.halfWidth,
      ay: bridge.ay,
      by: bridge.by,
    });
  }

  // 3. Landmarks
  const landmarks: LandmarkRuntime[] = [];
  for (const zone of zones) {
    for (const def of zone.def.landmarks) {
      const local = 'a' in def.at ? polarToLocal(def.at) : def.at;
      const { x, z } = toWorld(zone, local);
      const y = zone.y + (def.level ?? 0);
      const face = def.face ?? 'center';
      const centerCompass = compassFromLocal(-local.x, -local.z);
      const yaw =
        face === 'center'
          ? Math.hypot(local.x, local.z) < 0.01
            ? 0
            : yawFromCompass(centerCompass)
          : face === 'out'
            ? yawFromCompass(centerCompass + 180)
            : yawFromCompass(face.deg);
      const entry = getModel(def.model);
      const scale = def.scale ?? 1;
      const fp = entry.footprint;
      if (fp) {
        obstacles.push(
          fp.kind === 'circle'
            ? { kind: 'circle', x, z, r: fp.r * scale, y0: y, y1: y + entry.height * scale }
            : {
                kind: 'box',
                x,
                z,
                hw: (fp.w * scale) / 2,
                hd: (fp.d * scale) / 2,
                rot: yaw,
                y0: y,
                y1: y + entry.height * scale,
              },
        );
      }
      landmarks.push({
        def,
        id: def.id,
        zoneId: zone.id,
        x,
        y,
        z,
        yaw,
        scale,
        height: entry.height * scale,
        interactRadius: footprintRadius(fp) * scale + 2.6,
        panel: def.panel ?? null,
        approach: null,
        navNodeId: null,
      });
    }
  }

  const collision = new CollisionWorld(surfaces, obstacles);

  // 4. Navigation graph
  const nav = new NavGraph();
  const navEdges: NavEdge[] = [];
  const edgeKeys = new Set<string>();
  const nodesByZone = new Map<ZoneId, NavNode[]>();

  const addNode = (id: string, zoneId: ZoneId, x: number, z: number, y: number): NavNode => {
    const node: NavNode = { id, zoneId, x, y, z };
    nav.addNode(node);
    const list = nodesByZone.get(zoneId) ?? [];
    list.push(node);
    nodesByZone.set(zoneId, list);
    return node;
  };
  const connect = (a: NavNode, b: NavNode, force = false): boolean => {
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    if (a.id === b.id || edgeKeys.has(key)) return false;
    if (!force && !segmentWalkable(collision, a, b)) return false;
    edgeKeys.add(key);
    nav.addEdge(a.id, b.id);
    navEdges.push({ a, b });
    return true;
  };
  const linkNearest = (node: NavNode, k: number, filter: (n: NavNode) => boolean = () => true) => {
    const candidates = (nodesByZone.get(node.zoneId as ZoneId) ?? [])
      .filter((n) => n.id !== node.id && Math.abs(n.y - node.y) < 0.35 && filter(n))
      .sort((p, q) => Math.hypot(p.x - node.x, p.z - node.z) - Math.hypot(q.x - node.x, q.z - node.z));
    let linked = 0;
    for (const c of candidates) {
      if (linked >= k) break;
      if (connect(node, c)) linked++;
    }
    return linked;
  };
  const surfaceY = (x: number, z: number, near: number) => collision.groundAt(x, z, near) ?? near;

  for (const zone of zones) {
    const def = zone.def;
    const structural: NavNode[] = [];
    // rings
    const rings = def.navRings.map((r, ri) => {
      const n = Math.max(8, Math.round((2 * Math.PI * r) / 6));
      const nodes: NavNode[] = [];
      for (let i = 0; i < n; i++) {
        const { x, z } = toWorld(zone, polarToLocal({ a: (i * 360) / n, r }));
        const node = addNode(`${zone.id}:ring${ri}:${i}`, zone.id, x, z, zone.y);
        nodes.push(node);
        structural.push(node);
      }
      nodes.forEach((node, i) => connect(node, nodes[(i + 1) % n]!));
      return nodes;
    });
    rings.forEach((ring, ri) => {
      const outer = rings[ri + 1];
      if (outer) ring.forEach((node) => linkNearest(node, 1, (n) => outer.includes(n)));
    });
    // hub
    const hubLocal = def.hub ?? { x: 0, z: 0 };
    const hubWorld = toWorld(zone, hubLocal);
    if (def.hub || collision.isWalkable(hubWorld.x, hubWorld.z, zone.y)) {
      const hub = addNode(`${zone.id}:hub`, zone.id, hubWorld.x, hubWorld.z, zone.y);
      zone.hubNodeId = hub.id;
      linkNearest(hub, def.hub ? 3 : 64);
    } else {
      const homeZone = zones[0]!;
      const firstRing = rings[0] ?? [];
      const towardHome = [...firstRing].sort(
        (p, q) =>
          Math.hypot(p.x - homeZone.x, p.z - homeZone.z) - Math.hypot(q.x - homeZone.x, q.z - homeZone.z),
      )[0];
      if (!towardHome) throw new Error(`Zone "${zone.id}" has a blocked centre and no nav ring`);
      zone.hubNodeId = towardHome.id;
    }
    // tiers: ramp ends + trails
    def.tiers?.forEach((tier, ti) => {
      const ramp = ramps.find((r) => r.id === `${zone.id}-ramp-${ti}`)!;
      const bottom = addNode(`${zone.id}:ramp${ti}:bottom`, zone.id, ramp.ax, ramp.az, ramp.ay);
      const top = addNode(`${zone.id}:ramp${ti}:top`, zone.id, ramp.bx, ramp.bz, ramp.by);
      connect(bottom, top, true);
      const trail = tier.trail.map((a, k) => {
        const { x, z } = toWorld(zone, polarToLocal({ a, r: tier.trailRadius }));
        return addNode(`${zone.id}:tier${ti}:${k}`, zone.id, x, z, ramp.by);
      });
      trail.forEach((node, k) => {
        const next = trail[k + 1];
        if (next) connect(node, next);
      });
      linkNearest(bottom, 2);
      linkNearest(top, 2);
    });
  }

  // bridge ends
  for (const bridge of bridges) {
    const ea = addNode(`${bridge.id}:a`, bridge.a, bridge.ax, bridge.az, bridge.ay);
    const eb = addNode(`${bridge.id}:b`, bridge.b, bridge.bx, bridge.bz, bridge.by);
    connect(ea, eb, true);
    linkNearest(ea, 2, (n) => !n.id.startsWith('bridge-'));
    linkNearest(eb, 2, (n) => !n.id.startsWith('bridge-'));
  }
  // ramp bottoms may need to reach bridge-adjacent base nodes linked after bridges; relink zone hubs to bridges
  for (const zone of zones) {
    const hub = nav.getNode(zone.hubNodeId);
    if (hub && nav.neighbours(hub.id).length === 0) linkNearest(hub, 3);
  }

  // landmark approach nodes
  for (const lm of landmarks) {
    if (!lm.panel) continue;
    const entry = getModel(lm.def.model);
    const fwdX = Math.sin(lm.yaw);
    const fwdZ = Math.cos(lm.yaw);
    const reach = footprintDepth(entry.footprint) * lm.scale + APPROACH_GAP;
    let ax = lm.x + fwdX * reach;
    let az = lm.z + fwdZ * reach;
    const p = { x: ax, z: az };
    collision.resolveObstacles(p, lm.y);
    ax = p.x;
    az = p.z;
    const ay = surfaceY(ax, az, lm.y);
    const node = addNode(`${lm.zoneId}:lm:${lm.id}`, lm.zoneId, ax, az, ay);
    lm.approach = { x: ax, y: ay, z: az };
    lm.navNodeId = node.id;
    linkNearest(node, 2, (n) => !n.id.includes(':lm:'));
  }

  // 5. Decor scattering
  const decor: DecorItem[] = [];
  const decorObstacleKinds: Partial<Record<DecorKind, ModelKey>> = {
    treeRound: 'treeRound',
    treePine: 'treePine',
    blossomTree: 'blossomTree',
    rock: 'rock',
  };
  for (const zone of zones) {
    const rng = createRng(hashString(zone.id));
    const def = zone.def;
    const zoneEdges = navEdges.filter((e) => e.a.zoneId === zone.id || e.b.zoneId === zone.id);
    const zoneLandmarks = landmarks.filter((l) => l.zoneId === zone.id);
    const corridors = bridges
      .filter((b) => b.a === zone.id || b.b === zone.id)
      .map((b) => (b.a === zone.id ? { x: b.ax, z: b.az } : { x: b.bx, z: b.bz }));
    const river = def.features?.find((f) => f.kind === 'river');
    const pier = def.features?.find((f) => f.kind === 'pier');
    const placed: { x: number; z: number; r: number }[] = [];

    for (const [kind, count] of Object.entries(def.decor) as [DecorKind, number][]) {
      const solid = kind in decorObstacleKinds;
      const itemR = solid ? 0.8 : 0.35;
      let made = 0;
      for (let attempt = 0; attempt < count * 40 && made < count; attempt++) {
        const r = def.decorMinRadius + rng() * (def.radius - 1.3 - def.decorMinRadius);
        const a = rng() * 360;
        const local = polarToLocal({ a, r });
        const { x, z } = toWorld(zone, local);
        if (
          zoneLandmarks.some(
            (l) =>
              Math.hypot(l.x - x, l.z - z) <
              footprintRadius(getModel(l.def.model).footprint) * l.scale + itemR + 0.8,
          )
        )
          continue;
        if (zoneEdges.some((e) => distToSegment(x, z, e.a.x, e.a.z, e.b.x, e.b.z) < (solid ? 1.7 : 0.9)))
          continue;
        if (
          corridors.some(
            (c) =>
              distToSegment(x, z, zone.x, zone.z, c.x + (c.x - zone.x) * 0.2, c.z + (c.z - zone.z) * 0.2) <
              2.6,
          )
        )
          continue;
        if (river && river.kind === 'river') {
          const s = toWorld(zone, polarToLocal({ a: river.a, r: river.r0 - 1 }));
          const e = toWorld(zone, polarToLocal({ a: river.a, r: def.radius + 1 }));
          if (distToSegment(x, z, s.x, s.z, e.x, e.z) < 1.8) continue;
        }
        if (pier && pier.kind === 'pier' && Math.abs(((a - pier.a + 540) % 360) - 180) < 12) continue;
        if (placed.some((p) => Math.hypot(p.x - x, p.z - z) < p.r + itemR)) continue;
        const scale = 0.8 + rng() * 0.5;
        const seed = Math.floor(rng() * 1000);
        decor.push({ kind, zoneId: zone.id, seed, x, y: zone.y, z, yaw: rng() * Math.PI * 2, scale });
        placed.push({ x, z, r: itemR });
        const key = decorObstacleKinds[kind];
        if (key) {
          const fp = getModel(key).footprint;
          if (fp?.kind === 'circle')
            obstacles.push({ kind: 'circle', x, z, r: fp.r * scale, y0: zone.y, y1: zone.y + 3 });
        }
        made++;
      }
    }
  }

  // 6. Queries
  const landmarkMap = new Map(landmarks.map((l) => [l.id, l]));
  const interactables = landmarks.filter((l) => l.panel !== null);

  const zoneSpawn = (id: ZoneId): Spawn => {
    const zone = getZone(id);
    const hub = nav.getNode(zone.hubNodeId);
    const x = hub?.x ?? zone.x;
    const z = hub?.z ?? zone.z;
    const y = hub?.y ?? zone.y;
    const centerDist = Math.hypot(zone.x - x, zone.z - z);
    // Face the zone centre when spawning off-centre; Home faces south toward Achintha.
    const yaw = centerDist > 0.5 ? Math.atan2(zone.x - x, zone.z - z) : id === 'home' ? 0 : Math.PI;
    return { x, y, z, yaw };
  };

  const nearestReachableNode = (p: Vec3): NavNode | undefined => {
    const sorted = nav
      .allNodes()
      .map((n) => ({ n, d: Math.hypot(n.x - p.x, n.z - p.z) + Math.abs(n.y - p.y) * 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 12);
    return sorted.find(({ n }) => segmentWalkable(collision, p, n))?.n ?? sorted[0]?.n;
  };

  const routeTo = (p: Vec3, nodeId: string): Vec3[] | null => {
    const start = nearestReachableNode(p);
    if (!start) return null;
    const path = nav.findPath(start.id, nodeId);
    if (!path) return null;
    const points: Vec3[] = path.map((n) => ({ x: n.x, y: n.y, z: n.z }));
    // Skip the first node if we can walk straight to the second one.
    if (points.length > 1 && segmentWalkable(collision, p, points[1]!)) points.shift();
    return points;
  };

  const targetNode = (target: { kind: 'zone'; id: ZoneId } | { kind: 'landmark'; id: string }) => {
    if (target.kind === 'landmark') return landmarkMap.get(target.id)?.navNodeId ?? null;
    const zone = zoneMap.get(target.id);
    if (!zone) return null;
    return landmarkMap.get(zone.def.primaryLandmark)?.navNodeId ?? zone.hubNodeId;
  };

  return {
    zones,
    landmarks,
    interactables,
    bridges,
    ramps,
    tiers,
    decor,
    navEdges,
    collision,
    nav,
    spawn: zoneSpawn('home'),
    zone: getZone,
    landmark: (id) => landmarkMap.get(id),
    zoneSpawn,
    zoneAt: (x, z) => zones.find((zn) => Math.hypot(zn.x - x, zn.z - z) <= zn.def.radius) ?? null,
    nearestReachableNode,
    routeTo,
    targetNode,
  };
}

let cached: World | null = null;
/** Lazily built singleton world for the app. */
export function getWorld(): World {
  cached ??= buildWorld();
  return cached;
}
