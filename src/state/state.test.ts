import { beforeEach, describe, expect, it } from 'vitest';
import { useProgress } from './progress';
import { safeStorage } from './storage';
import { isUiBlocking, useUi } from './ui';

describe('ui store', () => {
  beforeEach(() => useUi.setState({ phase: 'play', panels: [], overlay: null }));

  it('opens, stacks and goes back through panels', () => {
    const ui = useUi.getState();
    ui.openPanel({ kind: 'projects' });
    useUi.getState().pushPanel({ kind: 'project', id: 'sage' });
    expect(useUi.getState().panels).toHaveLength(2);
    useUi.getState().backPanel();
    expect(useUi.getState().panels).toEqual([{ kind: 'projects' }]);
  });

  it('closes overlays before panels on Escape', () => {
    useUi.getState().openPanel({ kind: 'about' });
    useUi.setState({ overlay: 'map' });
    expect(useUi.getState().closeTop()).toBe(true);
    expect(useUi.getState().overlay).toBeNull();
    expect(useUi.getState().panels).toHaveLength(1);
    expect(useUi.getState().closeTop()).toBe(true);
    expect(useUi.getState().closeTop()).toBe(false);
  });

  it('blocks movement while UI is open or during the intro', () => {
    expect(isUiBlocking()).toBe(false);
    useUi.getState().openPanel({ kind: 'about' });
    expect(isUiBlocking()).toBe(true);
    useUi.setState({ panels: [], phase: 'intro' });
    expect(isUiBlocking()).toBe(true);
  });
});

describe('progress store', () => {
  it('records visits and seeds once', () => {
    const p = useProgress.getState();
    p.reset();
    expect(useProgress.getState().visit('home')).toBe(true);
    expect(useProgress.getState().visit('home')).toBe(false);
    expect(useProgress.getState().collectSeed('seed-alfred')).toBe(true);
    expect(useProgress.getState().collectSeed('seed-alfred')).toBe(false);
    expect(useProgress.getState().seeds).toEqual(['seed-alfred']);
  });
});

describe('safeStorage', () => {
  it('works without localStorage (memory fallback)', () => {
    safeStorage.setItem('k', 'v');
    expect(safeStorage.getItem('k')).toBe('v');
    safeStorage.removeItem('k');
    expect(safeStorage.getItem('k')).toBeNull();
  });
});
