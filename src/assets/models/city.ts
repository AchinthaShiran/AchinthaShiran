import type { Mesh, MeshStandardMaterial, Object3D } from 'three';
import { animate, box, cone, cylinder, group, ico, mesh, octa } from '../builders';
import { glowMat, mat } from '../materials';
import { palette } from '../palette';
import { labelTexture } from '../textures';
import type { ModelProps } from '../types';
import { PlaneGeometry } from 'three';

const FLOOR_COLORS = [palette.sky, palette.meadow, palette.lavender, palette.coral, palette.sunshine];

export const floorColor = (i: number) => FLOOR_COLORS[i % FLOOR_COLORS.length] ?? palette.sky;

/** A sign plane with canvas-rendered text. */
export function signPlane(
  text: string,
  w: number,
  h: number,
  bg: string = palette.cream,
  fg: string = palette.ink,
): Mesh {
  const tex = labelTexture(text, {
    background: bg,
    color: fg,
    border: palette.woodDark,
    width: 512,
    height: Math.round((512 * h) / w),
  });
  const m = mesh(new PlaneGeometry(w, h), mat(palette.white, { unique: true }));
  const material = m.material as MeshStandardMaterial;
  material.map = tex;
  material.flatShading = false;
  material.roughness = 1;
  m.castShadow = false;
  return m;
}

/**
 * Organization headquarters: one floor per role (bottom = earliest). `floors` = number of roles,
 * `label` = organization short name.
 */
export function officeTower(props: ModelProps): Object3D {
  const floors = typeof props.floors === 'number' ? Math.max(1, props.floors) : 3;
  const label = typeof props.label === 'string' ? props.label : 'HQ';
  const floorH = 2.4;
  const window = glowMat(palette.glow, 0.45);
  const parts: Object3D[] = [box(7.6, 0.4, 7.6, palette.stone, { p: [0, 0.2, 0] })];
  for (let i = 0; i < floors; i++) {
    const y = 0.4 + i * floorH;
    const w = 6.6 - i * 0.5;
    parts.push(box(w, floorH - 0.15, w, floorColor(i), { p: [0, y + floorH / 2, 0] }));
    parts.push(box(w + 0.3, 0.15, w + 0.3, palette.cream, { p: [0, y + floorH - 0.05, 0] }));
    for (let k = -1; k <= 1; k++) {
      parts.push(box(0.9, 1.0, 0.05, window, { p: [k * (w / 3.2), y + 1.2, w / 2 + 0.03] }));
      parts.push(box(0.05, 1.0, 0.9, window, { p: [w / 2 + 0.03, y + 1.2, k * (w / 3.2)] }));
      parts.push(box(0.05, 1.0, 0.9, window, { p: [-w / 2 - 0.03, y + 1.2, k * (w / 3.2)] }));
    }
  }
  const top = 0.4 + floors * floorH;
  const beacon = ico(0.3, glowMat(palette.coral, 1.2, { unique: true }), { p: [0, top + 1.9, 0] });
  parts.push(
    box(1.6, 2.0, 0.2, palette.ink, { p: [0, 1.4, 3.35] }),
    box(1.3, 1.7, 0.05, glowMat(palette.sky, 0.6), { p: [0, 1.35, 3.46] }),
    box(2.6, 0.2, 1.2, palette.coral, { p: [0, 2.6, 3.6] }),
    cylinder(0.08, 0.08, 1.6, 4, palette.metalDark, { p: [0, top + 0.8, 0] }),
    beacon,
  );
  const sign = signPlane(label, 4.2, 1.0, palette.cream, palette.ink);
  sign.position.set(0, 3.35, 3.4);
  parts.push(sign);
  const g = group(parts);
  return animate(g, (t) => beacon.scale.setScalar(0.8 + Math.sin(t * 3) * 0.2));
}

export function cityBlock(props: ModelProps): Object3D {
  const seed = typeof props.seed === 'number' ? props.seed : 0;
  const color = FLOOR_COLORS[seed % FLOOR_COLORS.length] ?? palette.sky;
  const h = 2.5 + (seed % 3) * 1.4;
  const window = glowMat(palette.glow, 0.35);
  const rows = Math.floor(h / 1.2);
  const wins: Object3D[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = -1; c <= 1; c += 2)
      wins.push(box(0.5, 0.55, 0.05, window, { p: [c * 0.7, 0.9 + r * 1.1, 1.53] }));
  return group([
    box(3, h, 3, color, { p: [0, h / 2, 0] }),
    box(3.3, 0.25, 3.3, palette.cream, { p: [0, h + 0.12, 0] }),
    seed % 2
      ? cone(1.5, 1.2, 4, palette.roof, { p: [0, h + 0.85, 0], r: [0, Math.PI / 4, 0] })
      : box(1, 0.6, 1, palette.metal, { p: [0.6, h + 0.55, -0.4] }),
    ...wins,
  ]);
}

export function car(props: ModelProps): Object3D {
  const color = typeof props.color === 'string' ? props.color : palette.coral;
  const wheel = (x: number, z: number) =>
    cylinder(0.22, 0.22, 0.16, 8, palette.ink, { p: [x, 0.22, z], r: [0, 0, Math.PI / 2] });
  return group([
    box(1.0, 0.45, 1.9, color, { p: [0, 0.48, 0] }),
    box(0.85, 0.4, 1.0, color, { p: [0, 0.9, -0.1] }),
    box(0.8, 0.32, 0.04, palette.glass, { p: [0, 0.92, 0.41] }),
    box(0.2, 0.12, 0.04, palette.glow, { p: [-0.32, 0.5, 0.96] }),
    box(0.2, 0.12, 0.04, palette.glow, { p: [0.32, 0.5, 0.96] }),
    wheel(-0.5, 0.6),
    wheel(0.5, 0.6),
    wheel(-0.5, -0.6),
    wheel(0.5, -0.6),
  ]);
}

/** Career timeline monument: stacked steps rising per role with a star on top. */
export function timelineMonument(props: ModelProps): Object3D {
  const steps = typeof props.steps === 'number' ? props.steps : 3;
  const parts: Object3D[] = [cylinder(2.4, 2.6, 0.4, 8, palette.stone, { p: [0, 0.2, 0] })];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const h = 1 + i * 0.9;
    parts.push(box(0.7, h, 0.7, floorColor(i), { p: [Math.sin(a) * 1.3, 0.4 + h / 2, Math.cos(a) * 1.3] }));
  }
  const star = octa(0.5, glowMat(palette.sunshine, 1));
  star.position.y = 4.6;
  parts.push(cylinder(0.25, 0.4, 3.6, 6, palette.cream, { p: [0, 2.2, 0] }), star);
  const g = group(parts);
  return animate(g, (t) => {
    star.rotation.y = t;
    star.position.y = 4.6 + Math.sin(t * 2) * 0.15;
  });
}

/** Role plaque: a small kiosk coloured like its floor. */
export function rolePlaque(props: ModelProps): Object3D {
  const color = typeof props.color === 'string' ? props.color : palette.sky;
  const label = typeof props.label === 'string' ? props.label : '';
  const parts: Object3D[] = [
    cylinder(0.7, 0.8, 0.3, 6, palette.stone, { p: [0, 0.15, 0] }),
    box(0.25, 1.4, 0.25, palette.woodDark, { p: [0, 0.95, 0] }),
    box(1.8, 1.0, 0.15, color, { p: [0, 1.9, 0], r: [-0.2, 0, 0] }),
  ];
  if (label) {
    const sign = signPlane(label, 1.65, 0.85, palette.cream, palette.ink);
    sign.position.set(0, 1.91, 0.09);
    sign.rotation.x = -0.2;
    parts.push(sign);
  }
  return group(parts);
}

export function streetTree(): Object3D {
  return group([
    box(0.9, 0.3, 0.9, palette.stone, { p: [0, 0.15, 0] }),
    cylinder(0.08, 0.1, 1.2, 5, palette.woodDark, { p: [0, 0.8, 0] }),
    ico(0.7, mat(palette.leafLight, { sway: 0.05 }), { p: [0, 1.8, 0] }),
  ]);
}
