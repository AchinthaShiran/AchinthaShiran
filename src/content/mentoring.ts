import type { MentoringActivity } from './types';

/** Concise, resume-based. No invented counts, dates, or outcomes (plan §7). */
export const mentoring: readonly MentoringActivity[] = [
  {
    id: 'project-summit',
    title: 'Sysco LABS Project Summit',
    organization: 'Sysco LABS',
    description: 'Led the intern and fresh graduate training program.',
  },
  {
    id: 'stemlink',
    title: 'STEMLINK Mentor',
    organization: 'STEMLINK',
    description: 'Mentor for a SpringBoot bootcamp.',
  },
  {
    id: 'glo-leadership',
    title: 'GLO Leadership Facilitator',
    organization: 'Global Learning Lab',
    description: 'Leadership facilitator at the Global Learning Lab.',
  },
];
