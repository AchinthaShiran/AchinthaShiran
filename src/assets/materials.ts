/**
 * Shared flat-shaded materials. Materials are cached by their options so thousands of meshes share a
 * handful of GPU programs. `sway` adds a cheap wind displacement in the vertex shader that works for
 * both individual and baked (merged) geometry because it is driven by world position.
 */
import { DoubleSide, FrontSide, MeshStandardMaterial } from 'three';

export const sharedUniforms = {
  uTime: { value: 0 },
  uWind: { value: 1 },
};

export interface MaterialOptions {
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
  roughness?: number;
  metalness?: number;
  doubleSide?: boolean;
  /** Wind sway amplitude in world units (foliage, flowers). */
  sway?: number;
  /** Bypass the cache (for materials animated individually). */
  unique?: boolean;
}

const cache = new Map<string, MeshStandardMaterial>();

export function mat(color: string, opts: MaterialOptions = {}): MeshStandardMaterial {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!opts.unique) {
    const hit = cache.get(key);
    if (hit) return hit;
  }
  const opacity = opts.opacity ?? 1;
  const m = new MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: opts.roughness ?? 0.88,
    metalness: opts.metalness ?? 0,
    emissive: opts.emissive ?? '#000000',
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 1,
    side: opts.doubleSide ? DoubleSide : FrontSide,
  });
  if (opts.sway) applySway(m, opts.sway);
  if (!opts.unique) cache.set(key, m);
  return m;
}

/** Convenience for glowing parts (crystals, screens, energy). */
export const glowMat = (color: string, intensity = 0.8, extra: MaterialOptions = {}) =>
  mat(color, { emissive: color, emissiveIntensity: intensity, roughness: 0.4, ...extra });

function applySway(m: MeshStandardMaterial, amount: number): void {
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = sharedUniforms.uTime;
    shader.uniforms.uWind = sharedUniforms.uWind;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 swayWp = modelMatrix * vec4(transformed, 1.0);
        float swayPhase = uTime * 1.6 + swayWp.x * 0.35 + swayWp.z * 0.27;
        transformed.x += sin(swayPhase) * ${amount.toFixed(3)} * uWind;
        transformed.z += cos(swayPhase * 0.8) * ${(amount * 0.6).toFixed(3)} * uWind;`,
      );
  };
  m.customProgramCacheKey = () => `sway-${amount}`;
}
