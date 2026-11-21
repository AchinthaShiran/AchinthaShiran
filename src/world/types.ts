import type { ModelKey } from '@/assets/manifest';
import type { ModelProps } from '@/assets/types';
import type { ContactKind, ProjectCategory } from '@/content';

export type ZoneId =
  | 'home'
  | 'career'
  | 'lab'
  | 'park'
  | 'forest'
  | 'peak'
  | 'horizon'
  | 'education'
  | 'mentorship'
  // Personal project islands ("Makers' Row", ADR-005)
  | 'tala'
  | 'skillup'
  | 'myspend'
  | 'unity';

/** What a landmark opens. Rendered by the panel registry in `ui/panels`. */
export type PanelRef =
  | { kind: 'welcome' }
  | { kind: 'about' }
  | { kind: 'interests' }
  | { kind: 'current-role' }
  | { kind: 'growth' }
  | { kind: 'organization'; id: string }
  | { kind: 'role'; id: string }
  | { kind: 'career-timeline' }
  | { kind: 'sage'; id: string }
  | { kind: 'projects'; category?: ProjectCategory }
  | { kind: 'project'; id: string }
  | { kind: 'project-topic'; project: string; id: string }
  | { kind: 'skills' }
  | { kind: 'skill'; id: string }
  | { kind: 'awards' }
  | { kind: 'award'; id: string }
  | { kind: 'education' }
  | { kind: 'mentoring-overview' }
  | { kind: 'mentoring'; id: string }
  | { kind: 'soft-skills' }
  | { kind: 'contact' }
  | { kind: 'contact-channel'; id: ContactKind }
  | { kind: 'profiles' }
  | { kind: 'cv' }
  | { kind: 'seeds' }
  | { kind: 'seed'; id: string }
  | { kind: 'zone'; id: ZoneId }
  | { kind: 'controls' };

/** Polar placement in zone-local space: compass degrees (0 = north, 90 = east) and radius. */
export interface Polar {
  readonly a: number;
  readonly r: number;
}

export type Facing = 'center' | 'out' | { readonly deg: number };

export interface LandmarkDef {
  readonly id: string;
  readonly name: string;
  readonly model: ModelKey;
  readonly props?: ModelProps;
  readonly at: Polar | { readonly x: number; readonly z: number };
  readonly face?: Facing;
  readonly scale?: number;
  /** Height above the zone's base elevation (Achievement Peak tiers). */
  readonly level?: number;
  /** Interactive landmarks open a panel; others are scenery with collision. */
  readonly panel?: PanelRef;
  readonly hint?: string;
  /** Category tag for group highlighting (Skill Forest clusters). */
  readonly group?: string;
}

export type DecorKind =
  | 'treeRound'
  | 'treePine'
  | 'blossomTree'
  | 'flower'
  | 'giantFlower'
  | 'rock'
  | 'mushroom'
  | 'bush'
  | 'glowShroom';

export type ZoneFeature =
  | { readonly kind: 'plaza'; readonly r: number; readonly color: string }
  | { readonly kind: 'ring-road'; readonly r: number; readonly width: number; readonly cars: number }
  | { readonly kind: 'river'; readonly a: number; readonly r0: number }
  | { readonly kind: 'pier'; readonly a: number }
  | { readonly kind: 'robots'; readonly count: number; readonly r: number }
  | { readonly kind: 'crystal-links' };

/** Achievement Peak style stacked plateaus; ramps connect consecutive levels. */
export interface TierDef {
  readonly radius: number;
  readonly height: number;
  /** Compass angle (deg) of the ramp leading UP onto this tier. */
  readonly rampAngle: number;
  readonly rampLength: number;
  /** Trail angles (deg) of nav nodes on this tier's walkable annulus. */
  readonly trail: readonly number[];
  readonly trailRadius: number;
}

export interface ZonePalette {
  readonly top: string;
  readonly rim: string;
  readonly rock: string;
  readonly accent: string;
}

export interface SeedPlacement {
  readonly id: string;
  readonly at: Polar;
  readonly level?: number;
}

export interface ZoneDef {
  readonly id: ZoneId;
  readonly name: string;
  readonly section: string;
  readonly description: string;
  readonly kind: 'island' | 'islet';
  readonly center: readonly [number, number];
  readonly elevation: number;
  readonly radius: number;
  readonly palette: ZonePalette;
  /** Map glyph (single character / short symbol). */
  readonly glyph: string;
  /** Where the world map draws the name (default: above the island). */
  readonly mapLabel?: 'top' | 'bottom' | 'left' | 'right';
  readonly landmarks: readonly LandmarkDef[];
  readonly decor: Partial<Record<DecorKind, number>>;
  /** Minimum radius for scattered decor (keeps the hub clear). */
  readonly decorMinRadius: number;
  /** Nav ring radii around the hub; empty for small islets (hub only). */
  readonly navRings: readonly number[];
  /** Hub offset from the centre (when a central feature occupies the middle). */
  readonly hub?: { readonly x: number; readonly z: number };
  readonly features?: readonly ZoneFeature[];
  readonly tiers?: readonly TierDef[];
  readonly seeds?: readonly SeedPlacement[];
  /** Panel shown for the zone itself (map "Read" action / landmark hub). */
  readonly overviewPanel: PanelRef;
  /** Landmark the guide targets for this zone. */
  readonly primaryLandmark: string;
  /** Projects explained on this island (their panels offer to guide or travel here). */
  readonly projects?: readonly string[];
}

export interface ZoneLink {
  readonly a: ZoneId;
  readonly b: ZoneId;
}
