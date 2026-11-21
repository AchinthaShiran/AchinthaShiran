import { describe, expect, it } from 'vitest';
import { parseHash } from './route';

describe('parseHash', () => {
  it('routes to the world by default', () => {
    expect(parseHash('')).toEqual({ view: 'world' });
    expect(parseHash('#/')).toEqual({ view: 'world' });
    expect(parseHash('#/unknown')).toEqual({ view: 'world' });
  });

  it('routes to classic mode with an optional section', () => {
    expect(parseHash('#/classic')).toEqual({ view: 'classic', section: null });
    expect(parseHash('#/classic/projects')).toEqual({ view: 'classic', section: 'projects' });
    expect(parseHash('#/classic?reason=webgl')).toEqual({ view: 'classic', section: null });
  });
});
