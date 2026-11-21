# Architect — personal-islands

See ADR-005 (personal project islands) and ADR-006 (Sysco LABS district, Project Park hub).

## Layout
Makers' Row (southern arc):

| Zone | Centre | R | Links |
|---|---|---|---|
| Tala Workshop | (-72, 52) | 17 | Innovation Lab, Skill Up Academy, Project Park |
| Skill Up Academy | (-40, 98) | 16 | Tala Workshop, Horizon Island |
| Unity Arcade | (40, 98) | 16 | Horizon Island, MySpend Market |
| MySpend Market | (74, 54) | 16 | Unity Arcade |

Sysco LABS district (west): Project Park moved to (-112, -20), bridged to Innovation Lab and Career City (plus
Tala). Innovation Lab ↔ Career City already existed.

Each personal island: central landmark on a plaza, ring of topic stations at r≈11–12.5, nav ring r=7.5, bridges on
free arcs. Existing zones re-spaced around new bridges: Innovation Lab, Career City, Horizon, Tala's sign.

## Boundaries
- Content: `Project.category/links/topics`, new skills + `ai` category, four idea seeds.
- World: four `ZoneDef`s with `projects`, eight new `zoneLinks`, `projectIslands`, `personalSections`
  (both derived from zone config), park gateways generated from content.
- UI: shared blocks gain category-aware lists, topic panels, links and an `extra` slot; `IslandActions` (world-only)
  adds Guide/Travel to project panels; Classic gets a Personal projects section.
- Camera: occlusion now rises over obstacles before pulling in.

## Failure modes
- Topic id without matching content → panel shows "not found"; tests assert every landmark panel resolves and every
  personal topic has a station.
- Overlapping stations/bridges → world tests (overlap, walkable nav edges, reachability, island spacing).
- More than four personal projects → `parkLandmarks()` throws with a clear message (add gateway slots).
