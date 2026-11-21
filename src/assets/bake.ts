/**
 * Merge many static meshes into one mesh per material (draw-call reduction for decor).
 * Animated objects (with userData.tick) must not be baked.
 */
import { BufferAttribute, BufferGeometry, type Material, Mesh, type Object3D } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function bakeStatic(root: Object3D, receiveShadow = true): Mesh[] {
  root.updateMatrixWorld(true);
  const buckets = new Map<Material, BufferGeometry[]>();
  root.traverse((o) => {
    if (!(o instanceof Mesh) || Array.isArray(o.material)) return;
    const src = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
    const g = new BufferGeometry();
    g.setAttribute('position', (src.getAttribute('position') as BufferAttribute).clone());
    const normal = src.getAttribute('normal') as BufferAttribute | undefined;
    if (normal) g.setAttribute('normal', normal.clone());
    else g.computeVertexNormals();
    g.applyMatrix4(o.matrixWorld);
    const list = buckets.get(o.material as Material) ?? [];
    list.push(g);
    buckets.set(o.material as Material, list);
  });
  const meshes: Mesh[] = [];
  for (const [material, geos] of buckets) {
    const merged = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    if (!merged) continue;
    merged.computeBoundingSphere();
    const m = new Mesh(merged, material);
    m.castShadow = true;
    m.receiveShadow = receiveShadow;
    meshes.push(m);
  }
  return meshes;
}
