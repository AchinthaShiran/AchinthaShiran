/**
 * Device-agnostic movement input. Keyboard and the on-screen joystick both write here; the Player loop
 * reads a single normalized intent. One-shot actions (jump) are latched until consumed.
 */

const MOVE_KEYS: Record<string, readonly [number, number]> = {
  KeyW: [0, 1],
  ArrowUp: [0, 1],
  KeyS: [0, -1],
  ArrowDown: [0, -1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

const pressed = new Set<string>();
const joystick = { x: 0, y: 0 };
let jumpLatched = false;
let runToggle = false;

export interface MoveIntent {
  /** Strafe (-1 left … 1 right). */
  x: number;
  /** Forward (-1 back … 1 forward). */
  y: number;
  run: boolean;
}

const intent: MoveIntent = { x: 0, y: 0, run: false };

export function readIntent(): MoveIntent {
  let x = joystick.x;
  let y = joystick.y;
  for (const code of pressed) {
    const dir = MOVE_KEYS[code];
    if (dir) {
      x += dir[0];
      y += dir[1];
    }
  }
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  intent.x = x;
  intent.y = y;
  const joystickRun = Math.hypot(joystick.x, joystick.y) > 0.92;
  intent.run = pressed.has('ShiftLeft') || pressed.has('ShiftRight') || runToggle || joystickRun;
  return intent;
}

export function hasMoveInput(): boolean {
  const i = readIntent();
  return Math.abs(i.x) > 0.05 || Math.abs(i.y) > 0.05;
}

export function consumeJump(): boolean {
  const j = jumpLatched;
  jumpLatched = false;
  return j;
}

export function requestJump(): void {
  jumpLatched = true;
}

export function setJoystick(x: number, y: number): void {
  joystick.x = x;
  joystick.y = y;
}

export function setRunToggle(on: boolean): void {
  runToggle = on;
}

export function clearInput(): void {
  pressed.clear();
  joystick.x = 0;
  joystick.y = 0;
  jumpLatched = false;
}

const isTypingTarget = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));

/**
 * Attach keyboard listeners. `isBlocked` lets the UI suspend movement while a panel/menu is open.
 * Returns a cleanup function.
 */
export function attachKeyboard(isBlocked: () => boolean): () => void {
  const down = (e: KeyboardEvent) => {
    if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (isBlocked()) {
      pressed.clear();
      return;
    }
    if (e.code in MOVE_KEYS || e.code.startsWith('Shift')) {
      pressed.add(e.code);
      if (e.code.startsWith('Arrow')) e.preventDefault();
    }
    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) jumpLatched = true;
    }
  };
  const up = (e: KeyboardEvent) => pressed.delete(e.code);
  const blur = () => clearInput();
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  window.addEventListener('blur', blur);
  return () => {
    window.removeEventListener('keydown', down);
    window.removeEventListener('keyup', up);
    window.removeEventListener('blur', blur);
    clearInput();
  };
}
