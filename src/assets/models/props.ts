import type { Object3D } from 'three';
import { box, cone, cylinder, group } from '../builders';
import { palette } from '../palette';

/** Signpost post; arrow boards are added by the scene with zone names. */
export function signpostPost(): Object3D {
  return group([
    cylinder(0.12, 0.15, 3.2, 6, palette.woodDark, { p: [0, 1.6, 0] }),
    cone(0.22, 0.3, 6, palette.roof, { p: [0, 3.35, 0] }),
    box(0.5, 0.15, 0.5, palette.stone, { p: [0, 0.07, 0] }),
  ]);
}

/** Generic fallback when a model fails to build or load. */
export function placeholder(): Object3D {
  return group([box(1, 1, 1, palette.lavender, { p: [0, 0.5, 0] })]);
}
