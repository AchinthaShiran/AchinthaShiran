/** Tunable numbers and copy for the paintball games (ADR-007). Pure data. */

export type GameId = 'gallery' | 'arena' | 'hunt';

export const MAX_BALLS = 48;
export const MAX_SPLATS = 220;

export const GALLERY_SECONDS = 45;
export const GALLERY_MAX_TARGETS = 4;

/** Bots per wave in the Bot Arena. */
export const ARENA_WAVES: readonly number[] = [3, 4, 6];
export const BOT_HP = 2;
/** Paint hits that put the player "painted out". */
export const METER_MAX = 5;
/** Seconds without a hit before the splat meter drains by one. */
export const METER_DRAIN_SECONDS = 9;

export const SPLAT_COLORS = ['#F5A6A6', '#75BDEB', '#FFD27D', '#80CFA9', '#B9A1E8', '#FF8FC7', '#8A5CF6'];
/** Index of the bots' paint colour in `SPLAT_COLORS`. */
export const BOT_COLOR = 6;

export interface GameInfo {
  title: string;
  /** Needs the player to be on the Splat Arena island. */
  needsArena: boolean;
  blurb: string;
  rules: readonly string[];
}

export const GAME_INFO: Record<GameId, GameInfo> = {
  gallery: {
    title: 'Shooting Gallery',
    needsArena: true,
    blurb: `Pop-up and sliding targets for ${GALLERY_SECONDS} seconds. Hit the middle for more points.`,
    rules: [
      'Outer ring 1 point, middle ring 2 points, bullseye 3 points',
      'Targets disappear after a few seconds, so be quick',
      'Your best score is saved in this browser',
    ],
  },
  arena: {
    title: 'Bot Arena',
    needsArena: true,
    blurb: `Survive ${ARENA_WAVES.length} waves of paint-bots. They only exist while this game runs.`,
    rules: [
      'Each bot needs two hits; their slow paint balls can be dodged',
      `${METER_MAX} paint hits fill your splat meter and send you back to the arena gate`,
      'Clear every wave without being hit for a bonus',
    ],
  },
  hunt: {
    title: 'Island Target Hunt',
    needsArena: false,
    blurb: 'A hidden target floats on every island. Find them all and paint each one.',
    rules: [
      'Targets only show while the hunt is running',
      'The hint tells you which island holds the nearest one',
      'Found targets are remembered, so you can hunt over several visits',
    ],
  },
};
