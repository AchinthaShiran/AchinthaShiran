import type { SageTopic } from './types';

/** Innovation Lab explanations. Resume facts only — no metrics or unverified capabilities (plan §5.3). */
export const sageTopics: readonly SageTopic[] = [
  {
    id: 'core',
    title: 'Agentic Platform Core',
    summary:
      'SAGE — Sysco Agentic Ecosystem — is the central platform for Agentic AI integrations across Sysco, ' +
      'supporting enterprise-wide adoption.',
    points: [
      'Cloud-agnostic, no-code Agentic AI platform',
      'Achintha serves as Technical Lead for the SAGE platform',
      'Drives platform strategy and roadmap execution',
      'Shapes technical direction and architecture decisions',
      'Leads integration of core platform capabilities',
    ],
  },
  {
    id: 'agent-workshop',
    title: 'Agent Workshop',
    summary:
      'SAGE enables the creation of RAG, API, Database, Generic, and MCP Agents, as well as Orchestrators — ' +
      'without writing code.',
    points: ['RAG Agents', 'API Agents', 'Database Agents', 'Generic Agents', 'MCP Agents', 'Orchestrators'],
  },
  {
    id: 'governance',
    title: 'Governance Station',
    summary: 'SAGE includes AI Governance capabilities and observability.',
    points: ['AI Governance capabilities', 'Observability for control, compliance, and management'],
  },
  {
    id: 'architecture',
    title: 'Architecture Machine',
    summary: 'SAGE is built using microservices and micro-frontend architecture.',
    points: ['Microservices architecture', 'Micro-frontend architecture', 'Scalable and modular deployments'],
  },
  {
    id: 'identity',
    title: 'Identity Gate',
    summary: 'SAGE includes authentication and request-validation flows.',
    points: ['Authentication flows', 'Request validation', 'Granular permissions', 'Multi-IDP token support'],
  },
  {
    id: 'cloud',
    title: 'Cloud-Agnostic Gateway',
    summary: 'SAGE is a cloud-agnostic platform.',
    points: ['Cloud-agnostic platform approach', 'Technologies listed include AWS and GCP'],
  },
];
