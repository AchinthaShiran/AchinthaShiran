/**
 * Content model for the portfolio (ADR-001).
 *
 * Rules:
 * - Only verified facts. Unknown optional values are `null` and the UI hides them.
 * - Entities reference each other by kebab-case string ids; integrity is enforced by tests.
 */

export type Id = string;

/** A link that may not be known yet. `url: null` means "configured placeholder - hide it". */
export interface OptionalLink {
  readonly label: string;
  readonly url: string | null;
}

export interface Profile {
  readonly name: string;
  readonly headline: string;
  readonly shortHeadline: string;
  readonly bio: string;
  readonly welcomeMessage: string;
  readonly passion: string;
  readonly technicalInterests: readonly string[];
  readonly themes: readonly string[];
  readonly intro: IntroCopy;
  readonly closingMessage: string;
}

export interface IntroCopy {
  readonly greeting: string;
  readonly lead: string;
  readonly nameLine: string;
  readonly headline: string;
  readonly cta: string;
}

/** Year-month string, e.g. "2022-10". `null` end means "Present". */
export type YearMonth = `${number}-${number}`;

export interface Organization {
  readonly id: Id;
  readonly name: string;
  readonly shortName: string;
  readonly url: string | null;
}

export interface Role {
  readonly id: Id;
  readonly organizationId: Id;
  readonly title: string;
  readonly start: YearMonth;
  readonly end: YearMonth | null;
  readonly summary: string | null;
  readonly responsibilities: readonly string[];
  readonly projectIds: readonly Id[];
  readonly technologies: readonly Id[];
}

export interface ProjectMedia {
  readonly type: 'image' | 'video';
  readonly src: string;
  readonly alt: string;
}

/** Corporate projects live in Project Park; personal projects each get their own island (ADR-005). */
export type ProjectCategory = 'corporate' | 'personal';

/** A labelled public link (store listing, website, article). Only public URLs belong here. */
export interface ProjectLink {
  readonly label: string;
  readonly url: string;
}

/** One explainable feature of a project, shown by a station on the project's island. */
export interface ProjectTopic {
  readonly id: Id;
  readonly title: string;
  readonly summary: string;
  readonly points: readonly string[];
}

/** Model keys for exhibits live in the asset manifest; kept as string to avoid a content→assets dependency. */
export interface Project {
  readonly id: Id;
  readonly name: string;
  readonly shortName: string;
  readonly category: ProjectCategory;
  readonly organizationId: Id | null;
  readonly tagline: string;
  readonly problem: string | null;
  readonly solution: string;
  readonly capabilities: readonly string[];
  readonly topics: readonly ProjectTopic[];
  readonly role: string;
  readonly contributions: readonly string[];
  readonly technologies: readonly Id[];
  readonly media: readonly ProjectMedia[];
  readonly demoVideoUrl: string | null;
  readonly liveUrl: string | null;
  /** Public repositories only. Private repositories stay `null`. */
  readonly repoUrl: string | null;
  readonly links: readonly ProjectLink[];
  /** Project Park exhibit model (corporate projects); personal projects have their own island instead. */
  readonly exhibitModel: string | null;
  readonly featured: boolean;
}

export type SkillCategoryId = 'frontend' | 'backend' | 'ai' | 'cloud' | 'cicd' | 'gamedev' | 'databases';

export interface SkillCategory {
  readonly id: SkillCategoryId;
  readonly name: string;
  readonly color: string;
  readonly description: string;
}

export interface Skill {
  readonly id: Id;
  readonly name: string;
  readonly categoryId: SkillCategoryId;
  /** Where it is listed: the resume skills, a resume project, or a personal project's public sources. */
  readonly source: 'resume-skills' | 'project-listing' | 'personal-project';
}

export interface Award {
  readonly id: Id;
  readonly title: string;
  readonly years: readonly number[];
  readonly projectId: Id;
  /** The resume lists awards under projects; recipient is the project unless stated otherwise. */
  readonly recipient: 'project' | 'individual';
  readonly imageUrl: string | null;
  readonly supportingUrl: string | null;
}

export interface Education {
  readonly institution: string;
  readonly qualification: string;
  readonly result: string;
  readonly startYear: number;
  readonly endYear: number;
}

export interface MentoringActivity {
  readonly id: Id;
  readonly title: string;
  readonly organization: string;
  readonly description: string;
}

export type ContactKind = 'email' | 'phone' | 'linkedin' | 'github' | 'website';

export interface ContactChannel {
  readonly id: ContactKind;
  readonly label: string;
  /** Human-readable value, e.g. the address or profile label. */
  readonly display: string;
  /** Actionable href; `null` = not yet supplied, hide action. */
  readonly href: string | null;
}

export interface CvInfo {
  /** Path relative to the site root, e.g. "cv/Achintha_Bandara_CV.pdf". `null` hides CV actions. */
  readonly path: string | null;
  readonly fileName: string;
}

export interface SageTopic {
  readonly id: Id;
  readonly title: string;
  readonly summary: string;
  readonly points: readonly string[];
}

export interface IdeaSeed {
  readonly id: Id;
  readonly title: string;
  readonly fact: string;
}
