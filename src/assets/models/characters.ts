import { type Group, type Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico } from '../builders';
import { glowMat } from '../materials';
import { palette } from '../palette';
import type { ModelProps } from '../types';

export interface CharacterColors {
  skin: string;
  shirt: string;
  pants: string;
  hair: string;
  shoes: string;
  accent: string;
}

export interface CharacterParts {
  root: Group;
  body: Group;
  head: Object3D;
  armL: Group;
  armR: Group;
  legL: Group;
  legR: Group;
}

/**
 * Stylized low-poly humanoid (~1.75 units tall) with pivoted limbs for procedural animation.
 * Front faces +Z. Parts are exposed via `root.userData.parts`.
 */
export function buildCharacter(c: CharacterColors, extras: Object3D[] = []): CharacterParts {
  const leg = (x: number) =>
    group(
      [
        box(0.2, 0.72, 0.22, c.pants, { p: [0, -0.36, 0] }),
        box(0.22, 0.14, 0.32, c.shoes, { p: [0, -0.74, 0.05] }),
      ],
      { p: [x, 0.82, 0] },
    );
  const arm = (x: number) =>
    group([box(0.15, 0.55, 0.17, c.shirt, { p: [0, -0.26, 0] }), ico(0.1, c.skin, { p: [0, -0.58, 0] })], {
      p: [x, 1.38, 0],
    });
  const head = group([
    ico(0.26, c.skin, { p: [0, 0, 0] }, 1),
    ico(0.28, c.hair, { p: [0, 0.08, -0.05], s: [1.02, 0.8, 1] }, 1),
    box(0.06, 0.08, 0.02, palette.ink, { p: [-0.09, 0.0, 0.245] }),
    box(0.06, 0.08, 0.02, palette.ink, { p: [0.09, 0.0, 0.245] }),
    box(0.08, 0.02, 0.02, '#D9837A', { p: [0, -0.1, 0.25] }),
  ]);
  head.position.set(0, 1.72, 0);

  const legL = leg(-0.12);
  const legR = leg(0.12);
  const armL = arm(-0.38);
  const armR = arm(0.38);
  const torso = cylinder(0.27, 0.24, 0.62, 6, c.shirt, { p: [0, 1.15, 0] });
  const belt = cylinder(0.25, 0.25, 0.08, 6, c.accent, { p: [0, 0.86, 0] });
  const neck = cylinder(0.08, 0.08, 0.12, 5, c.skin, { p: [0, 1.5, 0] });

  const body = group([torso, belt, neck, head, armL, armR, ...extras]);
  const root = group([body, legL, legR]);
  const parts: CharacterParts = { root, body, head, armL, armR, legL, legR };
  root.userData.parts = parts;
  return parts;
}

export const EXPLORER_COLORS: CharacterColors = {
  skin: palette.skin,
  shirt: '#5DA9E9',
  pants: '#4A5A8C',
  hair: '#6B4A3A',
  shoes: palette.ink,
  accent: palette.sunshine,
};

/** The visitor's character (animated by the Player controller, not by ticks). */
export function explorer(): Object3D {
  const pack = group([
    box(0.42, 0.5, 0.2, palette.coral, { p: [0, 0, 0] }),
    box(0.3, 0.12, 0.05, palette.cream, { p: [0, -0.08, -0.12] }),
  ]);
  pack.position.set(0, 1.18, -0.26);
  const hat = group([
    cylinder(0.36, 0.36, 0.04, 8, palette.sunshine, { p: [0, 0, 0] }),
    cylinder(0.2, 0.24, 0.18, 8, palette.sunshine, { p: [0, 0.1, 0] }),
  ]);
  hat.position.set(0, 1.94, 0);
  return buildCharacter(EXPLORER_COLORS, [pack, hat]).root;
}

/** Colours taken from the owner's reference portrait: dark hair, white shirt, jeans. */
const OWNER = {
  skin: '#E9B991',
  hair: '#2A1D18',
  shirt: '#F6F4EE',
  jeans: '#4F79B8',
  belt: '#6B4423',
  shoes: '#4A3426',
  silver: '#C9CED6',
} as const;

/**
 * Achintha's avatar on Home Island, styled after the owner's reference portrait: short, slightly spiky dark hair, a slight
 * smirk, a white button shirt with rolled sleeves, blue jeans with a brown belt.
 */
export function ownerAvatar(): Object3D {
  const c = OWNER;
  const shirtDetails = [
    box(0.13, 0.12, 0.05, c.shirt, { p: [-0.1, 1.5, 0.24], r: [0, 0, 0.55] }),
    box(0.13, 0.12, 0.05, c.shirt, { p: [0.1, 1.5, 0.24], r: [0, 0, -0.55] }),
    box(0.1, 0.14, 0.02, c.skin, { p: [0, 1.47, 0.27] }),
    ...[1.3, 1.18, 1.06].map((y) => ico(0.025, '#D8D2C4', { p: [0, y, 0.285] })),
    box(0.1, 0.08, 0.02, c.silver, { p: [0, 0.86, 0.265] }),
  ];

  const parts = buildCharacter(
    { skin: c.skin, shirt: c.shirt, pants: c.jeans, hair: c.hair, shoes: c.shoes, accent: c.belt },
    shirtDetails,
  );

  // Short, slightly spiky hair: a low row of small spikes along the top and front of the base cut.
  [-0.15, -0.075, 0, 0.075, 0.15].forEach((x, i) =>
    parts.head.add(
      cone(0.06, 0.12 + (i % 2) * 0.04, 4, c.hair, {
        p: [x, 0.27, 0.03 + (i % 2) * 0.03],
        r: [0.35, 0, -x * 1.6],
      }),
    ),
  );
  // Eyebrows and a smirk.
  parts.head.add(
    box(0.1, 0.025, 0.02, c.hair, { p: [-0.09, 0.1, 0.25], r: [0, 0, 0.14] }),
    box(0.1, 0.025, 0.02, c.hair, { p: [0.09, 0.1, 0.25], r: [0, 0, -0.14] }),
  );
  const mouth = parts.head.children[4];
  if (mouth) {
    mouth.position.x = 0.03;
    mouth.rotation.z = 0.22;
    mouth.scale.x = 1.4;
  }

  // Rolled sleeves: skin-toned forearms below a white cuff.
  for (const arm of [parts.armL, parts.armR]) {
    arm.add(
      box(0.17, 0.24, 0.19, c.skin, { p: [0, -0.42, 0] }),
      box(0.18, 0.05, 0.2, c.shirt, { p: [0, -0.29, 0] }),
    );
  }
  // Arms hang relaxed at his sides, angled slightly away from the body.
  parts.armL.rotation.z = -0.07;
  parts.armR.rotation.z = 0.07;

  parts.root.scale.setScalar(1.05);
  return animate(parts.root, (t) => {
    parts.body.position.y = Math.sin(t * 2) * 0.015;
    parts.armL.rotation.x = Math.sin(t * 1.3) * 0.05;
    parts.armR.rotation.x = -Math.sin(t * 1.3) * 0.05;
    parts.head.rotation.y = Math.sin(t * 0.7) * 0.18;
    parts.head.rotation.x = Math.sin(t * 0.5) * 0.03;
  });
}

/** Small figure for the mentorship pavilion (students and mentor). */
export function miniFigure(props: ModelProps): Object3D {
  const shirt = typeof props.color === 'string' ? props.color : palette.meadow;
  const parts = buildCharacter({
    skin: palette.skin,
    shirt,
    pants: '#5B6787',
    hair: palette.hair,
    shoes: palette.ink,
    accent: palette.cream,
  });
  parts.root.scale.setScalar(0.62);
  const phase = typeof props.seed === 'number' ? props.seed : 0;
  return animate(parts.root, (t) => {
    parts.head.rotation.x = Math.sin(t * 1.5 + phase) * 0.1;
    parts.armR.rotation.x = Math.sin(t * 2 + phase) * 0.3 - 0.3;
  });
}

/** Little exploring robot for the Innovation Lab. */
export function robot(props: ModelProps): Object3D {
  const tone = typeof props.color === 'string' ? props.color : palette.metal;
  const eye = glowMat('#7FF3FF', 1.2);
  const antennaTip = glowMat(palette.coral, 1);
  const head = group([
    box(0.5, 0.36, 0.42, tone, { p: [0, 0, 0] }),
    box(0.1, 0.1, 0.04, eye, { p: [-0.11, 0.02, 0.22] }),
    box(0.1, 0.1, 0.04, eye, { p: [0.11, 0.02, 0.22] }),
    cylinder(0.02, 0.02, 0.25, 4, palette.metalDark, { p: [0, 0.3, 0] }),
    ico(0.06, antennaTip, { p: [0, 0.45, 0] }),
  ]);
  head.position.y = 0.95;
  const g = group([
    cylinder(0.3, 0.36, 0.5, 6, tone, { p: [0, 0.55, 0] }),
    cone(0.22, 0.3, 6, palette.metalDark, { p: [0, 0.2, 0], r: [Math.PI, 0, 0] }),
    head,
  ]);
  const phase = typeof props.seed === 'number' ? props.seed : 0;
  return animate(g, (t) => {
    g.position.y = 0.12 + Math.sin(t * 3 + phase) * 0.08;
    head.rotation.y = Math.sin(t * 1.3 + phase) * 0.6;
  });
}
