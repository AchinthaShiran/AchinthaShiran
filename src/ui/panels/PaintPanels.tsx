import { guideTo, travelToLandmark } from '@/game/actions';
import { BADGES, type BadgeDef } from '@/game/paint/badges';
import { GAME_INFO, type GameId } from '@/game/paint/config';
import { sim, startGame, setPaintMode } from '@/game/paint/controller';
import { useGameStats } from '@/state/paint';
import { useUi } from '@/state/ui';
import { Section } from '../content/blocks';
import { Icon } from '../Icon';

const ARENA_LANDMARK = 'arena-board';

/** Start button, or a way to reach the arena first for games that need it. */
function StartGame({ id }: { id: GameId }) {
  const zone = useUi((s) => s.currentZone);
  const info = GAME_INFO[id];
  if (info.needsArena && zone !== 'arena') {
    return (
      <div>
        <p className="note">This game is played on the Splat Arena island.</p>
        <div className="actions">
          <button
            type="button"
            className="btn btn--small"
            onClick={() => guideTo({ kind: 'landmark', id: ARENA_LANDMARK, label: 'Splat Arena' })}
          >
            <Icon name="guide" /> Guide me
          </button>
          <button
            type="button"
            className="btn btn--small btn--primary"
            onClick={() => travelToLandmark(ARENA_LANDMARK)}
          >
            <Icon name="travel" /> Travel
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="actions">
      <button type="button" className="btn btn--primary" onClick={() => startGame(id)}>
        <Icon name="target" /> Start
      </button>
    </div>
  );
}

function Best({ id }: { id: 'gallery' | 'arena' }) {
  const best = useGameStats((s) => s.bests[id]);
  return <span className="badge badge--sun">{best > 0 ? `Best ${best}` : 'No score yet'}</span>;
}

export function PaintGameInfo({ id }: { id: GameId }) {
  const info = GAME_INFO[id];
  const found = useGameStats((s) => s.found.length);
  return (
    <>
      <p className="lead">{info.blurb}</p>
      <ul className="list">
        {info.rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p>
        {id === 'hunt' ? (
          <span className="badge badge--sun">
            Found {found}/{sim.huntTotal}
          </span>
        ) : (
          <Best id={id} />
        )}
      </p>
      <StartGame id={id} />
      <p className="note">Optional play. Nothing in the portfolio needs the paintball gun.</p>
    </>
  );
}

export function PaintHelp() {
  const mode = useGameStats((s) => s.mode);
  return (
    <>
      <p className="lead">
        Grab the paintball marker and splat the world. It is entirely optional - exploring and reading never
        need it.
      </p>
      <div className="actions">
        <button
          type="button"
          className={mode ? 'btn' : 'btn btn--primary'}
          onClick={() => setPaintMode(!mode)}
        >
          <Icon name="paint" /> {mode ? 'Put the gun away' : 'Equip the paintball gun'}
        </button>
      </div>
      <div className="card">
        <h3>Controls</h3>
        <ul className="list">
          <li>
            <kbd>F</kbd> or the paint button - equip or put away the gun
          </li>
          <li>Click or tap to shoot where you point; the ball arcs with gravity</li>
          <li>Shoot an exhibit or sign to open it (not during a game)</li>
          <li>
            <kbd>E</kbd> still interacts, and you can still walk and look around
          </li>
          <li>Open the world map to travel to the Splat Arena any time</li>
        </ul>
      </div>
      <div className="card">
        <h3>Things to play</h3>
        <ul className="list">
          {(Object.keys(GAME_INFO) as GameId[]).map((id) => (
            <li key={id}>
              <strong>{GAME_INFO[id].title}</strong> - {GAME_INFO[id].blurb}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function BadgeCard({ badge, earned }: { badge: BadgeDef; earned: boolean }) {
  return (
    <div className={`card seed-card ${earned ? '' : 'seed-card--locked'}`}>
      <h3>
        {earned ? <Icon name="star" /> : null} {badge.title}
      </h3>
      <p className={earned ? '' : 'muted'} style={{ margin: 0 }}>
        {badge.description}
      </p>
    </div>
  );
}

export function PaintChallenges() {
  const badges = useGameStats((s) => s.badges);
  const found = useGameStats((s) => s.found.length);
  const reset = useGameStats((s) => s.resetAll);
  return (
    <>
      <p className="lead">
        Optional mini games and challenges. Best scores and badges are saved in this browser only - there are
        no online leaderboards.
      </p>
      <Section title="Mini games">
        {(Object.keys(GAME_INFO) as GameId[]).map((id) => (
          <button
            key={id}
            type="button"
            className="card card--link"
            onClick={() => useUi.getState().pushPanel({ kind: 'paint-game', id })}
          >
            <h3>{GAME_INFO[id].title}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {GAME_INFO[id].blurb}
            </p>
          </button>
        ))}
      </Section>
      <Section title={`Badges · ${badges.length}/${BADGES.length}`}>
        <div className="grid-2">
          {BADGES.map((b) => (
            <BadgeCard key={b.id} badge={b} earned={badges.includes(b.id)} />
          ))}
        </div>
      </Section>
      <p className="muted">
        Target hunt: {found}/{sim.huntTotal} found
      </p>
      <div className="actions">
        <button
          type="button"
          className="btn btn--small btn--ghost"
          onClick={() => useUi.getState().pushPanel({ kind: 'paint-help' })}
        >
          <Icon name="help" /> How it works
        </button>
        <button type="button" className="btn btn--small btn--ghost" onClick={reset}>
          Reset scores and badges
        </button>
      </div>
    </>
  );
}
