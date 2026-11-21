# Architect — personal-islands

See ADR-005.

## Layout (southern arc, "Makers' Row")
| Zone | Centre | R | Links |
|---|---|---|---|
| Tala Workshop | (-72, 52) | 17 | Innovation Lab, Skill Up Academy |
| Skill Up Academy | (-40, 98) | 16 | Tala Workshop, Horizon Island |
| Unity Arcade | (40, 98) | 16 | Horizon Island, MySpend Market |
| MySpend Market | (74, 54) | 16 | Unity Arcade, Project Park |

Each island: central landmark (project panel) on a plaza, ring of topic stations at r≈11–12.5, nav ring r=7.5,
bridges leave on free arcs. Existing zones adjusted for the new bridges: Innovation Lab stations re-spaced around
a new bridge at 190°, Project Park exhibits moved to a 130° arc, Horizon landmarks and pier shifted.

## Boundaries
- Content: `Project.category/links/topics`, new skills + category, new idea seeds.
- World: four `ZoneDef`s, six `zoneLinks`, `personalSections()` derived from content + zones.
- UI: shared blocks gain category-aware lists, topic panels and links; Classic gets a Personal projects section.

## Failure modes
- Topic id without matching content → panel shows "not found"; test asserts every landmark panel resolves.
- Overlapping stations/bridges → existing world tests (overlap, walkable nav edges, reachability) cover the new zones.
