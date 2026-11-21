import type { Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico } from '../builders';
import { glowMat } from '../materials';
import { palette } from '../palette';

/** Idea Seed collectible: a glowing seed with a sprout. */
export function ideaSeed(): Object3D {
  const seed = ico(0.32, glowMat(palette.sunshine, 1.0), { s: [0.8, 1.1, 0.8] }, 1);
  const sprout = group([
    cylinder(0.03, 0.03, 0.3, 4, glowMat(palette.leafLight, 0.8), { p: [0, 0.3, 0] }),
    cone(0.12, 0.25, 4, glowMat(palette.leafLight, 0.8), { p: [0.1, 0.45, 0], r: [0, 0, -0.9] }),
    cone(0.12, 0.25, 4, glowMat(palette.leafLight, 0.8), { p: [-0.1, 0.42, 0], r: [0, 0, 0.9] }),
  ]);
  const inner = group([seed, sprout]);
  const g = group([inner]);
  g.traverse((o) => (o.castShadow = false));
  return animate(g, (t) => {
    inner.position.y = 1.0 + Math.sin(t * 2.5) * 0.15;
    inner.rotation.y = t * 1.5;
  });
}

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
