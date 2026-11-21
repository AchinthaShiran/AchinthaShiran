import { useEffect, useRef } from 'react';
import { camera as camState, player } from '@/engine/playerState';
import { world } from '@/game/actions';
import { guideRoute } from '@/scene/Guide';
import { useUi } from '@/state/ui';

const VIEW_RADIUS = 48; // world units shown from centre to edge

/** Player-centred, north-up minimap. Click/tap opens the world map. */
export function Minimap() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const toggle = useUi((s) => s.toggleOverlay);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    let raf = 0;
    let last = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 50) return;
      last = now;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const size = el.clientWidth;
      if (el.width !== size * dpr) {
        el.width = size * dpr;
        el.height = size * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const half = size / 2;
      const scale = half / VIEW_RADIUS;
      const sx = (x: number) => half + (x - player.x) * scale;
      const sy = (z: number) => half + (z - player.z) * scale;

      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#BFE3F5';
      ctx.fillRect(0, 0, size, size);

      ctx.lineCap = 'round';
      ctx.strokeStyle = '#B98353';
      ctx.lineWidth = Math.max(2, 2.6 * scale);
      for (const b of world.bridges) {
        ctx.beginPath();
        ctx.moveTo(sx(b.ax), sy(b.az));
        ctx.lineTo(sx(b.bx), sy(b.bz));
        ctx.stroke();
      }
      for (const z of world.zones) {
        ctx.beginPath();
        ctx.arc(sx(z.x), sy(z.z), z.def.radius * scale, 0, Math.PI * 2);
        ctx.fillStyle = z.def.palette.top;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = z.def.palette.rim;
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(238,223,184,0.95)';
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      for (const e of world.navEdges) {
        if (e.a.zoneId !== e.b.zoneId) continue;
        ctx.beginPath();
        ctx.moveTo(sx(e.a.x), sy(e.a.z));
        ctx.lineTo(sx(e.b.x), sy(e.b.z));
        ctx.stroke();
      }
      ctx.fillStyle = '#E8766B';
      for (const lm of world.interactables) {
        ctx.beginPath();
        ctx.arc(sx(lm.x), sy(lm.z), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Guide route
      if (guideRoute.points.length > 1) {
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = '#E0A400';
        ctx.lineWidth = 3;
        ctx.beginPath();
        guideRoute.points.forEach((p, i) =>
          i ? ctx.lineTo(sx(p.x), sy(p.z)) : ctx.moveTo(sx(p.x), sy(p.z)),
        );
        ctx.stroke();
        ctx.setLineDash([]);
        const end = guideRoute.points[guideRoute.points.length - 1]!;
        ctx.fillStyle = '#E0A400';
        ctx.beginPath();
        ctx.arc(sx(end.x), sy(end.z), 5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Zone names
      ctx.font = '700 10px Fredoka, Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2f2a40';
      for (const z of world.zones) {
        const x = sx(z.x);
        const y = sy(z.z);
        if (x > 10 && x < size - 10 && y > 10 && y < size - 10)
          ctx.fillText(z.def.name, x, y - z.def.radius * scale - 3);
      }
      // Camera view cone: camera looks along -(sin yaw, cos yaw) → screen angle (canvas, y down).
      const look = Math.atan2(-Math.cos(camState.yaw), -Math.sin(camState.yaw));
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.moveTo(half, half);
      ctx.arc(half, half, 30, look - 0.5, look + 0.5);
      ctx.closePath();
      ctx.fill();
      // Player arrow
      ctx.save();
      ctx.translate(half, half);
      ctx.rotate(Math.PI - player.yaw);
      ctx.fillStyle = '#2f2a40';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(6, 6);
      ctx.lineTo(0, 3);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <button
      type="button"
      className="minimap"
      onClick={() => toggle('map')}
      aria-label="Minimap — open world map"
    >
      <canvas ref={canvas} aria-hidden="true" />
      <span className="minimap__n">N</span>
    </button>
  );
}
