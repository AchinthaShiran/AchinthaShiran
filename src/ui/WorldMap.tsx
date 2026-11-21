import { useEffect, useMemo, useState } from 'react';
import { player } from '@/engine/playerState';
import { guideTo, travelToZone, world } from '@/game/actions';
import { useProgress } from '@/state/progress';
import { useUi } from '@/state/ui';
import type { ZoneId } from '@/world/types';
import { Icon } from './Icon';

const PAD = 10;

function labelPosition(x: number, z: number, r: number, side: 'top' | 'bottom' | 'left' | 'right' = 'top') {
  switch (side) {
    case 'bottom':
      return { x, y: z + r + 8, textAnchor: 'middle' as const };
    case 'left':
      return { x: x - r - 2, y: z + 3, textAnchor: 'end' as const };
    case 'right':
      return { x: x + r + 2, y: z + 3, textAnchor: 'start' as const };
    default:
      return { x, y: z - r - 2.5, textAnchor: 'middle' as const };
  }
}

function usePlayerPos(hz = 5) {
  const [pos, setPos] = useState({ x: player.x, z: player.z, yaw: player.yaw });
  useEffect(() => {
    const t = window.setInterval(() => setPos({ x: player.x, z: player.z, yaw: player.yaw }), 1000 / hz);
    return () => window.clearInterval(t);
  }, [hz]);
  return pos;
}

/** Full world map (M): every destination, where you are, what you've visited; guide or travel instantly. */
export function WorldMap() {
  const current = useUi((s) => s.currentZone);
  const visited = useProgress((s) => s.visited);
  const [selected, setSelected] = useState<ZoneId>(current);
  const pos = usePlayerPos();
  const close = () => useUi.getState().setOverlay(null);

  const box = useMemo(() => {
    const xs = world.zones.flatMap((z) => [z.x - z.def.radius, z.x + z.def.radius]);
    const zs = world.zones.flatMap((z) => [z.z - z.def.radius, z.z + z.def.radius]);
    const minX = Math.min(...xs) - PAD;
    const minZ = Math.min(...zs) - PAD - 6;
    return { minX, minZ, w: Math.max(...xs) + PAD - minX, h: Math.max(...zs) + PAD - minZ };
  }, []);

  const zone = world.zone(selected);
  const isVisited = visited.includes(selected);

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="map-title">
        <header className="sheet__header">
          <Icon name="map" />
          <h2 id="map-title">World map</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close map (Escape)">
            <Icon name="close" />
          </button>
        </header>
        <div className="sheet__body">
          <div className="map">
            <svg
              className="map__svg"
              viewBox={`${box.minX} ${box.minZ} ${box.w} ${box.h}`}
              role="group"
              aria-label="Islands of Wonderland"
            >
              {world.bridges.map((b) => (
                <line
                  key={b.id}
                  x1={b.ax}
                  y1={b.az}
                  x2={b.bx}
                  y2={b.bz}
                  stroke="#B98353"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray="1.2 1.6"
                />
              ))}
              {world.zones.map((z) => {
                const active = z.id === selected;
                const seen = visited.includes(z.id);
                return (
                  <g
                    key={z.id}
                    className="map__zone"
                    tabIndex={0}
                    role="button"
                    aria-label={`${z.def.name} — ${z.def.section}${seen ? ', visited' : ''}`}
                    aria-pressed={active}
                    onClick={() => setSelected(z.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(z.id);
                      }
                    }}
                  >
                    <circle
                      className="map__disc"
                      cx={z.x}
                      cy={z.z}
                      r={z.def.radius}
                      fill={z.def.palette.top}
                      stroke={active ? '#E8766B' : z.def.palette.rim}
                      strokeWidth={active ? 3 : 1.5}
                    />
                    <text
                      x={z.x}
                      y={z.z + 3}
                      textAnchor="middle"
                      fontSize={z.def.kind === 'islet' ? 8 : 11}
                      fill="#2f2a40"
                      style={{ pointerEvents: 'none' }}
                    >
                      {z.def.glyph}
                    </text>
                    <text
                      className={`map__label ${z.def.kind === 'islet' ? 'map__label--small' : ''}`}
                      {...labelPosition(z.x, z.z, z.def.radius, z.def.mapLabel)}
                    >
                      {z.def.name}
                      {seen ? ' ✓' : ''}
                    </text>
                  </g>
                );
              })}
              <g
                transform={`translate(${pos.x} ${pos.z}) rotate(${180 - (pos.yaw * 180) / Math.PI})`}
                aria-label="You are here"
              >
                <circle r={4.2} fill="#fff" opacity={0.85} />
                <path d="M0 -3.6 L2.8 2.8 L0 1.4 L-2.8 2.8Z" fill="#2f2a40" />
              </g>
            </svg>
            <div className="map__side">
              <div className="card">
                <div className="panel__eyebrow">{zone.def.section}</div>
                <h3 style={{ fontSize: 22 }}>{zone.def.name}</h3>
                <p>{zone.def.description}</p>
                <p>
                  {current === selected ? <span className="badge badge--sun">You are here</span> : null}{' '}
                  {isVisited ? (
                    <span className="badge">Visited</span>
                  ) : (
                    <span className="badge badge--coral">Not visited yet</span>
                  )}
                </p>
                <div className="actions">
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => useUi.getState().openPanel(zone.def.overviewPanel)}
                  >
                    <Icon name="book" /> Read
                  </button>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => guideTo({ kind: 'zone', id: selected, label: zone.def.name })}
                    disabled={current === selected}
                  >
                    <Icon name="guide" /> Guide me
                  </button>
                  <button
                    type="button"
                    className="btn btn--small btn--primary"
                    onClick={() => travelToZone(selected)}
                  >
                    <Icon name="travel" /> Travel
                  </button>
                </div>
              </div>
              <ul className="map__list" aria-label="Destinations">
                {world.zones.map((z) => (
                  <li key={z.id}>
                    <button type="button" aria-current={z.id === selected} onClick={() => setSelected(z.id)}>
                      <span>
                        {z.def.glyph} {z.def.name}
                      </span>
                      {visited.includes(z.id) && <Icon name="check" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
