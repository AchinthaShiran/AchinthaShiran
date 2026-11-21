import type { MeshStandardMaterial, Object3D } from 'three';
import { animate, cylinder, group, ico, mesh } from '../builders';
import { cachedGeometry } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';
import type { ModelProps } from '../types';
import { OctahedronGeometry } from 'three';
import { signPlane } from './city';

const shard = (r: number, stretch: number) =>
  cachedGeometry(`shard:${r}:${stretch}`, () => {
    const g = new OctahedronGeometry(r, 0);
    g.scale(1, stretch, 1);
    return g;
  });

/**
 * Skill crystal cluster. `color` = category colour, `label` = skill name shown on a small plaque.
 * Material is unique so each crystal can glow independently when its category is highlighted.
 */
export function crystal(props: ModelProps): Object3D {
  const color = typeof props.color === 'string' ? props.color : palette.sky;
  const label = typeof props.label === 'string' ? props.label : '';
  const seed = typeof props.seed === 'number' ? props.seed : 0;
  const material = glowMat(color, 0.35, { unique: true, roughness: 0.25, opacity: 0.92 });
  const main = mesh(shard(0.55, 2.4), material, { p: [0, 1.5, 0] });
  const side = [0, 1, 2].map((i) => {
    const a = seed + (i / 3) * Math.PI * 2;
    return mesh(shard(0.3, 2.1), material, { p: [Math.sin(a) * 0.55, 0.75, Math.cos(a) * 0.55], r: [Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35] });
  });
  const parts: Object3D[] = [cylinder(0.9, 1.05, 0.3, 7, palette.rockDark, { p: [0, 0.15, 0] }), main, ...side];
  if (label) {
    const plaque = signPlane(label, 1.6, 0.42, palette.cream, palette.ink);
    plaque.position.set(0, 0.42, 0.95);
    plaque.rotation.x = -0.5;
    parts.push(plaque);
  }
  const g = group(parts);
  g.userData.glowMaterial = material as MeshStandardMaterial;
  return animate(g, (t) => {
    main.rotation.y = t * 0.3 + seed;
    main.position.y = 1.5 + Math.sin(t * 1.4 + seed) * 0.08;
  });
}

/** Central skill-tree monument: a tree whose branches end in category-coloured crystals. */
export function skillTreeMonument(props: ModelProps): Object3D {
  const colors = Array.isArray(props.colors) ? (props.colors as readonly string[]) : [palette.sky, palette.meadow, palette.coral];
  const branches = colors.map((c, i) => {
    const a = (i / colors.length) * Math.PI * 2;
    const tip = mesh(shard(0.35, 2), glowMat(c, 0.7), { p: [Math.sin(a) * 2.2, 5.6 + (i % 2) * 0.5, Math.cos(a) * 2.2] });
    const branch = cylinder(0.1, 0.18, 2.6, 5, palette.woodDark, { p: [Math.sin(a) * 1.1, 4.6, Math.cos(a) * 1.1], r: [Math.cos(a) * 0.9, 0, -Math.sin(a) * 0.9] });
    return [branch, tip];
  });
  const tips = branches.map((b) => b[1]!);
  const g = group([
    cylinder(2.6, 3.0, 0.5, 8, palette.stone, { p: [0, 0.25, 0] }),
    cylinder(2.2, 2.2, 0.12, 8, palette.lavender, { p: [0, 0.56, 0] }),
    cylinder(0.45, 0.75, 4.4, 7, palette.woodDark, { p: [0, 2.6, 0] }),
    ico(1.3, mat(palette.leafLight, { sway: 0.04 }), { p: [0, 5.6, 0] }),
    ...branches.flat(),
  ]);
  return animate(g, (t) => tips.forEach((tip, i) => (tip.rotation.y = t * 0.8 + i)));
}

export function forestSign(): Object3D {
  const sign = signPlane('SKILL FOREST', 3.2, 0.8, palette.meadow, palette.white);
  sign.position.set(0, 2.0, 0.08);
  return group([cylinder(0.1, 0.12, 2.6, 5, palette.woodDark, { p: [-1.5, 1.3, 0] }), cylinder(0.1, 0.12, 2.6, 5, palette.woodDark, { p: [1.5, 1.3, 0] }), sign]);
}

export function glowShroom(props: ModelProps): Object3D {
  const seed = typeof props.seed === 'number' ? props.seed : 0;
  const c = [palette.lavender, palette.sky, palette.coral][seed % 3] ?? palette.lavender;
  return group([cylinder(0.08, 0.1, 0.5, 5, palette.cream, { p: [0, 0.25, 0] }), ico(0.28, glowMat(c, 0.7), { p: [0, 0.55, 0], s: [1, 0.5, 1] })]);
}
