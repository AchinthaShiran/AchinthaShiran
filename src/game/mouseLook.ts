/**
 * Desktop mouse look (pointer lock, GTA-style). Clicking the world captures the mouse; moving it turns the
 * camera; Esc releases it. The cursor is released automatically whenever UI that needs it opens, and if the
 * browser refuses the lock we fall back to drag-to-look and click-to-walk. Touch devices never use it.
 */
import { camera } from '@/engine/playerState';
import { interactNearby } from '@/game/actions';
import { useGameStats } from '@/state/paint';
import { useSettings } from '@/state/settings';
import { isUiBlocking, useUi } from '@/state/ui';

let canvas: HTMLElement | null = null;
let failed = false;

export function mouseLookSupported(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  return !!window.matchMedia?.('(pointer: fine)').matches && 'requestPointerLock' in Element.prototype;
}

export const mouseLookEnabled = (): boolean =>
  mouseLookSupported() && useSettings.getState().mouseLook && !failed;

/** Asks the browser to capture the mouse. Must run inside a user gesture (a click). */
export function requestMouseLook(): void {
  if (!canvas || !mouseLookEnabled() || camera.locked || isUiBlocking()) return;
  camera.lockIntentAt = performance.now();
  try {
    const pending = canvas.requestPointerLock() as Promise<void> | undefined;
    pending?.catch(() => {
      failed = true;
    });
  } catch {
    failed = true;
  }
}

export function releaseMouseLook(): void {
  if (document.pointerLockElement) document.exitPointerLock();
}

/** Wires pointer lock to the canvas; returns a cleanup function. */
export function attachMouseLook(el: HTMLElement): () => void {
  canvas = el;
  const sync = () => {
    const locked = document.pointerLockElement === el;
    camera.locked = locked;
    useUi.getState().setLocked(locked);
  };
  const onError = () => {
    failed = true;
    sync();
  };
  const onDown = (e: PointerEvent) => {
    if (e.button === 0 && !camera.locked) requestMouseLook();
  };
  const onUp = (e: PointerEvent) => {
    // While captured there is no cursor to aim with: a click interacts with the highlighted object (shooting is
    // handled by the paint view).
    if (camera.locked && e.button === 0 && !useGameStats.getState().mode) interactNearby();
  };
  const onContextMenu = (e: Event) => {
    if (camera.locked) e.preventDefault();
  };
  const unsubUi = useUi.subscribe((s) => {
    if (camera.locked && (s.panels.length > 0 || s.overlay !== null)) releaseMouseLook();
  });
  const unsubPaint = useGameStats.subscribe((s) => {
    if (camera.locked && s.result) releaseMouseLook();
  });
  const unsubSettings = useSettings.subscribe((s) => {
    if (camera.locked && !s.mouseLook) releaseMouseLook();
  });

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('pointerlockchange', sync);
  document.addEventListener('pointerlockerror', onError);
  return () => {
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('pointerlockchange', sync);
    document.removeEventListener('pointerlockerror', onError);
    unsubUi();
    unsubPaint();
    unsubSettings();
    releaseMouseLook();
    camera.locked = false;
    useUi.getState().setLocked(false);
    canvas = null;
  };
}
