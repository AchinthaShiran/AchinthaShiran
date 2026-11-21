import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GameId } from '@/game/paint/config';
import type { GameResult, GameSnapshot } from '@/game/paint/sim';
import { safeStorage } from './storage';

/** HUD view of the running game, plus a hint for the hunt. */
export interface GameHud extends GameSnapshot {
  hint: string | null;
}

export interface ResultCard {
  result: GameResult;
  best: boolean;
  bestScore: number;
  newBadges: string[];
}

interface PaintState {
  // Persisted (browser only; no online scores — plan §19)
  bests: Record<'gallery' | 'arena', number>;
  badges: string[];
  found: string[];
  landmarksShot: string[];
  shots: number;
  // Transient
  mode: boolean;
  hud: GameHud | null;
  result: ResultCard | null;
  /** Timestamp of the last time the player was hit (drives the screen splat). */
  hitAt: number;

  setMode: (on: boolean) => void;
  setHud: (hud: GameHud | null) => void;
  showResult: (card: ResultCard | null) => void;
  flashHit: () => void;
  addShot: () => void;
  award: (ids: string[]) => void;
  markFound: (id: string) => void;
  resetHunt: () => void;
  markLandmark: (id: string) => void;
  /** Records a score; returns whether it is a new personal best. */
  recordBest: (game: GameId, score: number) => { best: boolean; bestScore: number };
  resetAll: () => void;
}

export const useGameStats = create<PaintState>()(
  persist(
    (set, get) => ({
      bests: { gallery: 0, arena: 0 },
      badges: [],
      found: [],
      landmarksShot: [],
      shots: 0,
      mode: false,
      hud: null,
      result: null,
      hitAt: 0,

      setMode: (mode) => set({ mode }),
      setHud: (hud) => set({ hud }),
      showResult: (result) => set({ result }),
      flashHit: () => set({ hitAt: Date.now() }),
      addShot: () => set({ shots: get().shots + 1 }),
      award: (ids) => set({ badges: [...new Set([...get().badges, ...ids])] }),
      markFound: (id) => {
        if (!get().found.includes(id)) set({ found: [...get().found, id] });
      },
      resetHunt: () => set({ found: [] }),
      markLandmark: (id) => {
        if (!get().landmarksShot.includes(id)) set({ landmarksShot: [...get().landmarksShot, id] });
      },
      recordBest: (game, score) => {
        if (game === 'hunt') return { best: false, bestScore: 0 };
        const prev = get().bests[game];
        if (score > prev) {
          set({ bests: { ...get().bests, [game]: score } });
          return { best: prev > 0, bestScore: score };
        }
        return { best: false, bestScore: prev };
      },
      resetAll: () =>
        set({ bests: { gallery: 0, arena: 0 }, badges: [], found: [], landmarksShot: [], shots: 0 }),
    }),
    {
      name: 'wonderland:paint',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        bests: s.bests,
        badges: s.badges,
        found: s.found,
        landmarksShot: s.landmarksShot,
        shots: s.shots,
      }),
    },
  ),
);
