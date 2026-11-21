import { awards } from './awards';
import { contacts, cv } from './contact';
import { education } from './education';
import { organizations, roles } from './experience';
import { mentoring } from './mentoring';
import { profile } from './profile';
import { projects } from './projects';
import { sageTopics } from './sage';
import { ideaSeeds } from './seeds';
import { skillCategories, skills } from './skills';
import type { Award, ContactKind, Id, Project, Role, Skill, YearMonth } from './types';

export * from './types';
export {
  awards,
  contacts,
  cv,
  education,
  ideaSeeds,
  mentoring,
  organizations,
  profile,
  projects,
  roles,
  sageTopics,
  skillCategories,
  skills,
};

function indexById<T extends { readonly id: Id }>(items: readonly T[]): ReadonlyMap<Id, T> {
  return new Map(items.map((item) => [item.id, item]));
}

const projectById = indexById(projects);
const roleById = indexById(roles);
const skillById = indexById(skills);
const awardById = indexById(awards);
const orgById = indexById(organizations);

export const getProject = (id: Id): Project | undefined => projectById.get(id);
export const getRole = (id: Id): Role | undefined => roleById.get(id);
export const getSkill = (id: Id): Skill | undefined => skillById.get(id);
export const getAward = (id: Id): Award | undefined => awardById.get(id);
export const getOrganization = (id: Id) => orgById.get(id);
export const getSageTopic = (id: Id) => sageTopics.find((t) => t.id === id);
export const getMentoring = (id: Id) => mentoring.find((m) => m.id === id);
export const getSeed = (id: Id) => ideaSeeds.find((s) => s.id === id);
export const getContact = (kind: ContactKind) => contacts.find((c) => c.id === kind);
export const getSkillCategory = (id: Skill['categoryId']) => skillCategories.find((c) => c.id === id);

export const awardsForProject = (projectId: Id): Award[] => awards.filter((a) => a.projectId === projectId);
export const projectsUsingSkill = (skillId: Id): Project[] =>
  projects.filter((p) => p.technologies.includes(skillId));
export const skillsInCategory = (categoryId: Skill['categoryId']): Skill[] =>
  skills.filter((s) => s.categoryId === categoryId);
export const rolesForOrganization = (orgId: Id): Role[] => roles.filter((r) => r.organizationId === orgId);
export const rolesForProject = (projectId: Id): Role[] =>
  roles.filter((r) => r.projectIds.includes(projectId));

/** The latest role (no end date first, then most recent start). */
export function currentRole(): Role {
  const sorted = [...roles].sort((a, b) => {
    if (a.end === null && b.end !== null) return -1;
    if (b.end === null && a.end !== null) return 1;
    return b.start.localeCompare(a.start);
  });
  const first = sorted[0];
  if (!first) throw new Error('Content error: at least one role is required');
  return first;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatYearMonth(ym: YearMonth): string {
  const [year, month] = ym.split('-');
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : String(year);
}

export function formatPeriod(start: YearMonth, end: YearMonth | null): string {
  return `${formatYearMonth(start)} – ${end ? formatYearMonth(end) : 'Present'}`;
}

export function formatYears(years: readonly number[]): string {
  return [...years].sort((a, b) => b - a).join(' and ');
}

/** Resolve a site-relative asset path (e.g. CV) against Vite's base URL. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
