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

/** Centre crosshair while aiming the paintball gun with the mouse captured. */
export function Crosshair() {
  const locked = useUi((s) => s.locked);
  const mode = useGameStats((s) => s.mode);
  if (!locked || !mode) return null;
  return <div className="crosshair" aria-hidden="true" />;
}
