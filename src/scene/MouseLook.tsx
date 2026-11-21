import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { attachMouseLook } from '@/game/mouseLook';

/** Connects pointer lock (GTA-style mouse look) to the canvas on desktop. */
export function MouseLook() {
  const gl = useThree((s) => s.gl);
  useEffect(() => attachMouseLook(gl.domElement), [gl]);
  return null;
}
