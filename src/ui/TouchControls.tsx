import { useRef } from 'react';
import { requestJump, setJoystick } from '@/engine/input';
import { interactNearby, world } from '@/game/actions';
import { fireCenter, togglePaintMode } from '@/game/paint/controller';
import { useGameStats } from '@/state/paint';
import { useUi } from '@/state/ui';
import { Icon } from './Icon';

const RADIUS = 52;

/** Virtual joystick + jump/interact buttons for touch devices (plan §16). */
export function TouchControls() {
  const knob = useRef<HTMLDivElement>(null);
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  const nearbyId = useUi((s) => s.nearbyId);
  const paintMode = useGameStats((s) => s.mode);
  const blocked = useUi((s) => s.panels.length > 0 || s.overlay !== null || s.phase !== 'play');
  if (blocked) return null;

  const move = (clientX: number, clientY: number) => {
    const o = origin.current;
    if (!o) return;
    let dx = clientX - o.x;
    let dy = clientY - o.y;
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
    setJoystick(dx / RADIUS, -dy / RADIUS);
  };
  const end = () => {
    origin.current = null;
    if (knob.current) knob.current.style.transform = '';
    setJoystick(0, 0);
  };
  const lm = nearbyId ? world.landmark(nearbyId) : undefined;

  return (
    <>
      <div
        className="joystick"
        aria-hidden="true"
        onPointerDown={(e) => {
          e.stopPropagation();
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          const rect = e.currentTarget.getBoundingClientRect();
          origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, id: e.pointerId };
          move(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => origin.current?.id === e.pointerId && move(e.clientX, e.clientY)}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div ref={knob} className="joystick__knob" />
      </div>
      <div className="touch-actions">
        {lm && (
          <button type="button" className="touch-btn touch-btn--interact" onClick={interactNearby}>
            {lm.def.hint ?? 'Open'}
          </button>
        )}
        {paintMode && (
          <button
            type="button"
            className="touch-btn touch-btn--fire"
            onPointerDown={(e) => {
              e.stopPropagation();
              fireCenter();
            }}
            aria-label="Fire paintball"
          >
            <Icon name="fire" />
            <span>Fire</span>
          </button>
        )}
        <button
          type="button"
          className={`touch-btn touch-btn--gun ${paintMode ? 'is-on' : ''}`}
          onClick={togglePaintMode}
          aria-pressed={paintMode}
          aria-label={paintMode ? 'Put the paintball gun away' : 'Take out the paintball gun'}
        >
          <Icon name="paint" />
          <span>{paintMode ? 'Stow' : 'Paint gun'}</span>
        </button>
        <button type="button" className="touch-btn" onPointerDown={() => requestJump()} aria-label="Jump">
          Jump
        </button>
      </div>
    </>
  );
}
