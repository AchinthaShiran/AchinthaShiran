import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BackSide, Color, type DirectionalLight, Fog, type Group, Mesh, PlaneGeometry, ShaderMaterial, SphereGeometry } from 'three';
import { jitter } from '@/assets/builders';
import { mat, sharedUniforms } from '@/assets/materials';
import { bird, cloud } from '@/assets/models/nature';
import { palette } from '@/assets/palette';
import { createRng } from '@/engine/math';
import { player } from '@/engine/playerState';
import { useSettings } from '@/state/settings';

const FOG_COLOR = '#D6ECF8';

function Sky() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new Color('#5FAEE6') },
          horizon: { value: new Color('#DDF1FB') },
          sun: { value: new Color('#FFD9A8') },
          sunDir: { value: [-0.35, 0.18, 0.92] },
        },
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 sun; uniform vec3 sunDir; varying vec3 vDir;
          void main(){
            float h = clamp(vDir.y * 1.4 + 0.15, 0.0, 1.0);
            vec3 col = mix(horizon, top, pow(h, 0.8));
            float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
            col = mix(col, sun, pow(s, 6.0) * 0.55);
            col += vec3(1.0, 0.95, 0.85) * pow(s, 180.0);
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    [],
  );
  const ref = useRef<Mesh>(null);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return <mesh ref={ref} geometry={useMemo(() => new SphereGeometry(900, 24, 16), [])} material={material} renderOrder={-1} />;
}

function Ocean() {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(2400, 2400, 48, 48);
    g.rotateX(-Math.PI / 2);
    return jitter(g, 3, 7);
  }, []);
  const material = useMemo(() => mat(palette.waterDeep, { roughness: 0.6, emissive: '#3C8FC4', emissiveIntensity: 0.25 }), []);
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current && !useSettings.getState().reducedMotion) ref.current.position.y = -60 + Math.sin(clock.elapsedTime * 0.4) * 0.6;
  });
  return <mesh ref={ref} geometry={geometry} material={material} position={[0, -60, 0]} receiveShadow={false} />;
}

function Clouds({ count }: { count: number }) {
  const group = useRef<Group>(null);
  const clouds = useMemo(() => {
    const rng = createRng(42);
    return Array.from({ length: count }, (_, i) => {
      const object = cloud({ seed: i });
      const radius = 70 + rng() * 140;
      const angle = rng() * Math.PI * 2;
      const height = (rng() > 0.35 ? 18 : -28) + rng() * 16;
      object.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius - 10);
      object.scale.setScalar(0.8 + rng() * 1.2);
      return { object, speed: 0.6 + rng() * 0.8 };
    });
  }, [count]);
  useFrame((_, dt) => {
    if (useSettings.getState().reducedMotion) return;
    for (const c of clouds) {
      c.object.position.x += c.speed * dt;
      if (c.object.position.x > 230) c.object.position.x = -230;
    }
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <primitive key={i} object={c.object} />
      ))}
    </group>
  );
}

/** Small flocks circling between islands. */
function Birds({ count }: { count: number }) {
  const birds = useMemo(() => {
    const rng = createRng(7);
    return Array.from({ length: count }, (_, i) => ({
      object: bird({ seed: i }),
      cx: (rng() - 0.5) * 120,
      cz: (rng() - 0.5) * 120 - 20,
      r: 14 + rng() * 26,
      y: 16 + rng() * 10,
      speed: (0.15 + rng() * 0.2) * (rng() > 0.5 ? 1 : -1),
      phase: rng() * Math.PI * 2,
    }));
  }, [count]);
  useFrame(({ clock }, dt) => {
    if (useSettings.getState().reducedMotion) return;
    const t = clock.elapsedTime;
    for (const b of birds) {
      const a = b.phase + t * b.speed;
      b.object.position.set(b.cx + Math.cos(a) * b.r, b.y + Math.sin(t + b.phase) * 1.5, b.cz + Math.sin(a) * b.r);
      b.object.rotation.y = -a + (b.speed > 0 ? 0 : Math.PI);
      (b.object.userData.tick as ((t: number, dt: number) => void) | undefined)?.(t, dt);
    }
  });
  return (
    <>
      {birds.map((b, i) => (
        <primitive key={i} object={b.object} />
      ))}
    </>
  );
}

function SunLight({ shadows }: { shadows: boolean }) {
  const light = useRef<DirectionalLight>(null);
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    l.shadow.mapSize.set(2048, 2048);
    const cam = l.shadow.camera;
    cam.left = -48;
    cam.right = 48;
    cam.top = 48;
    cam.bottom = -48;
    cam.near = 1;
    cam.far = 220;
    cam.updateProjectionMatrix();
    l.shadow.bias = -0.0006;
    l.shadow.normalBias = 0.04;
  }, []);
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    l.position.set(player.x - 40, player.y + 80, player.z + 30);
    l.target.position.set(player.x, player.y, player.z);
    l.target.updateMatrixWorld();
  });
  return <directionalLight ref={light} castShadow={shadows} intensity={2.3} color="#FFF2D9" />;
}

export function Environment({ quality }: { quality: 'low' | 'high' }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.fog = new Fog(FOG_COLOR, 90, 340);
    scene.background = new Color(FOG_COLOR);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  useFrame(({ clock }) => {
    sharedUniforms.uTime.value = clock.elapsedTime;
    sharedUniforms.uWind.value = useSettings.getState().reducedMotion ? 0 : 1;
  });
  return (
    <>
      <Sky />
      <hemisphereLight args={['#D7ECFF', '#B4D99E', 1.25]} />
      <ambientLight intensity={0.25} />
      <SunLight shadows={quality === 'high'} />
      <Ocean />
      <Clouds count={quality === 'high' ? 22 : 10} />
      {quality === 'high' && <Birds count={10} />}
    </>
  );
}
