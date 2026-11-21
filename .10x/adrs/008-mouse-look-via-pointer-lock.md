# ADR-008: Desktop mouse look via pointer lock, with an over-the-shoulder aim camera

**Status:** Accepted
**Date:** 2026-11-21
**Feature:** paintball
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The owner asked for GTA-style looking with the mouse on PC browsers when the page is focused, and for the
paintball controls to be shown when the page loads. The plan (§9) asks for "mouse: rotate camera or look around"
and also requires click-to-move/point-and-click navigation for visitors unfamiliar with game controls (§9, §15).

## Decision
- **Pointer lock** captures the mouse when the visitor clicks the world (and when they press Explore on the intro,
  which is a user gesture). Raw mouse movement turns the camera; no dragging.
- **Safe by default:** the lock is released automatically whenever a panel, menu or result card opens, and by Esc.
  If the browser refuses the lock, the app falls back to drag-to-look and click-to-walk for the session.
- **Opt-out:** a Settings switch ("Mouse look", default on, desktop only) restores the classic controls. Touch
  devices never capture the mouse. Classic mode is unaffected.
- **Clicks while captured** interact with the highlighted object (same as `E`); the click that captures the mouse
  does not also walk. In paint mode a click shoots where the centre crosshair points.
- **Aim camera:** with the mouse captured and the gun out, the camera moves over the right shoulder, the player
  faces the aim direction, pitch may look up, and shots follow the centre ray. The maths is a pure, unit-tested
  module (`engine/look.ts`).
- **Discoverability:** the controls (including `F` for the paintball gun) are listed on the intro card and in the
  opening tips, adapted to touch or desktop; a small hint appears whenever the mouse is free.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Keep drag-to-look only | No lock edge cases | Not "like GTA"; tiring | Owner request |
| Always capture the mouse, no opt-out | Simplest | Breaks click-to-walk for newcomers and accessibility needs | Violates plan §9/§15 |
| Hold-right-mouse to look | No capture needed | Not what was asked; awkward trackpads | Owner asked for GTA-style |

## Consequences
### Positive
- Smooth, game-like camera control; precise aiming with a crosshair.
### Negative
- While captured the HUD buttons are unreachable until Esc (keyboard shortcuts still work).
- More input states to maintain.
### Risks
- Browser differences in pointer lock: failure falls back to the classic controls; verified in Chromium.

## Dependencies
- ADR-007 (paintball), plan §9 and §15.
