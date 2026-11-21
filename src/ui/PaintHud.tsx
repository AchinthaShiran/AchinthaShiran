import { isTouch } from '@/engine/device';
import { getBadge } from '@/game/paint/badges';
import { GAME_INFO, METER_MAX } from '@/game/paint/config';
import { startGame, stopGame, togglePaintMode } from '@/game/paint/controller';
import { useGameStats, type GameHud } from '@/state/paint';
import { Icon } from './Icon';

function Meter({ value }: { value: number }) {
  return (
    <div className="meter" role="img" aria-label={`Splat meter: ${value} of ${METER_MAX}`}>
      {Array.from({ length: METER_MAX }, (_, i) => (
        <span key={i} className={`meter__drop ${i < value ? 'meter__drop--full' : ''}`} />
      ))}
    </div>
  );
}

function GameHudCard({ hud }: { hud: GameHud }) {
  const info = GAME_INFO[hud.id];
  return (
    <div className="game-hud" role="status" aria-live="off">
      <div className="game-hud__title">{info.title}</div>
      {hud.id === 'gallery' && (
        <div className="game-hud__stats">
          <span>
            Score <strong>{hud.score}</strong>
          </span>
          <span>
            Time <strong>{Math.ceil(hud.timeLeft ?? 0)}s</strong>
          </span>
          <span>
            Shots <strong>{hud.shots}</strong>
          </span>
        </div>
      )}
      {hud.id === 'arena' && (
        <>
          <div className="game-hud__stats">
            <span>
              Wave{' '}
              <strong>
                {Math.max(1, hud.wave)}/{hud.waves}
              </strong>
            </span>
            <span>
              Bots <strong>{hud.bots}</strong>
            </span>
            <span>
              Score <strong>{hud.score}</strong>
            </span>
          </div>
          <Meter value={hud.meter} />
        </>
      )}
      {hud.id === 'hunt' && (
        <div className="game-hud__stats">
          <span>
            Found{' '}
            <strong>
              {hud.found}/{hud.total}
            </strong>
          </span>
          {hud.hint && <span>{hud.hint}</span>}
        </div>
      )}
      <button type="button" className="btn btn--small btn--ghost" onClick={stopGame}>
        Stop
      </button>
    </div>
  );
}

function ResultCard() {
  const card = useGameStats((s) => s.result);
  if (!card) return null;
  const { result } = card;
  const info = GAME_INFO[result.game];
  const close = () => useGameStats.getState().showResult(null);
  const heading =
    result.outcome === 'won'
      ? 'You did it!'
      : result.outcome === 'lost'
        ? 'Painted out!'
        : result.game === 'gallery'
          ? "Time's up!"
          : 'Round over';
  const accuracy = result.shots > 0 ? Math.round((result.hits / result.shots) * 100) : 0;
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="sheet sheet--narrow" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <header className="sheet__header">
          <Icon name="target" />
          <h2 id="result-title">{heading}</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close results (Escape)">
            <Icon name="close" />
          </button>
        </header>
        <div className="sheet__body">
          <p className="lead">{info.title}</p>
          {result.game !== 'hunt' && (
            <p>
              Score <strong>{result.score}</strong>{' '}
              {card.best ? (
                <span className="badge badge--sun">New best!</span>
              ) : (
                <span className="muted">(best {card.bestScore})</span>
              )}
            </p>
          )}
          {result.game === 'hunt' && (
            <p>
              Targets found{' '}
              <strong>
                {result.found}/{result.total}
              </strong>
            </p>
          )}
          {result.game === 'gallery' && (
            <p className="muted">
              {result.hits} hits from {result.shots} shots ({accuracy}%) · {result.bullseyes} bullseyes
            </p>
          )}
          {result.game === 'arena' && (
            <p className="muted">
              Wave {result.wave} reached · {result.hitsTaken} paint hits taken
              {result.outcome === 'lost' ? ' · back at the arena gate' : ''}
            </p>
          )}
          {card.newBadges.length > 0 && (
            <div>
              <h3 className="section-title">Badges earned</h3>
              <ul className="chips">
                {card.newBadges.map((id) => (
                  <li key={id} className="chip">
                    <Icon name="star" /> {getBadge(id)?.title ?? id}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="actions" style={{ marginTop: 14 }}>
            <button type="button" className="btn btn--primary" onClick={() => startGame(result.game)}>
              Play again
            </button>
            <button type="button" className="btn btn--ghost" onClick={close}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Paintball overlays: mode badge, game HUD, hit splash and results (ADR-007). All optional play. */
export function PaintHud() {
  const mode = useGameStats((s) => s.mode);
  const hud = useGameStats((s) => s.hud);
  const hitAt = useGameStats((s) => s.hitAt);
  return (
    <>
      {mode && !hud && (
        <button type="button" className="paint-badge" onClick={togglePaintMode}>
          <Icon name="paint" />{' '}
          {isTouch() ? (
            'Paint gun ready · tap to shoot'
          ) : (
            <>
              Paint mode - click to shoot · <kbd>F</kbd> to put the gun away
            </>
          )}
        </button>
      )}
      {hud && <GameHudCard hud={hud} />}
      {hitAt > 0 && <div key={hitAt} className="hit-flash" aria-hidden="true" />}
      <ResultCard />
    </>
  );
}
