# Engineering Manager - wonderland task plan

Branches: `feat/foundation` → `feat/world` → `feat/experience` → `ci/pages`, each merged `--no-ff` into `main`.

| # | Task | Depends |
|---|---|---|
| T1 | Scaffold Vite/TS/R3F, lint, prettier, vitest, design tokens | - |
| T2 | Content modules + integrity tests | T1 |
| T3 | Engine: rng, collision, nav/A* + tests | T1 |
| T4 | Assets: builders, materials, manifest, procedural models | T1 |
| T5 | World: zones, generators, buildWorld + invariant tests | T2–T4 |
| T6 | State stores (ui/settings/progress) with safe storage | T1 |
| T7 | Scene: environment, islands, bridges, landmarks, decor, seeds | T4–T6 |
| T8 | Player controller, camera rig, input, click-to-move, interaction | T5–T7 |
| T9 | Guide trail, signposts, compass | T8 |
| T10 | UI: HUD, panels, minimap, world map, quick nav, settings, intro | T6, T8 |
| T11 | Mobile controls, Classic mode, WebGL fallback, audio | T10 |
| T12 | QA pass, security review, CI + Pages deploy, README | all |

Risks: procedural art quality (iterate), mobile perf (low tier), scope (generators keep zones as data).
