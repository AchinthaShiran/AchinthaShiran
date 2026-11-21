import type { StateStorage } from 'zustand/middleware';

/**
 * localStorage wrapper that never throws (private mode, blocked storage, SSR/tests).
 * Falls back to an in-memory map so the app keeps working without persistence.
 */
const memory = new Map<string, string>();

function local(): Storage | null {
  try {
    const s = globalThis.localStorage;
    const probe = '__wonderland_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return local()?.getItem(name) ?? memory.get(name) ?? null;
    } catch {
      return memory.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    memory.set(name, value);
    try {
      local()?.setItem(name, value);
    } catch {
      /* quota or privacy mode: memory copy is enough */
    }
  },
  removeItem: (name) => {
    memory.delete(name);
    try {
      local()?.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};
