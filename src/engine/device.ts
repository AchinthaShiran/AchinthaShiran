/** True on touch-first devices (no hover/keyboard), where on-screen buttons replace key hints. */
export const isTouch = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
