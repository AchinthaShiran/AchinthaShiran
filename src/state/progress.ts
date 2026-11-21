import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ZoneId } from '@/world/types';
import { safeStorage } from './storage';

/** Exploration progress. Optional and never gates content (plan §10). */
interface ProgressState {
  visited: ZoneId[];
  seeds: string[];
  visit: (zone: ZoneId) => boolean;
  collectSeed: (id: string) => boolean;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      visited: [],
      seeds: [],
      visit: (zone) => {
        if (get().visited.includes(zone)) return false;
        set({ visited: [...get().visited, zone] });
        return true;
      },
      collectSeed: (id) => {
        if (get().seeds.includes(id)) return false;
        set({ seeds: [...get().seeds, id] });
        return true;
      },
      reset: () => set({ visited: [], seeds: [] }),
    }),
    { name: 'wonderland:progress', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);
