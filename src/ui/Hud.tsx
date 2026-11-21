import { useEffect, useRef, useState } from 'react';
import { profile } from '@/content';
import { isTouch } from '@/engine/device';
import { player } from '@/engine/playerState';
import { camera as camState } from '@/engine/playerState';
import { clearGuide, interactNearby, world } from '@/game/actions';
import { togglePaintMode } from '@/game/paint/controller';
import { useGameStats } from '@/state/paint';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';
import { ControlsStrip } from './ControlsHint';
import { Icon, Logo } from './Icon';
import { Minimap } from './Minimap';

function ZoneBanner() {
  const zoneId = useUi((s) => s.currentZone);
  const phase = useUi((s) => s.phase);
  const [shown, setShown] = useState<string | null>(null);
  const first = useRef(true);
  useEffect(() => {
    if (phase !== 'play') return;
    if (first.current) {
      first.current = false;
      return;
    }
    setShown(zoneId);
    const t = window.setTimeout(() => setShown(null), 3300);
    return () => window.clearTimeout(t);
  }, [zoneId, phase]);
  if (!shown) return null;
  const zone = world.zone(shown as Parameters<typeof world.zone>[0]);
  return (
    <div className="zone-banner" key={shown} role="status">
      <div className="zone-banner__name">{zone.def.name}</div>
      <div className="zone-banner__desc">{zone.def.section}</div>
    </div>
  );
}

/** Keyboard prompt (E). Touch devices have their own on-screen action button instead. */
function InteractPrompt() {
  const nearbyId = useUi((s) => s.nearbyId);
  const blocked = useUi((s) => s.panels.length > 0 || s.overlay !== null || s.phase !== 'play');
  const [touch] = useState(isTouch);
  if (!nearbyId || blocked || touch) return null;
  const lm = world.landmark(nearbyId);
  if (!lm) return null;
  return (
    <button type="button" className="prompt" onClick={interactNearby}>
      <kbd>E</kbd>
      <span className="prompt__text">
        <span>{lm.def.hint ?? 'Open'}</span>
        <span className="prompt__hint">{lm.def.name}</span>
      </span>
    </button>
  );
}

/** Points toward the active guide destination, relative to the camera view. */
function Compass() {
  const destination = useUi((s) => s.destination);
  const arrow = useRef<SVGSVGElement>(null);
  const dist = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!destination) return;
    const nodeId = world.targetNode(destination);
    const node = nodeId ? world.nav.getNode(nodeId) : undefined;
    if (!node) return;
    let raf = 0;
    const loop = () => {
      const dx = node.x - player.x;
      const dz = node.z - player.z;
      // Camera looks along -(sin yaw, cos yaw); angle of target relative to view direction.
      const targetAngle = Math.atan2(dx, dz);
      const viewAngle = Math.atan2(-Math.sin(camState.yaw), -Math.cos(camState.yaw));
      const rel = viewAngle - targetAngle;
      if (arrow.current) arrow.current.style.transform = `rotate(${(rel * 180) / Math.PI}deg)`;
      if (dist.current) dist.current.textContent = `${Math.round(Math.hypot(dx, dz))} m`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [destination]);
  if (!destination) return null;
  return (
    <div className="compass" role="status" aria-live="polite">
      <svg ref={arrow} className="compass__arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 19 20 12 16 5 20Z" fill="#2f2a40" />
      </svg>
      <span>
        {destination.label} · <span ref={dist} />
      </span>
      <button type="button" className="icon-btn" onClick={clearGuide} aria-label="Stop guiding">
        <Icon name="close" />
      </button>
    </div>
  );
}

function ToastView() {
  const toast = useUi((s) => s.toast);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);
  if (!toast || !visible) return null;
  return (
    <div className="toast" key={toast.id} role="status" aria-live="polite">
      {toast.text}
    </div>
  );
}

function Tips() {
  const phase = useUi((s) => s.phase);
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (phase !== 'play') return;
    const t = window.setTimeout(() => setShow(false), 18000);
    return () => window.clearTimeout(t);
  }, [phase]);
  if (phase !== 'play' || !show) return null;
  return (
    <div className="tips" role="note">
      <ControlsStrip compact />
      <button type="button" className="btn btn--small btn--ghost" onClick={() => setShow(false)}>
        Got it
      </button>
    </div>
  );
}

export function Hud() {
  const zoneId = useUi((s) => s.currentZone);
  const overlay = useUi((s) => s.overlay);
  const muted = useSettings((s) => s.muted);
  const setMuted = useSettings((s) => s.setMuted);
  const paintMode = useGameStats((s) => s.mode);
  const toggle = useUi((s) => s.toggleOverlay);
  const zone = world.zone(zoneId);
  return (
    <div className="hud">
      <div className="hud__top-left">
        <div className="brand">
          <Logo />
          <div>
            <span className="brand__name">{profile.name}</span>
            <span className="brand__owner">Interactive portfolio</span>
          </div>
        </div>
        <div className="zone-chip" aria-live="polite">
          {zone.def.name}
        </div>
      </div>
      <div className="hud__top-right">
        <button
          type="button"
          className="icon-btn"
          onClick={() => toggle('menu')}
          aria-pressed={overlay === 'menu'}
          aria-label="Explore menu: jump to any section"
        >
          <Icon name="menu" />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => toggle('map')}
          aria-pressed={overlay === 'map'}
          aria-label="World map (M)"
        >
          <Icon name="map" />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setMuted(!muted)}
          aria-pressed={!muted}
          aria-label={muted ? 'Turn sound on' : 'Mute sound'}
        >
          <Icon name={muted ? 'soundOff' : 'soundOn'} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={togglePaintMode}
          aria-pressed={paintMode}
          aria-label="Paintball gun (F)"
          title="Paintball gun (F)"
        >
          <Icon name="paint" />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => toggle('settings')}
          aria-pressed={overlay === 'settings'}
          aria-label="Settings"
        >
          <Icon name="gear" />
        </button>
        <a className="icon-btn" href="#/classic" aria-label="Classic portfolio view" title="Classic view">
          <Icon name="book" />
        </a>
      </div>
      <Compass />
      <ToastView />
      <ZoneBanner />
      <Minimap />
      <InteractPrompt />
      <Tips />
    </div>
  );
}
