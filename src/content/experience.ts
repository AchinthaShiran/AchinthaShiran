import type { Organization, Role } from './types';

export const organizations: readonly Organization[] = [
  { id: 'sysco-labs', name: 'Sysco LABS Technologies', shortName: 'Sysco LABS', url: null },
];

/**
 * Roles in chronological order. Earlier roles intentionally have no responsibilities:
 * the resume does not list role-specific details for them (plan §5.2).
 */
export const roles: readonly Role[] = [
  {
    id: 'software-engineer',
    organizationId: 'sysco-labs',
    title: 'Software Engineer',
    start: '2022-10',
    end: '2024-08',
    summary: null,
    responsibilities: [],
    projectIds: [],
    technologies: [],
  },
  {
    id: 'senior-software-engineer',
    organizationId: 'sysco-labs',
    title: 'Senior Software Engineer',
    start: '2024-08',
    end: '2026-02',
    summary: null,
    responsibilities: [],
    projectIds: [],
    technologies: [],
  },
  {
    id: 'associate-technical-lead',
    organizationId: 'sysco-labs',
    title: 'Associate Technical Lead',
    start: '2026-03',
    end: null,
    summary: 'Technical Lead for SAGE - Sysco Agentic Ecosystem, working on enterprise Agentic AI solutions.',
    responsibilities: [
      'Driving platform strategy',
      'Executing the platform roadmap',
      'Shaping technical direction',
      'Making architecture decisions',
      'Leading integration of core platform capabilities',
      'Working on enterprise Agentic AI solutions',
    ],
    projectIds: ['sage'],
    technologies: [],
  },
];
