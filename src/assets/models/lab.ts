import type { Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico, octa, torus } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';
import { signPlane } from './city';

const ENERGY = '#7FE7D9';

/** SAGE Agentic Platform Core: a glowing reactor with orbiting agent nodes. */
export function reactorCore(): Object3D {
  const core = ico(1.3, glowMat(ENERGY, 1.1, { unique: true }), { p: [0, 3.6, 0] }, 1);
  const rings = [0, 1].map((i) =>
    torus(
      2.1 + i * 0.5,
      0.08,
      glowMat(i ? palette.lavender : palette.sunshine, 0.9),
      { p: [0, 3.6, 0] },
      Math.PI * 2,
      4,
      24,
    ),
  );
  const nodes = [0, 1, 2, 3, 4].map((i) =>
    octa(
      0.32,
      glowMat(
        [palette.coral, palette.sky, palette.sunshine, palette.lavender, palette.meadow][i] ?? palette.sky,
        1,
      ),
    ),
  );
  const orbit = group(nodes);
  const pillars = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i / 6) * Math.PI * 2;
    return box(0.4, 2.2, 0.4, palette.metal, { p: [Math.sin(a) * 2.6, 1.3, Math.cos(a) * 2.6] });
  });
  const g = group([
    cylinder(3.4, 3.8, 0.6, 8, palette.metalDark, { p: [0, 0.3, 0] }),
    cylinder(2.8, 3.0, 0.3, 8, palette.lavender, { p: [0, 0.75, 0] }),
    cylinder(1.0, 1.4, 1.6, 8, palette.metal, { p: [0, 1.6, 0] }),
    ...pillars,
    core,
    ...rings,
    orbit,
    cone(0.6, 0.8, 6, palette.metalDark, { p: [0, 5.4, 0], r: [Math.PI, 0, 0] }),
  ]);
  return animate(g, (t) => {
    core.rotation.y = t * 0.4;
    core.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);
    rings[0]!.rotation.set(Math.PI / 2 + Math.sin(t * 0.5) * 0.3, t * 0.6, 0);
    rings[1]!.rotation.set(Math.PI / 2.5, -t * 0.4, Math.cos(t * 0.4) * 0.3);
    nodes.forEach((n, i) => {
      const a = t * 0.7 + (i / nodes.length) * Math.PI * 2;
      n.position.set(Math.sin(a) * 3.1, 3.6 + Math.sin(a * 2) * 0.6, Math.cos(a) * 3.1);
      n.rotation.y = t * 2;
    });
  });
}

/** Agent Workshop: an assembly table producing little agent cubes of different types. */
export function agentWorkshop(): Object3D {
  const colors = [palette.coral, palette.sky, palette.sunshine, palette.meadow, palette.lavender];
  const agents = colors.map((c, i) =>
    box(0.45, 0.45, 0.45, glowMat(c, 0.6), { p: [-1.6 + i * 0.8, 1.35, 0.2] }),
  );
  const arm = group(
    [
      box(0.15, 1.2, 0.15, palette.metalDark, { p: [0, -0.6, 0] }),
      cone(0.2, 0.3, 4, palette.coral, { p: [0, -1.3, 0], r: [Math.PI, 0, 0] }),
    ],
    { p: [0, 3.3, -0.2] },
  );
  const g = group([
    box(4.4, 0.25, 0.6, palette.metalDark, { p: [0, 1.0, 0.2] }),
    box(4.6, 1.0, 1.8, palette.metal, { p: [0, 0.5, -0.4] }),
    box(4.8, 0.2, 2.2, palette.lavender, { p: [0, 3.5, -0.4] }),
    box(0.2, 3.5, 0.2, palette.metalDark, { p: [-2.3, 1.75, -1.3] }),
    box(0.2, 3.5, 0.2, palette.metalDark, { p: [2.3, 1.75, -1.3] }),
    box(4.0, 1.6, 0.1, glowMat(palette.sky, 0.4), { p: [0, 2.2, -1.4] }),
    ...agents,
    arm,
  ]);
  return animate(g, (t) => {
    agents.forEach((a, i) => {
      a.position.y = 1.35 + Math.abs(Math.sin(t * 2 + i)) * 0.25;
      a.rotation.y = t + i;
    });
    arm.position.x = Math.sin(t * 0.9) * 1.6;
  });
}

/** Governance Station: a control tower with observability gauges. */
export function governanceStation(): Object3D {
  const dish = group(
    [
      cone(0.9, 0.4, 8, palette.cream, { r: [Math.PI, 0, 0] }),
      cylinder(0.05, 0.05, 0.6, 4, palette.metalDark, { p: [0, 0.3, 0] }),
    ],
    { p: [0, 5.2, 0] },
  );
  const bars = [0, 1, 2, 3].map((i) =>
    box(
      0.25,
      1,
      0.05,
      glowMat([palette.meadow, palette.sunshine, palette.sky, palette.coral][i] ?? palette.sky, 0.9),
      { p: [-0.55 + i * 0.37, 2.5, 1.06] },
    ),
  );
  const g = group([
    cylinder(1.6, 1.9, 0.4, 6, palette.metalDark, { p: [0, 0.2, 0] }),
    cylinder(1.0, 1.3, 3.6, 6, palette.cream, { p: [0, 2.2, 0] }),
    cylinder(1.6, 1.3, 0.9, 6, palette.lavender, { p: [0, 4.45, 0] }),
    box(1.6, 1.6, 0.1, palette.ink, { p: [0, 2.5, 1.0] }),
    ...bars,
    cylinder(0.15, 0.15, 0.2, 6, glowMat(palette.meadow, 1), {
      p: [0.9, 4.45, 1.05],
      r: [Math.PI / 2, 0, 0],
    }),
    cylinder(0.15, 0.15, 0.2, 6, glowMat(palette.coral, 1), {
      p: [-0.9, 4.45, 1.05],
      r: [Math.PI / 2, 0, 0],
    }),
    dish,
  ]);
  return animate(g, (t) => {
    dish.rotation.y = t * 0.6;
    bars.forEach((b, i) => {
      const k = 0.4 + Math.abs(Math.sin(t * 1.4 + i * 1.3)) * 0.6;
      b.scale.y = k;
      b.position.y = 2.0 + k * 0.5;
    });
  });
}

/** Architecture Machine: modular blocks (microservices) slotting into a frame (micro-frontends). */
export function architectureMachine(): Object3D {
  const colors = [
    palette.sky,
    palette.meadow,
    palette.coral,
    palette.sunshine,
    palette.lavender,
    palette.sky,
  ];
  const modules = colors.map((c, i) =>
    box(0.8, 0.8, 0.8, c, { p: [-1.1 + (i % 3) * 1.1, 1.2 + Math.floor(i / 3) * 1.1, 0] }),
  );
  const gears = [0, 1].map((i) =>
    cylinder(0.6, 0.6, 0.2, 8, palette.metalDark, { p: [i ? 1.9 : -1.9, 3.2, 0.3], r: [Math.PI / 2, 0, 0] }),
  );
  const g = group([
    box(4.2, 0.4, 2, palette.metalDark, { p: [0, 0.2, 0] }),
    box(0.2, 3.4, 1.6, palette.metal, { p: [-1.8, 2.0, 0] }),
    box(0.2, 3.4, 1.6, palette.metal, { p: [1.8, 2.0, 0] }),
    box(3.8, 0.2, 1.6, palette.metal, { p: [0, 3.7, 0] }),
    ...modules,
    ...gears,
    cylinder(0.2, 0.2, 2.5, 6, glowMat(ENERGY, 0.8), { p: [0, 4.4, 0], r: [0, 0, Math.PI / 2] }),
  ]);
  return animate(g, (t) => {
    modules.forEach((m, i) => (m.position.z = Math.max(0, Math.sin(t * 1.2 + i * 1.1)) * 0.5));
    gears[0]!.rotation.y = t;
    gears[1]!.rotation.y = -t;
  });
}

/** Identity Gate: an arch with a scanning beam (auth + request validation). */
export function identityGate(): Object3D {
  const beam = box(2.6, 0.08, 0.08, glowMat(palette.meadow, 1.4, { unique: true }), { p: [0, 1.5, 0] });
  const key = group(
    [
      torus(0.3, 0.08, palette.sunshine, {}, Math.PI * 2, 4, 10),
      box(0.12, 0.7, 0.08, palette.sunshine, { p: [0, -0.6, 0] }),
      box(0.25, 0.1, 0.08, palette.sunshine, { p: [0.12, -0.8, 0] }),
    ],
    { p: [0, 4.4, 0] },
  );
  const g = group([
    box(0.8, 3.6, 0.8, palette.lavender, { p: [-1.7, 1.8, 0] }),
    box(0.8, 3.6, 0.8, palette.lavender, { p: [1.7, 1.8, 0] }),
    box(4.2, 0.7, 0.9, palette.lavender, { p: [0, 3.75, 0] }),
    box(0.3, 2.6, 0.05, glowMat(palette.sky, 0.5), { p: [-1.7, 1.8, 0.42] }),
    box(0.3, 2.6, 0.05, glowMat(palette.sky, 0.5), { p: [1.7, 1.8, 0.42] }),
    beam,
    key,
  ]);
  return animate(g, (t) => {
    beam.position.y = 0.4 + (Math.sin(t * 1.5) * 0.5 + 0.5) * 2.8;
    key.rotation.y = t * 1.2;
  });
}

/** Cloud-Agnostic Gateway: a portal with interchangeable clouds orbiting. */
export function cloudGateway(): Object3D {
  const white = mat(palette.white, { emissive: '#ffffff', emissiveIntensity: 0.2 });
  const clouds = [0, 1, 2].map(() =>
    group([
      ico(0.5, white),
      ico(0.35, white, { p: [0.45, -0.1, 0] }),
      ico(0.35, white, { p: [-0.45, -0.1, 0] }),
    ]),
  );
  const portal = torus(1.6, 0.3, palette.sky, { p: [0, 2.4, 0] }, Math.PI * 2, 6, 16);
  const g = group([
    cylinder(1.8, 2.0, 0.4, 8, palette.metalDark, { p: [0, 0.2, 0] }),
    box(0.4, 1.2, 0.4, palette.metal, { p: [0, 0.8, 0] }),
    portal,
    cylinder(1.35, 1.35, 0.05, 16, glowMat(palette.sky, 0.7, { opacity: 0.6 }), {
      p: [0, 2.4, 0],
      r: [Math.PI / 2, 0, 0],
    }),
    ...clouds,
  ]);
  return animate(g, (t) => {
    clouds.forEach((c, i) => {
      const a = t * 0.6 + (i / 3) * Math.PI * 2;
      c.position.set(Math.sin(a) * 2.4, 2.4 + Math.cos(a * 1.5) * 0.4, Math.cos(a) * 0.8);
    });
  });
}

/** Colourful energy tube arch (decor). */
export function energyTube(): Object3D {
  const pulse = ico(0.25, glowMat(palette.glow, 1.5));
  const g = group([
    torus(2.0, 0.16, glowMat(ENERGY, 0.7), { p: [0, 0, 0] }, Math.PI, 5, 14),
    cylinder(0.3, 0.3, 0.3, 6, palette.metalDark, { p: [-2, 0.15, 0] }),
    cylinder(0.3, 0.3, 0.3, 6, palette.metalDark, { p: [2, 0.15, 0] }),
    pulse,
  ]);
  return animate(g, (t) => {
    const a = (t * 0.8) % Math.PI;
    pulse.position.set(Math.cos(a) * 2, Math.sin(a) * 2, 0);
  });
}

export function dataDisplay(): Object3D {
  const bars = [0, 1, 2, 3, 4].map((i) =>
    box(0.3, 1, 0.05, glowMat(i % 2 ? palette.sky : palette.meadow, 1), { p: [-0.8 + i * 0.4, 1.8, 0.06] }),
  );
  const g = group([
    box(0.15, 1.4, 0.15, palette.metalDark, { p: [0, 0.7, 0] }),
    box(2.2, 1.4, 0.1, palette.ink, { p: [0, 1.9, 0] }),
    ...bars,
  ]);
  return animate(g, (t) => bars.forEach((b, i) => (b.scale.y = 0.3 + Math.abs(Math.sin(t * 2 + i)) * 0.8)));
}

export function labSign(): Object3D {
  const sign = signPlane('INNOVATION LAB', 3.6, 0.9, palette.lavender, palette.white);
  sign.position.set(0, 2.2, 0.08);
  return group([
    box(0.15, 2.6, 0.15, palette.metalDark, { p: [-1.6, 1.3, 0] }),
    box(0.15, 2.6, 0.15, palette.metalDark, { p: [1.6, 1.3, 0] }),
    box(3.8, 1.1, 0.12, palette.metal, { p: [0, 2.2, 0] }),
    sign,
  ]);
}
