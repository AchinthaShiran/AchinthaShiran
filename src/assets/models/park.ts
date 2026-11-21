import type { Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico, octa, torus } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';
import type { ModelProps } from '../types';
import { signPlane } from './city';

const plinth = (color: string) => [
  cylinder(2.7, 3.0, 0.5, 8, palette.stone, { p: [0, 0.25, 0] }),
  cylinder(2.5, 2.5, 0.12, 8, color, { p: [0, 0.56, 0] }),
];

/** SAGE exhibit: miniature research campus with a central agentic core and connected agent stations. */
export function exhibitSage(): Object3D {
  const core = ico(0.7, glowMat('#7FE7D9', 1.1, { unique: true }), { p: [0, 2.3, 0] }, 1);
  const stationColors = [palette.coral, palette.sky, palette.sunshine, palette.meadow, palette.lavender];
  const stations = stationColors.flatMap((c, i) => {
    const a = (i / stationColors.length) * Math.PI * 2;
    const x = Math.sin(a) * 1.7;
    const z = Math.cos(a) * 1.7;
    return [
      box(0.6, 0.6, 0.6, c, { p: [x, 0.95, z] }),
      cone(0.45, 0.4, 4, palette.cream, { p: [x, 1.45, z], r: [0, Math.PI / 4, 0] }),
      box(0.08, 0.08, 1.2, glowMat('#7FE7D9', 0.8), { p: [x / 2, 0.75, z / 2], r: [0, a, 0] }),
    ];
  });
  const ring = torus(1.0, 0.05, glowMat(palette.sunshine, 1), { p: [0, 2.3, 0] }, Math.PI * 2, 4, 20);
  const g = group([
    ...plinth(palette.lavender),
    cylinder(0.4, 0.6, 1.2, 6, palette.metal, { p: [0, 1.2, 0] }),
    core,
    ring,
    ...stations,
  ]);
  return animate(g, (t) => {
    core.rotation.y = t * 0.5;
    ring.rotation.set(Math.PI / 2 + Math.sin(t) * 0.4, t, 0);
  });
}

/** Excellence Hub exhibit: collaborative knowledge centre with Alfred, the assistant character. */
export function exhibitExcellenceHub(): Object3D {
  const alfredHead = group([
    ico(0.42, palette.cream, {}, 1),
    box(0.12, 0.12, 0.05, glowMat(palette.sky, 1.2), { p: [-0.14, 0.04, 0.38] }),
    box(0.12, 0.12, 0.05, glowMat(palette.sky, 1.2), { p: [0.14, 0.04, 0.38] }),
    torus(0.2, 0.03, palette.ink, { p: [0, -0.12, 0.36], r: [0, 0, Math.PI] }, Math.PI, 3, 8),
    box(0.5, 0.1, 0.1, palette.ink, { p: [0, -0.35, 0.3] }),
    octa(0.12, palette.ink, { p: [0, -0.35, 0.36] }),
  ]);
  alfredHead.position.set(0, 2.6, 0.2);
  const books = [palette.coral, palette.sky, palette.sunshine, palette.meadow].map((c, i) =>
    box(0.18, 0.5, 0.4, c, { p: [-1.6 + i * 0.22, 1.35, -1.0] }),
  );
  const g = group([
    ...plinth(palette.sunshine),
    box(3.4, 1.8, 0.3, palette.cream, { p: [0, 1.5, -1.3] }),
    box(3.6, 0.2, 1.0, palette.roofBlue, { p: [0, 2.5, -1.0] }),
    box(1.2, 0.08, 0.7, palette.wood, { p: [1.0, 1.0, 0.4] }),
    box(0.1, 0.4, 0.1, palette.woodDark, { p: [1.0, 0.8, 0.4] }),
    cylinder(0.32, 0.4, 1.2, 6, palette.cream, { p: [0, 1.2, 0.2] }),
    alfredHead,
    ...books,
    ico(0.2, palette.coral, { p: [1.0, 1.2, 0.4] }),
  ]);
  return animate(g, (t) => {
    alfredHead.position.y = 2.6 + Math.sin(t * 2) * 0.08;
    alfredHead.rotation.y = Math.sin(t * 0.9) * 0.4;
  });
}

/** TA Portal exhibit: talent centre with a resume-review station and a hiring pipeline. */
export function exhibitTaPortal(): Object3D {
  const pipelineColors = [palette.sky, palette.lavender, palette.sunshine, palette.meadow];
  const stages = pipelineColors.map((c, i) => box(0.55, 0.55, 0.55, c, { p: [-1.5 + i * 1.0, 1.0, -0.9] }));
  const doc = group([
    box(0.5, 0.65, 0.03, palette.white),
    box(0.32, 0.04, 0.01, palette.ink, { p: [0, 0.18, 0.02] }),
    box(0.32, 0.04, 0.01, palette.ink, { p: [0, 0.06, 0.02] }),
    box(0.2, 0.04, 0.01, palette.ink, { p: [-0.06, -0.06, 0.02] }),
  ]);
  const lens = group([
    torus(0.28, 0.05, palette.ink, {}, Math.PI * 2, 4, 12),
    box(0.07, 0.4, 0.07, palette.woodDark, { p: [0.25, -0.3, 0], r: [0, 0, 0.6] }),
  ]);
  const star = octa(0.22, glowMat(palette.sunshine, 1.2));
  const g = group([
    ...plinth(palette.meadow),
    box(4, 0.15, 0.5, palette.metalDark, { p: [0, 0.68, -0.9] }),
    ...stages,
    box(1.4, 1.0, 0.8, palette.cream, { p: [0.6, 1.1, 0.8] }),
    group([doc], { p: [0.6, 2.0, 0.8] }),
    group([lens], { p: [0.2, 2.1, 1.1] }),
    star,
    miniPerson(palette.coral, -1.2, 0.9),
  ]);
  return animate(g, (t) => {
    const k = (t * 0.35) % 1;
    star.position.set(-1.5 + k * 3, 1.6 + Math.sin(k * Math.PI) * 0.4, -0.9);
    lens.position.x = Math.sin(t * 1.5) * 0.15;
    lens.position.y = Math.cos(t * 1.5) * 0.1;
  });
}

function miniPerson(color: string, x: number, z: number): Object3D {
  return group(
    [
      cylinder(0.18, 0.22, 0.6, 6, color, { p: [0, 0.95, 0] }),
      ico(0.18, palette.skin, { p: [0, 1.42, 0] }, 1),
    ],
    { p: [x, 0, z] },
  );
}

/** Default exhibit for projects without a bespoke model. */
export function exhibitGeneric(props: ModelProps): Object3D {
  const color = typeof props.color === 'string' ? props.color : palette.sky;
  const gem = octa(0.8, glowMat(color, 0.9, { unique: true }));
  gem.position.y = 2.4;
  const g = group([...plinth(color), cylinder(0.5, 0.7, 1.2, 6, palette.cream, { p: [0, 1.2, 0] }), gem]);
  return animate(g, (t) => {
    gem.rotation.y = t;
    gem.position.y = 2.4 + Math.sin(t * 1.5) * 0.15;
  });
}

/** Park directory kiosk (projects overview). */
export function kiosk(): Object3D {
  const sign = signPlane('PROJECTS', 1.8, 0.6, palette.sunshine, palette.ink);
  sign.position.set(0, 2.9, 0.62);
  return group([
    box(1.6, 2.2, 1.2, palette.coral, { p: [0, 1.1, 0] }),
    box(1.2, 0.9, 0.05, glowMat(palette.sky, 0.5), { p: [0, 1.4, 0.62] }),
    cone(1.4, 0.9, 4, palette.cream, { p: [0, 2.6, 0], r: [0, Math.PI / 4, 0] }),
    sign,
  ]);
}

export function fountain(): Object3D {
  const water = mat(palette.water, { opacity: 0.8, emissive: palette.water, emissiveIntensity: 0.2 });
  const jets = [0, 1, 2, 3, 4, 5].map((i) =>
    ico(0.18, water, { p: [Math.sin(i) * 0.6, 2.4, Math.cos(i) * 0.6] }),
  );
  const g = group([
    cylinder(2.6, 2.8, 0.7, 10, palette.stone, { p: [0, 0.35, 0] }),
    cylinder(2.3, 2.3, 0.1, 10, water, { p: [0, 0.68, 0] }),
    cylinder(0.3, 0.45, 1.6, 6, palette.stone, { p: [0, 1.4, 0] }),
    cylinder(1.0, 0.6, 0.3, 8, palette.stone, { p: [0, 2.2, 0] }),
    ...jets,
  ]);
  return animate(g, (t) =>
    jets.forEach((j, i) => {
      const k = (t * 0.8 + i / 6) % 1;
      const a = (i / 6) * Math.PI * 2;
      j.position.set(
        Math.sin(a) * (0.3 + k * 1.6),
        2.4 + Math.sin(k * Math.PI) * 1.2 - k * 1.2,
        Math.cos(a) * (0.3 + k * 1.6),
      );
    }),
  );
}

export function bench(): Object3D {
  return group([
    box(1.8, 0.1, 0.5, palette.wood, { p: [0, 0.5, 0] }),
    box(1.8, 0.4, 0.08, palette.wood, { p: [0, 0.8, -0.22] }),
    box(0.1, 0.5, 0.4, palette.ink, { p: [-0.75, 0.25, 0] }),
    box(0.1, 0.5, 0.4, palette.ink, { p: [0.75, 0.25, 0] }),
  ]);
}

export function sculpture(props: ModelProps): Object3D {
  const seed = typeof props.seed === 'number' ? props.seed : 0;
  const colors = [palette.coral, palette.lavender, palette.sky, palette.sunshine];
  const c = colors[seed % colors.length] ?? palette.coral;
  const top =
    seed % 2 ? octa(0.7, c, { p: [0, 2.2, 0] }) : torus(0.6, 0.2, c, { p: [0, 2.2, 0] }, Math.PI * 2, 5, 10);
  const g = group([box(0.9, 1.4, 0.9, palette.stone, { p: [0, 0.7, 0] }), top]);
  return animate(g, (t) => (top.rotation.y = t * 0.5 + seed));
}
