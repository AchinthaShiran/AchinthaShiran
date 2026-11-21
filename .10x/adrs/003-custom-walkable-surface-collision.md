# ADR-003: Custom 2.5D walkable-surface collision instead of a physics engine

**Status:** Accepted
**Date:** 2026-11-21
**Feature:** wonderland
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The brainstorm proposed `@react-three/rapier`. Requirements: never fall off islands, never get stuck, never walk
through buildings, a gentle jump, click-to-move/path following, low-end devices, easy to reason about.
The world is flat-topped floating islands, bridges and ramps, which is essentially 2.5D.

## Decision
Implement `src/engine/collision.ts`: walkable *surfaces* (discs + sloped strips with heights) and *obstacles*
(circles + oriented boxes with a vertical extent). Movement = propose → push out of obstacles → accept only if the
point lies on a walkable surface reachable within step height (else slide along one axis, else stay). Surfaces
higher than step height act as walls. Gravity/jump is a simple vertical integrator against `groundAt()`.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Rapier (WASM) character controller | General 3D physics, slopes/steps | ~2MB WASM, async init, trimesh setup, still needs invisible walls, harder to unit test | Overkill for 2.5D, hurts low-end load |
| Navmesh (recast) | Industry-standard pathing | Build step/WASM, heavy | Waypoint graph suffices |
| No collision | Trivial | Breaks "can't fall / walk through buildings" | Requirement |

## Consequences
### Positive
- Deterministic, pure TS, unit-tested, zero load cost; "can't fall off" holds by construction.
### Negative
- No dynamic physics props (not needed). True 3D terrain later would need a new ADR.
### Risks
- Overlapping-surface ambiguity: rule "highest surface at or below y + stepUp"; covered by tests.

## Dependencies
- Navigation graph edges must lie on walkable surfaces (asserted by world tests).
