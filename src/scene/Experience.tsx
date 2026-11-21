import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { PCFSoftShadowMap } from 'three';
import type { Quality } from '@/state/settings';
import { CameraRig } from './CameraRig';
import { Environment } from './Environment';
import { Features } from './Features';
import { Guide } from './Guide';
import { Landmarks } from './Landmarks';
import { Player } from './Player';
import { Terrain } from './Terrain';

interface Props {
  quality: Quality;
  onContextLost: () => void;
}

/** The 3D world. Lazy-loaded so Classic mode never downloads three.js (ADR-004). */
export default function Experience({ quality, onContextLost }: Props) {
  const high = quality === 'high';
  return (
    <Canvas
      className="world-canvas"
      flat
      shadows={high ? { type: PCFSoftShadowMap } : false}
      dpr={high ? [1, 1.75] : [0.8, 1.2]}
      camera={{ fov: 50, near: 0.3, far: 1400, position: [-40, 110, 190] }}
      gl={{ antialias: high, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Environment quality={quality} />
        <Terrain quality={quality} />
        <Features />
        <Landmarks />
        <Guide />
        <Player />
        <CameraRig />
      </Suspense>
    </Canvas>
  );
}
