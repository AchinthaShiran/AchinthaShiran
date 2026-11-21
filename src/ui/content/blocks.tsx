/**
 * Content components shared by in-world panels and Classic mode (ADR-004). They only render facts
 * from `content/`; fields with no data are hidden (plan §12). `nav` links to related panels when
 * rendered inside the 3D experience; in Classic mode links become in-page anchors.
 */
import type { ReactNode } from 'react';
import {
  assetUrl,
  awards,
  awardsForProject,
  contacts,
  currentRole,
  cv,
  education,
  formatPeriod,
  formatYears,
  getContact,
  getOrganization,
  getProject,
  getSkill,
  getSkillCategory,
  mentoring,
  profile,
  projects,
  projectsByCategory,
  projectsUsingSkill,
  roles,
  rolesForOrganization,
  rolesForProject,
  sageTopics,
  skillCategories,
  skillsInCategory,
  type Award,
  type ContactChannel,
  type ContactKind,
  type MentoringActivity,
  type Project,
  type ProjectCategory,
  type ProjectTopic,
  type Role,
  type SageTopic,
  type Skill,
} from '@/content';
import type { PanelRef } from '@/world/types';
import { Icon, type IconName } from '../Icon';

export type Nav = ((panel: PanelRef) => void) | undefined;

const ANCHORS: Partial<Record<PanelRef['kind'], string>> = {
  project: 'projects',
  'project-topic': 'projects',
  projects: 'projects',
  role: 'experience',
  'career-timeline': 'experience',
  organization: 'experience',
  skill: 'skills',
  skills: 'skills',
  award: 'awards',
  awards: 'awards',
  sage: 'sage',
  education: 'education',
  mentoring: 'mentoring',
  'mentoring-overview': 'mentoring',
  contact: 'contact',
  cv: 'contact',
  about: 'about',
};

/** Classic-mode section for a panel reference. Personal projects live in their own section. */
function classicAnchor(to: PanelRef): string | undefined {
  if (to.kind === 'project' && getProject(to.id)?.category === 'personal') return 'personal';
  if (to.kind === 'project-topic' && getProject(to.project)?.category === 'personal') return 'personal';
  if (to.kind === 'projects' && to.category === 'personal') return 'personal';
  return ANCHORS[to.kind];
}

export function NavChip({
  label,
  to,
  nav,
  color,
}: {
  label: string;
  to: PanelRef;
  nav: Nav;
  color?: string;
}) {
  const dot = color ? <span className="chip__dot" style={{ background: color }} /> : null;
  if (nav) {
    return (
      <button type="button" className="chip chip--link" onClick={() => nav(to)}>
        {dot}
        {label}
      </button>
    );
  }
  const anchor = classicAnchor(to);
  return anchor ? (
    <a className="chip chip--link" href={`#/classic/${anchor}`}>
      {dot}
      {label}
    </a>
  ) : (
    <span className="chip">
      {dot}
      {label}
    </span>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="section-title">{title}</h3>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="list">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function ExternalLink({
  href,
  children,
  icon = 'external',
}: {
  href: string;
  children: ReactNode;
  icon?: IconName;
}) {
  const external = href.startsWith('http');
  return (
    <a
      className="btn btn--small"
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <Icon name={icon} />
      {children}
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  );
}

/* ---------------- Profile ---------------- */

export function Welcome({ nav }: { nav: Nav }) {
  return (
    <>
      <p className="lead">{profile.welcomeMessage}</p>
      <p className="muted">{profile.headline}</p>
      <div className="actions">
        <NavChip label="About me" to={{ kind: 'about' }} nav={nav} />
        <NavChip label="Key projects" to={{ kind: 'projects', category: 'corporate' }} nav={nav} />
        <NavChip label="Personal projects" to={{ kind: 'projects', category: 'personal' }} nav={nav} />
        <NavChip label="Contact" to={{ kind: 'contact' }} nav={nav} />
      </div>
    </>
  );
}

export function About({ nav }: { nav: Nav }) {
  const role = currentRole();
  const org = getOrganization(role.organizationId);
  return (
    <>
      <p className="lead">{profile.bio}</p>
      <Section title="Current role">
        <p>
          <strong>{role.title}</strong>
          {org ? ` at ${org.name}` : ''}
        </p>
      </Section>
      <Section title="Areas of expertise">
        <Bullets items={profile.themes} />
      </Section>
      <Section title="Personal passion">
        <p>{profile.passion}</p>
      </Section>
      <Section title="Education">
        <EducationSummary />
      </Section>
      <Section title="Professional qualities">
        <SoftSkills />
      </Section>
      <CvAction />
      <div className="actions">
        <NavChip label="Career timeline" to={{ kind: 'career-timeline' }} nav={nav} />
        <NavChip label="Personal projects" to={{ kind: 'projects', category: 'personal' }} nav={nav} />
        <NavChip label="Skills" to={{ kind: 'skills' }} nav={nav} />
      </div>
    </>
  );
}

export function Interests({ nav }: { nav: Nav }) {
  return (
    <>
      <p>Areas of technical interest:</p>
      <ul className="chips">
        {profile.technicalInterests.map((t) => (
          <li key={t} className="chip">
            {t}
          </li>
        ))}
      </ul>
      <p className="muted">{profile.passion}</p>
      <div className="actions">
        <NavChip label="SAGE — Agentic AI" to={{ kind: 'sage', id: 'core' }} nav={nav} />
        <NavChip label="Skills" to={{ kind: 'skills' }} nav={nav} />
      </div>
    </>
  );
}

export function SoftSkills() {
  return (
    <ul className="chips">
      {profile.softSkills.map((s) => (
        <li key={s} className="chip">
          {s}
        </li>
      ))}
    </ul>
  );
}

/* ---------------- Experience ---------------- */

const ROLE_COLORS = ['#75BDEB', '#80CFA9', '#B9A1E8', '#F5A6A6', '#FFD27D'];

export function CareerTimeline({ nav }: { nav: Nav }) {
  const ordered = [...roles].sort((a, b) => a.start.localeCompare(b.start));
  return (
    <ol className="timeline" aria-label="Career timeline">
      {ordered.map((role, i) => (
        <li key={role.id} style={{ ['--dot' as string]: ROLE_COLORS[i % ROLE_COLORS.length] }}>
          <div className="timeline__date">{formatPeriod(role.start, role.end)}</div>
          <strong>{role.title}</strong>
          <div className="muted">{getOrganization(role.organizationId)?.name}</div>
          {nav && (
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={() => nav({ kind: 'role', id: role.id })}
            >
              Role details
            </button>
          )}
        </li>
      ))}
    </ol>
  );
}

export function OrganizationDetails({ id, nav }: { id: string; nav: Nav }) {
  const org = getOrganization(id);
  if (!org) return <Missing />;
  return (
    <>
      <p className="lead">Career progression at {org.name}:</p>
      <CareerTimeline nav={nav} />
      {rolesForOrganization(id).length > 0 && (
        <p className="muted">
          Currently {currentRole().title}. The plaques along the plaza walk through each role.
        </p>
      )}
    </>
  );
}

export function RoleDetails({ role, nav }: { role: Role; nav: Nav }) {
  const org = getOrganization(role.organizationId);
  return (
    <>
      <p>
        <span className="badge">{formatPeriod(role.start, role.end)}</span>
      </p>
      {org && <p className="muted">{org.name}</p>}
      {role.summary && <p className="lead">{role.summary}</p>}
      {role.responsibilities.length > 0 && (
        <Section title="Responsibilities & contributions">
          <Bullets items={role.responsibilities} />
        </Section>
      )}
      {role.projectIds.length > 0 && (
        <Section title="Relevant projects">
          <div className="chips">
            {role.projectIds.map((pid) => {
              const p = getProject(pid);
              return p ? (
                <NavChip key={pid} label={p.shortName} to={{ kind: 'project', id: pid }} nav={nav} />
              ) : null;
            })}
          </div>
        </Section>
      )}
      {role.technologies.length > 0 && <TechChips ids={role.technologies} nav={nav} />}
      {role.responsibilities.length === 0 && role.projectIds.length === 0 && (
        <p className="note">
          Part of the career progression at {org?.shortName ?? 'the organization'}. Role-specific details will
          be added here.
        </p>
      )}
      <div className="actions">
        <NavChip label="Full career timeline" to={{ kind: 'career-timeline' }} nav={nav} />
      </div>
    </>
  );
}

export function CurrentRole({ nav }: { nav: Nav }) {
  const role = currentRole();
  return (
    <>
      <div className="card">
        <h3>{role.title}</h3>
        <p className="muted">
          {getOrganization(role.organizationId)?.name} · {formatPeriod(role.start, role.end)}
        </p>
        {role.summary && <p>{role.summary}</p>}
      </div>
      <Section title="Career at Sysco LABS">
        <CareerTimeline nav={nav} />
      </Section>
    </>
  );
}

/* ---------------- SAGE ---------------- */

export function SageTopicDetails({ topic, nav }: { topic: SageTopic; nav: Nav }) {
  return (
    <>
      <p className="lead">{topic.summary}</p>
      <Bullets items={topic.points} />
      <Section title="Explore the lab">
        <div className="chips">
          {sageTopics
            .filter((t) => t.id !== topic.id)
            .map((t) => (
              <NavChip key={t.id} label={t.title} to={{ kind: 'sage', id: t.id }} nav={nav} />
            ))}
        </div>
      </Section>
      <div className="actions">
        <NavChip label="SAGE project details" to={{ kind: 'project', id: 'sage' }} nav={nav} />
      </div>
    </>
  );
}

export function SageOverview({ nav }: { nav: Nav }) {
  return (
    <>
      {sageTopics.map((t) => (
        <div key={t.id} className="card">
          <h3>{t.title}</h3>
          <p>{t.summary}</p>
          <Bullets items={t.points} />
        </div>
      ))}
      <div className="actions">
        <NavChip label="SAGE project details" to={{ kind: 'project', id: 'sage' }} nav={nav} />
      </div>
    </>
  );
}

/* ---------------- Projects ---------------- */

function TechChips({ ids, nav }: { ids: readonly string[]; nav: Nav }) {
  return (
    <Section title="Technologies">
      <div className="chips">
        {ids.map((id) => {
          const s = getSkill(id);
          return s ? (
            <NavChip
              key={id}
              label={s.name}
              to={{ kind: 'skill', id }}
              nav={nav}
              color={getSkillCategory(s.categoryId)?.color}
            />
          ) : null;
        })}
      </div>
    </Section>
  );
}

export function ProjectDetails({
  project,
  nav,
  extra,
}: {
  project: Project;
  nav: Nav;
  /** Extra content from the host (e.g. world actions); never rendered in Classic mode. */
  extra?: ReactNode;
}) {
  const org = project.organizationId ? getOrganization(project.organizationId) : undefined;
  const recognitions = awardsForProject(project.id);
  const linkedRoles = rolesForProject(project.id);
  return (
    <>
      <p>
        {org && <span className="badge">{org.name}</span>}{' '}
        {project.category === 'personal' && <span className="badge badge--coral">Personal project</span>}{' '}
        <span className="badge badge--sun">{project.role}</span>
      </p>
      <p className="lead">{project.tagline}</p>
      {project.problem && (
        <Section title="The need">
          <p>{project.problem}</p>
        </Section>
      )}
      <Section title="Solution">
        <p>{project.solution}</p>
      </Section>
      <Section title="Key capabilities">
        <Bullets items={project.capabilities} />
      </Section>
      {project.topics.length > 0 && <ProjectTopics project={project} nav={nav} />}
      <Section title="Achintha's role & contributions">
        <Bullets items={project.contributions} />
      </Section>
      {project.media.length > 0 && (
        <Section title="Media">
          <div className="grid-2">
            {project.media.map((m) =>
              m.type === 'image' ? (
                <img
                  key={m.src}
                  src={assetUrl(m.src)}
                  alt={m.alt}
                  style={{ width: '100%', borderRadius: 12 }}
                  loading="lazy"
                />
              ) : (
                <video
                  key={m.src}
                  src={assetUrl(m.src)}
                  controls
                  style={{ width: '100%', borderRadius: 12 }}
                  aria-label={m.alt}
                />
              ),
            )}
          </div>
        </Section>
      )}
      {recognitions.length > 0 && (
        <Section title="Recognition">
          <ul className="list">
            {recognitions.map((a) => (
              <li key={a.id}>
                {a.title} <span className="muted">({formatYears(a.years)})</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {project.technologies.length > 0 && (
        <>
          <TechChips ids={project.technologies} nav={nav} />
          <p className="note">
            {project.category === 'corporate'
              ? 'Technologies are those listed for the project in the resume; not every technology is used in every component.'
              : "Technologies are those stated in the project's public sources."}
          </p>
        </>
      )}
      {(project.liveUrl || project.repoUrl || project.demoVideoUrl || project.links.length > 0) && (
        <div className="actions">
          {project.liveUrl && <ExternalLink href={project.liveUrl}>Live application</ExternalLink>}
          {project.links.map((l) => (
            <ExternalLink key={l.url} href={l.url}>
              {l.label}
            </ExternalLink>
          ))}
          {project.repoUrl && <ExternalLink href={project.repoUrl}>Source repository</ExternalLink>}
          {project.demoVideoUrl && <ExternalLink href={project.demoVideoUrl}>Demo video</ExternalLink>}
        </div>
      )}
      {extra}
      {linkedRoles.length > 0 && (
        <div className="actions">
          {linkedRoles.map((r) => (
            <NavChip key={r.id} label={`Role: ${r.title}`} to={{ kind: 'role', id: r.id }} nav={nav} />
          ))}
          {project.id === 'sage' && (
            <NavChip label="Explore the Innovation Lab" to={{ kind: 'sage', id: 'core' }} nav={nav} />
          )}
        </div>
      )}
    </>
  );
}

/** One feature of a project: chips that open its topic panel in the world, or full cards in Classic mode. */
function ProjectTopics({ project, nav }: { project: Project; nav: Nav }) {
  if (nav) {
    return (
      <Section title="Features">
        <div className="chips">
          {project.topics.map((t) => (
            <NavChip
              key={t.id}
              label={t.title}
              to={{ kind: 'project-topic', project: project.id, id: t.id }}
              nav={nav}
            />
          ))}
        </div>
      </Section>
    );
  }
  return (
    <Section title="Features">
      {project.topics.map((t) => (
        <div key={t.id} className="card">
          <h3>{t.title}</h3>
          <p>{t.summary}</p>
          <Bullets items={t.points} />
        </div>
      ))}
    </Section>
  );
}

export function ProjectTopicDetails({
  project,
  topic,
  nav,
}: {
  project: Project;
  topic: ProjectTopic;
  nav: Nav;
}) {
  const others = project.topics.filter((t) => t.id !== topic.id);
  return (
    <>
      <p className="lead">{topic.summary}</p>
      <Bullets items={topic.points} />
      {others.length > 0 && (
        <Section title={`More from ${project.shortName}`}>
          <div className="chips">
            {others.map((t) => (
              <NavChip
                key={t.id}
                label={t.title}
                to={{ kind: 'project-topic', project: project.id, id: t.id }}
                nav={nav}
              />
            ))}
          </div>
        </Section>
      )}
      <div className="actions">
        <NavChip label={`About ${project.shortName}`} to={{ kind: 'project', id: project.id }} nav={nav} />
      </div>
    </>
  );
}

const PROJECT_GROUPS: { category: ProjectCategory; title: string }[] = [
  { category: 'corporate', title: 'At Sysco LABS' },
  { category: 'personal', title: 'Personal projects' },
];

/** Projects grouped by category; pass `category` to show a single group. */
export function ProjectList({ nav, category }: { nav: Nav; category?: ProjectCategory }) {
  return (
    <>
      {PROJECT_GROUPS.filter((g) => !category || g.category === category).map((group) => {
        const list = projectsByCategory(group.category);
        if (list.length === 0) return null;
        return (
          <div key={group.category}>
            {!category && <h3 className="section-title">{group.title}</h3>}
            {list.map((p) =>
              nav ? (
                <button
                  key={p.id}
                  type="button"
                  className="card card--link"
                  onClick={() => nav({ kind: 'project', id: p.id })}
                >
                  <h3>{p.name}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {p.tagline}
                  </p>
                </button>
              ) : (
                <article key={p.id} className="card">
                  <h3>{p.name}</h3>
                  <ProjectDetails project={p} nav={undefined} />
                </article>
              ),
            )}
          </div>
        );
      })}
    </>
  );
}

/* ---------------- Skills ---------------- */

export function SkillsOverview({ nav }: { nav: Nav }) {
  return (
    <>
      <p>
        Technologies from the resume and from personal projects, grouped by area. Each one links to the
        projects where it appears.
      </p>
      {skillCategories.map((c) => {
        const list = skillsInCategory(c.id);
        if (list.length === 0) return null;
        return (
          <div key={c.id} className="card">
            <h3>
              <span
                className="chip__dot"
                style={{ background: c.color, display: 'inline-block', marginRight: 8 }}
              />
              {c.name}
            </h3>
            <div className="chips">
              {list.map((s) => (
                <NavChip
                  key={s.id}
                  label={s.name}
                  to={{ kind: 'skill', id: s.id }}
                  nav={nav}
                  color={c.color}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function SkillDetails({ skill, nav }: { skill: Skill; nav: Nav }) {
  const category = getSkillCategory(skill.categoryId);
  const related = skillsInCategory(skill.categoryId).filter((s) => s.id !== skill.id);
  const used = projectsUsingSkill(skill.id);
  return (
    <>
      {category && (
        <p>
          <span className="badge" style={{ background: category.color, color: '#2f2a40' }}>
            {category.name}
          </span>
        </p>
      )}
      <p className="muted">
        {skill.source === 'resume-skills'
          ? 'Listed in the resume skills.'
          : skill.source === 'personal-project'
            ? 'Used in personal projects, as stated in their public sources.'
            : 'Listed under specific projects in the resume.'}
      </p>
      {used.length > 0 && (
        <Section title="Appears in">
          <div className="chips">
            {used.map((p) => (
              <NavChip key={p.id} label={p.shortName} to={{ kind: 'project', id: p.id }} nav={nav} />
            ))}
          </div>
        </Section>
      )}
      {related.length > 0 && (
        <Section title={`Related ${category?.name ?? ''} skills`}>
          <div className="chips">
            {related.map((s) => (
              <NavChip
                key={s.id}
                label={s.name}
                to={{ kind: 'skill', id: s.id }}
                nav={nav}
                color={category?.color}
              />
            ))}
          </div>
        </Section>
      )}
      <div className="actions">
        <NavChip label="All skills" to={{ kind: 'skills' }} nav={nav} />
      </div>
    </>
  );
}

/* ---------------- Awards ---------------- */

export function AwardDetails({ award, nav }: { award: Award; nav: Nav }) {
  const project = getProject(award.projectId);
  return (
    <>
      <p>
        <span className="badge badge--sun">{formatYears(award.years)}</span>{' '}
        <span className="badge">
          {award.recipient === 'project' ? 'Project recognition' : 'Individual recognition'}
        </span>
      </p>
      <p className="lead">{award.title}</p>
      {project && (
        <p>
          Listed under <strong>{project.name}</strong> in the resume.
        </p>
      )}
      {award.imageUrl && (
        <img src={assetUrl(award.imageUrl)} alt={award.title} style={{ width: '100%', borderRadius: 12 }} />
      )}
      {award.supportingUrl && <ExternalLink href={award.supportingUrl}>Read more</ExternalLink>}
      {project && (
        <div className="actions">
          <NavChip label={project.shortName} to={{ kind: 'project', id: project.id }} nav={nav} />
          <NavChip label="All milestones" to={{ kind: 'awards' }} nav={nav} />
        </div>
      )}
    </>
  );
}

export function AwardsOverview({ nav }: { nav: Nav }) {
  const byProject = projects
    .map((p) => ({ project: p, list: awards.filter((a) => a.projectId === p.id) }))
    .filter((g) => g.list.length);
  return (
    <>
      <p>
        Recognition associated with the projects Achintha has led and contributed to, as listed in the resume.
      </p>
      {byProject.map(({ project, list }) => (
        <div key={project.id} className="card">
          <h3>{project.name}</h3>
          <ul className="list">
            {list.map((a) => (
              <li key={a.id}>
                {nav ? (
                  <button
                    type="button"
                    className="chip chip--link"
                    onClick={() => nav({ kind: 'award', id: a.id })}
                  >
                    {a.title}
                  </button>
                ) : (
                  a.title
                )}{' '}
                <span className="muted">({formatYears(a.years)})</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

/* ---------------- Education & mentoring ---------------- */

export function EducationSummary() {
  return (
    <>
      {education.map((e) => (
        <p key={e.institution} style={{ margin: 0 }}>
          <strong>{e.qualification}</strong> — {e.result}
          <br />
          <span className="muted">
            {e.institution} · {e.startYear}–{e.endYear}
          </span>
        </p>
      ))}
    </>
  );
}

export function EducationDetails() {
  return (
    <>
      {education.map((e) => (
        <div key={e.institution} className="card">
          <h3>{e.institution}</h3>
          <dl style={{ margin: 0 }}>
            <dt className="muted">Qualification</dt>
            <dd style={{ margin: '0 0 8px' }}>{e.qualification}</dd>
            <dt className="muted">Result</dt>
            <dd style={{ margin: '0 0 8px' }}>{e.result}</dd>
            <dt className="muted">Period</dt>
            <dd style={{ margin: 0 }}>
              {e.startYear}–{e.endYear}
            </dd>
          </dl>
        </div>
      ))}
    </>
  );
}

export function MentoringDetails({ activity }: { activity: MentoringActivity }) {
  return (
    <>
      <p>
        <span className="badge">{activity.organization}</span>
      </p>
      <p className="lead">{activity.description}</p>
    </>
  );
}

export function MentoringOverview({ nav }: { nav: Nav }) {
  return (
    <>
      <p>Mentoring, leadership and community contributions listed in the resume.</p>
      {mentoring.map((m) => (
        <div key={m.id} className="card">
          <h3>{m.title}</h3>
          <p style={{ margin: 0 }}>{m.description}</p>
        </div>
      ))}
      <Section title="Professional qualities">
        <SoftSkills />
      </Section>
      {nav && (
        <div className="actions">
          <NavChip label="Career timeline" to={{ kind: 'career-timeline' }} nav={nav} />
        </div>
      )}
    </>
  );
}

/* ---------------- Growth timeline ---------------- */

export function GrowthTimeline({ nav }: { nav: Nav }) {
  type Item = {
    key: string;
    sort: string;
    date: string;
    title: string;
    detail?: string;
    to?: PanelRef;
    color: string;
  };
  const items: Item[] = [
    ...education.map((e) => ({
      key: `edu-${e.institution}`,
      sort: `${e.startYear}-00`,
      date: `${e.startYear}–${e.endYear}`,
      title: e.qualification,
      detail: `${e.institution} · ${e.result}`,
      to: { kind: 'education' } as PanelRef,
      color: '#75BDEB',
    })),
    ...roles.map((r) => ({
      key: r.id,
      sort: r.start,
      date: formatPeriod(r.start, r.end),
      title: r.title,
      detail: getOrganization(r.organizationId)?.name,
      to: { kind: 'role', id: r.id } as PanelRef,
      color: '#80CFA9',
    })),
    ...awards.map((a) => ({
      key: a.id,
      sort: `${Math.min(...a.years)}-13`,
      date: formatYears(a.years),
      title: a.title,
      detail: getProject(a.projectId)?.shortName,
      to: { kind: 'award', id: a.id } as PanelRef,
      color: '#FFD27D',
    })),
  ].sort((a, b) => a.sort.localeCompare(b.sort));
  return (
    <>
      <p>Education, career progression and project recognition — growing like the tree.</p>
      <ol className="timeline">
        {items.map((i) => (
          <li key={i.key} style={{ ['--dot' as string]: i.color }}>
            <div className="timeline__date">{i.date}</div>
            {nav && i.to ? (
              <button type="button" className="chip chip--link" onClick={() => nav(i.to!)}>
                {i.title}
              </button>
            ) : (
              <strong>{i.title}</strong>
            )}
            {i.detail && <div className="muted">{i.detail}</div>}
          </li>
        ))}
      </ol>
      <Section title="Mentoring & leadership">
        <ul className="list">
          {mentoring.map((m) => (
            <li key={m.id}>
              <strong>{m.title}</strong> — {m.description}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/* ---------------- Contact ---------------- */

const CONTACT_ICONS: Record<ContactKind, IconName> = {
  email: 'mail',
  phone: 'phone',
  linkedin: 'link',
  github: 'globe',
  website: 'globe',
};

export function ContactRow({ channel }: { channel: ContactChannel }) {
  return (
    <div className="contact-row">
      <span className="contact-row__icon">
        <Icon name={CONTACT_ICONS[channel.id]} />
      </span>
      <div className="contact-row__text">
        <div className="muted" style={{ fontSize: 13 }}>
          {channel.label}
        </div>
        <strong>{channel.display}</strong>
      </div>
      {channel.href && (
        <a
          className="btn btn--small"
          href={channel.href}
          {...(channel.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          aria-label={`${channel.id === 'email' ? 'Send email to' : channel.id === 'phone' ? 'Call' : 'Open'} ${channel.label}: ${channel.display}`}
        >
          {channel.id === 'email' ? 'Email' : channel.id === 'phone' ? 'Call' : 'Open'}
        </a>
      )}
    </div>
  );
}

/** Channels shown: anything with an href, plus labels the plan says to display (LinkedIn label). */
const visibleChannels = () => contacts.filter((c) => c.href !== null || c.id === 'linkedin');

export function ContactList({ closing = true }: { closing?: boolean }) {
  return (
    <>
      {closing && <p className="lead">{profile.closingMessage}</p>}
      <div>
        {visibleChannels().map((c) => (
          <ContactRow key={c.id} channel={c} />
        ))}
      </div>
      <CvAction />
    </>
  );
}

export function ContactChannelDetails({ id }: { id: ContactKind }) {
  const channel = getContact(id);
  if (!channel || (channel.href === null && channel.id !== 'linkedin')) {
    return (
      <p className="note">
        This profile link hasn't been published yet. Please reach out by email in the meantime.
      </p>
    );
  }
  return (
    <>
      <ContactRow channel={channel} />
      {channel.href === null && (
        <p className="note">
          Search for “{channel.display}” on {channel.label}. A direct link will be added soon.
        </p>
      )}
      <p className="muted">{profile.closingMessage}</p>
    </>
  );
}

export function Profiles() {
  const profiles = contacts.filter(
    (c) => !['email', 'phone'].includes(c.id) && (c.href !== null || c.id === 'linkedin'),
  );
  return (
    <>
      <p>Other places to find Achintha online:</p>
      {profiles.map((c) => (
        <ContactRow key={c.id} channel={c} />
      ))}
      {profiles.every((c) => c.href === null) && (
        <p className="note">More verified profile links will appear here once published.</p>
      )}
    </>
  );
}

export function CvAction() {
  if (!cv.path) return null;
  return (
    <div className="actions">
      <a className="btn btn--primary" href={assetUrl(cv.path)} download={cv.fileName}>
        <Icon name="download" /> Download CV
      </a>
    </div>
  );
}

export function CvDetails() {
  if (cv.path) {
    return (
      <>
        <p>Grab a copy of Achintha's CV (PDF).</p>
        <CvAction />
      </>
    );
  }
  return (
    <p className="note">
      The CV download will be available here soon. In the meantime, everything on the CV is in this world — or
      reach out by email.
    </p>
  );
}

export function Missing() {
  return <p className="note">This item could not be found. It may have been renamed or removed.</p>;
}
