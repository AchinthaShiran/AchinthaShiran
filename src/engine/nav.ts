/** Waypoint navigation graph with A* search. Drives click-to-move, auto-walk and the guide trail. */
import type { Vec3 } from './math';

export interface NavNode extends Vec3 {
  readonly id: string;
  readonly zoneId: string;
}

interface Edge {
  readonly to: string;
  readonly cost: number;
}

const distance = (a: Vec3, b: Vec3) => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);

export class NavGraph {
  private readonly nodes = new Map<string, NavNode>();
  private readonly adjacency = new Map<string, Edge[]>();

  addNode(node: NavNode): void {
    if (this.nodes.has(node.id)) throw new Error(`Duplicate nav node "${node.id}"`);
    this.nodes.set(node.id, node);
    this.adjacency.set(node.id, []);
  }

  addEdge(a: string, b: string): void {
    const na = this.nodes.get(a);
    const nb = this.nodes.get(b);
    if (!na || !nb) throw new Error(`Nav edge references unknown node: ${a} → ${b}`);
    const cost = distance(na, nb);
    this.adjacency.get(a)?.push({ to: b, cost });
    this.adjacency.get(b)?.push({ to: a, cost });
  }

  getNode(id: string): NavNode | undefined {
    return this.nodes.get(id);
  }

  allNodes(): NavNode[] {
    return [...this.nodes.values()];
  }

  neighbours(id: string): readonly Edge[] {
    return this.adjacency.get(id) ?? [];
  }

  /** Closest node to a point, optionally filtered (e.g. same zone, line-of-sight). */
  nearest(p: Vec3, filter?: (n: NavNode) => boolean): NavNode | undefined {
    let best: NavNode | undefined;
    let bestD = Infinity;
    for (const n of this.nodes.values()) {
      if (filter && !filter(n)) continue;
      const d = distance(p, n);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    return best;
  }

  /** A* shortest path between two node ids (inclusive). Returns null if unreachable. */
  findPath(startId: string, goalId: string): NavNode[] | null {
    const start = this.nodes.get(startId);
    const goal = this.nodes.get(goalId);
    if (!start || !goal) return null;

    const open = new Set<string>([startId]);
    const cameFrom = new Map<string, string>();
    const g = new Map<string, number>([[startId, 0]]);
    const f = new Map<string, number>([[startId, distance(start, goal)]]);

    while (open.size > 0) {
      let current = '';
      let bestF = Infinity;
      for (const id of open) {
        const score = f.get(id) ?? Infinity;
        if (score < bestF) {
          bestF = score;
          current = id;
        }
      }
      if (current === goalId) return this.reconstruct(cameFrom, current);
      open.delete(current);

      for (const edge of this.neighbours(current)) {
        const tentative = (g.get(current) ?? Infinity) + edge.cost;
        if (tentative < (g.get(edge.to) ?? Infinity)) {
          const node = this.nodes.get(edge.to);
          if (!node) continue;
          cameFrom.set(edge.to, current);
          g.set(edge.to, tentative);
          f.set(edge.to, tentative + distance(node, goal));
          open.add(edge.to);
        }
      }
    }
    return null;
  }

  private reconstruct(cameFrom: Map<string, string>, end: string): NavNode[] {
    const path: NavNode[] = [];
    let cur: string | undefined = end;
    while (cur !== undefined) {
      const node = this.nodes.get(cur);
      if (node) path.unshift(node);
      cur = cameFrom.get(cur);
    }
    return path;
  }
}
