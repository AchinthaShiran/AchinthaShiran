import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import type { Quality } from '@/state/settings';
import { CameraRig } from './CameraRig';
import { Environment } from './Environment';
import { Features } from './Features';
import { Guide } from './Guide';
import { MouseLook } from './MouseLook';
import { PaintView } from './PaintView';
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
      shadows={high ? 'percentage' : false}
      dpr={high ? [1, 1.75] : [0.8, 1.2]}
      camera={{ fov: 50, near: 0.3, far: 1400, position: [-40, 110, 190] }}
      gl={{ antialias: high, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          // R3F force-loses the context when the canvas unmounts (e.g. switching to Classic) - not a failure.
          if (!gl.domElement.isConnected) return;
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
        <PaintView />
        <MouseLook />
        <Player />
        <CameraRig />
      </Suspense>
    </Canvas>
  );
}
