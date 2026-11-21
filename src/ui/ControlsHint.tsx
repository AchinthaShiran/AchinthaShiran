import { mouseLookSupported } from '@/game/mouseLook';
import { useSettings } from '@/state/settings';

const isTouch = () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

interface Control {
  keys: string[];
  label: string;
}

/** Controls to show, adapted to the device and the mouse-look setting (shown on the intro and at first play). */
export function useControlList(): { controls: Control[]; note: string | null } {
  const mouseLook = useSettings((s) => s.mouseLook);
  if (isTouch()) {
    return {
      controls: [
        { keys: ['Joystick'], label: 'move (push far to run)' },
        { keys: ['Drag'], label: 'look around' },
        { keys: ['Tap ground'], label: 'walk there' },
        { keys: ['Paint button'], label: 'paintball gun, then tap to shoot' },
      ],
      note: null,
    };
  }
  const captured = mouseLookSupported() && mouseLook;
  return {
    controls: [
      { keys: ['W', 'A', 'S', 'D'], label: 'move' },
      { keys: ['Shift'], label: 'run' },
      { keys: ['Space'], label: 'jump' },
      captured
        ? { keys: ['Mouse'], label: 'look around (like a third-person game)' }
        : { keys: ['Drag'], label: 'look · click ground to walk' },
      { keys: ['E'], label: 'interact' },
      { keys: ['M'], label: 'map' },
      { keys: ['F'], label: 'paintball gun (optional) — click to shoot' },
    ],
    note: captured ? 'Click the world to capture the mouse. Esc releases it.' : null,
  };
}

/** Compact controls list with key caps; used on the intro and in the opening tips. */
export function ControlsStrip({ compact = false }: { compact?: boolean }) {
  const { controls, note } = useControlList();
  return (
    <div className={compact ? 'controls controls--compact' : 'controls'}>
      <ul className="controls__list">
        {controls.map((c) => (
          <li key={c.label}>
            {c.keys.map((k) => (
              <kbd key={k}>{k}</kbd>
            ))}{' '}
            {c.label}
          </li>
        ))}
      </ul>
      {note && <p className="controls__note">{note}</p>}
    </div>
  );
}
