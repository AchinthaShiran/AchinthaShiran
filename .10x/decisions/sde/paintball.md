# SDE — paintball (what was built)

See ADR-007 (paintball, mini games, arena) and ADR-008 (mouse look).

## Delivered
- **Core (pure, tested):** `game/paint/ballistics.ts` (ray march, launch velocity, segment–sphere), `badges.ts`
  (11 badges), `config.ts`, `sim.ts` (`PaintSim`: balls, splat decals, bursts, gallery/arena/hunt games, paint-bots),
  `huntTargets.ts` (one target per island, deterministic), `engine/look.ts` (mouse-look and aim-camera maths).
- **Glue:** `game/paint/controller.ts` (events → sfx, stores, badges, results, teleports), `game/mouseLook.ts`
  (pointer lock with automatic release and fallback), `state/paint.ts` (persisted bests, badges, found targets).
- **World:** Splat Arena island linked to Home only; landmarks for the gallery, bot gate, hunt desk, armory and
  challenge board; cover blocks and barrels; 11 new procedural models.
- **Scene/UI:** `PaintView` (instanced balls/splats/bursts, target and bot mirrors, shot input), gun in the
  player's hand with recoil, aim camera, crosshair, game HUD with splat meter, hit flash, results card, panels,
  Explore-menu entry, `F` hotkey and HUD button, controls on the intro and in the opening tips, Settings toggle.
- **Tests:** 97 total (was 62): ballistics, badges, simulation (13), look maths (7), arena isolation and hunt
  placement (5).

## Decisions made without asking
- Arena games move the player to the arena centre facing the range (gallery) so targets are in view.
- Games pause while a panel or menu is open; leaving the arena or putting the gun away ends the game.
- Shooting an exhibit opens it only when no game is running.

## Tech debt
- Browser play-tests used a dev-only hook (`window.__paint`, stripped from production) and a fast-forwarded
  simulation because headless software rendering runs at ~4 fps; real-GPU feel is untested.
- No touch fire button: tap shoots at the tap point (paint button toggles the gun).
- Bots use simple steering (no pathfinding around cover); they never leave the arena.
