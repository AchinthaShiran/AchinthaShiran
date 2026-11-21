import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from './storage';

export type QualitySetting = 'auto' | 'low' | 'high';
export type Quality = 'low' | 'high';

interface SettingsState {
  muted: boolean;
  reducedMotion: boolean;
  quality: QualitySetting;
  introSeen: boolean;
  /** Capture the mouse for GTA-style look on desktop (click the world to start, Esc to release). */
  mouseLook: boolean;
  setMuted: (muted: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  setQuality: (q: QualitySetting) => void;
  setMouseLook: (on: boolean) => void;
  markIntroSeen: () => void;
  resetIntro: () => void;
}

const prefersReducedMotion = () => {
  try {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      muted: true,
      reducedMotion: prefersReducedMotion(),
      quality: 'auto',
      introSeen: false,
      mouseLook: true,
      setMuted: (muted) => set({ muted }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setQuality: (quality) => set({ quality }),
      setMouseLook: (mouseLook) => set({ mouseLook }),
      markIntroSeen: () => set({ introSeen: true }),
      resetIntro: () => set({ introSeen: false }),
    }),
    { name: 'wonderland:settings', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);

/** Resolve "auto" to a concrete tier from device hints. */
export function resolveQuality(setting: QualitySetting): Quality {
  if (setting !== 'auto') return setting;
  try {
    const coarse = globalThis.matchMedia?.('(pointer: coarse)').matches ?? false;
    const cores = globalThis.navigator?.hardwareConcurrency ?? 8;
    const memory = (globalThis.navigator as Navigator & { deviceMemory?: number })?.deviceMemory ?? 8;
    return coarse || cores <= 4 || memory <= 4 ? 'low' : 'high';
  } catch {
    return 'high';
  }
}
