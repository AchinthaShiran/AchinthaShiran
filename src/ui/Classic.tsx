import { type ReactNode, useEffect, useRef, useState } from 'react';
import {
  assetUrl,
  awards,
  contacts,
  currentRole,
  cv,
  education,
  formatYearMonth,
  getContact,
  getOrganization,
  profile,
  projectsByCategory,
  roles,
} from '@/content';
import {
  About,
  AwardsOverview,
  CareerTimeline,
  ContactList,
  EducationDetails,
  MentoringOverview,
  ProjectList,
  RoleDetails,
  SkillsOverview,
} from './content/blocks';
import { Icon, Logo } from './Icon';

/** Order matters: personal projects come before the Sysco LABS projects (which include SAGE). */
const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'personal', label: 'Personal projects' },
  { id: 'projects', label: 'Sysco LABS projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'awards', label: 'Awards' },
  { id: 'mentoring', label: 'Mentoring' },
  { id: 'contact', label: 'Contact' },
] as const;

/** Anchors inside sections (kept so older links such as #/classic/sage still work). */
const SUB_ANCHORS: Record<string, string> = { sage: 'projects' };

const prefersReducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

/** Links to the hash we are already on do not change the route, so scroll explicitly. */
const jumpTo = (id: string | null) => {
  if (id)
    document
      .getElementById(SUB_ANCHORS[id] ?? id)
      ?.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
  else window.scrollTo({ top: 0, behavior: scrollBehavior() });
};

/** The section currently under the reading line (for the nav highlight). */
function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-18% 0px -68% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/** Reading progress (0..1) and whether the visitor has scrolled far enough for "back to top". */
function useScroll(): { progress: number; past: boolean } {
  const [state, setState] = useState({ progress: 0, past: false });
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setState({ progress: max > 0 ? Math.min(1, window.scrollY / max) : 0, past: window.scrollY > 600 });
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return state;
}

function ClassicSection({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="classic-section" aria-labelledby={`${id}-title`}>
      <header className="section-head">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        {intro && <p className="section-head__intro">{intro}</p>}
      </header>
      {children}
    </section>
  );
}

function Hero({ webgl }: { webgl: boolean }) {
  const role = currentRole();
  const org = getOrganization(role.organizationId);
  const edu = education[0];
  const email = getContact('email');
  const linkedin = contacts.find((c) => c.id === 'linkedin' && c.href);
  const corporate = projectsByCategory('corporate').length;
  const personal = projectsByCategory('personal').length;
  return (
    <section className="classic__hero" aria-labelledby="hero-title">
      <p className="eyebrow">WONDERLAND · Portfolio</p>
      <h1 id="hero-title">{profile.name}</h1>
      <p className="classic__headline">{profile.headline}</p>
      <p className="muted">{profile.shortHeadline}</p>
      <div className="actions classic__actions">
        {email?.href && (
          <a className="btn btn--primary" href={email.href}>
            <Icon name="mail" /> Get in touch
          </a>
        )}
        {cv.path && (
          <a className="btn" href={assetUrl(cv.path)} download={cv.fileName}>
            <Icon name="download" /> Download CV
          </a>
        )}
        {linkedin?.href && (
          <a className="btn" href={linkedin.href} target="_blank" rel="noopener noreferrer">
            <Icon name="link" /> LinkedIn
          </a>
        )}
        {webgl && (
          <a className="btn btn--ghost" href="#/">
            <Icon name="sparkle" /> Explore the 3D world
          </a>
        )}
      </div>
      <dl className="facts">
        <div>
          <dt>Current role</dt>
          <dd>
            {role.title}
            {org ? ` · ${org.shortName}` : ''}
            <small>Since {formatYearMonth(role.start)}</small>
          </dd>
        </div>
        {edu && (
          <div>
            <dt>Education</dt>
            <dd>
              {edu.qualification}
              <small>
                {edu.result} · {edu.institution}
              </small>
            </dd>
          </div>
        )}
        <div>
          <dt>Projects</dt>
          <dd>
            {corporate + personal}
            <small>
              {corporate} at Sysco LABS · {personal} personal
            </small>
          </dd>
        </div>
        <div>
          <dt>Recognition</dt>
          <dd>
            {awards.length}
            <small>awards linked to the projects</small>
          </dd>
        </div>
      </dl>
    </section>
  );
}

/** Conventional, fully accessible portfolio page built from the same content (ADR-004). */
export function Classic({ section, webgl }: { section: string | null; webgl: boolean }) {
  const ids = SECTIONS.map((s) => s.id);
  const active = useActiveSection(ids);
  const { progress, past } = useScroll();
  const navRef = useRef<HTMLElement>(null);
  const lostContext = window.location.hash.includes('reason=webgl');

  // Deep links (#/classic/projects, #/classic/sage …) scroll to their section.
  useEffect(() => {
    jumpTo(section);
  }, [section]);

  // Keep the highlighted nav item visible on narrow screens.
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
    });
  }, [active]);

  // Printing shows every project's details.
  useEffect(() => {
    const openAll = () =>
      document.querySelectorAll('details.project').forEach((d) => d.setAttribute('open', ''));
    window.addEventListener('beforeprint', openAll);
    return () => window.removeEventListener('beforeprint', openAll);
  }, []);

  const navActive = active ?? (section ? (SUB_ANCHORS[section] ?? section) : null);
  const personal = projectsByCategory('personal');

  return (
    <div className="classic">
      <a className="skip-link" href="#/classic/about">
        Skip to content
      </a>
      <header className="classic__header">
        <div className="classic__bar">
          <a className="classic__brand" href="#/classic" onClick={() => jumpTo(null)}>
            <Logo />
            <strong>{profile.name}</strong>
          </a>
          <nav className="classic__nav" aria-label="Sections" ref={navRef}>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#/classic/${s.id}`}
                aria-current={navActive === s.id ? 'true' : undefined}
                onClick={() => jumpTo(s.id)}
              >
                {s.label}
              </a>
            ))}
          </nav>
          {webgl && (
            <a className="btn btn--small btn--primary classic__cta" href="#/">
              3D world
            </a>
          )}
        </div>
        <div className="classic__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
      </header>

      <main className="classic__main">
        {(!webgl || lostContext) && (
          <p className="notice" role="status">
            {lostContext
              ? 'The 3D world stopped unexpectedly, so here is the classic portfolio instead.'
              : "Your browser doesn't support the 3D world, so here is the classic portfolio — all the same content."}
          </p>
        )}
        <Hero webgl={webgl} />

        <ClassicSection id="about" eyebrow="Who I am" title="About">
          <About nav={undefined} />
        </ClassicSection>

        <ClassicSection
          id="experience"
          eyebrow="Career"
          title="Experience"
          intro="Career progression at Sysco LABS Technologies, most recent role first."
        >
          <div className="experience">
            <CareerTimeline nav={undefined} />
            <div className="grid-cards">
              {[...roles].reverse().map((r) => (
                <article key={r.id} className="card role-card">
                  <h3>{r.title}</h3>
                  <RoleDetails role={r} nav={undefined} />
                </article>
              ))}
            </div>
          </div>
        </ClassicSection>

        <ClassicSection
          id="personal"
          eyebrow="Built on my own"
          title="Personal projects"
          intro={`Projects created outside work: ${personal.map((p) => p.shortName).join(', ')}.`}
        >
          <ProjectList nav={undefined} category="personal" />
        </ClassicSection>

        <ClassicSection
          id="projects"
          eyebrow="Sysco LABS"
          title="Key projects at Sysco LABS"
          intro="Corporate projects from Sysco LABS."
        >
          <ProjectList nav={undefined} category="corporate" />
        </ClassicSection>

        <ClassicSection id="skills" eyebrow="Toolbox" title="Skills">
          <SkillsOverview nav={undefined} />
        </ClassicSection>

        <ClassicSection id="education" eyebrow="Learning" title="Education">
          <EducationDetails />
        </ClassicSection>

        <ClassicSection id="awards" eyebrow="Recognition" title="Awards & recognition">
          <AwardsOverview nav={undefined} />
        </ClassicSection>

        <ClassicSection id="mentoring" eyebrow="Giving back" title="Mentoring & leadership">
          <MentoringOverview nav={undefined} />
        </ClassicSection>

        <ClassicSection id="contact" eyebrow="Let's talk" title="Contact">
          <ContactList />
        </ClassicSection>
      </main>

      <footer className="classic__footer">
        <p>
          {profile.name} · {profile.headline}
        </p>
        <p className="muted">
          {webgl ? (
            <>
              This is the classic view of the same content. <a href="#/">Explore the 3D world</a>.
            </>
          ) : (
            'Classic view'
          )}
        </p>
      </footer>

      {past && (
        <button type="button" className="back-to-top" aria-label="Back to top" onClick={() => jumpTo(null)}>
          <Icon name="back" className="icon back-to-top__icon" />
        </button>
      )}
    </div>
  );
}
