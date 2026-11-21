import { getModel } from '@/assets/manifest';
import { createRng, hashString } from '@/engine/math';
import type { World } from '@/world/build';
import type { HuntSpot } from './sim';

const ARENA_ID = 'arena';

/**
 * One hidden target per island (ADR-007), placed deterministically with the same rejection rules as scenery:
 * on the island's base level, clear of landmarks and obstacles. The arena island hosts the games, not a target.
 */
export function placeHuntSpots(world: World): HuntSpot[] {
  const rng = createRng(hashString('paint-hunt'));
  const col = world.collision;
  const spots: HuntSpot[] = [];
  for (const zone of world.zones) {
    if (zone.id === ARENA_ID) continue;
    const landmarks = world.landmarks.filter((l) => l.zoneId === zone.id);
    const radius = zone.def.radius;
    for (let attempt = 0; attempt < 400; attempt++) {
      const a = rng() * Math.PI * 2;
      const r = radius * (0.4 + rng() * 0.45);
      const x = zone.x + Math.sin(a) * r;
      const z = zone.z - Math.cos(a) * r;
      if (col.groundAt(x, z, zone.y) === null) continue;
      if (Math.abs((col.topAt(x, z) ?? NaN) - zone.y) > 0.01) continue; // base level only (not tiers or bridges)
      const clear = [0, 1, 2, 3].every((i) => {
        const ox = Math.sin((i * Math.PI) / 2) * 1.1;
        const oz = Math.cos((i * Math.PI) / 2) * 1.1;
        return !col.obstacleAt(x + ox, zone.y + 1, z + oz) && !col.obstacleAt(x + ox, zone.y + 0.3, z + oz);
      });
      if (!clear) continue;
      const nearLandmark = landmarks.some((l) => {
        const fp = getModel(l.def.model).footprint;
        const size = fp === null ? 0.5 : fp.kind === 'circle' ? fp.r : Math.hypot(fp.w, fp.d) / 2;
        return Math.hypot(l.x - x, l.z - z) < size * l.scale + 2.4;
      });
      if (nearLandmark) continue;
      spots.push({ id: `hunt-${zone.id}`, zoneId: zone.id, x, y: zone.y + 0.9 + rng() * 0.9, z });
      break;
    }
  }
  return spots;
}
