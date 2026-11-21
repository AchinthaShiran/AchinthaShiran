import { useEffect, useRef } from 'react';
import { profile } from '@/content';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';

/** Short, skippable opening (plan §13). Returning visitors skip it automatically. */
export function Intro({ onStart }: { onStart: () => void }) {
  const phase = useUi((s) => s.phase);
  const explore = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    explore.current?.focus();
  }, []);
  if (phase !== 'intro') return null;
  const start = () => {
    useSettings.getState().markIntroSeen();
    useUi.getState().setPhase('play');
    onStart();
  };
  const { intro } = profile;
  return (
    <div className="intro" role="dialog" aria-modal="true" aria-labelledby="intro-name">
      <div className="intro__card">
        <p className="intro__greeting">{intro.greeting}</p>
        <p className="muted">{intro.lead}</p>
        <h1 id="intro-name" className="intro__name">
          {intro.nameLine}
        </h1>
        <p className="intro__headline">{intro.headline}</p>
        <p>{intro.cta}</p>
        <div className="intro__actions">
          <button ref={explore} type="button" className="btn btn--primary" onClick={start}>
            Explore My World
          </button>
          <button type="button" className="btn btn--ghost" onClick={start}>
            Skip Intro
          </button>
        </div>
        <a className="intro__classic" href="#/classic">
          Prefer a classic page? View the portfolio without the game →
        </a>
      </div>
    </div>
  );
}
