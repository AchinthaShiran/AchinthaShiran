import type { Project } from './types';

/**
 * Key projects from the resume. To add a project, append an entry here — Project Park
 * automatically adds an exhibit for it (ADR-002). `exhibitModel` must be a key in the asset manifest.
 */
export const projects: readonly Project[] = [
  {
    id: 'sage',
    name: 'SAGE — Sysco Agentic Ecosystem',
    shortName: 'SAGE',
    organizationId: 'sysco-labs',
    tagline:
      'The central platform for Agentic AI integrations across Sysco, supporting enterprise-wide adoption.',
    problem: null,
    solution:
      'A cloud-agnostic, no-code Agentic AI platform that enables the creation of RAG, API, Database, Generic, ' +
      'and MCP Agents, as well as Orchestrators.',
    capabilities: [
      'Agent creation and orchestration',
      'AI Governance capabilities',
      'Observability for control, compliance, and management',
      'Microservices and micro-frontend architecture',
      'Scalable and modular deployments',
      'Authentication and request validation',
      'Granular permissions',
      'Multi-IDP token support',
      'Cloud-agnostic platform approach',
    ],
    role: 'Technical Lead',
    contributions: [
      'Technical Lead for the platform',
      'Drives platform strategy and roadmap execution',
      'Shapes technical direction and architecture decisions',
      'Leads integration of core platform capabilities',
    ],
    technologies: [
      'python-fastapi',
      'springboot',
      'nodejs',
      'reactjs',
      'aws',
      'gcp',
      'mongodb',
      'postgresql',
    ],
    media: [],
    demoVideoUrl: null,
    liveUrl: null,
    repoUrl: null,
    exhibitModel: 'exhibitSage',
    featured: true,
  },
  {
    id: 'excellence-hub',
    name: 'Excellence Hub',
    shortName: 'Excellence Hub',
    organizationId: 'sysco-labs',
    tagline: 'A platform integrated with the Smart AI Agent "Alfred".',
    problem: null,
    solution:
      'Built using microservices and micro-frontend architecture to enable scalable and modular deployments, ' +
      'with integration of the Smart AI Agent "Alfred".',
    capabilities: [
      'Integration with Smart AI Agent "Alfred"',
      'Microservices and micro-frontend architecture',
      'Scalable and modular deployments',
    ],
    role: 'Lead Engineer',
    contributions: [
      'Served as a Lead Engineer',
      'Collaborated on technical decisions',
      'Integrated core platform components',
      'Integrated with Smart AI Agent "Alfred"',
    ],
    technologies: ['springboot', 'nodejs', 'reactjs', 'aws', 'mongodb'],
    media: [],
    demoVideoUrl: null,
    liveUrl: null,
    repoUrl: null,
    exhibitModel: 'exhibitExcellenceHub',
    featured: true,
  },
  {
    id: 'ta-portal',
    name: 'TA Portal',
    shortName: 'TA Portal',
    organizationId: 'sysco-labs',
    tagline: 'An AI-powered Talent Acquisition Portal.',
    problem: null,
    solution:
      'Enables resume data extraction and ranking with a human-in-the-loop approach, and automates the ' +
      'pipeline from job posting to hiring.',
    capabilities: [
      'Resume data extraction',
      'Resume ranking with a human-in-the-loop approach',
      'Automated pipeline from job posting to hiring',
    ],
    role: 'Lead Engineer',
    contributions: [
      'Served as a Lead Engineer',
      'Collaborated on technical decisions',
      'Integrated core platform components',
    ],
    technologies: ['nodejs', 'reactjs', 'aws', 'mongodb'],
    media: [],
    demoVideoUrl: null,
    liveUrl: null,
    repoUrl: null,
    exhibitModel: 'exhibitTaPortal',
    featured: true,
  },
];
