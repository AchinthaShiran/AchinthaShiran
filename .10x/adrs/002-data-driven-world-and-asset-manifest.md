# ADR-002: Data-driven world layout + asset manifest with procedural models

**Status:** Accepted
**Date:** 2026-11-21
**Feature:** wonderland
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The world must grow (new projects, roles, skills, awards) without redesign, and models must be easy to replace.

## Decision
- Zones are declared in `src/world/zones.ts` (position, elevation, radius, palette, static landmarks, decor density).
- Zone *generators* derive landmarks from content (exhibit per project, floor per role, crystal per skill,
  trophy per award).
- `buildWorld()` is a pure function producing an immutable `World`: zones, landmarks, bridges, walkable surfaces,
  obstacles, nav graph, interactables, seeds. Scene, engine and UI all read the same `World`.
- Every renderable references a `ModelKey` in `src/assets/manifest.ts`:
  `{ source: procedural(factory) | gltf(url), footprint }`. The footprint lives in the manifest, so swapping to a
  `.glb` keeps collision. Factories may set `userData.tick` for ambient animation.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Hand-authored scenes per island (JSX) | Max artistic control | Every content change edits scene code | Fails extensibility goal |
| Single level file from an editor (Blender glTF) | Visual editing | Content and geometry coupled, big download | Content would not drive the world |
| CC0 model packs | Richer visuals | Licence curation, download weight | Owner chose procedural-first; manifest keeps the door open |

## Consequences
### Positive
- One-line additions, testable layout invariants, tiny bundle.
### Negative
- Procedural art is simpler than hand-modelled art.
### Risks
- Auto-layout overlap as content grows: ring layouts scale their slots; tests assert landmarks do not overlap.

## Dependencies
- ADR-003 consumes footprints for obstacles.
