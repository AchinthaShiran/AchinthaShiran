import type { Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico, torus } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';
import { signPlane } from './city';

/** Lighthouse (LinkedIn): rotating beacon. */
export function lighthouse(): Object3D {
  const stripes = [0, 1, 2].map((i) => cylinder(1.12 - i * 0.18, 1.2 - i * 0.18, 0.7, 8, palette.roof, { p: [0, 1.3 + i * 2.0, 0] }));
  const beam = cone(0.9, 6, 6, glowMat(palette.glow, 1, { opacity: 0.35 }), { p: [3, 0, 0], r: [0, 0, Math.PI / 2] });
  beam.castShadow = false;
  const beamPivot = group([beam], { p: [0, 7.4, 0] });
  const g = group([
    cylinder(1.6, 1.8, 0.6, 8, palette.stone, { p: [0, 0.3, 0] }),
    cylinder(0.75, 1.3, 6.4, 8, palette.white, { p: [0, 3.6, 0] }),
    ...stripes,
    cylinder(1.1, 1.1, 0.2, 8, palette.ink, { p: [0, 6.85, 0] }),
    cylinder(0.6, 0.6, 1.0, 8, glowMat(palette.glow, 1.4), { p: [0, 7.4, 0] }),
    cone(0.9, 1.0, 8, palette.roof, { p: [0, 8.4, 0] }),
    box(0.6, 1.0, 0.1, palette.woodDark, { p: [0, 1.0, 1.27] }),
    beamPivot,
  ]);
  return animate(g, (_t, dt) => (beamPivot.rotation.y += dt * 0.9));
}

/** Message in a bottle (email) bobbing on a little sand patch. */
export function bottle(): Object3D {
  const glass = mat(palette.glass, { opacity: 0.75, roughness: 0.2 });
  const b = group([
    cylinder(0.28, 0.32, 0.9, 8, glass, { p: [0, 0, 0] }),
    cylinder(0.1, 0.22, 0.3, 8, glass, { p: [0, 0.6, 0] }),
    cylinder(0.11, 0.11, 0.15, 6, palette.wood, { p: [0, 0.8, 0] }),
    box(0.3, 0.45, 0.02, palette.cream, { p: [0, 0, 0], r: [0, 0.4, 0.1] }),
  ]);
  b.position.set(0, 0.6, 0);
  b.rotation.z = 1.2;
  const g = group([cylinder(1.2, 1.4, 0.2, 9, palette.sand, { p: [0, 0.1, 0] }), ico(0.25, palette.coral, { p: [0.8, 0.25, 0.3] }), b]);
  return animate(g, (t) => {
    b.position.y = 0.6 + Math.sin(t * 2) * 0.08;
    b.rotation.x = Math.sin(t * 1.5) * 0.15;
  });
}

/** Telephone booth (phone). */
export function phoneBooth(): Object3D {
  const glass = glowMat(palette.glass, 0.25, { opacity: 0.6 });
  const sign = signPlane('PHONE', 0.9, 0.3, palette.cream, palette.roof);
  sign.position.set(0, 2.45, 0.58);
  return group([
    box(1.2, 0.15, 1.2, palette.stone, { p: [0, 0.075, 0] }),
    box(1.1, 2.4, 1.1, palette.roof, { p: [0, 1.35, 0] }),
    box(0.8, 1.6, 0.05, glass, { p: [0, 1.25, 0.56] }),
    box(1.25, 0.25, 1.25, palette.roof, { p: [0, 2.7, 0] }),
    box(0.2, 0.3, 0.1, palette.ink, { p: [0.2, 1.4, 0.4] }),
    sign,
  ]);
}

/** Telescope (other profiles). */
export function telescope(): Object3D {
  const tube = group([cylinder(0.18, 0.26, 1.6, 8, palette.roofBlue, { r: [Math.PI / 2, 0, 0] }), cylinder(0.27, 0.27, 0.1, 8, palette.sunshine, { p: [0, 0, 0.8], r: [Math.PI / 2, 0, 0] })], { p: [0, 1.5, 0], r: [-0.35, 0, 0] });
  const g = group([
    cylinder(0.04, 0.04, 1.4, 4, palette.ink, { p: [0.3, 0.7, -0.2], r: [0.2, 0, -0.2] }),
    cylinder(0.04, 0.04, 1.4, 4, palette.ink, { p: [-0.3, 0.7, -0.2], r: [0.2, 0, 0.2] }),
    cylinder(0.04, 0.04, 1.4, 4, palette.ink, { p: [0, 0.7, 0.3], r: [-0.3, 0, 0] }),
    tube,
  ]);
  return animate(g, (t) => (tube.rotation.y = Math.sin(t * 0.4) * 0.5));
}

export function pier(): Object3D {
  const planks = Array.from({ length: 9 }, (_, i) => box(2.4, 0.15, 0.7, i % 2 ? palette.wood : '#C99467', { p: [0, 0, i * 0.75] }));
  const posts = [0, 3, 6].flatMap((i) => [cylinder(0.12, 0.12, 2.2, 5, palette.woodDark, { p: [-1.1, -0.9, i * 0.75 + 0.3] }), cylinder(0.12, 0.12, 2.2, 5, palette.woodDark, { p: [1.1, -0.9, i * 0.75 + 0.3] })]);
  return group([...planks, ...posts]);
}

export function boat(): Object3D {
  const sail = cone(1.0, 2.2, 3, mat(palette.cream, { doubleSide: true }), { p: [0, 1.9, 0], s: [0.1, 1, 1] });
  const g = group([
    box(1.2, 0.5, 2.6, palette.wood, { p: [0, 0.25, 0] }),
    cone(0.6, 0.8, 4, palette.wood, { p: [0, 0.25, 1.6], r: [Math.PI / 2, Math.PI / 4, 0], s: [1.4, 1, 0.6] }),
    box(1.0, 0.1, 2.2, palette.woodDark, { p: [0, 0.52, 0] }),
    cylinder(0.05, 0.05, 2.6, 4, palette.woodDark, { p: [0, 1.6, 0] }),
    sail,
  ]);
  return animate(g, (t) => {
    g.rotation.z = Math.sin(t * 1.2) * 0.06;
    g.position.y = Math.sin(t * 1.6) * 0.1;
  });
}

/** Closing message arch at the entrance of Horizon Island. */
export function welcomeArch(): Object3D {
  const sign = signPlane("LET'S CONNECT", 3.2, 0.8, palette.coral, palette.white);
  sign.position.set(0, 3.25, 0.2);
  const flowers = [-1.6, 1.6].map((x) => ico(0.35, palette.lavender, { p: [x, 3.0, 0.1] }));
  return group([
    cylinder(0.18, 0.22, 3.2, 6, palette.wood, { p: [-1.6, 1.6, 0] }),
    cylinder(0.18, 0.22, 3.2, 6, palette.wood, { p: [1.6, 1.6, 0] }),
    torus(1.6, 0.16, mat(palette.leaf, { sway: 0.04 }), { p: [0, 3.2, 0] }, Math.PI, 5, 12),
    sign,
    ...flowers,
  ]);
}
