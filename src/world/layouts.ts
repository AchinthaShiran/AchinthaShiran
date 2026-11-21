/**
 * Content-driven landmark generators (ADR-002). Adding a role, project, skill or award to `content/`
 * adds the matching world object here — no hand placement required.
 */
import { floorColor } from '@/assets/models/city';
import { isModelKey } from '@/assets/manifest';
import {
  awards,
  formatYears,
  organizations,
  projects,
  rolesForOrganization,
  skillCategories,
  skillsInCategory,
} from '@/content';
import type { LandmarkDef } from './types';

const chronological = <T extends { start: string }>(items: readonly T[]) =>
  [...items].sort((a, b) => a.start.localeCompare(b.start));

/** Career City: one tower per organization (a floor per role) + one plaque per role leading to it. */
export function careerLandmarks(): LandmarkDef[] {
  const out: LandmarkDef[] = [];
  organizations.forEach((org, oi) => {
    const towerAngle = (oi * 75) % 360;
    const orgRoles = chronological(rolesForOrganization(org.id));
    out.push({
      id: `career-org-${org.id}`,
      name: org.name,
      model: 'officeTower',
      props: { floors: orgRoles.length, label: org.shortName },
      at: { a: towerAngle, r: 13.5 },
      panel: { kind: 'organization', id: org.id },
      hint: `View ${org.shortName} career`,
    });
    orgRoles.forEach((role, ri) => {
      out.push({
        id: `career-role-${role.id}`,
        name: role.title,
        model: 'rolePlaque',
        props: { color: floorColor(ri), label: role.title },
        at: { a: (towerAngle - (orgRoles.length - ri) * 28 + 360) % 360, r: 11.5 },
        panel: { kind: 'role', id: role.id },
        hint: 'View role',
      });
    });
  });
  return out;
}

/** Project Park: exhibits spread over the free arc between bridges (first row r=13.5, then r=18.5). */
export function parkLandmarks(arcStart = 40, arcEnd = 240, perRow = 6): LandmarkDef[] {
  const ordered = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  return ordered.map((project, i) => {
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, ordered.length - row * perRow);
    const k = i % perRow;
    const offset = row % 2 ? 0.5 : 0;
    const angle = arcStart + ((k + 0.5 + offset) * (arcEnd - arcStart)) / (inRow + offset);
    return {
      id: `park-exhibit-${project.id}`,
      name: project.shortName,
      model: isModelKey(project.exhibitModel) ? project.exhibitModel : 'exhibitGeneric',
      at: { a: angle, r: 13.5 + row * 5 },
      panel: { kind: 'project', id: project.id },
      hint: 'Inspect project',
    };
  });
}

/** Skill Forest: one crystal per skill, clustered by category along the free arc. */
export function forestLandmarks(arcStart = 255, arcSpan = 255, radius = 14): LandmarkDef[] {
  const clusters = skillCategories
    .map((c) => ({ category: c, skills: skillsInCategory(c.id) }))
    .filter((c) => c.skills.length > 0);
  const total = clusters.reduce((n, c) => n + c.skills.length, 0);
  const inner = total - clusters.length;
  const gaps = clusters.length - 1;
  // inner step : gap step = 1 : 2, scaled to fit the arc (capped for comfortable spacing)
  const step = Math.min(13, arcSpan / Math.max(1, inner + gaps * 2));
  const used = (inner + gaps * 2) * step;
  let angle = arcStart + (arcSpan - used) / 2;
  const out: LandmarkDef[] = [];
  clusters.forEach((cluster, ci) => {
    if (ci > 0) angle += step * 2;
    cluster.skills.forEach((skill, si) => {
      if (si > 0) angle += step;
      out.push({
        id: `forest-skill-${skill.id}`,
        name: skill.name,
        model: 'crystal',
        props: { color: cluster.category.color, label: skill.name, seed: out.length },
        at: { a: angle % 360, r: radius },
        panel: { kind: 'skill', id: skill.id },
        hint: 'View skill',
        group: cluster.category.id,
      });
    });
  });
  return out;
}

const TROPHY_COLORS = ['#FFD27D', '#F5A6A6', '#B9A1E8', '#75BDEB', '#80CFA9', '#FFB07D'];

/** Achievement Peak: trophies along the trail — newest highest. Extra awards spill onto the base ring. */
export function peakLandmarks(): LandmarkDef[] {
  const slots: { a: number; r: number; level: number; face: 'center' | 'out' }[] = [
    { a: 330, r: 12.7, level: 1.8, face: 'center' },
    { a: 295, r: 12.7, level: 1.8, face: 'center' },
    { a: 260, r: 12.7, level: 1.8, face: 'center' },
    { a: 225, r: 12.7, level: 1.8, face: 'center' },
    { a: 220, r: 17.5, level: 0, face: 'out' },
    { a: 140, r: 17.5, level: 0, face: 'out' },
    { a: 100, r: 17.5, level: 0, face: 'out' },
    { a: 260, r: 17.5, level: 0, face: 'out' },
    { a: 60, r: 17.5, level: 0, face: 'out' },
    { a: 300, r: 17.5, level: 0, face: 'out' },
  ];
  const ordered = [...awards].sort((a, b) => Math.max(...b.years) - Math.max(...a.years));
  if (ordered.length > slots.length) {
    throw new Error(`Achievement Peak has ${slots.length} trophy slots; add more in peakLandmarks()`);
  }
  return ordered.map((award, i) => {
    const slot = slots[i]!;
    return {
      id: `peak-award-${award.id}`,
      name: award.title,
      model: 'trophy',
      props: {
        color: TROPHY_COLORS[i % TROPHY_COLORS.length],
        label: formatYears(award.years).replace(' and ', ' · '),
      },
      at: { a: slot.a, r: slot.r },
      level: slot.level,
      face: slot.face,
      panel: { kind: 'award', id: award.id },
      hint: 'View award',
    };
  });
}

export const skillCategoryColors = () => skillCategories.map((c) => c.color);
