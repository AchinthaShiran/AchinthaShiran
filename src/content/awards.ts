import type { Award } from './types';

/**
 * Recognitions as listed in the resume, each associated with a project.
 * `recipient: 'project'` - the resume does not state an individual recipient (plan §5.6).
 */
export const awards: readonly Award[] = [
  {
    id: 'newsweek-ai-impact-2026',
    title: 'Newsweek 2026 AI Impact Award for AI Brand & Retail',
    years: [2026],
    projectId: 'sage',
    recipient: 'project',
    imageUrl: null,
    supportingUrl: null,
  },
  {
    id: 'presidential-export-award-2025',
    title: '27th Presidential Export Award – Most Innovative Export Service (Agentic AI)',
    years: [2025],
    projectId: 'sage',
    recipient: 'project',
    imageUrl: null,
    supportingUrl: null,
  },
  {
    id: 'slasscom-sage-2025',
    title: 'SLASSCOM National & Western Province Award – Best Innovation in Internal Process',
    years: [2025],
    projectId: 'sage',
    recipient: 'project',
    imageUrl: null,
    supportingUrl: null,
  },
  {
    id: 'sysco-hall-of-fame-2025',
    title: 'Sysco Hall of Fame Award',
    years: [2025],
    projectId: 'sage',
    recipient: 'project',
    imageUrl: null,
    supportingUrl: null,
  },
  {
    id: 'slasscom-excellence-hub',
    title: 'SLASSCOM National & Western Province Award – Best Innovation in Internal Process',
    years: [2024, 2023],
    projectId: 'excellence-hub',
    recipient: 'project',
    imageUrl: null,
    supportingUrl: null,
  },
  {
    id: 'blueprint-most-innovative-2025',
    title: 'Most Innovative Projects – Sysco LABS Blueprint 2025',
    years: [2025],
    projectId: 'ta-portal',
    recipient: 'project',
    imageUrl: null,
    supportingUrl: null,
  },
];
