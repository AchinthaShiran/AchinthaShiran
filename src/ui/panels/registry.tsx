import type { ReactNode } from 'react';
import {
  getAward,
  getContact,
  getMentoring,
  getOrganization,
  getProject,
  getProjectTopic,
  getRole,
  getSageTopic,
  getSeed,
  getSkill,
  ideaSeeds,
  profile,
} from '@/content';
import { GAME_INFO } from '@/game/paint/config';
import { useProgress } from '@/state/progress';
import type { PanelRef } from '@/world/types';
import { zones } from '@/world/zones';
import {
  About,
  AwardDetails,
  AwardsOverview,
  CareerTimeline,
  ContactChannelDetails,
  ContactList,
  CurrentRole,
  CvDetails,
  EducationDetails,
  GrowthTimeline,
  Interests,
  MentoringDetails,
  MentoringOverview,
  Missing,
  type Nav,
  OrganizationDetails,
  Profiles,
  ProjectDetails,
  ProjectTopicDetails,
  ProjectList,
  RoleDetails,
  SageTopicDetails,
  SkillDetails,
  SkillsOverview,
  SoftSkills,
  Welcome,
} from '../content/blocks';
import { Controls } from './Controls';
import { IslandActions } from './IslandActions';
import { PaintChallenges, PaintGameInfo, PaintHelp } from './PaintPanels';

export interface PanelView {
  eyebrow: string;
  title: string;
  body: (nav: Nav) => ReactNode;
}

function SeedsCollection({ nav }: { nav: Nav }) {
  const collected = useProgress((s) => s.seeds);
  return (
    <>
      <p>
        Optional little discoveries hidden around the world — {collected.length} of {ideaSeeds.length} found.
        Nothing important is hidden behind them.
      </p>
      <div className="grid-2">
        {ideaSeeds.map((s) => {
          const found = collected.includes(s.id);
          return (
            <div key={s.id} className={`card seed-card ${found ? '' : 'seed-card--locked'}`}>
              <h3>{found ? s.title : '???'}</h3>
              {found ? (
                nav ? (
                  <button
                    type="button"
                    className="chip chip--link"
                    onClick={() => nav({ kind: 'seed', id: s.id })}
                  >
                    Read
                  </button>
                ) : (
                  <p>{s.fact}</p>
                )
              ) : (
                <p className="muted">Still hidden somewhere…</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

const view = (eyebrow: string, title: string, body: (nav: Nav) => ReactNode): PanelView => ({
  eyebrow,
  title,
  body,
});
const missing = view('Oops', 'Not found', () => <Missing />);

export function describePanel(ref: PanelRef): PanelView {
  switch (ref.kind) {
    case 'welcome':
      return view('Home Island', `Hey, I'm ${profile.name.split(' ')[0]}!`, (nav) => <Welcome nav={nav} />);
    case 'about':
      return view('About me', profile.name, (nav) => <About nav={nav} />);
    case 'interests':
      return view('Workstation', 'Technical interests', (nav) => <Interests nav={nav} />);
    case 'current-role':
      return view('Notice board', 'Current role', (nav) => <CurrentRole nav={nav} />);
    case 'growth':
      return view('Giant tree', 'Growth timeline', (nav) => <GrowthTimeline nav={nav} />);
    case 'organization': {
      const org = getOrganization(ref.id);
      return org
        ? view('Career City', org.name, (nav) => <OrganizationDetails id={ref.id} nav={nav} />)
        : missing;
    }
    case 'role': {
      const role = getRole(ref.id);
      return role
        ? view(getOrganization(role.organizationId)?.name ?? 'Experience', role.title, (nav) => (
            <RoleDetails role={role} nav={nav} />
          ))
        : missing;
    }
    case 'career-timeline':
      return view('Experience', 'Career timeline', (nav) => <CareerTimeline nav={nav} />);
    case 'sage': {
      const topic = getSageTopic(ref.id);
      return topic
        ? view('Innovation Lab · SAGE', topic.title, (nav) => <SageTopicDetails topic={topic} nav={nav} />)
        : missing;
    }
    case 'projects': {
      const personal = ref.category === 'personal';
      const park = ref.category === 'corporate';
      return view(
        personal ? "Makers' Row" : park ? 'Project Park' : 'Projects',
        personal ? 'Personal projects' : park ? 'Key projects' : 'All projects',
        (nav) => <ProjectList nav={nav} category={ref.category} />,
      );
    }
    case 'project': {
      const project = getProject(ref.id);
      return project
        ? view(project.category === 'personal' ? 'Personal project' : 'Project', project.name, (nav) => (
            <ProjectDetails project={project} nav={nav} extra={<IslandActions projectId={project.id} />} />
          ))
        : missing;
    }
    case 'project-topic': {
      const project = getProject(ref.project);
      const topic = getProjectTopic(ref.project, ref.id);
      return project && topic
        ? view(project.name, topic.title, (nav) => (
            <ProjectTopicDetails project={project} topic={topic} nav={nav} />
          ))
        : missing;
    }
    case 'skills':
      return view('Skill Forest', 'Technical skills', (nav) => <SkillsOverview nav={nav} />);
    case 'skill': {
      const skill = getSkill(ref.id);
      return skill ? view('Skill', skill.name, (nav) => <SkillDetails skill={skill} nav={nav} />) : missing;
    }
    case 'awards':
      return view('Achievement Peak', 'Awards & recognition', (nav) => <AwardsOverview nav={nav} />);
    case 'award': {
      const award = getAward(ref.id);
      return award
        ? view('Recognition', award.title, (nav) => <AwardDetails award={award} nav={nav} />)
        : missing;
    }
    case 'education':
      return view('University Grove', 'Education', () => <EducationDetails />);
    case 'mentoring-overview':
      return view('Mentor Pavilion', 'Mentoring & leadership', (nav) => <MentoringOverview nav={nav} />);
    case 'mentoring': {
      const activity = getMentoring(ref.id);
      return activity
        ? view('Mentoring & leadership', activity.title, () => <MentoringDetails activity={activity} />)
        : missing;
    }
    case 'soft-skills':
      return view('Mentor Pavilion', 'Professional qualities', () => <SoftSkills />);
    case 'contact':
      return view('Contact', "Let's connect", () => <ContactList />);
    case 'contact-channel': {
      const channel = getContact(ref.id);
      return channel ? view('Contact', channel.label, () => <ContactChannelDetails id={ref.id} />) : missing;
    }
    case 'profiles':
      return view('Telescope', 'Online profiles', () => <Profiles />);
    case 'cv':
      return view('Notice board', 'Curriculum vitae', () => <CvDetails />);
    case 'seeds':
      return view('Bonus discoveries', 'Idea Seeds', (nav) => <SeedsCollection nav={nav} />);
    case 'seed': {
      const seed = getSeed(ref.id);
      return seed
        ? view('Idea Seed found!', seed.title, (nav) => (
            <>
              <p className="lead">{seed.fact}</p>
              {nav && (
                <button
                  type="button"
                  className="btn btn--small btn--ghost"
                  onClick={() => nav({ kind: 'seeds' })}
                >
                  View all Idea Seeds
                </button>
              )}
            </>
          ))
        : missing;
    }
    case 'zone': {
      const zone = zones.find((z) => z.id === ref.id);
      return zone ? view(zone.section, zone.name, () => <p className="lead">{zone.description}</p>) : missing;
    }
    case 'paint-challenges':
      return view('Splat Arena', 'Paintball challenges', () => <PaintChallenges />);
    case 'paint-game':
      return view('Splat Arena', GAME_INFO[ref.id].title, () => <PaintGameInfo id={ref.id} />);
    case 'paint-help':
      return view('Paint Armory', 'Paintball gun', () => <PaintHelp />);
    case 'controls':
      return view('Help', 'How to explore', () => <Controls />);
  }
}
