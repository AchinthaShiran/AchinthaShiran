# ADR-006: Sysco LABS district and Project Park as the hub for every project

**Status:** Accepted
**Date:** 2026-11-21
**Feature:** personal-islands
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The owner asked that (1) Project Park connect to every project and to the islands that explain them, and (2) the
Innovation Lab (SAGE) — a Sysco LABS project — be bridged to Career City (Sysco LABS) and to Project Park.
Project Park sat in the east and the Innovation Lab in the west; a straight bridge between them would cross Home
Island. Bridges are straight strips, and a strip above Home's surface would act as a wall for the player
(ADR-003: surfaces higher than step height block).

## Decision
- Move Project Park to the west, next to the Innovation Lab and Career City, forming a **Sysco LABS district**
  with bridges lab–career, lab–park and career–park. Add a park–tala bridge into Makers' Row.
- Project Park keeps exhibits for corporate projects and gains one **gateway** per personal project (generated
  from content, four slots).
- `ZoneDef.projects` records which projects an island explains. Project panels use it to show **Find it in the
  world** with Guide and Travel (a host-provided `extra` slot, so Classic mode stays free of game actions).
- The Home–Park, Park–Forest and Park–MySpend bridges are removed; Forest remains reachable via Mentor Pavilion
  and MySpend via Unity Arcade.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Keep Park in the east, bridge it to the Lab across Home | No relocation | Bridge would overlap Home and block walking | Breaks ADR-003 movement rules |
| Add an intermediate islet to route a Lab–Park bridge | Park stays east | Extra world object that is not content; still a long detour | Relocation is simpler and reads better |
| Connect through UI only (no bridges) | No layout change | Fails the explicit request for bridges | Owner asked for bridges |

## Consequences
### Positive
- Related places are adjacent: employer, flagship project and project hub share a district.
- Every project panel can take a visitor to where the project lives.
### Negative
- The east side of the world is sparser (Skill Forest, Mentor Pavilion, MySpend).
- Existing visitors' mental map of Project Park changes.
### Risks
- More islands lengthen travel; mitigated by the map, Explore menu and project-panel Travel buttons.

## Dependencies
- ADR-002 (data-driven world), ADR-003 (collision), ADR-005 (personal project islands).
