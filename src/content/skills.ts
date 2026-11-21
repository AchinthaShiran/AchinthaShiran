import type { Skill, SkillCategory } from './types';

/** No proficiency ratings by design (plan §5.5). Capabilities are shown through projects. */
export const skillCategories: readonly SkillCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    color: '#6FA8F5',
    description: 'Building user interfaces for web applications.',
  },
  {
    id: 'backend',
    name: 'Backend Development',
    color: '#5CC48A',
    description: 'Services and APIs powering the platforms.',
  },
  {
    id: 'ai',
    name: 'AI & Agents',
    color: '#4FC9B8',
    description: 'Frameworks and runtimes used in the personal AI assistant project, Tala.',
  },
  { id: 'cloud', name: 'Cloud', color: '#F5A35C', description: 'Cloud platforms used for delivery.' },
  {
    id: 'cicd',
    name: 'CI/CD & Engineering Tools',
    color: '#B9A1E8',
    description: 'Build and delivery automation.',
  },
  {
    id: 'gamedev',
    name: 'Game Development',
    color: '#FFD27D',
    description: 'A personal passion for building games.',
  },
  {
    id: 'databases',
    name: 'Databases',
    color: '#F5A6A6',
    description: 'Data stores listed under the key projects.',
  },
];

export const skills: readonly Skill[] = [
  { id: 'reactjs', name: 'ReactJs', categoryId: 'frontend', source: 'resume-skills' },
  { id: 'springboot', name: 'SpringBoot', categoryId: 'backend', source: 'resume-skills' },
  { id: 'nodejs', name: 'NodeJs', categoryId: 'backend', source: 'resume-skills' },
  { id: 'python-fastapi', name: 'Python FastAPI', categoryId: 'backend', source: 'resume-skills' },
  { id: 'python', name: 'Python', categoryId: 'backend', source: 'personal-project' },
  { id: 'langchain', name: 'LangChain', categoryId: 'ai', source: 'personal-project' },
  { id: 'langgraph', name: 'LangGraph', categoryId: 'ai', source: 'personal-project' },
  { id: 'ollama', name: 'Ollama', categoryId: 'ai', source: 'personal-project' },
  { id: 'aws', name: 'AWS Cloud', categoryId: 'cloud', source: 'resume-skills' },
  { id: 'gcp', name: 'Google Cloud', categoryId: 'cloud', source: 'resume-skills' },
  { id: 'jenkins', name: 'Jenkins', categoryId: 'cicd', source: 'resume-skills' },
  { id: 'unity', name: 'Unity', categoryId: 'gamedev', source: 'resume-skills' },
  { id: 'csharp', name: 'C#', categoryId: 'gamedev', source: 'personal-project' },
  { id: 'mongodb', name: 'MongoDB', categoryId: 'databases', source: 'project-listing' },
  { id: 'postgresql', name: 'PostgreSQL', categoryId: 'databases', source: 'project-listing' },
];
