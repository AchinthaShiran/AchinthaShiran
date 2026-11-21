import type { Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico, octa } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';
import { signPlane } from './city';
import { noticeBoard } from './home';

/** University building (education). */
export function university(): Object3D {
  const columns = [-1.8, -0.6, 0.6, 1.8].map((x) =>
    cylinder(0.22, 0.25, 2.6, 6, palette.white, { p: [x, 1.7, 2.0] }),
  );
  const sign = signPlane('UNIVERSITY', 2.6, 0.5, palette.roofBlue, palette.white);
  sign.position.set(0, 3.55, 2.32);
  const clockHand = box(0.05, 0.4, 0.02, palette.ink, { p: [0, 0.15, 0] });
  const clock = group(
    [
      cylinder(0.45, 0.45, 0.08, 10, palette.cream, { r: [Math.PI / 2, 0, 0] }),
      group([clockHand], { p: [0, 0, 0.06] }),
    ],
    { p: [0, 5.6, 1.55] },
  );
  const g = group([
    box(6.4, 0.4, 5, palette.stone, { p: [0, 0.2, 0] }),
    box(5.6, 3, 3.6, palette.cream, { p: [0, 1.9, -0.4] }),
    ...columns,
    box(5.0, 0.4, 1.2, palette.white, { p: [0, 3.2, 1.9] }),
    cone(3.2, 1.2, 4, palette.roofBlue, { p: [0, 4.0, 1.0], r: [0, Math.PI / 4, 0], s: [1.15, 1, 0.55] }),
    box(1.6, 2.2, 1.6, palette.cream, { p: [0, 4.6, -0.4] }),
    cone(1.3, 1.4, 4, palette.roofBlue, { p: [0, 6.4, -0.4], r: [0, Math.PI / 4, 0] }),
    box(1.0, 1.6, 0.1, palette.woodDark, { p: [0, 1.2, 1.42] }),
    box(0.8, 0.8, 0.1, glowMat(palette.glow, 0.4), { p: [-1.8, 2.0, 1.42] }),
    box(0.8, 0.8, 0.1, glowMat(palette.glow, 0.4), { p: [1.8, 2.0, 1.42] }),
    sign,
    clock,
  ]);
  return animate(g, (t) => (clockHand.parent!.rotation.z = -t * 0.3));
}

/** Graduation monument: a mortarboard atop a pillar. */
export function graduationMonument(): Object3D {
  const cap = group([
    box(1.4, 0.1, 1.4, palette.ink, { r: [0, Math.PI / 4, 0] }),
    cylinder(0.45, 0.5, 0.35, 8, palette.ink, { p: [0, -0.2, 0] }),
    cylinder(0.02, 0.02, 0.6, 4, palette.sunshine, { p: [0.55, -0.25, 0] }),
    ico(0.07, palette.sunshine, { p: [0.55, -0.55, 0] }),
  ]);
  cap.position.y = 3.2;
  const g = group([
    cylinder(1.0, 1.2, 0.4, 8, palette.stone, { p: [0, 0.2, 0] }),
    cylinder(0.35, 0.45, 2.4, 8, palette.cream, { p: [0, 1.6, 0] }),
    box(1.2, 0.5, 0.25, palette.coral, { p: [0, 0.9, 0.42] }),
    cap,
  ]);
  return animate(g, (t) => (cap.rotation.y = t * 0.5));
}

export function bookStack(): Object3D {
  const colors = [palette.coral, palette.sky, palette.sunshine, palette.lavender];
  return group(
    colors.map((c, i) =>
      box(1.0 - i * 0.08, 0.22, 0.7, c, { p: [0, 0.11 + i * 0.22, 0], r: [0, i * 0.25, 0] }),
    ),
  );
}

/** Learning pavilion (mentoring overview). */
export function pavilion(): Object3D {
  const posts = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return cylinder(0.14, 0.16, 2.6, 6, palette.wood, { p: [Math.sin(a) * 2.4, 1.6, Math.cos(a) * 2.4] });
  });
  return group([
    cylinder(2.9, 3.1, 0.3, 6, palette.stone, { p: [0, 0.15, 0] }),
    cylinder(2.7, 2.7, 0.08, 6, palette.cream, { p: [0, 0.34, 0] }),
    ...posts,
    cone(3.4, 1.6, 6, palette.meadow, { p: [0, 3.7, 0] }),
    ico(0.25, palette.sunshine, { p: [0, 4.6, 0] }),
    box(1.6, 0.1, 0.9, palette.wood, { p: [0, 1.0, 0] }),
    box(0.12, 0.65, 0.12, palette.woodDark, { p: [0, 0.65, 0] }),
    octa(0.2, glowMat(palette.sunshine, 0.8), { p: [0, 1.3, 0] }),
  ]);
}

/** Training board (intern & fresh graduate programme). */
export function trainingBoard(): Object3D {
  const g = noticeBoard();
  const sign = signPlane('TRAINING', 1.4, 0.35, palette.meadow, palette.white);
  sign.position.set(0, 2.05, 0.1);
  g.add(sign);
  return g;
}

/** Bootcamp desk (SpringBoot mentoring): a desk with a leaf-green "spring" emblem screen. */
export function bootcampDesk(): Object3D {
  const leaf = cone(0.25, 0.5, 4, glowMat(palette.leafLight, 1), { p: [0, 1.75, -0.18], r: [0, 0, 0.8] });
  const g = group([
    box(2.0, 0.12, 1.0, palette.wood, { p: [0, 0.9, 0] }),
    box(0.1, 0.9, 0.9, palette.woodDark, { p: [-0.9, 0.45, 0] }),
    box(0.1, 0.9, 0.9, palette.woodDark, { p: [0.9, 0.45, 0] }),
    box(1.1, 0.7, 0.07, palette.ink, { p: [0, 1.4, -0.25] }),
    box(1.0, 0.6, 0.02, glowMat('#2F4F3A', 0.6), { p: [0, 1.4, -0.21] }),
    leaf,
    box(0.8, 0.05, 0.3, palette.metalDark, { p: [0, 0.98, 0.15] }),
  ]);
  return animate(g, (t) => (leaf.rotation.y = t));
}

/** Facilitator podium (GLO Leadership). */
export function podium(): Object3D {
  const globe = ico(
    0.35,
    mat(palette.sky, { emissive: palette.sky, emissiveIntensity: 0.25 }),
    { p: [0, 1.75, 0] },
    1,
  );
  const g = group([
    box(1.6, 0.2, 1.2, palette.stone, { p: [0, 0.1, 0] }),
    box(0.9, 1.2, 0.6, palette.lavender, { p: [0, 0.8, 0] }),
    box(1.1, 0.12, 0.8, palette.wood, { p: [0, 1.45, 0.05], r: [0.25, 0, 0] }),
    cylinder(0.03, 0.03, 0.3, 4, palette.ink, { p: [0, 1.6, 0] }),
    globe,
  ]);
  return animate(g, (t) => (globe.rotation.y = t * 0.8));
}
