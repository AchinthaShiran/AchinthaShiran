import type { Object3D } from 'three';
import { animate, box, cone, cylinder, gableRoof, group, ico } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';

export function cozyHouse(): Object3D {
  const window = glowMat(palette.glow, 0.5);
  const smoke = mat(palette.white, { opacity: 0.7 });
  const puffs = [0, 1, 2].map((i) => ico(0.3 + i * 0.08, smoke, { p: [1.3, 6 + i * 0.7, -0.6] }));
  const g = group([
    box(5.2, 0.4, 4.4, palette.stone, { p: [0, 0.2, 0] }),
    box(4.8, 3.0, 4.0, palette.cream, { p: [0, 1.9, 0] }),
    gableRoof(5.0, 2.25, 5.4, palette.roof, 3.3),
    box(1.0, 1.8, 0.12, palette.woodDark, { p: [0, 1.3, 2.02] }),
    ico(0.07, palette.sunshine, { p: [0.32, 1.3, 2.1] }),
    box(0.9, 0.9, 0.1, window, { p: [-1.5, 2.2, 2.02] }),
    box(0.9, 0.9, 0.1, window, { p: [1.5, 2.2, 2.02] }),
    box(1.1, 0.12, 0.3, palette.wood, { p: [-1.5, 1.7, 2.1] }),
    box(1.1, 0.12, 0.3, palette.wood, { p: [1.5, 1.7, 2.1] }),
    box(0.6, 1.6, 0.6, palette.rockDark, { p: [1.3, 5.0, -0.6] }),
    box(1.6, 0.15, 0.6, palette.woodDark, { p: [0, 2.5, 2.35] }),
    ico(0.25, palette.coral, { p: [-1.5, 1.85, 2.25] }),
    ico(0.25, palette.lavender, { p: [1.5, 1.85, 2.25] }),
    ...puffs,
  ]);
  return animate(g, (t) => {
    puffs.forEach((p, i) => {
      const k = (t * 0.25 + i / 3) % 1;
      p.position.y = 5.8 + k * 2.4;
      p.scale.setScalar(0.6 + k * 0.9);
    });
  });
}

export function workstation(): Object3D {
  const screen = glowMat(palette.sky, 0.9);
  const code = glowMat(palette.sunshine, 1.1);
  const lines = [0, 1, 2, 3].map((i) =>
    box(0.3 + (i % 2) * 0.35, 0.05, 0.01, code, { p: [-0.25 + (i % 2) * 0.1, 1.55 - i * 0.12, 0.07] }),
  );
  const g = group([
    box(2.4, 0.12, 1.2, palette.wood, { p: [0, 0.95, 0] }),
    ...[-1.05, 1.05].flatMap((x) => [
      box(0.1, 0.9, 0.1, palette.woodDark, { p: [x, 0.45, -0.45] }),
      box(0.1, 0.9, 0.1, palette.woodDark, { p: [x, 0.45, 0.45] }),
    ]),
    box(1.3, 0.8, 0.08, palette.ink, { p: [0, 1.5, -0.3] }),
    box(1.18, 0.68, 0.02, screen, { p: [0, 1.5, -0.25] }),
    group(lines, { p: [0, 0, -0.3] }),
    box(0.9, 0.04, 0.32, palette.metalDark, { p: [0, 1.03, 0.2] }),
    cylinder(0.12, 0.12, 0.25, 6, palette.coral, { p: [0.9, 1.13, 0.1] }),
    box(0.6, 0.08, 0.6, palette.lavender, { p: [0, 0.55, 1.0] }),
    box(0.6, 0.7, 0.08, palette.lavender, { p: [0, 0.9, 1.3] }),
    cylinder(0.04, 0.04, 0.5, 4, palette.metalDark, { p: [0, 0.3, 1.0] }),
  ]);
  return animate(g, (t) => {
    lines.forEach((l, i) => (l.scale.x = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.2 + i))));
  });
}

export function noticeBoard(): Object3D {
  const papers = [
    [-0.6, 1.75, palette.white],
    [0.25, 1.85, palette.sunshine],
    [0.75, 1.45, palette.coral],
    [-0.2, 1.35, palette.sky],
  ] as const;
  return group([
    box(0.14, 2.4, 0.14, palette.woodDark, { p: [-1.05, 1.2, 0] }),
    box(0.14, 2.4, 0.14, palette.woodDark, { p: [1.05, 1.2, 0] }),
    box(2.3, 1.3, 0.1, palette.wood, { p: [0, 1.6, 0] }),
    box(2.1, 1.1, 0.04, '#D9B98C', { p: [0, 1.6, 0.06] }),
    ...papers.map(([x, y, c]) => box(0.45, 0.5, 0.02, c, { p: [x, y, 0.09], r: [0, 0, (x * 0.2) % 0.15] })),
    ...papers.map(([x, y]) => ico(0.04, palette.coral, { p: [x, y + 0.22, 0.11] })),
    box(2.6, 0.12, 0.5, palette.roof, { p: [0, 2.4, 0], r: [0.15, 0, 0] }),
  ]);
}

export function mailbox(): Object3D {
  const flag = box(0.04, 0.25, 0.25, palette.roof, { p: [0.24, 0.12, 0.05] });
  const flagPivot = group([flag], { p: [0, 1.25, 0] });
  const g = group([
    box(0.12, 1.1, 0.12, palette.woodDark, { p: [0, 0.55, 0] }),
    box(0.45, 0.4, 0.65, palette.roofBlue, { p: [0, 1.25, 0] }),
    cylinder(0.225, 0.225, 0.65, 8, palette.roofBlue, {
      p: [0, 1.45, 0],
      r: [Math.PI / 2, 0, 0],
      s: [1, 1, 0.6],
    }),
    box(0.36, 0.3, 0.02, palette.ink, { p: [0, 1.25, 0.33] }),
    box(0.2, 0.06, 0.02, palette.cream, { p: [0, 1.3, 0.34] }),
    flagPivot,
  ]);
  return animate(g, (t) => (flagPivot.rotation.x = Math.sin(t * 2.2) * 0.3));
}

/** Little wooden footbridge over the Home river (visual). */
export function footbridge(): Object3D {
  const planks = [-1.2, -0.6, 0, 0.6, 1.2].map((z) =>
    box(2.2, 0.12, 0.5, palette.wood, { p: [0, 0.18 + (1.4 - Math.abs(z)) * 0.08, z] }),
  );
  return group([
    ...planks,
    box(0.1, 0.6, 3.0, palette.woodDark, { p: [-1.1, 0.5, 0] }),
    box(0.1, 0.6, 3.0, palette.woodDark, { p: [1.1, 0.5, 0] }),
  ]);
}

/** Waterfall pouring off an island rim; place at the rim, facing outward (+Z). */
export function waterfall(): Object3D {
  const water = mat(palette.water, { opacity: 0.75, emissive: palette.water, emissiveIntensity: 0.2 });
  const foam = mat(palette.white, { opacity: 0.85 });
  const sheets = [0, 1, 2].map((i) =>
    box(1.8 - i * 0.3, 7, 0.2, water, { p: [0, -3.5 - i * 0.4, 0.3 + i * 0.25] }),
  );
  const drops = [0, 1, 2, 3, 4].map((i) => ico(0.25, foam, { p: [(i - 2) * 0.4, -1, 0.5] }));
  const g = group([...sheets, ...drops, ico(0.5, foam, { p: [0, 0, 0.1], s: [2, 0.5, 1] })]);
  g.traverse((o) => (o.castShadow = false));
  return animate(g, (t) => {
    drops.forEach((d, i) => {
      const k = (t * 0.6 + i / 5) % 1;
      d.position.y = -k * 8;
      d.position.z = 0.5 + k * 1.2;
    });
    sheets.forEach((s, i) => (s.scale.x = 1 + Math.sin(t * 3 + i) * 0.05));
  });
}

export function windmill(): Object3D {
  const blades = group(
    [0, 1, 2, 3].map((i) =>
      box(0.35, 2.4, 0.06, palette.cream, {
        p: [Math.sin((i * Math.PI) / 2) * 1.2, Math.cos((i * Math.PI) / 2) * 1.2, 0],
        r: [0, 0, (-i * Math.PI) / 2],
      }),
    ),
    { p: [0, 4.6, 0.85] },
  );
  const g = group([
    cylinder(0.6, 1.0, 4.6, 6, palette.cream, { p: [0, 2.3, 0] }),
    cone(0.9, 1.1, 6, palette.roof, { p: [0, 5.1, 0] }),
    box(0.5, 0.8, 0.1, palette.woodDark, { p: [0, 0.4, 0.92] }),
    cylinder(0.12, 0.12, 0.5, 6, palette.woodDark, { p: [0, 4.6, 0.6], r: [Math.PI / 2, 0, 0] }),
    blades,
  ]);
  return animate(g, (_t, dt) => (blades.rotation.z += dt * 0.8));
}

export function lamppost(): Object3D {
  return group([
    cylinder(0.06, 0.09, 2.6, 5, palette.ink, { p: [0, 1.3, 0] }),
    cone(0.28, 0.3, 5, palette.ink, { p: [0, 2.85, 0] }),
    ico(0.18, glowMat(palette.glow, 1.2), { p: [0, 2.6, 0] }),
  ]);
}

export function fence(): Object3D {
  return group([
    box(0.1, 0.7, 0.1, palette.wood, { p: [-0.9, 0.35, 0] }),
    box(0.1, 0.7, 0.1, palette.wood, { p: [0.9, 0.35, 0] }),
    box(2, 0.1, 0.06, palette.wood, { p: [0, 0.5, 0] }),
    box(2, 0.1, 0.06, palette.wood, { p: [0, 0.25, 0] }),
  ]);
}
