import type { Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico, octa, torus } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';
import type { ModelProps } from '../types';
import { signPlane } from './city';

/** Award trophy on a pedestal. `label` = year(s) plaque. */
export function trophy(props: ModelProps): Object3D {
  const color = typeof props.color === 'string' ? props.color : palette.sunshine;
  const label = typeof props.label === 'string' ? props.label : '';
  const gold = mat(color, { metalness: 0.4, roughness: 0.35, emissive: color, emissiveIntensity: 0.15 });
  const cup = group([
    cylinder(0.55, 0.3, 0.8, 8, gold, { p: [0, 0.4, 0] }),
    torus(0.28, 0.06, gold, { p: [-0.55, 0.5, 0], r: [0, 0, Math.PI / 2] }, Math.PI, 4, 8),
    torus(0.28, 0.06, gold, { p: [0.55, 0.5, 0], r: [0, 0, -Math.PI / 2] }, Math.PI, 4, 8),
    cylinder(0.08, 0.12, 0.4, 6, gold, { p: [0, -0.15, 0] }),
    cylinder(0.32, 0.36, 0.12, 8, gold, { p: [0, -0.38, 0] }),
    octa(0.18, glowMat(palette.white, 0.8), { p: [0, 1.0, 0] }),
  ]);
  cup.position.y = 1.95;
  const parts: Object3D[] = [
    box(1.3, 0.3, 1.3, palette.stone, { p: [0, 0.15, 0] }),
    box(0.9, 1.2, 0.9, palette.cream, { p: [0, 0.9, 0] }),
    box(1.0, 0.12, 1.0, palette.lavender, { p: [0, 1.5, 0] }),
    cup,
  ];
  if (label) {
    const plaque = signPlane(label, 0.85, 0.36, palette.ink, palette.sunshine);
    plaque.position.set(0, 0.95, 0.46);
    parts.push(plaque);
  }
  const g = group(parts);
  return animate(g, (t) => (cup.rotation.y = Math.sin(t * 0.8) * 0.4));
}

export function flag(props: ModelProps): Object3D {
  const color = typeof props.color === 'string' ? props.color : palette.coral;
  const cloth = box(1.1, 0.7, 0.04, mat(color, { doubleSide: true }), { p: [0.55, 0, 0] });
  const pivot = group([cloth], { p: [0, 2.6, 0] });
  const g = group([
    cylinder(0.05, 0.06, 3, 5, palette.woodDark, { p: [0, 1.5, 0] }),
    ico(0.1, palette.sunshine, { p: [0, 3.05, 0] }),
    pivot,
  ]);
  const seed = typeof props.seed === 'number' ? props.seed : 0;
  return animate(g, (t) => {
    pivot.rotation.y = Math.sin(t * 2 + seed) * 0.35;
    cloth.scale.y = 1 + Math.sin(t * 4 + seed) * 0.05;
  });
}

/** Summit castle (awards summary). */
export function castle(): Object3D {
  const tower = (x: number, z: number, h: number, roof: string) => [
    cylinder(0.8, 0.9, h, 7, palette.cream, { p: [x, h / 2, z] }),
    cone(1.05, 1.6, 7, roof, { p: [x, h + 0.8, z] }),
    box(0.3, 0.5, 0.05, glowMat(palette.glow, 0.6), { p: [x, h * 0.65, z + 0.86] }),
  ];
  const banner = box(0.7, 0.45, 0.03, mat(palette.coral, { doubleSide: true }), { p: [0.35, 0, 0] });
  const bannerPivot = group([banner], { p: [0, 7.2, 0] });
  const g = group([
    box(4.6, 2.8, 3.2, palette.stone, { p: [0, 1.4, 0] }),
    ...[-1.8, -0.6, 0.6, 1.8].map((x) => box(0.6, 0.5, 0.6, palette.stone, { p: [x, 3.05, 1.3] })),
    box(1.2, 1.8, 0.1, palette.woodDark, { p: [0, 0.9, 1.62] }),
    ...tower(-2.4, 1.2, 4.2, palette.lavender),
    ...tower(2.4, 1.2, 4.2, palette.lavender),
    ...tower(0, -0.6, 5.4, palette.roof),
    cylinder(0.04, 0.04, 1.2, 4, palette.woodDark, { p: [0, 6.7, -0.6] }),
    bannerPivot,
  ]);
  bannerPivot.position.z = -0.6;
  return animate(g, (t) => (bannerPivot.rotation.y = Math.sin(t * 2) * 0.4));
}

export function peakSign(): Object3D {
  const sign = signPlane('ACHIEVEMENT PEAK', 3.4, 0.8, palette.sunshine, palette.ink);
  sign.position.set(0, 2.1, 0.08);
  return group([
    cylinder(0.1, 0.12, 2.7, 5, palette.woodDark, { p: [-1.6, 1.35, 0] }),
    cylinder(0.1, 0.12, 2.7, 5, palette.woodDark, { p: [1.6, 1.35, 0] }),
    sign,
  ]);
}
