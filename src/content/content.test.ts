import { describe, expect, it } from 'vitest';
import {
  awards,
  contacts,
  currentRole,
  formatPeriod,
  formatYears,
  ideaSeeds,
  organizations,
  projects,
  roles,
  sageTopics,
  skillCategories,
  skills,
} from './index';

const ids = <T extends { id: string }>(items: readonly T[]) => new Set(items.map((i) => i.id));

function expectUniqueIds(items: readonly { id: string }[]) {
  expect(ids(items).size).toBe(items.length);
}

describe('content integrity', () => {
  it('has unique ids per collection', () => {
    [projects, roles, skills, awards, organizations, sageTopics, ideaSeeds, skillCategories].forEach(
      expectUniqueIds,
    );
  });

  it('uses kebab-case ids', () => {
    const all = [...projects, ...roles, ...skills, ...awards, ...organizations, ...ideaSeeds];
    for (const item of all) expect(item.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('references existing projects, organizations and skills', () => {
    const projectIds = ids(projects);
    const skillIds = ids(skills);
    const orgIds = ids(organizations);
    for (const award of awards) expect(projectIds).toContain(award.projectId);
    for (const role of roles) {
      expect(orgIds).toContain(role.organizationId);
      role.projectIds.forEach((p) => expect(projectIds).toContain(p));
      role.technologies.forEach((t) => expect(skillIds).toContain(t));
    }
    for (const project of projects) {
      if (project.organizationId) expect(orgIds).toContain(project.organizationId);
      project.technologies.forEach((t) => expect(skillIds).toContain(t));
    }
  });

  it('assigns every skill to a known category', () => {
    const categoryIds = ids(skillCategories);
    for (const skill of skills) expect(categoryIds).toContain(skill.categoryId);
  });

  it('keeps the three Sysco LABS roles with exact resume dates', () => {
    expect(roles.map((r) => [r.title, r.start, r.end])).toEqual([
      ['Software Engineer', '2022-10', '2024-08'],
      ['Senior Software Engineer', '2024-08', '2026-02'],
      ['Associate Technical Lead', '2026-03', null],
    ]);
  });

  it('does not invent responsibilities for earlier roles', () => {
    expect(roles[0]?.responsibilities).toEqual([]);
    expect(roles[1]?.responsibilities).toEqual([]);
  });

  it('only exposes contact links that are explicitly supplied', () => {
    const linkedin = contacts.find((c) => c.id === 'linkedin');
    const github = contacts.find((c) => c.id === 'github');
    expect(linkedin?.href).toBeNull();
    expect(github?.href).toBeNull();
    for (const c of contacts) if (c.href) expect(c.href).toMatch(/^(mailto:|tel:|https:\/\/)/);
  });

  it('keeps project links null or https', () => {
    for (const p of projects) {
      for (const url of [p.liveUrl, p.repoUrl, p.demoVideoUrl]) {
        if (url !== null) expect(url).toMatch(/^https:\/\//);
      }
    }
  });
});

describe('content helpers', () => {
  it('finds the current role', () => {
    expect(currentRole().title).toBe('Associate Technical Lead');
  });

  it('formats periods and years', () => {
    expect(formatPeriod('2022-10', '2024-08')).toBe('October 2022 – August 2024');
    expect(formatPeriod('2026-03', null)).toBe('March 2026 – Present');
    expect(formatYears([2023, 2024])).toBe('2024 and 2023');
  });
});
