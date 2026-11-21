import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Component, type ReactNode, Suspense, useMemo } from 'react';
import type { Object3D } from 'three';
import { getModel, type ModelKey } from '@/assets/manifest';
import { placeholder } from '@/assets/models/props';
import type { ModelProps } from '@/assets/types';
import { useSettings } from '@/state/settings';

type Tick = (t: number, dt: number) => void;

/** Run every `userData.tick` found in the object tree (ambient animation), unless reduced motion is on. */
function useTicks(object: Object3D) {
  const ticks = useMemo(() => {
    const list: Tick[] = [];
    object.traverse((o) => {
      if (typeof o.userData.tick === 'function') list.push(o.userData.tick as Tick);
    });
    return list;
  }, [object]);
  useFrame((state, dt) => {
    if (ticks.length === 0 || useSettings.getState().reducedMotion) return;
    const t = state.clock.elapsedTime;
    for (const tick of ticks) tick(t, dt);
  });
}

function ProceduralModel({ build, props }: { build: (p: ModelProps) => Object3D; props: ModelProps }) {
  const key = JSON.stringify(props);
  const object = useMemo(() => {
    try {
      return build(props);
    } catch (error) {
      console.error('Model build failed', error);
      return placeholder();
    }
    // `key` is the stable identity of `props`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build, key]);
  useTicks(object);
  return <primitive object={object} />;
}

function GltfModel({ url, scale }: { url: string; scale: number }) {
  const gltf = useGLTF(`${import.meta.env.BASE_URL}${url}`);
  const object = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
    return clone;
  }, [gltf.scene]);
  return <primitive object={object} scale={scale} />;
}

class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('Model failed to load', error);
  }
  render() {
    return this.state.failed ? <primitive object={placeholder()} /> : this.props.children;
  }
}

const EMPTY: ModelProps = {};

/** Render any manifest model by key — procedural or glTF (ADR-002). */
export function Model({ id, props = EMPTY }: { id: ModelKey; props?: ModelProps }) {
  const entry = getModel(id);
  if (entry.source.kind === 'gltf') {
    return (
      <ModelBoundary>
        <Suspense fallback={null}>
          <GltfModel url={entry.source.url} scale={entry.source.scale ?? 1} />
        </Suspense>
      </ModelBoundary>
    );
  }
  return (
    <ModelBoundary>
      <ProceduralModel build={entry.source.build} props={props} />
    </ModelBoundary>
  );
}
