/** Challenge badges (ADR-007). Pure rules: facts in, newly earned badge ids out. */

export type BadgeGroup = 'trick' | 'gallery' | 'arena' | 'explore';

export interface BadgeDef {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly group: BadgeGroup;
}

export const BADGES: readonly BadgeDef[] = [
  { id: 'first-splat', title: 'First Splat', description: 'Fire your first paintball.', group: 'trick' },
  {
    id: 'streak-3',
    title: 'Hat Trick',
    description: 'Hit 3 targets in a row without a miss.',
    group: 'trick',
  },
  {
    id: 'long-shot',
    title: 'Long Shot',
    description: 'Hit a target from more than 30 metres away.',
    group: 'trick',
  },
  {
    id: 'landmark-painter',
    title: 'Landmark Painter',
    description: 'Open 3 different landmarks by shooting them.',
    group: 'trick',
  },
  {
    id: 'gallery-bronze',
    title: 'Gallery Bronze',
    description: 'Score 15 in the Shooting Gallery.',
    group: 'gallery',
  },
  {
    id: 'gallery-gold',
    title: 'Gallery Gold',
    description: 'Score 30 in the Shooting Gallery.',
    group: 'gallery',
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    description: 'Finish a gallery round with 70% accuracy or better (at least 10 shots).',
    group: 'gallery',
  },
  {
    id: 'bullseye',
    title: 'Bullseye Trio',
    description: 'Hit 3 bullseyes in one gallery round.',
    group: 'gallery',
  },
  {
    id: 'arena-cleared',
    title: 'Arena Cleared',
    description: 'Clear every wave in the Bot Arena.',
    group: 'arena',
  },
  {
    id: 'untouchable',
    title: 'Untouchable',
    description: 'Clear the Bot Arena without being hit.',
    group: 'arena',
  },
  {
    id: 'hunter',
    title: 'Target Hunter',
    description: 'Find every hidden target on the islands.',
    group: 'explore',
  },
];

export interface BadgeFacts {
  /** Paintballs fired, all time. */
  shots: number;
  /** Current run of consecutive target hits (session). */
  streak: number;
  /** Longest distance of any target hit, in metres (session). */
  longestHit: number;
  landmarksShot: number;
  huntFound: number;
  huntTotal: number;
  /** Set when a gallery round has just ended. */
  gallery?: { score: number; shots: number; hits: number; bullseyes: number };
  /** Set when an arena run has just ended. */
  arena?: { outcome: 'won' | 'lost' | 'aborted' | 'finished'; hitsTaken: number };
}

/** Badge ids that the facts newly earn, given the badges already held. */
export function evaluateBadges(have: ReadonlySet<string>, f: BadgeFacts): string[] {
  const earned: string[] = [];
  const grant = (id: string, condition: boolean) => {
    if (condition && !have.has(id)) earned.push(id);
  };
  grant('first-splat', f.shots >= 1);
  grant('streak-3', f.streak >= 3);
  grant('long-shot', f.longestHit > 30);
  grant('landmark-painter', f.landmarksShot >= 3);
  grant('hunter', f.huntTotal > 0 && f.huntFound >= f.huntTotal);
  if (f.gallery) {
    grant('gallery-bronze', f.gallery.score >= 15);
    grant('gallery-gold', f.gallery.score >= 30);
    grant('sharpshooter', f.gallery.shots >= 10 && f.gallery.hits / f.gallery.shots >= 0.7);
    grant('bullseye', f.gallery.bullseyes >= 3);
  }
  if (f.arena?.outcome === 'won') {
    grant('arena-cleared', true);
    grant('untouchable', f.arena.hitsTaken === 0);
  }
  return earned;
}

export const getBadge = (id: string): BadgeDef | undefined => BADGES.find((b) => b.id === id);
