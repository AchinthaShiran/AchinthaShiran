import type { Object3D } from 'three';
import { animate, blob, box, cone, cylinder, group, ico } from '../builders';
import { mat } from '../materials';
import { palette } from '../palette';
import type { ModelProps } from '../types';

const num = (v: ModelProps[string], fallback: number) => (typeof v === 'number' ? v : fallback);
const str = (v: ModelProps[string], fallback: string) => (typeof v === 'string' ? v : fallback);

const LEAF_TONES = [palette.leaf, palette.leafLight, palette.meadow, palette.leafDark];
const BLOSSOM_TONES = [palette.coral, palette.lavender, palette.sunshine];

export function treeRound(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const tone = str(props.color, LEAF_TONES[seed % LEAF_TONES.length] ?? palette.leaf);
  const leaves = mat(tone, { sway: 0.06 });
  return group(
    [
      cylinder(0.18, 0.28, 1.6, 6, palette.woodDark, { p: [0, 0.8, 0] }),
      blob(1.15, leaves, seed, { p: [0, 2.3, 0] }),
      blob(0.8, leaves, seed + 1, { p: [0.55, 2.0, 0.2] }),
      blob(0.7, leaves, seed + 2, { p: [-0.45, 2.75, -0.15] }),
    ],
    { s: num(props.scale, 1) },
  );
}

export function treePine(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const tone = str(props.color, seed % 2 ? palette.pine : palette.leafDark);
  const needles = mat(tone, { sway: 0.04 });
  return group(
    [
      cylinder(0.15, 0.22, 1.0, 5, palette.woodDark, { p: [0, 0.5, 0] }),
      cone(1.2, 1.6, 7, needles, { p: [0, 1.5, 0] }),
      cone(0.95, 1.4, 7, needles, { p: [0, 2.3, 0], r: [0, 0.4, 0] }),
      cone(0.65, 1.2, 7, needles, { p: [0, 3.0, 0], r: [0, 0.8, 0] }),
    ],
    { s: num(props.scale, 1) },
  );
}

export function blossomTree(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const tone = BLOSSOM_TONES[seed % BLOSSOM_TONES.length] ?? palette.coral;
  const leaves = mat(tone, { sway: 0.05 });
  return group(
    [
      cylinder(0.16, 0.26, 1.5, 6, palette.woodDark, { p: [0, 0.75, 0] }),
      blob(1.0, leaves, seed, { p: [0, 2.1, 0] }),
      blob(0.7, leaves, seed + 3, { p: [0.5, 1.9, -0.3] }),
    ],
    { s: num(props.scale, 1) },
  );
}

/** Home Island's giant tree of growth. */
export function giantTree(): Object3D {
  const bark = palette.woodDark;
  const leafA = mat(palette.leaf, { sway: 0.08 });
  const leafB = mat(palette.meadow, { sway: 0.08 });
  const leafC = mat(palette.lavender, { sway: 0.08 });
  const fruit = mat(palette.sunshine, { emissive: palette.sunshine, emissiveIntensity: 0.35 });
  const roots = [0, 1, 2, 3, 4].map((i) =>
    box(0.5, 0.5, 1.8, bark, {
      p: [Math.sin(i * 1.26) * 1.1, 0.2, Math.cos(i * 1.26) * 1.1],
      r: [0.2, i * 1.26, 0],
    }),
  );
  const fruits = [0, 1, 2, 3, 4, 5].map((i) =>
    ico(0.22, fruit, { p: [Math.sin(i * 1.05) * 2.6, 5.4 + (i % 3) * 0.6, Math.cos(i * 1.05) * 2.6] }),
  );
  return group([
    cylinder(0.75, 1.25, 5.5, 7, bark, { p: [0, 2.75, 0] }),
    cylinder(0.35, 0.5, 2.2, 6, bark, { p: [1.0, 5.0, 0.2], r: [0, 0, -0.6] }),
    cylinder(0.3, 0.45, 2.0, 6, bark, { p: [-0.9, 5.2, -0.2], r: [0, 0, 0.7] }),
    ...roots,
    blob(2.6, leafA, 11, { p: [0, 7.2, 0] }),
    blob(1.9, leafB, 12, { p: [2.0, 6.4, 0.6] }),
    blob(1.8, leafB, 13, { p: [-2.0, 6.6, -0.4] }),
    blob(1.5, leafC, 14, { p: [0.4, 8.6, -0.8] }),
    blob(1.4, leafA, 15, { p: [-0.6, 6.2, 1.9] }),
    ...fruits,
  ]);
}

export function flower(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const colors = [palette.coral, palette.sunshine, palette.lavender, palette.white, '#FF9EC7'];
  const petal = mat(colors[seed % colors.length] ?? palette.coral, { sway: 0.05 });
  const stem = mat(palette.leafDark, { sway: 0.03 });
  const s = num(props.scale, 1);
  return group(
    [
      cylinder(0.03, 0.03, 0.5, 4, stem, { p: [0, 0.25, 0] }),
      ico(0.16, petal, { p: [0, 0.55, 0] }),
      ico(0.07, mat(palette.sunshine, { sway: 0.05 }), { p: [0, 0.6, 0.12] }),
    ],
    { s },
  );
}

export function giantFlower(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const colors = [palette.coral, palette.lavender, palette.sunshine];
  const tone = colors[seed % colors.length] ?? palette.coral;
  const petals = [0, 1, 2, 3, 4].map((i) =>
    box(0.5, 0.08, 0.28, mat(tone, { sway: 0.05 }), {
      p: [Math.sin((i / 5) * Math.PI * 2) * 0.35, 1.6, Math.cos((i / 5) * Math.PI * 2) * 0.35],
      r: [0, (i / 5) * Math.PI * 2 + Math.PI / 2, 0.3],
    }),
  );
  return group([
    cylinder(0.06, 0.08, 1.6, 5, mat(palette.leafDark, { sway: 0.03 }), { p: [0, 0.8, 0] }),
    box(0.5, 0.06, 0.2, mat(palette.leaf, { sway: 0.03 }), { p: [0.2, 0.7, 0], r: [0, 0, 0.5] }),
    ...petals,
    ico(0.2, mat(palette.sunshine, { sway: 0.05 }), { p: [0, 1.65, 0] }),
  ]);
}

export function rock(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const s = num(props.scale, 1);
  return group(
    [
      blob(
        0.7,
        seed % 2 ? palette.rock : palette.stone,
        seed,
        { p: [0, 0.35, 0], s: [1, 0.7, 1] },
        0.3,
        'dodeca',
      ),
      blob(0.35, palette.rockDark, seed + 2, { p: [0.6, 0.15, 0.2] }, 0.3, 'dodeca'),
    ],
    { s },
  );
}

export function mushroom(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const cap = seed % 2 ? palette.coral : palette.lavender;
  const dots = [0, 1, 2].map((i) =>
    ico(0.08, palette.white, { p: [Math.sin(i * 2.1) * 0.32, 0.88, Math.cos(i * 2.1) * 0.32] }),
  );
  return group(
    [
      cylinder(0.12, 0.16, 0.6, 6, palette.cream, { p: [0, 0.3, 0] }),
      cone(0.5, 0.45, 7, cap, { p: [0, 0.78, 0] }),
      ...dots,
    ],
    { s: num(props.scale, 1) },
  );
}

export function bush(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const leaves = mat(LEAF_TONES[(seed + 1) % LEAF_TONES.length] ?? palette.leaf, { sway: 0.03 });
  return group(
    [blob(0.6, leaves, seed, { p: [0, 0.45, 0] }), blob(0.45, leaves, seed + 1, { p: [0.5, 0.35, 0.1] })],
    { s: num(props.scale, 1) },
  );
}

export function cloud(props: ModelProps): Object3D {
  const seed = num(props.seed, 1);
  const white = mat(palette.white, { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.15 });
  const g = group([
    blob(3.2, white, seed, { p: [0, 0, 0] }, 0.18),
    blob(2.4, white, seed + 1, { p: [3.2, -0.5, 0.4] }, 0.18),
    blob(2.2, white, seed + 2, { p: [-3.0, -0.6, -0.3] }, 0.18),
    blob(1.8, white, seed + 3, { p: [1.2, 1.4, -0.6] }, 0.18),
  ]);
  g.traverse((o) => {
    o.castShadow = false;
    o.receiveShadow = false;
  });
  return g;
}

/** Simple flapping bird. Flight path is driven by the scene; the model flaps its wings. */
export function bird(props: ModelProps): Object3D {
  const tone = str(props.color, palette.white);
  const wingL = box(0.7, 0.04, 0.3, tone, { p: [-0.35, 0, 0] });
  const wingR = box(0.7, 0.04, 0.3, tone, { p: [0.35, 0, 0] });
  const pivotL = group([wingL]);
  const pivotR = group([wingR]);
  const g = group([
    box(0.18, 0.16, 0.5, tone),
    cone(0.06, 0.18, 4, palette.sunshine, { p: [0, 0, 0.32], r: [Math.PI / 2, 0, 0] }),
    pivotL,
    pivotR,
  ]);
  const phase = num(props.seed, 0);
  return animate(g, (t) => {
    const flap = Math.sin(t * 9 + phase) * 0.6;
    pivotL.rotation.z = flap;
    pivotR.rotation.z = -flap;
  });
}
