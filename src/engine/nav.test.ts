import { describe, expect, it } from 'vitest';
import { NavGraph } from './nav';

function graph() {
  const g = new NavGraph();
  const node = (id: string, x: number, z: number) => g.addNode({ id, x, y: 0, z, zoneId: 'z' });
  node('a', 0, 0);
  node('b', 10, 0);
  node('c', 10, 10);
  node('d', 0, 10);
  node('island', 50, 50);
  g.addEdge('a', 'b');
  g.addEdge('b', 'c');
  g.addEdge('a', 'd');
  g.addEdge('d', 'c');
  g.addEdge('a', 'c');
  return g;
}

describe('NavGraph', () => {
  it('finds the shortest path', () => {
    expect(graph().findPath('a', 'c')?.map((n) => n.id)).toEqual(['a', 'c']);
  });

  it('returns a single-node path when start equals goal', () => {
    expect(graph().findPath('b', 'b')?.map((n) => n.id)).toEqual(['b']);
  });

  it('returns null for unreachable or unknown nodes', () => {
    expect(graph().findPath('a', 'island')).toBeNull();
    expect(graph().findPath('a', 'nope')).toBeNull();
  });

  it('finds the nearest node with a filter', () => {
    const g = graph();
    expect(g.nearest({ x: 9, y: 0, z: 1 })?.id).toBe('b');
    expect(g.nearest({ x: 9, y: 0, z: 3 }, (n) => n.id !== 'b')?.id).toBe('c');
  });

  it('rejects duplicate nodes and dangling edges', () => {
    const g = graph();
    expect(() => g.addNode({ id: 'a', x: 0, y: 0, z: 0, zoneId: 'z' })).toThrow();
    expect(() => g.addEdge('a', 'missing')).toThrow();
  });
});
