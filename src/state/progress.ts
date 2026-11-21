import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ZoneId } from '@/world/types';
import { safeStorage } from './storage';

/** Exploration progress. Optional and never gates content (plan §10). */
interface ProgressState {
  visited: ZoneId[];
  visit: (zone: ZoneId) => boolean;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      visited: [],
      visit: (zone) => {
        if (get().visited.includes(zone)) return false;
        set({ visited: [...get().visited, zone] });
        return true;
      },
      reset: () => set({ visited: [] }),
    }),
    { name: 'wonderland:progress', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);
