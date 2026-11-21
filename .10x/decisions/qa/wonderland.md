# QA — wonderland

## Strategy
- **Unit (Vitest, CI):** content integrity, collision, nav/A*, world invariants (reachability of every interactable
  and section from spawn, walkable nav edges, walkable seeds, no landmark overlap, island spacing), stores,
  hash routing. 46 tests.
- **Browser smoke (Playwright + Edge, local, production build):** intro, explore, keyboard move, map, menu,
  travel to 6 zones, guide trail, Classic mode, mobile viewport; interaction flow (E, Esc, panel push/back,
  landmark click → walk → open, settings persistence). Zero page errors.
- **Quality gates:** `npm run check` + format check in CI must pass before deploy.

## Bugs found & fixed during verification
1. Classic mode falsely reported "3D world stopped" — R3F forces context loss on unmount. Fixed (ignore when canvas detached).
2. Camera could sit inside buildings after travel — added occlusion pull-in.
3. Home not marked visited on spawn; world-map label overlap; panel covered HUD buttons; mobile top bar overlap;
   signpost blocked the spawn view; PCFSoftShadowMap deprecation warning. All fixed.

## Known gaps
- No automated E2E in CI; no real-GPU performance measurement (headless SwiftShader only).
- Screen-reader pass done by code review (roles/labels/focus), not with an actual screen reader.
