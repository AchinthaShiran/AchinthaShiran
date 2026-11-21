# Status

## wonderland (core) — delivered 2026-11-21
| Phase | State |
|---|---|
| 0–3 Brainstorm, strategy, design, planning | ✅ ADR-001..004 |
| 4 Implementation | ✅ T1–T11 |
| 5 Verification | ✅ [QA](reviews/2026-11-21-qa-report.md), [Security](reviews/2026-11-21-security-review.md) |
| 6 Delivery | ✅ CI + Pages workflow — **pending owner: create GitHub repo, push, enable Pages** |

## personal-islands — merged to `main` 2026-11-21 (ADR-005, ADR-006)
Four personal project islands, Project Park as the project hub, Sysco LABS district bridges.

## paintball — implemented 2026-11-21 (branch `feat/paintball`, ADR-007, ADR-008)
| Item | State |
|---|---|
| Paintball gun, shooting, splats, landmark shots | ✅ |
| Splat Arena island (Home-only link) | ✅ |
| Shooting gallery, bot arena (waves, splat meter, respawn at gate), island target hunt | ✅ |
| Challenge board, 11 badges, personal bests (local only) | ✅ |
| GTA-style mouse look (pointer lock) + over-the-shoulder aim camera + crosshair | ✅ |
| Controls shown on intro and opening tips (incl. paintball) | ✅ |
| Lint / typecheck / 97 tests / build / browser play-tests | ✅ no page errors |

## classic-redesign and avatar — implemented 2026-11-21
| Item | State |
|---|---|
| Placeholder messages removed (role Career step, contact, profiles, CV) | ✅ |
| Classic view redesign: hero, scroll-aware nav, progress, collapsible project cards, back-to-top, print | ✅ |
| Classic order: Personal projects, then Key projects at Sysco LABS (SAGE inside) | ✅ |
| Achintha's avatar restyled after the reference portrait | ✅ (the visitor's own character is unchanged) |

## Open items (owner input)
- LinkedIn and GitHub profile URLs (`src/content/contact.ts`).
- CV PDF (`public/cv/…` + `cv.path`).
- Screenshots / media for projects; the Skill Up and MySpend repositories are private, so no repo links are shown.
- Confirm the skills added from the personal projects (Python, C#, LangChain, LangGraph, Ollama).
- Confirm Tala's license (website says Apache-2.0, GitHub says MIT) if it should be shown.
- Role-specific details for Software Engineer and Senior Software Engineer (optional).
- Try the paintball feel on a real GPU and tune `GRAVITY`, `BALL_SPEED`, bot speed and wave sizes in
  `src/game/paint/config.ts` / `ballistics.ts` if needed.

## Next iteration candidates
Self-host fonts · trim drei · E2E smoke in CI · real .glb hero models · background music · touch fire button ·
project screenshots.
