import { cv } from '@/content';
import type { PanelRef, ZoneId } from './types';

/** Conventional portfolio sections for quick navigation and Classic mode (plan §11). */
export interface Section {
  readonly id: string;
  readonly label: string;
  readonly zoneId: ZoneId;
  readonly landmarkId: string;
  readonly panel: PanelRef;
  readonly description: string;
}

export const sections: readonly Section[] = [
  {
    id: 'about',
    label: 'About',
    zoneId: 'home',
    landmarkId: 'home-house',
    panel: { kind: 'about' },
    description: 'Who Achintha is and what drives him.',
  },
  {
    id: 'experience',
    label: 'Experience',
    zoneId: 'career',
    landmarkId: 'career-org-sysco-labs',
    panel: { kind: 'career-timeline' },
    description: 'Career progression at Sysco LABS Technologies.',
  },
  {
    id: 'sage',
    label: 'SAGE / Agentic AI',
    zoneId: 'lab',
    landmarkId: 'lab-core',
    panel: { kind: 'sage', id: 'core' },
    description: 'Enterprise Agentic AI platform leadership.',
  },
  {
    id: 'projects',
    label: 'Key Projects',
    zoneId: 'park',
    landmarkId: 'park-kiosk',
    panel: { kind: 'projects' },
    description: 'SAGE, Excellence Hub and TA Portal.',
  },
  {
    id: 'skills',
    label: 'Skills',
    zoneId: 'forest',
    landmarkId: 'forest-monument',
    panel: { kind: 'skills' },
    description: 'Technologies from real projects.',
  },
  {
    id: 'education',
    label: 'Education',
    zoneId: 'education',
    landmarkId: 'edu-university',
    panel: { kind: 'education' },
    description: 'University of Peradeniya.',
  },
  {
    id: 'awards',
    label: 'Awards',
    zoneId: 'peak',
    landmarkId: 'peak-castle',
    panel: { kind: 'awards' },
    description: 'Recognition for the projects.',
  },
  {
    id: 'mentoring',
    label: 'Mentoring & Leadership',
    zoneId: 'mentorship',
    landmarkId: 'mentor-pavilion',
    panel: { kind: 'mentoring-overview' },
    description: 'Training, bootcamps and facilitation.',
  },
  {
    id: 'contact',
    label: 'Contact',
    zoneId: 'horizon',
    landmarkId: 'horizon-arch',
    panel: { kind: 'contact' },
    description: 'Email, phone and profiles.',
  },
  {
    id: 'cv',
    label: cv.path ? 'Download CV' : 'CV',
    zoneId: 'horizon',
    landmarkId: 'horizon-board',
    panel: { kind: 'cv' },
    description: 'Résumé download.',
  },
];
