import { assetUrl, cv, ideaSeeds } from '@/content';
import { guideTo, travelToLandmark, world } from '@/game/actions';
import { useProgress } from '@/state/progress';
import { useUi } from '@/state/ui';
import { sections } from '@/world/sections';
import { Icon } from './Icon';

/** Conventional section navigation (plan §11): read instantly, get guided, or travel. */
export function QuickNav() {
  const seeds = useProgress((s) => s.seeds.length);
  const close = () => useUi.getState().setOverlay(null);
  const open = useUi((s) => s.openPanel);
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="menu-title">
        <header className="sheet__header">
          <Icon name="sparkle" />
          <h2 id="menu-title">Explore</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close menu (Escape)">
            <Icon name="close" />
          </button>
        </header>
        <div className="sheet__body">
          <div className="menu-grid">
            {sections.map((s) => {
              const zone = world.zone(s.zoneId);
              return (
                <article key={s.id} className="card menu-item">
                  <h3>{s.label}</h3>
                  <p className="muted">
                    {s.description} <br />
                    <small>
                      {zone.def.glyph} {zone.def.name}
                    </small>
                  </p>
                  <div className="actions">
                    {s.id === 'cv' && cv.path ? (
                      <a
                        className="btn btn--small btn--primary"
                        href={assetUrl(cv.path)}
                        download={cv.fileName}
                      >
                        <Icon name="download" /> Download
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--small btn--primary"
                        onClick={() => open(s.panel)}
                      >
                        <Icon name="book" /> Open
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => guideTo({ kind: 'landmark', id: s.landmarkId, label: s.label })}
                      aria-label={`Guide me to ${s.label}`}
                    >
                      <Icon name="guide" /> Guide
                    </button>
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => travelToLandmark(s.landmarkId, true)}
                      aria-label={`Travel to ${s.label}`}
                    >
                      <Icon name="travel" /> Go
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={() => open({ kind: 'seeds' })}
            >
              <Icon name="seed" /> Idea Seeds {seeds}/{ideaSeeds.length}
            </button>
            <button
              type="button"
              className="btn btn--small btn--ghost"
              onClick={() => open({ kind: 'controls' })}
            >
              <Icon name="help" /> Controls
            </button>
            <a className="btn btn--small btn--ghost" href="#/classic">
              <Icon name="book" /> Classic view
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
