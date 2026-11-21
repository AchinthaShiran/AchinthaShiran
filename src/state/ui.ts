import { create } from 'zustand';
import type { PanelRef, ZoneId } from '@/world/types';

export type Overlay = 'map' | 'menu' | 'settings' | null;
export type Phase = 'intro' | 'play';

export type Destination = { kind: 'zone'; id: ZoneId; label: string } | { kind: 'landmark'; id: string; label: string };

export interface Toast {
  id: number;
  text: string;
}

interface UiState {
  phase: Phase;
  panels: PanelRef[];
  overlay: Overlay;
  nearbyId: string | null;
  /** Landmark that just got selected (for the hop animation). */
  selectedId: string | null;
  highlightGroup: string | null;
  currentZone: ZoneId;
  destination: Destination | null;
  toast: Toast | null;
  fading: boolean;

  setPhase: (phase: Phase) => void;
  openPanel: (panel: PanelRef, sourceId?: string | null) => void;
  pushPanel: (panel: PanelRef) => void;
  backPanel: () => void;
  closePanel: () => void;
  setOverlay: (overlay: Overlay) => void;
  toggleOverlay: (overlay: Exclude<Overlay, null>) => void;
  setNearby: (id: string | null) => void;
  setHighlightGroup: (group: string | null) => void;
  setCurrentZone: (zone: ZoneId) => void;
  setDestination: (d: Destination | null) => void;
  showToast: (text: string) => void;
  setFading: (fading: boolean) => void;
  /** Close whatever is on top (Escape semantics). Returns true if something closed. */
  closeTop: () => boolean;
}

let toastSeq = 0;

export const useUi = create<UiState>()((set, get) => ({
  phase: 'intro',
  panels: [],
  overlay: null,
  nearbyId: null,
  selectedId: null,
  highlightGroup: null,
  currentZone: 'home',
  destination: null,
  toast: null,
  fading: false,

  setPhase: (phase) => set({ phase }),
  openPanel: (panel, sourceId = null) => set({ panels: [panel], overlay: null, selectedId: sourceId }),
  pushPanel: (panel) => set({ panels: [...get().panels, panel] }),
  backPanel: () => set({ panels: get().panels.slice(0, -1) }),
  closePanel: () => set({ panels: [], selectedId: null }),
  setOverlay: (overlay) => set({ overlay }),
  toggleOverlay: (overlay) => set({ overlay: get().overlay === overlay ? null : overlay, panels: [] }),
  setNearby: (nearbyId) => {
    if (get().nearbyId !== nearbyId) set({ nearbyId });
  },
  setHighlightGroup: (highlightGroup) => {
    if (get().highlightGroup !== highlightGroup) set({ highlightGroup });
  },
  setCurrentZone: (currentZone) => {
    if (get().currentZone !== currentZone) set({ currentZone });
  },
  setDestination: (destination) => set({ destination }),
  showToast: (text) => set({ toast: { id: ++toastSeq, text } }),
  setFading: (fading) => set({ fading }),
  closeTop: () => {
    const s = get();
    if (s.overlay) {
      set({ overlay: null });
      return true;
    }
    if (s.panels.length) {
      set({ panels: [], selectedId: null });
      return true;
    }
    return false;
  },
}));

/** True while UI should own the keyboard (movement suspended). */
export const isUiBlocking = () => {
  const s = useUi.getState();
  return s.phase !== 'play' || s.panels.length > 0 || s.overlay !== null;
};
