import type { Project } from './types';

/**
 * Portfolio projects.
 *
 * - `corporate` projects (from the resume) get an exhibit in Project Park (ADR-002); `exhibitModel` must be a key
 *   in the asset manifest.
 * - `personal` projects get their own island (ADR-005): add a ZoneDef in `world/zones.ts` whose landmarks open
 *   the project and its `topics`. Facts come only from public sources; unknown values stay empty or `null`.
 */
export const projects: readonly Project[] = [
  {
    id: 'sage',
    name: 'SAGE - Sysco Agentic Ecosystem',
    shortName: 'SAGE',
    category: 'corporate',
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
    links: [],
    topics: [],
    exhibitModel: 'exhibitSage',
    featured: true,
  },
  {
    id: 'excellence-hub',
    name: 'Excellence Hub',
    shortName: 'Excellence Hub',
    category: 'corporate',
    organizationId: 'sysco-labs',
    tagline:
      'A platform that tracks agile standards and offers suggestions and recommendations to improve and mitigate.',
    problem: null,
    solution:
      'Tracks agile standards and provides suggestions, recommendations and mitigations that help teams improve. ' +
      'Built using microservices and micro-frontend architecture for scalable and modular deployments, and ' +
      'integrated with the Smart AI Agent "Alfred".',
    capabilities: [
      'Tracking of agile standards',
      'Suggestions and recommendations to improve',
      'Mitigations for the gaps it finds',
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
    links: [],
    topics: [],
    exhibitModel: 'exhibitExcellenceHub',
    featured: true,
  },
  {
    id: 'ta-portal',
    name: 'TA Portal',
    shortName: 'TA Portal',
    category: 'corporate',
    organizationId: 'sysco-labs',
    tagline:
      'An AI-driven talent acquisition portal that makes talent filtering and acquisition streamlined and efficient.',
    problem: null,
    solution:
      'Resumes are extracted, ranked and classified with AI, so filtering talent and acquiring it is streamlined and ' +
      'efficient. A human-in-the-loop approach keeps recruiters in control, and the pipeline from job posting to ' +
      'hiring is automated.',
    capabilities: [
      'AI-driven resume data extraction',
      'AI-based ranking and classification of resumes',
      'Streamlined, efficient talent filtering and acquisition',
      'Human-in-the-loop approach',
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
    links: [],
    topics: [],
    exhibitModel: 'exhibitTaPortal',
    featured: true,
  },

  // ---------------------------------------------------------------------------------------------
  // Personal projects - facts from the public GitHub README / website / Google Play listing.
  // ---------------------------------------------------------------------------------------------
  {
    id: 'tala',
    name: 'TALA: Trusted Assistant for Local Actions',
    shortName: 'TALA',
    category: 'personal',
    organizationId: null,
    tagline:
      'A private AI assistant for your PC: chat in plain language and a local model runs tools you define in simple YAML files.',
    problem: null,
    solution:
      'A local, OS-agnostic assistant. A local model (via Ollama) picks and runs tools defined as YAML "packs", ' +
      'with approval prompts, an audit log and safe-by-default execution. Built with LangChain and LangGraph; ' +
      'works on Windows, Linux and macOS. Nothing leaves your machine, and nothing risky runs without your approval.',
    capabilities: [
      'Add capabilities with YAML only - no Python needed',
      'One logical tool with a command per operating system (Windows, macOS, Linux)',
      'Safe by default: mandatory risk levels, approval prompts showing the exact command, and an audit log',
      'Runs on small local models using hybrid keyword and vector tool retrieval',
      'Hardware-aware setup wizard with Default, Recommended and Advanced setups',
      'Remembers facts you give it, and chat sessions resume automatically',
      'Typed event API for any front end; layered architecture enforced by tests',
    ],
    topics: [
      {
        id: 'packs',
        title: 'Pack Library',
        summary:
          'Capabilities are small YAML files called packs. Drop one in a folder and the assistant can use it.',
        points: [
          'Each tool declares a name, description, risk level and examples',
          'One logical tool can carry a different command per operating system',
          'A built-in linter checks packs before the model ever sees them',
          'Project packs only load after you explicitly trust them',
        ],
      },
      {
        id: 'safety',
        title: 'Approval Gate',
        summary: 'Safe by default: nothing risky runs without your approval.',
        points: [
          'A mandatory risk level for every tool',
          'Approval prompts show the exact command before it runs',
          'No shell, argument constraints and fenced untrusted output',
          'An audit log of recent tool executions',
        ],
      },
      {
        id: 'local',
        title: 'Local Brain',
        summary: 'A model you host yourself (via Ollama) chooses the tools, so nothing leaves your computer.',
        points: [
          'Runs fully on your machine - no cloud',
          'Questions, files and system details stay local',
          'Built with LangChain and LangGraph',
        ],
      },
      {
        id: 'cross-platform',
        title: 'Cross-platform Dock',
        summary: 'One assistant for Windows, Linux and macOS.',
        points: [
          'The same tool name and schema everywhere, with a different command per platform',
          'Tools whose executable is missing are never offered to the model',
          'One-line installers for PowerShell and shell, or install from PyPI',
        ],
      },
      {
        id: 'small-models',
        title: 'Tool Funnel',
        summary: 'Hybrid keyword and vector retrieval offers the model 4–8 tools instead of 100.',
        points: [
          'Model-supplied arguments are validated and repaired',
          'Chat never loads the tool machinery',
          'Evaluation commands measure tool-selection quality',
        ],
      },
    ],
    role: 'Creator',
    contributions: ['Created by Achintha as a personal, open-source project'],
    technologies: ['python', 'langchain', 'langgraph', 'ollama'],
    media: [],
    demoVideoUrl: null,
    liveUrl: null,
    repoUrl: 'https://github.com/AchinthaShiran/Tala',
    links: [{ label: 'Project website', url: 'https://tala-ai.achinthabandara1-ea5.workers.dev' }],
    exhibitModel: null,
    featured: false,
  },
  {
    id: 'skill-up',
    name: 'Skill Up',
    shortName: 'Skill Up',
    category: 'personal',
    organizationId: null,
    tagline: 'An AI-powered learning and study planner for students, job seekers and professionals.',
    problem:
      'Students, job seekers and professionals want to learn faster, stay consistent and reach real goals.',
    solution:
      'Creates a clear path from where you are now to where you want to be: a personalized study plan from your ' +
      'goals, level, timeline and learning style, guided by an AI learning coach, with a roadmap, curated ' +
      'resources and progress tracking.',
    capabilities: [
      'Personalized AI study plans from your goals, level, timeline and learning style',
      'Structured roadmap of daily and weekly steps with milestones',
      'Curated articles, videos and study materials connected to each plan',
      'AI learning companion for instant explanations and guidance',
      'Progress tracking phase by phase, with visible achievements',
      'Works for programming, languages, academic subjects, certifications, interview prep and more',
    ],
    topics: [
      {
        id: 'plans',
        title: 'Personalized AI Study Plans',
        summary:
          'A custom plan tailored to your goals, current level, timeline and preferred learning style.',
        points: [
          'Generated through interactive guidance with an Intelligent Learning Coach',
          'Create a plan in minutes',
        ],
      },
      {
        id: 'roadmap',
        title: 'Structured Learning Roadmap',
        summary: 'Big goals broken into manageable daily and weekly steps.',
        points: ['Clear milestones so you always know what to do next', 'Helps build daily learning habits'],
      },
      {
        id: 'resources',
        title: 'Curated Learning Resources',
        summary: 'Handpicked articles, videos and study materials connected to your plan.',
        points: ['Links and embedded videos included in every plan', 'All resources organized in one place'],
      },
      {
        id: 'companion',
        title: 'AI Learning Companion',
        summary: 'Ask questions anytime and get instant explanations and guidance.',
        points: ['Practical support while you study', 'Guidance tailored to your pace'],
      },
      {
        id: 'progress',
        title: 'Progress Tracking & Motivation',
        summary: 'Track completed tasks and stay motivated with visible achievements.',
        points: ['Monitor progress phase by phase', 'Improve focus, retention and consistency'],
      },
    ],
    role: 'Creator',
    contributions: ['Created by Achintha as a personal project'],
    technologies: [],
    media: [],
    demoVideoUrl: null,
    liveUrl: null,
    repoUrl: null,
    links: [
      {
        label: 'Get it on Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.taprobanastudios.skillup',
      },
    ],
    exhibitModel: null,
    featured: false,
  },
  {
    id: 'myspend',
    name: 'MySpend',
    shortName: 'MySpend',
    category: 'personal',
    organizationId: null,
    tagline:
      'A smart expense tracker for Android: payments are recorded automatically, budgets and bills stay on track, and costs split easily with friends.',
    problem: null,
    solution:
      'Reads the payment alerts that already arrive on your phone (only after you allow it) and turns them into ' +
      'entries with the shop, amount, date and a suggested category. Entries live in an encrypted database on your phone.',
    capabilities: [
      'Automatic entries with a suggested category',
      'Clear picture of what you spent, what came in and what is left, with day-by-day charts',
      'Budgets that warn at 80% and when used up',
      'Spots recurring bills such as rent, subscriptions and utilities',
      'Split costs with groups, see who owes whom and settle up',
      'Encrypted backup to your own Google Drive',
      'Custom categories and tags with icons and colours; no ads',
    ],
    topics: [
      {
        id: 'auto',
        title: 'Automatic Entries',
        summary: 'Payments become entries by themselves; you only step in when something is new.',
        points: [
          'Uses Android notification access that you turn on yourself',
          'No bank login and no SMS inbox access',
          "Tell MySpend the sender name your bank's messages come from, then set up the first message in a tap",
        ],
      },
      {
        id: 'budgets',
        title: 'Budgets That Warn You',
        summary: 'Set a limit for the month or for a category.',
        points: ['Warns you when you reach 80%', 'Warns you again when the budget is used up'],
      },
      {
        id: 'bills',
        title: 'Bills & Recurring Payments',
        summary: 'MySpend spots payments that repeat and shows what is coming up next.',
        points: ['Rent, subscriptions and utilities', 'A simple view of upcoming bills'],
      },
      {
        id: 'splits',
        title: 'Split With Friends',
        summary:
          'Create a group for a trip, a home or a lunch club and share costs without the awkward maths.',
        points: [
          'Add expenses, see who owes whom and settle up in a tap',
          'Invite people with a code or by email',
          'Only the amount, description, date and who paid are shared - your alerts never are',
          'Signing in with Google is only needed for groups',
        ],
      },
      {
        id: 'privacy',
        title: 'Private by Design',
        summary: 'Built to need as little of your data as possible.',
        points: [
          'Entries are stored in an encrypted database on your phone',
          'No ads, no tracking tools and no bank connection',
          'Optional automatic backup, encrypted with a passphrase only you know, saved in your own Google Drive',
          'You can delete your account from inside the app',
        ],
      },
    ],
    role: 'Creator',
    contributions: ['Created by Achintha as a personal project'],
    technologies: [],
    media: [],
    demoVideoUrl: null,
    liveUrl: null,
    repoUrl: null,
    links: [
      {
        label: 'Get it on Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.taprobana_studios.spendly',
      },
      { label: 'Website', url: 'https://myspend.site/' },
    ],
    exhibitModel: null,
    featured: false,
  },
  {
    id: 'openai-unity',
    name: 'OpenAI-Unity',
    shortName: 'OpenAI-Unity',
    category: 'personal',
    organizationId: null,
    tagline: 'An OpenAI package for Unity that lets games use the OpenAI API directly.',
    problem: null,
    solution:
      'A Unity package, added directly through the Package Manager from a Git URL, that connects a Unity project ' +
      'with the OpenAI API.',
    capabilities: [
      'Chat Completions with a configurable conversation-history memory and system message',
      'Function calling: describe a function and its parameters, then read the structured arguments returned',
      'Request failures surface as typed exceptions with a code, parameter, type and message',
      'Async/await usage from Unity scripts',
      'Installed from a Git URL in the Package Manager',
    ],
    topics: [
      {
        id: 'install',
        title: 'Package Import',
        summary: 'Add the package straight from Git in the Unity Package Manager.',
        points: [
          'Open Window → Package Manager',
          'Choose + → Add package from git URL',
          'Paste the repository URL and click Add',
        ],
      },
      {
        id: 'chat',
        title: 'Chat Completions',
        summary: 'Talk to OpenAI models from a Unity script.',
        points: [
          'Create the API client with your key and set a system message to give the AI a persona',
          'Keep recent turns with a configurable conversation-history memory',
          'Errors surface as exceptions carrying code, parameter, type and message',
        ],
      },
      {
        id: 'functions',
        title: 'Function Calling',
        summary: 'Describe a function and its parameters, and get structured arguments back.',
        points: [
          'Demo: generate a trivia question with two answers and mark the correct one',
          'The structured result can drive game logic directly',
        ],
      },
    ],
    role: 'Creator',
    contributions: ['Created by Achintha as an open-source personal project'],
    technologies: ['csharp', 'unity'],
    media: [],
    demoVideoUrl: null,
    liveUrl: null,
    repoUrl: 'https://github.com/TaprobanaStudios/OpenAI-Unity',
    links: [
      { label: 'Read the article', url: 'https://medium.com/@achinthabandara1/openai-unity-509fb6173b87' },
    ],
    exhibitModel: null,
    featured: false,
  },
];
