import { mouseLookSupported } from '@/game/mouseLook';
import { useProgress } from '@/state/progress';
import { type QualitySetting, useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';
import { Icon } from './Icon';

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="switch"
      onClick={() => onChange(!checked)}
    />
  );
}

export function SettingsSheet() {
  const s = useSettings();
  const resetProgress = useProgress((p) => p.reset);
  const close = () => useUi.getState().setOverlay(null);
  const qualities: QualitySetting[] = ['auto', 'low', 'high'];
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="sheet sheet--narrow" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="sheet__header">
          <Icon name="gear" />
          <h2 id="settings-title">Settings</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close settings (Escape)">
            <Icon name="close" />
          </button>
        </header>
        <div className="sheet__body">
          <div className="setting-row">
            <span>
              <strong>Sound</strong>
              <br />
              <small className="muted">Gentle ambience and interaction sounds</small>
            </span>
            <Switch checked={!s.muted} onChange={(on) => s.setMuted(!on)} label="Sound" />
          </div>
          <div className="setting-row">
            <span>
              <strong>Reduced motion</strong>
              <br />
              <small className="muted">Stops ambient animation, camera fly-ins and fades</small>
            </span>
            <Switch checked={s.reducedMotion} onChange={s.setReducedMotion} label="Reduced motion" />
          </div>
          {mouseLookSupported() && (
            <div className="setting-row">
              <span>
                <strong>Mouse look</strong>
                <br />
                <small className="muted">
                  Capture the mouse and look around by moving it. Esc releases it
                </small>
              </span>
              <Switch checked={s.mouseLook} onChange={s.setMouseLook} label="Mouse look" />
            </div>
          )}
          <div className="setting-row">
            <span>
              <strong>Graphics quality</strong>
              <br />
              <small className="muted">Low turns off shadows and some details</small>
            </span>
            <div className="segmented" role="group" aria-label="Graphics quality">
              {qualities.map((q) => (
                <button key={q} type="button" aria-pressed={s.quality === q} onClick={() => s.setQuality(q)}>
                  {q[0]!.toUpperCase() + q.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={() => (s.resetIntro(), window.location.reload())}
            >
              Replay intro
            </button>
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={() => (resetProgress(), useUi.getState().showToast('Exploration progress reset'))}
            >
              Reset discoveries
            </button>
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={() => useUi.getState().openPanel({ kind: 'controls' })}
            >
              <Icon name="help" /> Controls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
