/**
 * Tiny DSL for composing low-poly models from primitives. Geometries are cached by parameters so
 * repeated props share GPU buffers. Never dispose cached geometry from model code.
 */
import {
  BoxGeometry,
  type BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Group,
  IcosahedronGeometry,
  type Material,
  Mesh,
  type Object3D,
  OctahedronGeometry,
  TorusGeometry,
} from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createRng } from '@/engine/math';
import { mat } from './materials';

export type V3 = readonly [number, number, number];

export interface Place {
  p?: V3;
  r?: V3;
  s?: V3 | number;
}

type Mat = Material | string;

const geoCache = new Map<string, BufferGeometry>();

export function cachedGeometry(key: string, make: () => BufferGeometry): BufferGeometry {
  let g = geoCache.get(key);
  if (!g) {
    g = make();
    geoCache.set(key, g);
  }
  return g;
}

const resolve = (m: Mat): Material => (typeof m === 'string' ? mat(m) : m);

export function place<T extends Object3D>(o: T, pl: Place = {}): T {
  if (pl.p) o.position.set(pl.p[0], pl.p[1], pl.p[2]);
  if (pl.r) o.rotation.set(pl.r[0], pl.r[1], pl.r[2]);
  if (pl.s !== undefined) {
    if (typeof pl.s === 'number') o.scale.setScalar(pl.s);
    else o.scale.set(pl.s[0], pl.s[1], pl.s[2]);
  }
  return o;
}

export function mesh(geo: BufferGeometry, m: Mat, pl?: Place): Mesh {
  const out = new Mesh(geo, resolve(m));
  out.castShadow = true;
  out.receiveShadow = true;
  return place(out, pl);
}

export const box = (w: number, h: number, d: number, m: Mat, pl?: Place) =>
  mesh(
    cachedGeometry(`box:${w}:${h}:${d}`, () => new BoxGeometry(w, h, d)),
    m,
    pl,
  );

export const cylinder = (rTop: number, rBottom: number, h: number, seg: number, m: Mat, pl?: Place) =>
  mesh(
    cachedGeometry(`cyl:${rTop}:${rBottom}:${h}:${seg}`, () => new CylinderGeometry(rTop, rBottom, h, seg)),
    m,
    pl,
  );

export const cone = (r: number, h: number, seg: number, m: Mat, pl?: Place) =>
  mesh(
    cachedGeometry(`cone:${r}:${h}:${seg}`, () => new ConeGeometry(r, h, seg)),
    m,
    pl,
  );

export const ico = (r: number, m: Mat, pl?: Place, detail = 0) =>
  mesh(
    cachedGeometry(`ico:${r}:${detail}`, () => new IcosahedronGeometry(r, detail)),
    m,
    pl,
  );

export const octa = (r: number, m: Mat, pl?: Place) =>
  mesh(
    cachedGeometry(`oct:${r}`, () => new OctahedronGeometry(r, 0)),
    m,
    pl,
  );

export const torus = (
  r: number,
  tube: number,
  m: Mat,
  pl?: Place,
  arc = Math.PI * 2,
  radial = 6,
  tubular = 12,
) =>
  mesh(
    cachedGeometry(
      `torus:${r}:${tube}:${arc}:${radial}:${tubular}`,
      () => new TorusGeometry(r, tube, radial, tubular, arc),
    ),
    m,
    pl,
  );

/** Organic low-poly blob: icosahedron/dodecahedron with deterministic vertex jitter. */
export function blob(
  r: number,
  m: Mat,
  seed: number,
  pl?: Place,
  amount = 0.22,
  kind: 'ico' | 'dodeca' = 'ico',
) {
  const variant = seed % 6;
  const geo = cachedGeometry(`blob:${kind}:${r}:${amount}:${variant}`, () =>
    jitter(
      kind === 'ico' ? new IcosahedronGeometry(r, 0) : new DodecahedronGeometry(r, 0),
      r * amount,
      variant + 1,
    ),
  );
  return mesh(geo, m, pl);
}

/** Displace shared vertices randomly while keeping faces closed. */
export function jitter(geo: BufferGeometry, amount: number, seed: number): BufferGeometry {
  const base = geo.clone();
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const merged = mergeVertices(base);
  const pos = merged.getAttribute('position');
  const rng = createRng(seed);
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + (rng() - 0.5) * amount,
      pos.getY(i) + (rng() - 0.5) * amount,
      pos.getZ(i) + (rng() - 0.5) * amount,
    );
  }
  const out = merged.toNonIndexed();
  out.computeVertexNormals();
  return out;
}

export function group(children: Object3D[], pl?: Place): Group {
  const g = new Group();
  for (const c of children) g.add(c);
  return place(g, pl);
}

/** Attach an ambient animation callback (see Model component). */
export function animate<T extends Object3D>(o: T, tick: (t: number, dt: number) => void): T {
  const prev = o.userData.tick as ((t: number, dt: number) => void) | undefined;
  o.userData.tick = prev
    ? (t: number, dt: number) => {
        prev(t, dt);
        tick(t, dt);
      }
    : tick;
  return o;
}
