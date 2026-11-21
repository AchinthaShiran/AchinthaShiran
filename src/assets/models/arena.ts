/**
 * Splat Arena models (ADR-007): runtime pieces (targets, bots, gun) and the arena's landmarks.
 * Runtime pieces are centred on their simulation position; landmarks sit on the ground like any other.
 */
import type { Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico, octa, torus } from '../builders';
import { glowMat } from '../materials';
import { palette } from '../palette';
import type { ModelProps } from '../types';
import { signPlane } from './city';

const RED = '#E8453C';
const BOT = '#8A5CF6';
const PAINT = ['#F5A6A6', '#75BDEB', '#FFD27D', '#80CFA9', '#B9A1E8', '#FF8FC7'];
const pick = <T>(list: readonly T[], i: number): T => list[i % list.length] as T;

/** Gallery target: bullseye rings on a post. Centred on the disc; faces +Z. */
export function paintTarget(): Object3D {
  const ring = (r: number, color: string, z: number) =>
    cylinder(r, r, 0.08, 20, color, { p: [0, 0, z], r: [Math.PI / 2, 0, 0] });
  return group([
    ring(0.7, palette.white, 0),
    ring(0.56, RED, 0.02),
    ring(0.42, palette.white, 0.04),
    ring(0.28, RED, 0.06),
    ring(0.12, palette.sunshine, 0.08),
    box(0.12, 1.4, 0.1, palette.woodDark, { p: [0, -1.05, -0.1] }),
  ]);
}

/** Hunt target: a floating glowing ring that spins and bobs. */
export function huntTarget(): Object3D {
  const core = octa(0.22, glowMat(palette.sunshine, 1.3, { unique: true }));
  const rings = [0, 1].map((i) =>
    torus(0.62 - i * 0.18, 0.06, glowMat(i ? palette.coral : '#7FE7D9', 1), {}, Math.PI * 2, 4, 20),
  );
  const g = group([core, ...rings]);
  return animate(g, (t) => {
    core.rotation.y = t * 2;
    rings[0]!.rotation.set(Math.sin(t) * 0.5, t * 1.2, 0);
    rings[1]!.rotation.set(Math.PI / 2, 0, -t * 1.6);
    g.scale.setScalar(1 + Math.sin(t * 3) * 0.06);
  });
}

/** Enemy paint-bot. Origin at its feet; faces +Z. */
export function paintBot(): Object3D {
  const visor = glowMat('#FF5C7A', 1.3);
  const eye = (x: number) => box(0.16, 0.16, 0.06, visor, { p: [x, 1.25, 0.5] });
  const gun = group(
    [
      box(0.14, 0.14, 0.5, palette.metalDark, { p: [0, 0, 0.3] }),
      ico(0.1, palette.coral, { p: [0, 0.14, 0.1] }),
    ],
    { p: [0.5, 0.85, 0.15] },
  );
  const g = group([
    cylinder(0.12, 0.16, 0.5, 6, palette.metalDark, { p: [-0.22, 0.25, 0] }),
    cylinder(0.12, 0.16, 0.5, 6, palette.metalDark, { p: [0.22, 0.25, 0] }),
    ico(0.62, BOT, { p: [0, 0.95, 0], s: [1, 1.05, 1] }, 1),
    box(0.8, 0.34, 0.12, '#1F2A44', { p: [0, 1.25, 0.46] }),
    eye(-0.2),
    eye(0.2),
    cylinder(0.03, 0.03, 0.4, 4, palette.metalDark, { p: [0, 1.75, 0] }),
    ico(0.09, glowMat('#FF5C7A', 1.2), { p: [0, 1.98, 0] }),
    cylinder(0.26, 0.26, 0.5, 8, palette.coral, { p: [0, 1.0, -0.55] }),
    gun,
  ]);
  return animate(g, (t) => (g.position.y = Math.sin(t * 6) * 0.03));
}

/** The visitor's paintball marker. The barrel points along -Y so it aims forward when the arm is raised. */
export function paintGun(): Object3D {
  return group([
    box(0.12, 0.3, 0.12, palette.ink, { p: [0, 0, 0] }),
    cylinder(0.04, 0.04, 0.5, 6, palette.metal, { p: [0, -0.38, 0] }),
    cylinder(0.055, 0.055, 0.08, 6, palette.coral, { p: [0, -0.64, 0] }),
    ico(0.11, palette.sunshine, { p: [0, 0.17, 0.02] }),
    box(0.08, 0.2, 0.08, palette.woodDark, { p: [0, 0.05, 0.1], r: [0.3, 0, 0] }),
  ]);
}

/* ------------------------------------------------------------ arena landmarks */

/** Challenge board: paint splats, badge medals and a heading. */
export function challengeBoard(): Object3D {
  const medals = [0, 1, 2, 3, 4].map((i) =>
    octa(0.2, glowMat(pick(PAINT, i), 0.8), { p: [-1.1 + i * 0.55, 1.6, 0.14] }),
  );
  const label = signPlane('CHALLENGES', 2.6, 0.5, palette.coral, palette.white);
  label.position.set(0, 2.7, 0.08);
  const g = group([
    box(0.14, 2.8, 0.14, palette.woodDark, { p: [-1.5, 1.4, 0] }),
    box(0.14, 2.8, 0.14, palette.woodDark, { p: [1.5, 1.4, 0] }),
    box(3.2, 2.2, 0.12, palette.wood, { p: [0, 1.7, 0] }),
    box(3.0, 2.0, 0.05, palette.cream, { p: [0, 1.7, 0.07] }),
    ...PAINT.map((c, i) =>
      cylinder(0.3 + (i % 3) * 0.08, 0.3 + (i % 3) * 0.08, 0.03, 10, c, {
        p: [-1.1 + i * 0.44, 1.05 + (i % 2) * 0.3, 0.11],
        r: [Math.PI / 2, 0, 0],
      }),
    ),
    ...medals,
    label,
  ]);
  return animate(g, (t) => medals.forEach((m, i) => (m.position.y = 1.6 + Math.sin(t * 2 + i) * 0.05)));
}

/** Shooting gallery booth: counter, striped awning and a back wall of mini targets. */
export function galleryBooth(): Object3D {
  const stripes = Array.from({ length: 8 }, (_, i) =>
    box(0.45, 0.08, 1.9, i % 2 ? palette.cream : RED, { p: [-1.57 + i * 0.45, 3.1, 0.1], r: [0.3, 0, 0] }),
  );
  const label = signPlane('SHOOTING GALLERY', 3.0, 0.5, palette.sunshine, palette.ink);
  label.position.set(0, 3.55, 0.7);
  return group([
    box(3.4, 0.9, 1.0, palette.wood, { p: [0, 0.45, 0.4] }),
    box(3.4, 2.8, 0.15, palette.woodDark, { p: [0, 1.4, -0.5] }),
    ...[-1.6, 1.6].map((x) => box(0.12, 3.0, 0.12, palette.woodDark, { p: [x, 1.5, 0.85] })),
    ...stripes,
    ...[-1, 0, 1].map((x) =>
      cylinder(0.4, 0.4, 0.06, 14, x % 2 ? palette.white : RED, {
        p: [x, 1.9, -0.4],
        r: [Math.PI / 2, 0, 0],
      }),
    ),
    ...[-0.5, 0.5].map((x) =>
      cylinder(0.2, 0.2, 0.08, 12, palette.sunshine, { p: [x, 1.9, -0.36], r: [Math.PI / 2, 0, 0] }),
    ),
    label,
  ]);
}

/** Bot arena gate: pillars with watching eyes. */
export function botGate(): Object3D {
  const eyeMats = [-1, 1].map(() => glowMat('#FF5C7A', 1.3, { unique: true }));
  const eyes = eyeMats.map((m, i) => ico(0.22, m, { p: [i ? 1.9 : -1.9, 3.4, 0.4] }));
  const label = signPlane('BOT ARENA', 3.0, 0.6, BOT, palette.white);
  label.position.set(0, 3.45, 0.38);
  const g = group([
    box(0.8, 3.8, 0.8, palette.metalDark, { p: [-1.9, 1.9, 0] }),
    box(0.8, 3.8, 0.8, palette.metalDark, { p: [1.9, 1.9, 0] }),
    box(4.6, 0.7, 0.8, BOT, { p: [0, 3.9, 0] }),
    ...eyes,
    box(3.2, 0.9, 0.12, palette.ink, { p: [0, 3.45, 0.32] }),
    label,
    cone(0.4, 0.7, 4, '#FF5C7A', { p: [-1.9, 4.6, 0], r: [0, Math.PI / 4, 0] }),
    cone(0.4, 0.7, 4, '#FF5C7A', { p: [1.9, 4.6, 0], r: [0, Math.PI / 4, 0] }),
  ]);
  return animate(g, (t) =>
    eyeMats.forEach((m, i) => (m.emissiveIntensity = 1 + Math.sin(t * 3 + i * 2) * 0.6)),
  );
}

/** Target-hunt desk: a map with pins and a telescope. */
export function huntDesk(): Object3D {
  const pins = [0, 1, 2, 3, 4].map((i) =>
    ico(0.09, pick(PAINT, i), { p: [-0.7 + i * 0.35, 1.32 + (i % 2) * 0.06, -0.2 + (i % 3) * 0.2] }),
  );
  const label = signPlane('TARGET HUNT', 2.2, 0.45, palette.meadow, palette.ink);
  label.position.set(0, 2.9, 0.06);
  return group([
    box(2.4, 0.12, 1.3, palette.wood, { p: [0, 1.0, 0] }),
    ...[-1, 1].flatMap((x) => [
      box(0.1, 1.0, 0.1, palette.woodDark, { p: [x, 0.5, -0.5] }),
      box(0.1, 1.0, 0.1, palette.woodDark, { p: [x, 0.5, 0.5] }),
    ]),
    box(1.8, 0.04, 0.9, palette.cream, { p: [-0.1, 1.08, 0], r: [0, 0.1, 0] }),
    ...pins,
    cylinder(0.12, 0.16, 0.9, 8, palette.roofBlue, { p: [0.85, 1.55, 0], r: [0, 0, 0.9] }),
    box(0.1, 1.9, 0.1, palette.woodDark, { p: [0, 1.9, -0.55] }),
    box(2.4, 0.7, 0.1, palette.woodDark, { p: [0, 2.9, -0.55] }),
    label,
  ]);
}

/** Paint armory: a rack of markers and paint barrels. */
export function armory(): Object3D {
  const guns = [0, 1, 2].map((i) => {
    const gun = paintGun();
    gun.position.set(-0.9 + i * 0.9, 2.0, 0.1);
    gun.rotation.z = Math.PI;
    return gun;
  });
  const label = signPlane('PAINT ARMORY', 2.6, 0.5, palette.coral, palette.white);
  label.position.set(0, 3.2, 0.08);
  return group([
    box(3.2, 2.6, 0.12, palette.woodDark, { p: [0, 1.5, -0.3] }),
    box(3.2, 0.1, 0.6, palette.wood, { p: [0, 1.0, 0] }),
    box(3.2, 0.1, 0.6, palette.wood, { p: [0, 2.2, 0] }),
    ...guns,
    ...[-1.2, 1.2].map((x, i) => cylinder(0.3, 0.3, 0.8, 10, pick(PAINT, i + 1), { p: [x, 0.4, 0.2] })),
    label,
  ]);
}

/** Cover block (scenery): stops paint balls and bots. */
export function coverBlock(): Object3D {
  return group([
    box(1.8, 1.3, 0.7, '#E58F7C', { p: [0, 0.65, 0] }),
    box(1.8, 0.1, 0.8, palette.cream, { p: [0, 1.35, 0] }),
    ...[0, 1, 2].map((i) =>
      ico(0.18, pick(PAINT, i), { p: [-0.5 + i * 0.5, 0.8 + (i % 2) * 0.25, 0.36], s: [1.4, 1, 0.3] }),
    ),
  ]);
}

export function paintBarrel(props: ModelProps): Object3D {
  const color = typeof props.color === 'string' ? props.color : palette.sky;
  return group([
    cylinder(0.5, 0.55, 1.1, 10, palette.metal, { p: [0, 0.55, 0] }),
    cylinder(0.52, 0.52, 0.2, 10, color, { p: [0, 0.65, 0] }),
    cylinder(0.3, 0.3, 0.06, 10, color, { p: [0, 1.12, 0] }),
    box(0.08, 0.5, 0.04, color, { p: [0.3, 0.9, 0.44] }),
  ]);
}
