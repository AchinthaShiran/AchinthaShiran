import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { startAmbient, stopAmbient } from '@/audio/sfx';
import { attachKeyboard } from '@/engine/input';
import { interactNearby } from '@/game/actions';
import { togglePaintMode } from '@/game/paint/controller';
import { useGameStats } from '@/state/paint';
import { resolveQuality, useSettings } from '@/state/settings';
import { isUiBlocking, useUi } from '@/state/ui';
import { Hud } from './Hud';
import { Intro } from './Intro';
import { MouseHint, Crosshair } from './MouseHint';
import { PaintHud } from './PaintHud';
import { PanelHost } from './panels/PanelHost';
import { QuickNav } from './QuickNav';
import { SettingsSheet } from './SettingsSheet';
import { TouchControls } from './TouchControls';
import { WorldMap } from './WorldMap';

const Experience = lazy(() => import('@/scene/Experience'));

export function Loading() {
  return (
    <div className="loading" role="status">
      <div>
        <svg className="loading__island" viewBox="0 0 64 64" aria-hidden="true">
          <polygon points="32,6 54,18 54,30 32,42 10,30 10,18" fill="#80CFA9" />
          <polygon points="10,30 32,42 32,58 18,44" fill="#B9A1E8" />
          <polygon points="54,30 32,42 32,58 46,44" fill="#9C86D4" />
        </svg>
        Building the islands…
      </div>
    </div>
  );
}

function useHotkeys() {
  useEffect(() => {
    const detach = attachKeyboard(isUiBlocking);
    const onKey = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName))
      )
        return;
      const ui = useUi.getState();
      if (e.key === 'Escape') {
        if (useGameStats.getState().result) {
          useGameStats.getState().showResult(null);
          e.preventDefault();
        } else if (ui.closeTop()) e.preventDefault();
        return;
      }
      if (ui.phase !== 'play') return;
      if (e.code === 'KeyF' && !ui.overlay && ui.panels.length === 0) {
        e.preventDefault();
        togglePaintMode();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        ui.toggleOverlay('map');
      } else if (e.code === 'KeyE' && !ui.overlay && ui.panels.length === 0) {
        e.preventDefault();
        interactNearby();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      detach();
      window.removeEventListener('keydown', onKey);
    };
  }, []);
}

function useAmbientAudio() {
  const muted = useSettings((s) => s.muted);
  const phase = useUi((s) => s.phase);
  useEffect(() => {
    if (!muted && phase === 'play') startAmbient();
    else stopAmbient();
    return stopAmbient;
  }, [muted, phase]);
}

/** The interactive 3D experience: canvas + HUD + panels (lazy chunk). */
export default function WorldApp() {
  const qualitySetting = useSettings((s) => s.quality);
  const quality = useMemo(() => resolveQuality(qualitySetting), [qualitySetting]);
  const overlay = useUi((s) => s.overlay);
  const fading = useUi((s) => s.fading);
  const paintMode = useGameStats((s) => s.mode);
  const [touch] = useState(() => window.matchMedia?.('(pointer: coarse)').matches ?? false);

  useHotkeys();
  useAmbientAudio();

  useEffect(() => {
    const ui = useUi.getState();
    if (useSettings.getState().introSeen) {
      ui.setPhase('play');
      ui.showToast('Welcome back, explorer!');
    } else {
      ui.setPhase('intro');
    }
  }, []);

  const onContextLost = () => {
    window.location.hash = '#/classic?reason=webgl';
  };

  return (
    <div className={`world ${paintMode ? 'world--paint' : ''}`}>
      <a className="skip-link" href="#/classic">
        Skip to the classic portfolio
      </a>
      <Suspense fallback={<Loading />}>
        <Experience key={quality} quality={quality} onContextLost={onContextLost} />
      </Suspense>
      <Hud />
      <PanelHost />
      <PaintHud />
      <Crosshair />
      <MouseHint />
      {touch && <TouchControls />}
      {overlay === 'map' && <WorldMap />}
      {overlay === 'menu' && <QuickNav />}
      {overlay === 'settings' && <SettingsSheet />}
      <Intro onStart={() => useUi.getState().showToast('Tip: open the Explore menu to jump anywhere')} />
      <div className={`fade ${fading ? 'fade--on' : ''}`} aria-hidden="true" />
    </div>
  );
}
