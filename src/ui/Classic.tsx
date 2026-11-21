import { useEffect } from 'react';
import { profile, roles } from '@/content';
import {
  About,
  AwardsOverview,
  CareerTimeline,
  ContactList,
  EducationDetails,
  MentoringOverview,
  ProjectList,
  RoleDetails,
  SageOverview,
  SkillsOverview,
} from './content/blocks';
import { Logo } from './Icon';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'sage', label: 'SAGE / Agentic AI' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'awards', label: 'Awards' },
  { id: 'mentoring', label: 'Mentoring' },
  { id: 'contact', label: 'Contact' },
] as const;

/** Conventional, fully accessible portfolio page built from the same content (ADR-004). */
export function Classic({ section, webgl }: { section: string | null; webgl: boolean }) {
  useEffect(() => {
    if (section) document.getElementById(section)?.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0 });
  }, [section]);
  const lostContext = window.location.hash.includes('reason=webgl');

  return (
    <div className="classic">
      <header className="classic__header">
        <div className="classic__bar">
          <a
            href="#/classic"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Logo />
            <strong style={{ fontFamily: 'var(--font-display)' }}>{profile.name}</strong>
          </a>
          <nav className="classic__nav" aria-label="Sections">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#/classic/${s.id}`}>
                {s.label}
              </a>
            ))}
          </nav>
          {webgl && (
            <a className="btn btn--small btn--primary" href="#/">
              Enter the 3D world
            </a>
          )}
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
        <section className="classic__hero">
          <p className="panel__eyebrow">WONDERLAND · Portfolio</p>
          <h1>{profile.name}</h1>
          <p className="lead">
            <strong>{profile.headline}</strong>
          </p>
          <p className="muted">{profile.shortHeadline}</p>
        </section>
        <section id="about" className="classic-section">
          <h2>About</h2>
          <About nav={undefined} />
        </section>
        <section id="experience" className="classic-section">
          <h2>Experience</h2>
          <CareerTimeline nav={undefined} />
          {[...roles].reverse().map((r) => (
            <article key={r.id} className="card">
              <h3>{r.title}</h3>
              <RoleDetails role={r} nav={undefined} />
            </article>
          ))}
        </section>
        <section id="sage" className="classic-section">
          <h2>SAGE — Enterprise Agentic AI</h2>
          <SageOverview nav={undefined} />
        </section>
        <section id="projects" className="classic-section">
          <h2>Key projects</h2>
          <ProjectList nav={undefined} />
        </section>
        <section id="skills" className="classic-section">
          <h2>Skills</h2>
          <SkillsOverview nav={undefined} />
        </section>
        <section id="education" className="classic-section">
          <h2>Education</h2>
          <EducationDetails />
        </section>
        <section id="awards" className="classic-section">
          <h2>Awards & recognition</h2>
          <AwardsOverview nav={undefined} />
        </section>
        <section id="mentoring" className="classic-section">
          <h2>Mentoring & leadership</h2>
          <MentoringOverview nav={undefined} />
        </section>
        <section id="contact" className="classic-section">
          <h2>Contact</h2>
          <ContactList />
        </section>
      </main>
    </div>
  );
}
