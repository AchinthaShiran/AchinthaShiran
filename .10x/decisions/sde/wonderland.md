# SDE - wonderland (what was built)

## Delivered (T1–T12)
- **Content** (`src/content`): profile, experience (3 Sysco LABS roles, exact dates), 3 projects, 10 skills in
  6 categories, 6 awards (project recognition), education, 3 mentoring activities, contact, CV placeholder,
  6 SAGE topics, 7 Idea Seeds. Integrity tests.
- **Engine** (`src/engine`): walkable-surface collision (discs/strips, step height, tier walls via obstacles),
  obstacle push-out (circle/OBB), `obstacleAt` for camera occlusion, A* nav graph, keyboard/joystick input,
  mutable player state.
- **World** (`src/world`): 9 zones, 10 bridges, content-driven generators (career, park, forest, peak),
  `buildWorld()` producing surfaces, obstacles, 164 nav nodes / 260 edges, 52 interactables, ~340 decor items, seeds.
- **Assets**: ~70 procedural low-poly models in a manifest (procedural | gltf), shared flat materials with
  wind-sway shader, static mesh baking, canvas text textures.
- **Scene**: islands, tiers, ramps, rope bridges, visible route paths, baked decor, zone features (river,
  waterfall, ring road + cars, robots, pier + sky-boat, crystal links), landmarks with idle markers, nearby ring
  + label, selection hop, category glow, signposts, bridge-head signs, player controller (run/jump/auto-walk/stuck
  recovery), follow camera (drag orbit, zoom, pinch, auto-follow, occlusion, intro fly-in), guide trail + beacon,
  click marker, Idea Seeds.
- **UI**: HUD, panels (27 panel kinds, back stack, focus mgmt), minimap, world map (guide/travel), Explore menu
  (10 sections: open/guide/go), settings (sound, reduced motion, quality), intro (skippable, remembered),
  touch controls, Classic mode, WebGL fallback, procedural WebAudio sfx + ambience (muted by default).
- **Delivery**: CI (format, lint, typecheck, test, build) + Pages deploy, build-time CSP, README.

## Deviations from plan
- Rapier replaced by custom collision (ADR-003) - decided in design, before coding.
- Project Park second exhibit row (> 6 projects) is laid out but not yet exercised by tests (only 3 projects).

## Tech debt
- `WorldApp` chunk ~1.1 MB (three + drei, ~300 KB gzip). drei is only used for `Html` + `useGLTF`; could be replaced
  to trim ~100 KB.
- Achievement Peak trophy slots are a fixed list (10); `peakLandmarks()` throws if exceeded.
- Canvas-text signs use system font if Fredoka hasn't loaded yet when textures are first drawn.
- No E2E tests in CI (browser smoke tests were run locally with Playwright against the production build).
