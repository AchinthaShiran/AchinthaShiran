import { describe, expect, it } from 'vitest';
import { getModel } from '@/assets/manifest';
import {
  getAward,
  getContact,
  getMentoring,
  getProject,
  getProjectTopic,
  getRole,
  getSageTopic,
  getSeed,
  getSkill,
  organizations,
  projects,
  projectsByCategory,
  roles,
  skills,
  awards,
  ideaSeeds,
} from '@/content';
import { buildWorld, segmentWalkable } from './build';
import { personalSections, projectIslands, sections } from './sections';
import type { PanelRef } from './types';
import { zoneLinks, zones } from './zones';

const world = buildWorld();
const homeHub = world.zone('home').hubNodeId;

function panelTargetExists(p: PanelRef): boolean {
  switch (p.kind) {
    case 'organization':
      return organizations.some((o) => o.id === p.id);
    case 'role':
      return !!getRole(p.id);
    case 'project':
      return !!getProject(p.id);
    case 'project-topic':
      return !!getProjectTopic(p.project, p.id);
    case 'skill':
      return !!getSkill(p.id);
    case 'award':
      return !!getAward(p.id);
    case 'sage':
      return !!getSageTopic(p.id);
    case 'mentoring':
      return !!getMentoring(p.id);
    case 'contact-channel':
      return !!getContact(p.id);
    case 'seed':
      return !!getSeed(p.id);
    default:
      return true;
  }
}

describe('world layout', () => {
  it('creates one bridge per zone link and a hub per zone', () => {
    expect(world.bridges).toHaveLength(zoneLinks.length);
    for (const z of world.zones) expect(world.nav.getNode(z.hubNodeId)).toBeDefined();
  });

  it('spawns the player on walkable ground at Home', () => {
    const s = world.spawn;
    expect(world.collision.isWalkable(s.x, s.z, s.y)).toBe(true);
    expect(world.zoneAt(s.x, s.z)?.id).toBe('home');
  });

  it('keeps every nav edge walkable', () => {
    const bad = world.navEdges.filter(
      (e) =>
        !e.a.id.startsWith('bridge-') &&
        !e.a.id.includes(':ramp') &&
        !segmentWalkable(world.collision, e.a, e.b),
    );
    expect(bad.map((e) => `${e.a.id} → ${e.b.id}`)).toEqual([]);
  });

  it('can reach every zone hub from Home', () => {
    for (const z of world.zones) {
      expect(world.nav.findPath(homeHub, z.hubNodeId), `zone ${z.id}`).not.toBeNull();
    }
  });

  it('can reach every interactable from Home with a walkable approach point', () => {
    const unreachable = world.interactables.filter((lm) => {
      if (!lm.navNodeId || !lm.approach) return true;
      if (!world.collision.isWalkable(lm.approach.x, lm.approach.z, lm.approach.y)) return true;
      return world.nav.findPath(homeHub, lm.navNodeId) === null;
    });
    expect(unreachable.map((l) => l.id)).toEqual([]);
  });

  it('places every seed on walkable ground', () => {
    const bad = world.seeds.filter((s) => world.collision.groundAt(s.x, s.z, s.y + 0.1) === null);
    expect(bad.map((s) => s.id)).toEqual([]);
  });

  it('has globally unique landmark ids', () => {
    const ids = world.landmarks.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not overlap landmark footprints on the same level', () => {
    const solid = world.landmarks.filter((l) => getModel(l.def.model).footprint);
    const overlaps: string[] = [];
    const radius = (id: string) => {
      const lm = world.landmark(id)!;
      const fp = getModel(lm.def.model).footprint!;
      return (fp.kind === 'circle' ? fp.r : Math.min(fp.w, fp.d) / 2) * lm.scale;
    };
    for (let i = 0; i < solid.length; i++)
      for (let j = i + 1; j < solid.length; j++) {
        const a = solid[i]!;
        const b = solid[j]!;
        if (a.zoneId !== b.zoneId || Math.abs(a.y - b.y) > 0.5) continue;
        if (Math.hypot(a.x - b.x, a.z - b.z) < radius(a.id) + radius(b.id))
          overlaps.push(`${a.id} × ${b.id}`);
      }
    expect(overlaps).toEqual([]);
  });

  it('keeps all islands apart', () => {
    for (let i = 0; i < zones.length; i++)
      for (let j = i + 1; j < zones.length; j++) {
        const a = zones[i]!;
        const b = zones[j]!;
        const d = Math.hypot(a.center[0] - b.center[0], a.center[1] - b.center[1]);
        expect(d, `${a.id}/${b.id}`).toBeGreaterThan(a.radius + b.radius + 6);
      }
  });
});

describe('content → world mapping', () => {
  it('represents every project, role, skill and award as an interactable', () => {
    const panels = world.interactables.map((l) => l.panel!);
    const has = (kind: string, id: string) => panels.some((p) => p.kind === kind && 'id' in p && p.id === id);
    projects.forEach((p) => expect(has('project', p.id), p.id).toBe(true));
    roles.forEach((r) => expect(has('role', r.id), r.id).toBe(true));
    skills.forEach((s) => expect(has('skill', s.id), s.id).toBe(true));
    awards.forEach((a) => expect(has('award', a.id), a.id).toBe(true));
  });

  it('places every idea seed exactly once', () => {
    expect(world.seeds.map((s) => s.id).sort()).toEqual(ideaSeeds.map((s) => s.id).sort());
  });

  it('only links panels to existing content', () => {
    for (const lm of world.interactables) expect(panelTargetExists(lm.panel!), lm.id).toBe(true);
  });

  it('points every quick-nav section at an existing interactable', () => {
    for (const s of sections) {
      const lm = world.landmark(s.landmarkId);
      expect(lm?.panel, s.id).toBeTruthy();
      expect(lm?.zoneId).toBe(s.zoneId);
    }
  });

  it('routes from Home spawn to every section', () => {
    for (const s of [...sections, ...personalSections]) {
      const node = world.targetNode({ kind: 'landmark', id: s.landmarkId });
      expect(node).not.toBeNull();
      expect(world.routeTo(world.spawn, node!), s.id).not.toBeNull();
    }
  });
});

describe('personal project islands (ADR-005)', () => {
  const personal = projectsByCategory('personal');

  it('gives every personal project its own island with a landmark that opens it', () => {
    expect(personalSections.map((s) => s.id).sort()).toEqual(personal.map((p) => p.id).sort());
    const zonesUsed = personalSections.map((s) => s.zoneId);
    expect(new Set(zonesUsed).size).toBe(personal.length);
    for (const s of personalSections) {
      const lm = world.landmark(s.landmarkId);
      expect(lm?.zoneId, s.id).toBe(s.zoneId);
      expect(lm?.panel, s.id).toEqual({ kind: 'project', id: s.id });
    }
  });

  it('has a station for every topic of every personal project', () => {
    const stations = world.interactables.flatMap((l) => (l.panel?.kind === 'project-topic' ? [l.panel] : []));
    const missing = personal.flatMap((p) =>
      p.topics
        .filter((t) => !stations.some((s) => s.project === p.id && s.id === t.id))
        .map((t) => `${p.id}/${t.id}`),
    );
    expect(missing).toEqual([]);
  });

  it('keeps the stations of a project on its own island', () => {
    for (const lm of world.interactables) {
      const panel = lm.panel;
      if (panel?.kind !== 'project-topic') continue;
      const home = personalSections.find((s) => s.id === panel.project);
      expect(lm.zoneId, lm.id).toBe(home?.zoneId);
    }
  });

  it('keeps Project Park for corporate projects only', () => {
    const exhibits = world.landmarks.filter((l) => l.id.startsWith('park-exhibit-')).map((l) => l.id);
    expect(exhibits.sort()).toEqual(
      projectsByCategory('corporate')
        .map((p) => `park-exhibit-${p.id}`)
        .sort(),
    );
  });

  it('links the Makers Row islands into the world through bridges', () => {
    for (const s of personalSections) {
      const hub = world.zone(s.zoneId).hubNodeId;
      expect(world.nav.findPath(homeHub, hub), s.id).not.toBeNull();
    }
  });
});

describe('project connections', () => {
  const linked = (a: string, b: string) =>
    world.bridges.some((br) => (br.a === a && br.b === b) || (br.a === b && br.b === a));

  it('bridges the Innovation Lab (SAGE) to Career City (Sysco LABS) and to Project Park', () => {
    expect(linked('lab', 'career')).toBe(true);
    expect(linked('lab', 'park')).toBe(true);
  });

  it('keeps Project Park connected to Career City and to the personal project islands', () => {
    expect(linked('career', 'park')).toBe(true);
    expect(linked('park', 'tala')).toBe(true);
  });

  it('puts a gateway in Project Park for every personal project, opening that project', () => {
    for (const p of projectsByCategory('personal')) {
      const gateway = world.landmark(`park-gateway-${p.id}`);
      expect(gateway?.zoneId, p.id).toBe('park');
      expect(gateway?.panel, p.id).toEqual({ kind: 'project', id: p.id });
    }
  });

  it('tells every project panel where its island is (SAGE and all personal projects)', () => {
    expect(projectIslands.get('sage')?.zoneId).toBe('lab');
    for (const p of projectsByCategory('personal')) {
      const island = projectIslands.get(p.id);
      expect(island, p.id).toBeDefined();
      expect(world.landmark(island!.landmarkId)?.zoneId, p.id).toBe(island!.zoneId);
      expect(world.nav.findPath(homeHub, world.zone(island!.zoneId).hubNodeId), p.id).not.toBeNull();
    }
  });

  it('keeps the Sysco LABS district close together', () => {
    const dist = (a: string, b: string) => {
      const za = world.zone(a as never);
      const zb = world.zone(b as never);
      return Math.hypot(za.x - zb.x, za.z - zb.z);
    };
    expect(dist('lab', 'park')).toBeLessThan(70);
    expect(dist('career', 'park')).toBeLessThan(70);
  });
});
