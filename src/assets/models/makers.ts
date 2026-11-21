/**
 * Models for the personal project islands ("Makers' Row", ADR-005). Each landmark visualizes one feature
 * described in the project's public sources — nothing is decoration without a meaning.
 */
import type { Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico, octa, torus } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';
import type { ModelProps } from '../types';
import { buildCharacter } from './characters';
import { signPlane } from './city';

const TEAL = '#7FE7D9';
const GOLD = '#FFC94D';
const PIG = '#F7A8B8';
const PIG_DARK = '#EE8BA2';
const CARDBOARD = '#D9B98C';
const SCREEN = '#16303A';
const GREEN = '#6BD68A';
const RED = '#F26B6B';

const text = (v: ModelProps[string], fallback: string) => (typeof v === 'string' ? v : fallback);
const pick = <T>(list: readonly T[], i: number): T => list[i % list.length] as T;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Chat bubble facing +Z with a downward tail. */
function bubble(color: string, w: number, h: number): Object3D {
  return group([
    box(w, h, 0.12, color),
    cone(0.18, 0.3, 3, color, { p: [-w * 0.25, -h / 2 - 0.12, 0], r: [0, 0, Math.PI] }),
  ]);
}

/** Gabled roof prism (same construction as the cosy house). */
const roofPrism = (w: number, h: number, d: number, color: string, y: number) =>
  cylinder(h, h, d, 3, color, { p: [0, y, 0], r: [Math.PI / 2, 0, Math.PI / 2], s: [w / (h * 1.73), 1, 1] });

/** Generic island sign: props `label`, `color`, `ink`. */
export function islandSign(props: ModelProps): Object3D {
  const plate = signPlane(
    text(props.label, ''),
    3.4,
    0.9,
    text(props.color, palette.cream),
    text(props.ink, palette.ink),
  );
  plate.position.set(0, 2.2, 0.08);
  return group([
    cylinder(0.1, 0.12, 2.7, 5, palette.woodDark, { p: [-1.6, 1.35, 0] }),
    cylinder(0.1, 0.12, 2.7, 5, palette.woodDark, { p: [1.6, 1.35, 0] }),
    box(3.6, 1.1, 0.12, palette.wood, { p: [0, 2.2, 0] }),
    plate,
  ]);
}

/* ------------------------------------------------------------------ Tala Workshop */

/** Tala Terminal: chat in plain language — a terminal typing out lines, with two chat bubbles. */
export function talaTerminal(): Object3D {
  const widths = [1.6, 2.2, 1.2, 1.9, 0.9];
  const lines = widths.map((w, i) =>
    box(w, 0.12, 0.02, glowMat(i % 2 ? palette.sunshine : TEAL, 1), {
      p: [-1.35 + w / 2, 3.5 - i * 0.34, 0.3],
    }),
  );
  const cursor = box(0.16, 0.26, 0.02, glowMat(TEAL, 1.6, { unique: true }), { p: [-1.25, 1.8, 0.3] });
  const user = bubble(palette.coral, 1.7, 0.7);
  user.position.set(-2.7, 4.6, 0.4);
  const reply = bubble(TEAL, 1.9, 0.7);
  reply.position.set(2.7, 4.1, 0.4);
  const monitor = group(
    [
      box(3.6, 2.7, 0.5, '#2B3345', { p: [0, 2.55, 0] }),
      box(3.2, 2.3, 0.05, SCREEN, { p: [0, 2.55, 0.26] }),
      ...lines,
      cursor,
      cylinder(0.25, 0.45, 0.4, 6, palette.metal, { p: [0, 1.18, 0] }),
    ],
    { p: [0, 0, -0.5] },
  );
  const legSpots: [number, number][] = [
    [-2, -1.2],
    [2, -1.2],
    [-2, 1.2],
    [2, 1.2],
  ];
  const g = group([
    box(4.4, 0.15, 2.8, palette.wood, { p: [0, 0.9, 0] }),
    ...legSpots.map(([x, z]) => box(0.15, 0.9, 0.15, palette.woodDark, { p: [x, 0.45, z] })),
    monitor,
    box(2.2, 0.08, 0.7, palette.cream, { p: [0, 1.02, 0.7] }),
    user,
    reply,
  ]);
  return animate(g, (t) => {
    cursor.visible = Math.sin(t * 6) > 0;
    const typed = (t * 0.8) % 7;
    lines.forEach((l, i) => (l.visible = typed > i * 0.9 + 0.3));
    user.position.y = 4.6 + Math.sin(t * 2) * 0.1;
    reply.position.y = 4.1 + Math.sin(t * 2 + 1.5) * 0.1;
  });
}

/** Pack Library: shelves of rolled YAML scrolls — one logical tool per scroll. */
export function packShelf(): Object3D {
  const colors = [TEAL, palette.sunshine, palette.coral, palette.lavender, palette.sky, palette.meadow];
  const scrolls = [0, 1, 2].flatMap((row) =>
    [0, 1, 2, 3].map((k) =>
      cylinder(0.24, 0.24, 0.9, 8, pick(colors, row * 4 + k), {
        p: [-1.2 + k * 0.8, 0.82 + row * 0.85, 0],
        r: [Math.PI / 2, 0, 0],
      }),
    ),
  );
  const boards = [0.4, 1.25, 2.1, 2.95].map((y) => box(3.6, 0.1, 1.0, palette.wood, { p: [0, y, 0] }));
  const floating = cylinder(0.2, 0.2, 1.0, 8, palette.cream, { p: [0, 4.3, 0], r: [0, 0, Math.PI / 2] });
  const label = signPlane('YAML PACKS', 2.4, 0.5, palette.cream, palette.ink);
  label.position.set(0, 3.5, 0.38);
  const g = group([
    box(3.6, 3.0, 0.1, palette.woodDark, { p: [0, 1.6, -0.5] }),
    box(0.1, 3.0, 1.0, palette.wood, { p: [-1.85, 1.6, 0] }),
    box(0.1, 3.0, 1.0, palette.wood, { p: [1.85, 1.6, 0] }),
    ...boards,
    ...scrolls,
    box(2.6, 0.6, 0.14, palette.coral, { p: [0, 3.5, 0.3] }),
    label,
    floating,
  ]);
  return animate(g, (t) => {
    floating.position.y = 4.3 + Math.sin(t * 1.6) * 0.12;
    floating.rotation.y = t * 0.8;
  });
}

/** Approval Gate: risk lights and a barrier that only lifts once you approve. */
export function approvalGate(): Object3D {
  const lightMats = [
    glowMat(GREEN, 1.3, { unique: true }),
    glowMat(palette.sunshine, 1.3, { unique: true }),
    glowMat(RED, 1.3, { unique: true }),
  ];
  const lights = lightMats.map((m, i) => ico(0.28, m, { p: [-0.9 + i * 0.9, 3.55, 0.4] }, 1));
  const arm = box(3.0, 0.2, 0.2, RED, { p: [1.5, 0, 0] });
  const stripes = [0, 1, 2].map((i) => box(0.35, 0.22, 0.22, palette.white, { p: [0.5 + i * 0.9, 0, 0] }));
  const pivot = group([arm, ...stripes], { p: [-1.5, 1.2, 0.5] });
  const prompt = signPlane('Run it? [y/N]', 2.2, 0.5, palette.cream, palette.ink);
  prompt.position.set(0, 2.75, 0.4);
  const g = group([
    box(0.6, 3.8, 0.7, palette.metal, { p: [-2.1, 1.9, 0] }),
    box(0.6, 3.8, 0.7, palette.metal, { p: [2.1, 1.9, 0] }),
    box(4.8, 0.8, 0.7, palette.lavender, { p: [0, 3.7, 0] }),
    ...lights,
    box(0.06, 0.4, 0.06, palette.ink, { p: [-0.8, 3.2, 0.4] }),
    box(0.06, 0.4, 0.06, palette.ink, { p: [0.8, 3.2, 0.4] }),
    prompt,
    pivot,
  ]);
  return animate(g, (t) => {
    const p = t % 6;
    const lift = p < 2 ? 0 : p < 3 ? p - 2 : p < 5 ? 1 : 6 - p;
    pivot.rotation.z = lift * 1.2;
    lightMats[0]!.emissiveIntensity = lift > 0.9 ? 1.7 : 0.25;
    lightMats[1]!.emissiveIntensity = lift > 0.05 && lift < 0.9 ? 1.7 : 0.25;
    lightMats[2]!.emissiveIntensity = lift <= 0.05 ? 1.7 : 0.25;
  });
}

/** Local Brain: the model runs on your own machine — a glowing core under a glass dome. */
export function localBrain(): Object3D {
  const core = ico(0.7, glowMat(TEAL, 1.1, { unique: true }), { p: [0, 2.2, 0] }, 1);
  const rings = [0, 1].map((i) =>
    torus(
      1.05 + i * 0.12,
      0.05,
      glowMat(i ? palette.lavender : palette.sunshine, 0.9),
      { p: [0, 2.2, 0] },
      Math.PI * 2,
      4,
      20,
    ),
  );
  const label = signPlane('100% LOCAL', 1.8, 0.45, palette.cream, palette.ink);
  label.position.set(0, 0.62, 1.34);
  const g = group([
    cylinder(1.6, 1.9, 0.5, 8, palette.metalDark, { p: [0, 0.25, 0] }),
    cylinder(1.0, 1.3, 0.8, 8, palette.metal, { p: [0, 0.9, 0] }),
    label,
    core,
    ...rings,
    ico(1.5, mat(palette.glass, { opacity: 0.28, roughness: 0.2 }), { p: [0, 2.2, 0] }, 1),
  ]);
  return animate(g, (t) => {
    core.rotation.y = t * 0.5;
    core.scale.setScalar(1 + Math.sin(t * 2.4) * 0.07);
    rings[0]!.rotation.set(Math.PI / 2 + Math.sin(t * 0.6) * 0.4, t * 0.7, 0);
    rings[1]!.rotation.set(Math.PI / 2.4, -t * 0.5, Math.cos(t * 0.5) * 0.4);
  });
}

/** Cross-platform Dock: three pads — Windows, macOS and Linux — wired to one core. */
export function platformDock(): Object3D {
  const colors = [palette.sky, palette.lavender, palette.sunshine];
  const labels = ['Windows', 'macOS', 'Linux'];
  const orb = octa(0.55, glowMat(TEAL, 1.1, { unique: true }), { p: [0, 1.5, 0] });
  const parts: Object3D[] = [cylinder(0.5, 0.6, 0.5, 8, palette.metalDark, { p: [0, 0.25, 0] }), orb];
  labels.forEach((label, i) => {
    const a = (i / 3) * Math.PI * 2 + Math.PI;
    const x = Math.sin(a) * 1.8;
    const z = Math.cos(a) * 1.8;
    const plate = signPlane(label, 1.3, 0.38, pick(colors, i), palette.ink);
    plate.position.set(0, 1.45, 0.06);
    const pad = group(
      [
        cylinder(0.85, 0.95, 0.3, 8, palette.stone, { p: [0, 0.15, 0] }),
        cylinder(0.7, 0.7, 0.06, 8, glowMat(pick(colors, i), 0.7), { p: [0, 0.33, 0] }),
        box(0.08, 0.9, 0.08, palette.woodDark, { p: [0, 0.9, 0] }),
        box(1.45, 0.5, 0.08, palette.cream, { p: [0, 1.45, 0] }),
        plate,
      ],
      { p: [x, 0, z] },
    );
    pad.rotation.y = a;
    parts.push(pad, box(0.12, 0.1, 1.7, glowMat(TEAL, 0.8), { p: [x / 2, 0.55, z / 2], r: [0, a, 0] }));
  });
  return animate(group(parts), (t) => {
    orb.rotation.y = t;
    orb.position.y = 1.5 + Math.sin(t * 2) * 0.1;
  });
}

/** Tool Funnel: about a hundred tools go in, only four to eight reach the model. */
export function toolFunnel(): Object3D {
  const colors = [palette.coral, palette.sunshine, palette.sky, palette.lavender, palette.meadow];
  const falling = Array.from({ length: 12 }, (_, i) => box(0.3, 0.3, 0.3, pick(colors, i)));
  const chosen = [0, 1, 2, 3].map((i) =>
    box(0.34, 0.34, 0.34, glowMat(TEAL, 0.9), { p: [-0.6 + i * 0.4, 0.97, 0] }),
  );
  const label = signPlane('100 tools → 4–8', 2.4, 0.5, palette.cream, palette.ink);
  label.position.set(0, 1.5, 1.35);
  const g = group([
    ...[0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI * 2;
      return cylinder(0.08, 0.1, 3.4, 5, palette.metalDark, {
        p: [Math.sin(a) * 1.15, 1.7, Math.cos(a) * 1.15],
      });
    }),
    cone(1.5, 1.6, 10, mat(palette.metal, { doubleSide: true }), { p: [0, 3.4, 0], r: [Math.PI, 0, 0] }),
    cylinder(0.18, 0.18, 1.0, 6, palette.metalDark, { p: [0, 2.1, 0] }),
    box(1.9, 0.15, 1.0, palette.lavender, { p: [0, 0.8, 0] }),
    ...chosen,
    box(0.08, 1.4, 0.08, palette.woodDark, { p: [0, 0.7, 1.35] }),
    label,
    ...falling,
  ]);
  return animate(g, (t) => {
    falling.forEach((c, i) => {
      const k = (t * 0.45 + i / falling.length) % 1;
      const r = 1.3 * (1 - k);
      const a = i * 2.1 + t * 1.2;
      c.position.set(Math.sin(a) * r, 5.4 - k * 2.8, Math.cos(a) * r);
      c.rotation.set(t * 2 + i, t + i, 0);
      c.scale.setScalar(1 - k * 0.5);
    });
  });
}

/* ------------------------------------------------------------------ Skill Up Academy */

/** Learning Hall: a schoolhouse with a swinging bell. */
export function learningHall(): Object3D {
  const window = glowMat(palette.glow, 0.5);
  const sign = signPlane('SKILL UP', 3.4, 0.7, palette.sunshine, palette.ink);
  sign.position.set(0, 3.0, 2.07);
  const bell = cone(0.28, 0.5, 8, GOLD, { p: [0, -0.25, 0] });
  const bellPivot = group([bell], { p: [0, 6.75, 0] });
  const posts = [
    [-0.55, -0.55],
    [0.55, -0.55],
    [-0.55, 0.55],
    [0.55, 0.55],
  ] as const;
  const g = group([
    box(6.4, 0.4, 4.6, palette.stone, { p: [0, 0.2, 0] }),
    box(6, 3.2, 4, palette.cream, { p: [0, 2, 0] }),
    roofPrism(6.6, 1.5, 4.8, palette.roof, 4.25),
    ...posts.map(([x, z]) => cylinder(0.08, 0.08, 1.6, 5, palette.woodDark, { p: [x, 6.0, z] })),
    cone(1.0, 1.2, 4, palette.roof, { p: [0, 7.4, 0], r: [0, Math.PI / 4, 0] }),
    bellPivot,
    box(1.2, 2.0, 0.12, palette.woodDark, { p: [0, 1.4, 2.02] }),
    box(2.0, 0.15, 0.6, palette.stone, { p: [0, 0.47, 2.3] }),
    box(0.9, 0.9, 0.1, window, { p: [-2.0, 2.3, 2.02] }),
    box(0.9, 0.9, 0.1, window, { p: [2.0, 2.3, 2.02] }),
    box(0.9, 0.9, 0.1, window, { p: [-2.0, 2.3, -2.02] }),
    sign,
  ]);
  return animate(g, (t) => (bellPivot.rotation.z = Math.sin(t * 2.2) * 0.35));
}

/** Study-plan board: tasks complete one by one — a personalized plan in action. */
export function planDesk(): Object3D {
  const todo = mat(palette.white);
  const done = glowMat(GREEN, 0.8);
  const cells = Array.from({ length: 15 }, (_, i) => ({ c: i % 5, r: Math.floor(i / 5) }));
  const base = cells.map(({ c, r }) =>
    box(0.5, 0.45, 0.04, todo, { p: [-1.2 + c * 0.6, 3.0 - r * 0.55, -0.17] }),
  );
  const checks = cells.map(({ c, r }) =>
    box(0.5, 0.45, 0.05, done, { p: [-1.2 + c * 0.6, 3.0 - r * 0.55, -0.13] }),
  );
  const g = group([
    box(3.5, 2.2, 0.12, palette.woodDark, { p: [0, 2.45, -0.3] }),
    box(3.3, 2.0, 0.06, palette.cream, { p: [0, 2.45, -0.22] }),
    ...base,
    ...checks,
    cylinder(0.08, 0.08, 1.4, 5, palette.woodDark, { p: [-1.6, 0.7, -0.3] }),
    cylinder(0.08, 0.08, 1.4, 5, palette.woodDark, { p: [1.6, 0.7, -0.3] }),
    box(2.8, 0.12, 1.2, palette.wood, { p: [0, 0.9, 0.5] }),
    box(0.12, 0.9, 0.12, palette.woodDark, { p: [-1.3, 0.45, 0.9] }),
    box(0.12, 0.9, 0.12, palette.woodDark, { p: [1.3, 0.45, 0.9] }),
    box(0.6, 0.04, 0.8, palette.sky, { p: [-0.7, 1.0, 0.5], r: [0, 0.2, 0] }),
    box(0.5, 0.05, 0.7, palette.white, { p: [-0.7, 1.04, 0.5], r: [0, 0.2, 0] }),
    cylinder(0.12, 0.12, 0.25, 6, palette.coral, { p: [0.9, 1.1, 0.5] }),
  ]);
  return animate(g, (t) => {
    const q = ((t * 0.25) % 1) * 17;
    checks.forEach((c, i) => c.scale.setScalar(Math.max(0.001, clamp01(q - i))));
  });
}

/** Roadmap: stepping stones winding up around a milestone flag, with a marker climbing them. */
export function roadmapTrail(): Object3D {
  const colors = [
    palette.sky,
    palette.meadow,
    palette.sunshine,
    palette.coral,
    palette.lavender,
    palette.sky,
  ];
  const steps = colors.map((c, i) => {
    const a = i * 0.95;
    return { x: Math.sin(a) * 1.7, y: 0.4 + i * 0.4, z: Math.cos(a) * 1.7, c };
  });
  const marker = ico(0.24, glowMat(palette.sunshine, 1.1, { unique: true }));
  const flagPole = (x: number, y: number, z: number, color: string) => [
    cylinder(0.03, 0.03, 0.9, 4, palette.woodDark, { p: [x, y + 0.55, z] }),
    box(0.4, 0.25, 0.03, color, { p: [x + 0.2, y + 0.85, z] }),
  ];
  const g = group([
    cylinder(2.5, 2.7, 0.3, 10, palette.stone, { p: [0, 0.15, 0] }),
    ...steps.map((s) => cylinder(0.55, 0.6, 0.24, 8, s.c, { p: [s.x, s.y, s.z] })),
    ...flagPole(steps[2]!.x, steps[2]!.y, steps[2]!.z, palette.coral),
    cylinder(0.14, 0.2, 4.2, 6, palette.woodDark, { p: [0, 2.4, 0] }),
    box(1.2, 0.7, 0.05, palette.sunshine, { p: [0.6, 4.2, 0] }),
    ico(0.15, palette.sunshine, { p: [0, 4.6, 0] }),
    marker,
  ]);
  return animate(g, (t) => {
    const f = ((t * 0.3) % 1) * (steps.length - 1);
    const i = Math.min(steps.length - 2, Math.floor(f));
    const k = f - i;
    const a = steps[i]!;
    const b = steps[i + 1]!;
    marker.position.set(
      a.x + (b.x - a.x) * k,
      a.y + (b.y - a.y) * k + 0.5 + Math.sin(k * Math.PI) * 0.35,
      a.z + (b.z - a.z) * k,
    );
  });
}

/** Resource library: books, a video screen and links — curated, in one place. */
export function resourceLibrary(): Object3D {
  const colors = [palette.coral, palette.sky, palette.sunshine, palette.meadow, palette.lavender];
  const books = [0, 1, 2].flatMap((row) =>
    Array.from({ length: 10 }, (_, i) =>
      box(0.22, 0.55 + ((i + row) % 3) * 0.12, 0.6, pick(colors, i + row), {
        p: [-1.35 + i * 0.3, 0.3 + row * 0.9 + (0.55 + ((i + row) % 3) * 0.12) / 2 + 0.05, 0],
      }),
    ),
  );
  const g = group([
    box(3.2, 3.0, 0.12, palette.woodDark, { p: [0, 1.6, -0.35] }),
    box(0.12, 3.0, 0.8, palette.wood, { p: [-1.6, 1.6, 0] }),
    box(0.12, 3.0, 0.8, palette.wood, { p: [1.6, 1.6, 0] }),
    ...[0.1, 1.0, 1.9, 3.1].map((y) => box(3.2, 0.1, 0.8, palette.wood, { p: [0, y, 0] })),
    ...books,
    box(1.5, 0.95, 0.1, palette.ink, { p: [0, 3.75, -0.3] }),
    box(1.35, 0.8, 0.04, glowMat(palette.sky, 0.7), { p: [0, 3.75, -0.24] }),
    cone(0.22, 0.3, 3, palette.white, { p: [0.03, 3.75, -0.2], r: [0, 0, -Math.PI / 2] }),
    torus(0.18, 0.05, palette.sunshine, { p: [1.0, 3.5, 0.1] }, Math.PI * 2, 4, 10),
    torus(0.18, 0.05, palette.coral, { p: [1.2, 3.6, 0.1], r: [0, 0, 1] }, Math.PI * 2, 4, 10),
  ]);
  return g;
}

/** AI learning companion: a friendly coach bot that answers questions. */
export function companionBot(): Object3D {
  const eyes = [-0.22, 0.22].map((x) => box(0.14, 0.16, 0.04, glowMat(TEAL, 1.3), { p: [x, 0.05, 0.5] }));
  const head = group(
    [
      ico(0.85, palette.white, { s: [1.1, 0.95, 1] }, 1),
      box(0.9, 0.42, 0.12, '#1F2A44', { p: [0, 0.05, 0.62] }),
      ...eyes.map((e) => e),
      cylinder(0.03, 0.03, 0.45, 4, palette.metalDark, { p: [0, 0.95, 0] }),
      ico(0.1, glowMat(palette.coral, 1.2), { p: [0, 1.2, 0] }),
    ],
    { p: [0, 2.0, 0] },
  );
  const dots = [0, 1, 2].map((i) =>
    ico(0.08, glowMat(palette.sky, 1.2, { unique: true }), { p: [-0.35 + i * 0.35, 0, 0.1] }),
  );
  const talk = bubble(palette.white, 1.5, 0.75);
  talk.position.set(1.5, 3.5, 0.2);
  dots.forEach((d) => talk.add(d));
  const g = group([
    cylinder(1.0, 1.2, 0.4, 8, palette.stone, { p: [0, 0.2, 0] }),
    cylinder(0.35, 0.5, 0.7, 8, palette.metal, { p: [0, 0.75, 0] }),
    ico(0.18, palette.sunshine, { p: [-1.05, 1.5, 0.2] }),
    ico(0.18, palette.sunshine, { p: [1.05, 1.5, 0.2] }),
    head,
    talk,
  ]);
  return animate(g, (t) => {
    head.position.y = 2.0 + Math.sin(t * 1.8) * 0.08;
    head.rotation.y = Math.sin(t * 0.7) * 0.3;
    dots.forEach((d, i) => d.scale.setScalar(0.6 + Math.max(0, Math.sin(t * 5 - i * 0.9)) * 0.7));
  });
}

/** Progress tower: ascending bars, phase by phase, up to a star. */
export function progressTower(): Object3D {
  const colors = [palette.sky, palette.meadow, palette.sunshine, palette.coral, palette.lavender];
  const heights = [0.9, 1.5, 2.1, 2.7, 3.3];
  const star = octa(0.42, glowMat(GOLD, 1.2), { p: [1.6, 4.4, 0] });
  const g = group([
    box(4.2, 0.2, 1.4, palette.stone, { p: [0, 0.1, 0] }),
    ...heights.map((h, i) => box(0.7, h, 0.9, pick(colors, i), { p: [-1.6 + i * 0.8, 0.2 + h / 2, 0] })),
    cylinder(0.04, 0.04, 0.7, 4, palette.woodDark, { p: [1.6, 3.85, 0] }),
    star,
  ]);
  return animate(g, (t) => {
    star.rotation.y = t * 1.2;
    star.position.y = 4.4 + Math.sin(t * 2) * 0.1;
  });
}

/* ------------------------------------------------------------------ MySpend Market */

/** MySpend piggy bank with coins dropping in. */
export function piggyBank(): Object3D {
  const coinMat = mat(GOLD, { metalness: 0.4, roughness: 0.35, emissive: GOLD, emissiveIntensity: 0.2 });
  const coins = [0, 1].map(() => cylinder(0.4, 0.4, 0.08, 14, coinMat, { p: [0, 6, -0.1] }));
  const pig = group(
    [
      ico(1.5, PIG, { s: [1.3, 1, 1] }, 1),
      cylinder(0.42, 0.46, 0.4, 8, PIG_DARK, { p: [1.95, -0.05, 0], r: [0, 0, Math.PI / 2] }),
      box(0.08, 0.14, 0.08, palette.ink, { p: [2.17, 0.02, 0.15] }),
      box(0.08, 0.14, 0.08, palette.ink, { p: [2.17, 0.02, -0.15] }),
      cone(0.32, 0.5, 4, PIG_DARK, { p: [1.0, 1.35, 0.7], r: [0.5, 0, -0.3] }),
      cone(0.32, 0.5, 4, PIG_DARK, { p: [1.0, 1.35, -0.7], r: [-0.5, 0, -0.3] }),
      ico(0.1, palette.ink, { p: [1.35, 0.45, 0.78] }),
      ico(0.1, palette.ink, { p: [1.35, 0.45, -0.78] }),
      ...[
        [0.9, 0.7],
        [0.9, -0.7],
        [-0.9, 0.7],
        [-0.9, -0.7],
      ].map(([x, z]) => cylinder(0.28, 0.3, 0.7, 6, PIG_DARK, { p: [x!, -1.25, z!] })),
      torus(0.18, 0.05, PIG_DARK, { p: [-1.95, 0.3, 0] }, Math.PI * 1.5, 4, 8),
      box(0.9, 0.08, 0.22, palette.ink, { p: [-0.1, 1.5, 0] }),
    ],
    { p: [0, 2.9, 0], r: [0, -Math.PI / 2, 0] },
  );
  const g = group([
    cylinder(2.4, 2.7, 1.3, 10, palette.stone, { p: [0, 0.65, 0] }),
    cylinder(2.1, 2.1, 0.06, 10, GOLD, { p: [0, 1.32, 0] }),
    pig,
    ...coins,
  ]);
  return animate(g, (t) => {
    coins.forEach((c, i) => {
      const k = (t * 0.5 + i / 2) % 1;
      c.position.y = 7 - k * 2.6;
      c.rotation.set(t * 2.5 + i, 0, t * 1.5);
    });
  });
}

/** Automatic entries: a phone's payment alerts slide down a chute into the ledger. */
export function entryChute(): Object3D {
  const alerts = [0, 1, 2].map((i) => box(0.7, 0.25, 0.03, palette.white, { p: [0, 3.0 - i * 0.35, 0.11] }));
  const receipts = [0, 1, 2].map(() => box(0.3, 0.02, 0.4, palette.white));
  const g = group([
    box(0.15, 1.5, 0.3, palette.wood, { p: [-1.4, 0.75, -0.2] }),
    box(1.0, 1.9, 0.14, '#2B3345', { p: [-1.4, 2.4, 0] }),
    box(0.86, 1.7, 0.04, glowMat(palette.sky, 0.6), { p: [-1.4, 2.4, 0.08] }),
    ...alerts.map((a) => {
      a.position.x = -1.4;
      return a;
    }),
    box(2.6, 0.08, 0.5, palette.metal, { p: [0.1, 1.4, 0], r: [0, 0, -0.35] }),
    box(2.6, 0.12, 0.06, palette.metalDark, { p: [0.1, 1.5, 0.28], r: [0, 0, -0.35] }),
    box(2.6, 0.12, 0.06, palette.metalDark, { p: [0.1, 1.5, -0.28], r: [0, 0, -0.35] }),
    box(1.8, 0.8, 1.4, palette.wood, { p: [1.7, 0.4, 0] }),
    box(1.6, 0.16, 1.2, palette.cream, { p: [1.7, 0.88, 0] }),
    box(1.2, 0.04, 0.05, palette.ink, { p: [1.7, 0.98, 0.2] }),
    box(1.2, 0.04, 0.05, palette.ink, { p: [1.7, 0.98, -0.1] }),
    ico(0.2, GOLD, { p: [2.2, 1.05, 0.3] }),
    ...receipts,
  ]);
  return animate(g, (t) => {
    receipts.forEach((r, i) => {
      const u = (t * 0.35 + i / 3) % 1;
      r.position.set(-1.1 + u * 2.4, 1.85 - u * 0.85, 0);
      r.rotation.z = -0.35;
    });
    alerts.forEach((a, i) => (a.position.y = 3.0 - ((i * 0.35 + t * 0.15) % 1.05)));
  });
}

/** Budget gauge: fills past the 80% warning line to the limit. */
export function budgetGauge(): Object3D {
  const ok = glowMat(GREEN, 0.7);
  const warn = glowMat(palette.sunshine, 0.9);
  const fillOk = group([box(0.5, 1, 0.5, ok, { p: [0, 0.5, 0] })], { p: [0, 0.45, 0] });
  const fillWarn = group([box(0.5, 1, 0.5, warn, { p: [0, 0.5, 0] })], { p: [0, 3.65, 0] });
  const mark = signPlane('80%', 0.8, 0.36, palette.cream, palette.ink);
  mark.position.set(0.95, 3.65, 0.05);
  const g = group([
    cylinder(0.9, 1.0, 0.4, 8, palette.stone, { p: [0, 0.2, 0] }),
    box(0.7, 4.0, 0.7, mat(palette.glass, { opacity: 0.3, roughness: 0.2 }), { p: [0, 2.45, 0] }),
    fillOk,
    fillWarn,
    box(0.95, 0.08, 0.95, RED, { p: [0, 3.65, 0] }),
    box(0.95, 0.08, 0.95, GOLD, { p: [0, 4.4, 0] }),
    mark,
  ]);
  return animate(g, (t) => {
    const level = 2.6 + Math.sin(t * 0.6) * 1.3;
    fillOk.scale.y = Math.max(0.01, Math.min(level, 3.2));
    fillWarn.scale.y = Math.max(0.001, Math.min(Math.max(level - 3.2, 0), 0.75));
  });
}

/** Recurring payments: a calendar clock with cycling arrows and repeating bills. */
export function recurringClock(): Object3D {
  const hour = group([box(0.12, 0.7, 0.06, palette.ink, { p: [0, 0.35, 0] })], { p: [0, 3.2, 0.25] });
  const minute = group([box(0.08, 1.05, 0.05, palette.ink, { p: [0, 0.52, 0] })], { p: [0, 3.2, 0.25] });
  const arrow = (start: number) => {
    const arc = 2.2;
    return group(
      [
        torus(2.3, 0.07, palette.sunshine, {}, arc, 4, 20),
        cone(0.2, 0.4, 4, palette.sunshine, {
          p: [Math.cos(arc) * 2.3, Math.sin(arc) * 2.3, 0],
          r: [0, 0, arc],
        }),
      ],
      { p: [0, 3.2, 0], r: [0, 0, start] },
    );
  };
  const cycle = [arrow(0.3), arrow(Math.PI + 0.3)];
  const bills = [palette.coral, palette.sky, palette.meadow].map((c) => ico(0.25, c));
  const g = group([
    cylinder(0.2, 0.3, 1.5, 6, palette.woodDark, { p: [0, 0.75, 0] }),
    cylinder(0.9, 1.1, 0.3, 8, palette.stone, { p: [0, 0.15, 0] }),
    cylinder(1.65, 1.65, 0.3, 20, palette.cream, { p: [0, 3.2, 0], r: [Math.PI / 2, 0, 0] }),
    torus(1.7, 0.14, palette.coral, { p: [0, 3.2, 0] }, Math.PI * 2, 5, 24),
    ...Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return box(0.06, 0.2, 0.04, palette.ink, {
        p: [Math.sin(a) * 1.35, 3.2 + Math.cos(a) * 1.35, 0.2],
        r: [0, 0, -a],
      });
    }),
    hour,
    minute,
    ...cycle,
    ...bills,
  ]);
  return animate(g, (t) => {
    minute.rotation.z = -t * 0.8;
    hour.rotation.z = -t * 0.07;
    cycle[0]!.rotation.z = 0.3 - t * 0.4;
    cycle[1]!.rotation.z = Math.PI + 0.3 - t * 0.4;
    bills.forEach((b, i) => {
      const a = t * 0.5 + (i / 3) * Math.PI * 2;
      b.position.set(Math.cos(a) * 2.0, 3.2 + Math.sin(a) * 2.0, 0.3);
    });
  });
}

/** Split with friends: a round table with a balance scale and three seats. */
export function splitTable(): Object3D {
  const pans = [-0.9, 0.9].map((x) => cylinder(0.4, 0.3, 0.08, 10, GOLD, { p: [x, -0.8, 0] }));
  const beam = group(
    [
      box(2.0, 0.1, 0.1, palette.woodDark),
      ...pans,
      box(0.03, 0.8, 0.03, palette.metalDark, { p: [-0.9, -0.4, 0] }),
      box(0.03, 0.8, 0.03, palette.metalDark, { p: [0.9, -0.4, 0] }),
      ico(0.2, GOLD, { p: [-0.9, -0.6, 0] }),
    ],
    { p: [0, 2.5, 0] },
  );
  const stools = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    return group(
      [
        cylinder(0.14, 0.18, 0.55, 6, palette.woodDark, { p: [0, 0.28, 0] }),
        cylinder(0.4, 0.4, 0.12, 8, [palette.coral, palette.sky, palette.sunshine][i]!, { p: [0, 0.6, 0] }),
      ],
      { p: [Math.sin(a) * 2.0, 0, Math.cos(a) * 2.0] },
    );
  });
  const g = group([
    cylinder(0.35, 0.5, 1.0, 8, palette.woodDark, { p: [0, 0.5, 0] }),
    cylinder(1.6, 1.6, 0.18, 12, palette.wood, { p: [0, 1.05, 0] }),
    cylinder(0.08, 0.08, 1.4, 5, palette.metalDark, { p: [0, 1.8, 0] }),
    beam,
    ...stools,
  ]);
  return animate(g, (t) => (beam.rotation.z = Math.sin(t * 1.2) * 0.18));
}

/** Private by design: an encrypted vault with a wheel lock. */
export function vault(): Object3D {
  const wheel = group(
    [
      torus(0.6, 0.08, GOLD, {}, Math.PI * 2, 4, 16),
      ...[0, 1, 2, 3].map((i) => box(0.08, 1.4, 0.08, GOLD, { r: [0, 0, (i * Math.PI) / 4] })),
      ico(0.14, GOLD),
    ],
    { p: [0, 1.9, 1.05] },
  );
  const bolts = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return ico(0.1, palette.metalDark, { p: [Math.sin(a) * 1.15, 1.9 + Math.cos(a) * 1.15, 0.92] });
  });
  const key = group(
    [
      torus(0.16, 0.05, GOLD, {}, Math.PI * 2, 4, 8),
      box(0.06, 0.5, 0.05, GOLD, { p: [0, -0.35, 0] }),
      box(0.18, 0.06, 0.05, GOLD, { p: [0.1, -0.5, 0] }),
    ],
    { p: [1.4, 1.0, 0.7] },
  );
  const g = group([
    box(3.6, 3.6, 1.2, palette.stone, { p: [0, 1.8, 0] }),
    cylinder(1.3, 1.3, 0.3, 18, palette.metal, { p: [0, 1.9, 0.7], r: [Math.PI / 2, 0, 0] }),
    ...bolts,
    wheel,
    key,
  ]);
  return animate(g, (t) => {
    wheel.rotation.z = Math.sin(t * 0.5) * 1.2;
    key.rotation.z = Math.sin(t * 1.4) * 0.12;
  });
}

/** Market stall (scenery). Props: `color` for the awning. */
export function marketStall(props: ModelProps): Object3D {
  const awning = text(props.color, palette.coral);
  const stripes = Array.from({ length: 6 }, (_, i) =>
    box(0.46, 0.08, 1.7, i % 2 ? palette.cream : awning, {
      p: [-1.15 + i * 0.46, 2.75, 0.05],
      r: [0.3, 0, 0],
    }),
  );
  return group([
    box(2.4, 0.9, 1.0, palette.wood, { p: [0, 0.45, 0] }),
    ...[-1.15, 1.15].flatMap((x) => [
      box(0.1, 2.4, 0.1, palette.woodDark, { p: [x, 1.2, -0.45] }),
      box(0.1, 2.0, 0.1, palette.woodDark, { p: [x, 1.0, 0.55] }),
    ]),
    ...stripes,
    ico(0.2, palette.coral, { p: [-0.7, 1.05, 0.1] }),
    ico(0.2, palette.sunshine, { p: [-0.3, 1.05, 0.1] }),
    ico(0.2, palette.meadow, { p: [0.1, 1.05, 0.1] }),
    cylinder(0.3, 0.3, 0.08, 10, GOLD, { p: [0.8, 0.94, 0.1] }),
  ]);
}

export function coinStack(): Object3D {
  const coin = mat(GOLD, { metalness: 0.4, roughness: 0.35, emissive: GOLD, emissiveIntensity: 0.15 });
  return group([
    ...[0, 1, 2, 3, 4].map((i) =>
      cylinder(0.5, 0.5, 0.12, 12, coin, { p: [0, 0.06 + i * 0.13, 0], r: [0, i * 0.4, 0] }),
    ),
    cylinder(0.5, 0.5, 0.12, 12, coin, { p: [0.7, 0.4, 0.3], r: [0.2, 0, 1.2] }),
  ]);
}

/* ------------------------------------------------------------------ Unity Arcade */

/** OpenAI-Unity package: an opened package with a glowing cube, and a chat bubble above. */
export function packageCube(): Object3D {
  const cube = box(0.9, 0.9, 0.9, glowMat(palette.sky, 1, { unique: true }), { p: [0, 3.7, 0] });
  const ring = torus(0.9, 0.04, glowMat(palette.sunshine, 1), { p: [0, 3.7, 0] }, Math.PI * 2, 4, 20);
  const talk = bubble(palette.white, 1.7, 0.8);
  talk.position.set(0, 5.6, 0);
  const dots = [0, 1, 2].map((i) =>
    ico(0.09, glowMat(palette.sky, 1.2, { unique: true }), { p: [-0.4 + i * 0.4, 0, 0.1] }),
  );
  dots.forEach((d) => talk.add(d));
  const label = signPlane('PACKAGE', 1.8, 0.5, palette.cream, palette.ink);
  label.position.set(0, 1.9, 1.22);
  const g = group([
    cylinder(2.2, 2.5, 0.9, 8, palette.stone, { p: [0, 0.45, 0] }),
    box(2.4, 2.0, 2.4, CARDBOARD, { p: [0, 1.9, 0] }),
    box(0.5, 2.02, 2.42, palette.cream, { p: [0, 1.9, 0] }),
    box(2.4, 0.08, 1.0, CARDBOARD, { p: [0, 3.3, 1.55], r: [-0.9, 0, 0] }),
    box(2.4, 0.08, 1.0, CARDBOARD, { p: [0, 3.3, -1.55], r: [0.9, 0, 0] }),
    box(1.0, 0.08, 2.4, CARDBOARD, { p: [-1.55, 3.3, 0], r: [0, 0, -0.9] }),
    box(1.0, 0.08, 2.4, CARDBOARD, { p: [1.55, 3.3, 0], r: [0, 0, 0.9] }),
    label,
    cube,
    ring,
    talk,
  ]);
  return animate(g, (t) => {
    cube.rotation.set(t * 0.6, t, 0);
    cube.position.y = 3.7 + Math.sin(t * 2) * 0.12;
    ring.position.y = cube.position.y;
    ring.rotation.set(Math.PI / 2 + Math.sin(t) * 0.4, t * 0.8, 0);
    talk.position.y = 5.6 + Math.sin(t * 1.5) * 0.1;
    dots.forEach((d, i) => d.scale.setScalar(0.6 + Math.max(0, Math.sin(t * 5 - i * 0.9)) * 0.7));
  });
}

/** Git portal: add the package from a git URL in the Package Manager. */
export function gitPortal(): Object3D {
  const swirl = [0, 1, 2].map((i) => octa(0.18, glowMat([palette.sunshine, palette.coral, TEAL][i]!, 1.1)));
  const card = signPlane('Add from git URL', 2.0, 0.5, palette.cream, palette.ink);
  card.position.set(0, 1.05, 1.36);
  card.rotation.x = -0.3;
  const portal = group(
    [
      torus(1.5, 0.2, palette.lavender, { p: [0, 2.1, 0] }, Math.PI * 2, 6, 20),
      cylinder(1.35, 1.35, 0.04, 20, glowMat(palette.sky, 0.7, { opacity: 0.55 }), {
        p: [0, 2.1, 0],
        r: [Math.PI / 2, 0, 0],
      }),
      box(0.5, 0.4, 0.5, palette.metalDark, { p: [-1.5, 0.2, 0] }),
      box(0.5, 0.4, 0.5, palette.metalDark, { p: [1.5, 0.2, 0] }),
      ...swirl,
    ],
    { p: [0, 0, -0.6] },
  );
  const g = group([
    portal,
    box(2.2, 0.9, 0.9, palette.stone, { p: [0, 0.45, 0.9] }),
    box(0.4, 0.08, 0.04, glowMat(TEAL, 1.3), { p: [0, 1.0, 1.05] }),
    box(0.08, 0.4, 0.04, glowMat(TEAL, 1.3), { p: [0, 1.0, 1.05] }),
    card,
  ]);
  return animate(g, (t) =>
    swirl.forEach((s, i) => {
      const a = t * 1.2 + (i / 3) * Math.PI * 2;
      s.position.set(Math.cos(a) * 0.8, 2.1 + Math.sin(a) * 0.8, 0);
      s.rotation.y = t * 2;
    }),
  );
}

/** Chatty NPC: a game character with a speech bubble — Chat Completions in a game. */
export function npcTalker(): Object3D {
  const cap = group(
    [
      cylinder(0.36, 0.36, 0.04, 8, palette.sky),
      cylinder(0.2, 0.24, 0.18, 8, palette.sky, { p: [0, 0.1, 0] }),
    ],
    { p: [0, 1.94, 0] },
  );
  const parts = buildCharacter(
    {
      skin: '#E8B98F',
      shirt: palette.meadow,
      pants: '#4A5A8C',
      hair: '#2B2230',
      shoes: palette.ink,
      accent: palette.sunshine,
    },
    [cap],
  );
  parts.root.scale.setScalar(1.25);
  parts.root.position.y = 0.35;
  const hello = signPlane('Hello, traveler!', 2.3, 0.55, palette.white, palette.ink);
  const talk = group(
    [hello, cone(0.15, 0.3, 3, palette.white, { p: [-0.5, -0.42, 0], r: [0, 0, Math.PI] })],
    { p: [0.7, 3.9, 0.3] },
  );
  const g = group([cylinder(1.2, 1.4, 0.35, 8, palette.stone, { p: [0, 0.17, 0] }), parts.root, talk]);
  return animate(g, (t) => {
    parts.armR.rotation.z = 2.6 + Math.sin(t * 5) * 0.3;
    parts.head.rotation.y = Math.sin(t * 0.9) * 0.25;
    talk.position.y = 3.9 + Math.sin(t * 1.6) * 0.08;
  });
}

/** Function-calling machine: describe a function, get a structured trivia card back. */
export function functionMachine(): Object3D {
  const card = group(
    [
      box(1.3, 0.9, 0.05, palette.cream),
      box(0.9, 0.08, 0.02, palette.ink, { p: [0, 0.25, 0.03] }),
      box(0.5, 0.18, 0.02, glowMat(GREEN, 1), { p: [-0.35, -0.08, 0.03] }),
      box(0.5, 0.18, 0.02, palette.coral, { p: [0.35, -0.08, 0.03] }),
    ],
    { p: [0.55, 1.85, 0.8] },
  );
  const dial = cylinder(0.25, 0.25, 0.12, 10, palette.sunshine, {
    p: [-1.1, 1.5, 0.84],
    r: [Math.PI / 2, 0, 0],
  });
  const label = signPlane('FUNCTION CALL', 2.4, 0.5, palette.cream, palette.ink);
  label.position.set(0, 2.45, 0.82);
  const g = group([
    box(3.4, 0.4, 1.8, palette.metalDark, { p: [0, 0.2, 0] }),
    box(3.2, 2.4, 1.6, palette.lavender, { p: [0, 1.6, 0] }),
    cone(0.9, 1.1, 8, palette.metal, { p: [-0.8, 3.35, 0], r: [Math.PI, 0, 0] }),
    box(1.6, 0.12, 0.5, palette.ink, { p: [0.55, 1.35, 0.85] }),
    dial,
    label,
    card,
  ]);
  return animate(g, (t) => {
    const k = (t * 0.3) % 1;
    const out = k < 0.7 ? Math.min(1, k / 0.35) : 1 - (k - 0.7) / 0.3;
    card.position.z = 0.7 + out * 0.8;
    card.position.y = 1.55 + out * 0.4;
    card.visible = out > 0.03;
    dial.rotation.y = t * 2;
  });
}

/** Arcade cabinet (scenery). Props: `color`. */
export function arcadeCabinet(props: ModelProps): Object3D {
  const color = text(props.color, palette.lavender);
  return group([
    box(1.4, 2.6, 1.0, color, { p: [0, 1.3, 0] }),
    box(1.1, 0.9, 0.06, glowMat(TEAL, 0.9), { p: [0, 1.95, 0.52], r: [-0.25, 0, 0] }),
    box(1.3, 0.15, 0.5, palette.ink, { p: [0, 1.15, 0.6], r: [0.3, 0, 0] }),
    cylinder(0.04, 0.04, 0.3, 4, palette.metalDark, { p: [-0.3, 1.35, 0.62] }),
    ico(0.1, palette.coral, { p: [-0.3, 1.52, 0.62] }),
    ico(0.07, palette.sunshine, { p: [0.15, 1.27, 0.68] }),
    ico(0.07, palette.sky, { p: [0.35, 1.25, 0.7] }),
    box(1.4, 0.4, 0.2, glowMat(palette.sunshine, 0.8), { p: [0, 2.75, 0.45] }),
  ]);
}
