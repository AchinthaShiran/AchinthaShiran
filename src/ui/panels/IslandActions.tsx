import { guideTo, travelToLandmark, world } from '@/game/actions';
import { useUi } from '@/state/ui';
import { projectIslands } from '@/world/sections';
import { Section } from '../content/blocks';
import { Icon } from '../Icon';

/**
 * "Find it in the world": connects a project panel (e.g. opened from a Project Park exhibit or gateway) to
 * the island that explains the project. Projects without an island render nothing.
 */
export function IslandActions({ projectId }: { projectId: string }) {
  const currentZone = useUi((s) => s.currentZone);
  const island = projectIslands.get(projectId);
  if (!island) return null;
  const zone = world.zone(island.zoneId);
  const label = zone.def.name;

  return (
    <Section title="Find it in the world">
      <p style={{ margin: '0 0 8px' }}>
        {zone.def.glyph} <strong>{label}</strong>
        <br />
        <span className="muted">{zone.def.section}</span>
      </p>
      {currentZone === island.zoneId ? (
        <p className="note">You are on this island - look around for its stations.</p>
      ) : (
        <div className="actions">
          <button
            type="button"
            className="btn btn--small"
            onClick={() => guideTo({ kind: 'landmark', id: island.landmarkId, label })}
          >
            <Icon name="guide" /> Guide me
          </button>
          <button
            type="button"
            className="btn btn--small btn--primary"
            onClick={() => travelToLandmark(island.landmarkId)}
          >
            <Icon name="travel" /> Travel
          </button>
        </div>
      )}
    </Section>
  );
}
