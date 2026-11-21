import { mouseLookSupported } from '@/game/mouseLook';
import { useGameStats } from '@/state/paint';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';

/** Tells desktop visitors how to start mouse look whenever the mouse is free (never on touch devices). */
export function MouseHint() {
  const locked = useUi((s) => s.locked);
  const phase = useUi((s) => s.phase);
  const blocked = useUi((s) => s.panels.length > 0 || s.overlay !== null);
  const enabled = useSettings((s) => s.mouseLook);
  const result = useGameStats((s) => s.result);
  if (!mouseLookSupported() || !enabled || locked || phase !== 'play' || blocked || result) return null;
  return (
    <div className="mouse-hint" role="note">
      Click the world to look around with the mouse · <kbd>Esc</kbd> releases
    </div>
  );
}

/** Centre crosshair whenever the paintball gun is out: shots go where it points. */
export function Crosshair() {
  const mode = useGameStats((s) => s.mode);
  if (!mode) return null;
  return <div className="crosshair" aria-hidden="true" />;
}
