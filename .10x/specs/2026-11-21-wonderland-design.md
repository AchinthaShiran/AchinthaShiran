# WONDERLAND - Design Spec

**Date:** 2026-11-21
**Feature slug:** `wonderland`
**Source requirements:** [`plan.md`](../../plan.md) (product description, content facts)
**Status:** Approved by owner (2026-11-21)

## 1. Goal

An explorable, low-poly, floating-islands 3D portfolio for Achintha Bandara that feels like a small
indie adventure game while keeping every piece of professional content one or two clicks away.

## 2. Owner decisions (brainstorming)

| Question | Decision |
|---|---|
| Stack | Vite + TypeScript (strict) + React Three Fiber + drei + Zustand |
| Models | Procedural low-poly models first, all resolved through one asset manifest (swappable for `.glb`) |
| Scope | Full world in first delivery; iterative polish afterwards |
| Hosting | GitHub Pages via GitHub Actions |
| Git | Conventional commits, owner's identity, **no Claude co-author trailers** |

## 3. Architecture (layers)

| Layer | Path | Responsibility | Depends on |
|---|---|---|---|
| Content | `src/content/` | Typed portfolio facts. Single source of truth. Unknown values are `null` and hidden. | nothing |
| World config | `src/world/` | Zones (islands/islets), landmarks, zone graph (bridges). Content-driven generators lay out exhibits, crystals, trophies, career floors. | content, assets keys |
| Assets | `src/assets/` | Manifest `modelKey → procedural factory | gltf url` + footprint. Shared flat-shaded materials. | three |
| Engine | `src/engine/` | 2.5D walkable-surface collision, obstacles, waypoint nav graph + A*, input, mutable player state. Pure TS, unit-tested. | world |
| Scene | `src/scene/` | R3F components rendering world, player, camera, guide trail, environment. | engine, world, assets, state |
| State | `src/state/` | Zustand stores: UI (panels, map, destination), settings (persisted), progress (visited, seeds). | - |
| UI | `src/ui/` | HUD, panels, minimap, world map, quick nav, intro, settings, Classic mode. | content, state |

## 4. World layout

Central Home Island with six islands (N Achievement Peak, NW Career City, NE Skill Forest, W Innovation
Lab, E Project Park, S Horizon Island) and two islets (University Grove - Education, between Home and
Career City; Mentor Pavilion - Mentorship, between Home and Skill Forest). Bridges are generated from
zone-graph edges. Elevations vary by a few units; bridges slope between them.

Content-driven zones (adding data adds world objects, no layout changes):
- **Career City:** one building per organization, one floor per role.
- **Project Park:** one exhibit per project, auto-placed on a ring of plinths.
- **Skill Forest:** one crystal per skill, clustered by category.
- **Achievement Peak:** one trophy per award, distributed along the mountain trail tiers.

## 5. Movement, collision, navigation

- Walkable surfaces: discs (island tops, mountain tiers) and strips (bridges, ramps) with heights.
  The player can only stand on walkable surfaces → cannot fall off. Higher surfaces act as walls.
- Obstacles: circles / oriented boxes from asset footprints → cannot walk through buildings.
- Waypoint graph (zone hubs, landmark approach points, bridge ends, ramp ends) + A* drives
  click-to-move, landmark auto-walk and the guide trail. Stuck detection skips/cancels.
- Controls: WASD move, Shift run, Space jump, E interact, M map, Esc close, mouse drag orbit,
  wheel zoom, click ground to move, click landmark to walk + open. Touch: joystick, interact, jump.

## 6. Guidance

Guide trail (glowing breadcrumbs along A* path), HUD compass to destination, signposts at hubs,
minimap (north-up canvas: zones, bridges, player arrow, route), world map overlay (M) with
descriptions, visited state, "Guide me" and "Travel" (fade + teleport).

## 7. Interaction states

Idle (floating marker above every interactable) → Nearby (ground ring, bounce, label, prompt) →
Selected (hop + sfx) → Open (panel) → Closed (resume in place). Panels have history (back).

## 8. Accessibility, mobile, performance

- Classic mode `#/classic`: full conventional page from the same content; auto when WebGL missing.
- Reduced motion (defaults to OS preference), mute (default muted), quality tier (auto/low/high).
- Keyboard-operable panels/menus, focus management, readable contrast.
- Mobile: joystick, interact/jump buttons, bottom-sheet panels, compact map, tap-to-travel, low tier.
- Perf: shared materials, merged/instanced decor, DPR clamp, shadows only on high tier,
  3D world lazy-loaded (Classic page never downloads three.js).

## 9. Content accuracy rules

Only resume facts from `plan.md`. LinkedIn/GitHub URLs, CV file, screenshots, demo links are `null`
until supplied and the UI hides them. Awards are labeled as project recognitions. No proficiency
ratings, no invented responsibilities for earlier roles.

## 10. Testing & delivery

Vitest: content integrity (cross-references resolve), collision, A* pathfinding, world layout
invariants (every interactable reachable from Home spawn). CI: lint, typecheck, test, build; deploy
`dist/` to GitHub Pages from `main`.

## 11. Out of scope

Per plan §19 (no multiplayer, accounts, quests, currencies, etc.).
