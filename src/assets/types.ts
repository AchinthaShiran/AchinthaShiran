import type { Object3D } from 'three';

/** Parameters passed from world config to a model factory (e.g. colour, seed, floors). */
export type ModelProps = Readonly<Record<string, string | number | boolean | readonly string[] | undefined>>;

/** Collision footprint in the model's local space (ADR-002). */
export type Footprint =
  | { readonly kind: 'circle'; readonly r: number }
  | { readonly kind: 'box'; readonly w: number; readonly d: number };

export type ModelSource =
  | { readonly kind: 'procedural'; readonly build: (props: ModelProps) => Object3D }
  | { readonly kind: 'gltf'; readonly url: string; readonly scale?: number };

export interface ModelEntry {
  readonly source: ModelSource;
  /** Collision footprint; null = walk-through (flowers, small props). */
  readonly footprint: Footprint | null;
  /** Approximate height, used to place labels and interaction markers above the model. */
  readonly height: number;
}
