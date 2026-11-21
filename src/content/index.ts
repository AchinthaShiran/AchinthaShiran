import { awards } from './awards';
import { contacts, cv } from './contact';
import { education } from './education';
import { organizations, roles } from './experience';
import { mentoring } from './mentoring';
import { profile } from './profile';
import { projects } from './projects';
import { sageTopics } from './sage';
import { skillCategories, skills } from './skills';
import type {
  Award,
  ContactKind,
  Id,
  Project,
  ProjectCategory,
  ProjectTopic,
  Role,
  Skill,
  YearMonth,
} from './types';

export * from './types';
export {
  awards,
  contacts,
  cv,
  education,
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
export const getContact = (kind: ContactKind) => contacts.find((c) => c.id === kind);
export const getSkillCategory = (id: Skill['categoryId']) => skillCategories.find((c) => c.id === id);

export const getProjectTopic = (projectId: Id, topicId: Id): ProjectTopic | undefined =>
  projectById.get(projectId)?.topics.find((t) => t.id === topicId);
export const projectsByCategory = (category: ProjectCategory): Project[] =>
  projects.filter((p) => p.category === category);
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

/** Whole-month duration between two year-months, e.g. "1 year 10 months". Null for an ongoing role. */
export function formatDuration(start: YearMonth, end: YearMonth | null): string | null {
  if (end === null) return null;
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  const months = (ey! - sy!) * 12 + (em! - sm!);
  if (months <= 0) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
  return [years > 0 ? plural(years, 'year') : null, rest > 0 ? plural(rest, 'month') : null]
    .filter(Boolean)
    .join(' ');
}

export function formatYears(years: readonly number[]): string {
  return [...years].sort((a, b) => b - a).join(' and ');
}

/** Resolve a site-relative asset path (e.g. CV) against Vite's base URL. */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
