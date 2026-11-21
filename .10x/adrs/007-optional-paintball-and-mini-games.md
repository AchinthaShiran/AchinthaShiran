# ADR-007: Optional paintball, mini games and an enemy island

**Status:** Accepted
**Date:** 2026-11-21
**Feature:** paintball
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The owner asked for a paintball gun the player can shoot and interact with, targets, mini games, challenges and a
few enemies, without interfering with or blocking exploration (a separate enemy island is allowed). Plan §19 had
put combat and scoring out of scope "unless separately requested"; this request overrides that, with constraints:
- Shooting is optional and never needed to reach portfolio content.
- Enemies never leave their island and only exist while the arena game runs.
- No online leaderboards; personal bests and badges stay in the visitor's browser.

Owner choices: the gun is usable anywhere as a toggle; enemies fill a splat meter, and a full meter respawns the
player at the arena gate; all four games (gallery, bot arena waves, island target hunt, trick-shot badges);
personal bests + badges.

## Decision
- **Paint mode** (F / HUD button): left-click or tap shoots toward the pointer instead of walking. A shot that
  hits an interactive landmark opens it when no game is running.
- **Pure core** in `src/game/paint/`: ballistics (aim march against the collision world, launch velocity with
  gravity compensation, segment–sphere hits), badge rules and game config are dependency-free and unit-tested.
- **Runtime** (`runtime.ts`): mutable per-frame simulation — paint balls, splat decals, targets, paint-bots and
  game controllers — driven by one scene component. React state is only a throttled snapshot (Zustand store).
- **World**: new zone `arena` ("Splat Arena") east of Home, linked only to Home. Hunt targets are placed
  automatically, one per other zone, with the same rejection rules as decor (off paths, landmarks and bridges).
- **UI**: game HUD, countdown, results card, splat meter, hit overlay; panels for the challenge board, each game
  and paint-mode help; Explore menu entry.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Physics engine for projectiles | Generic collisions | Large WASM, overkill (ADR-003) | Analytic spheres + collision-world queries suffice |
| Raycast against rendered meshes for aiming | Pixel-accurate | Sky sphere/clouds, merged meshes, per-click cost | Marching the collision world matches gameplay collision exactly |
| Separate game page/scene | Total isolation | Breaks "explore one world" and duplicates engine | Optional mode in the same world is cheaper and nicer |
| Enemies roaming the main islands | More "alive" | Interferes with exploration | Explicitly not wanted |

## Consequences
### Positive
- Adds play value without touching how portfolio content is reached; hunt targets encourage visiting every island.
- Gameplay logic is testable in isolation.
### Negative
- More HUD states and input modes to maintain; the world chunk grows slightly.
### Risks
- Click handling conflicts between walking, landmark clicks and shooting: paint mode gates all ground/landmark
  click handlers; drags never shoot.
- Performance on low-end devices: projectiles/splats are instanced and capped.

## Dependencies
- ADR-002 (data-driven world), ADR-003 (collision world queries), ADR-004 (Classic mode unaffected).
