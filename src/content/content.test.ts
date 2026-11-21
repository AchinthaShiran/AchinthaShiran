import { describe, expect, it } from 'vitest';
import {
  awards,
  contacts,
  currentRole,
  formatDuration,
  formatPeriod,
  formatYears,
  getProject,
  getProjectTopic,
  organizations,
  projects,
  projectsByCategory,
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
    [projects, roles, skills, awards, organizations, sageTopics, skillCategories].forEach(expectUniqueIds);
  });

  it('uses kebab-case ids', () => {
    const all = [...projects, ...roles, ...skills, ...awards, ...organizations];
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

  it('formats whole-month durations and leaves ongoing roles open', () => {
    expect(formatDuration('2022-10', '2024-08')).toBe('1 year 10 months');
    expect(formatDuration('2024-08', '2026-02')).toBe('1 year 6 months');
    expect(formatDuration('2023-01', '2024-01')).toBe('1 year');
    expect(formatDuration('2024-01', '2024-02')).toBe('1 month');
    expect(formatDuration('2026-03', null)).toBeNull();
  });

  it('formats periods and years', () => {
    expect(formatPeriod('2022-10', '2024-08')).toBe('October 2022 – August 2024');
    expect(formatPeriod('2026-03', null)).toBe('March 2026 – Present');
    expect(formatYears([2023, 2024])).toBe('2024 and 2023');
  });
});

describe('project categories and topics (ADR-005)', () => {
  const corporate = projects.filter((p) => p.category === 'corporate');
  const personal = projects.filter((p) => p.category === 'personal');

  it('keeps the three resume projects as corporate, with Project Park exhibits', () => {
    expect(corporate.map((p) => p.id)).toEqual(['sage', 'excellence-hub', 'ta-portal']);
    for (const p of corporate) {
      expect(p.organizationId, p.id).not.toBeNull();
      expect(p.exhibitModel, p.id).not.toBeNull();
    }
  });

  it('adds the four personal projects without an organization or park exhibit', () => {
    expect(personal.map((p) => p.id).sort()).toEqual(['myspend', 'openai-unity', 'skill-up', 'tala']);
    for (const p of personal) {
      expect(p.organizationId, p.id).toBeNull();
      expect(p.exhibitModel, p.id).toBeNull();
    }
  });

  it('gives every personal project at least one explainable topic with unique ids', () => {
    for (const p of personal) {
      expect(p.topics.length, p.id).toBeGreaterThan(0);
      expect(new Set(p.topics.map((t) => t.id)).size, p.id).toBe(p.topics.length);
      for (const t of p.topics) {
        expect(t.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(t.summary.length, `${p.id}/${t.id}`).toBeGreaterThan(0);
        expect(t.points.length, `${p.id}/${t.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('only publishes https links, and no repository link for private projects', () => {
    for (const p of personal) {
      for (const l of p.links) expect(l.url, `${p.id}: ${l.label}`).toMatch(/^https:\/\//);
      if (p.repoUrl) expect(p.repoUrl).toMatch(/^https:\/\/github\.com\//);
    }
    // skill-up and MySpend repositories are private: their pages must not link to a dead repository.
    expect(getProject('skill-up')?.repoUrl).toBeNull();
    expect(getProject('myspend')?.repoUrl).toBeNull();
  });

  it('only lists technologies that the sources state', () => {
    expect(getProject('skill-up')?.technologies).toEqual([]);
    expect(getProject('myspend')?.technologies).toEqual([]);
    expect(getProject('tala')?.technologies).toEqual(['python', 'langchain', 'langgraph', 'ollama']);
    expect(getProject('openai-unity')?.technologies).toEqual(['csharp', 'unity']);
  });

  it('looks up topics and filters by category', () => {
    expect(getProjectTopic('tala', 'safety')?.title).toBe('Approval Gate');
    expect(getProjectTopic('tala', 'nope')).toBeUndefined();
    expect(projectsByCategory('personal')).toHaveLength(4);
    expect(projectsByCategory('corporate')).toHaveLength(3);
  });
});
