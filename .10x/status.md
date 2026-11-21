# Status

## wonderland (core) — delivered 2026-11-21
| Phase | State |
|---|---|
| 0–3 Brainstorm, strategy, design, planning | ✅ ADR-001..004 |
| 4 Implementation | ✅ T1–T11 |
| 5 Verification | ✅ [QA](reviews/2026-11-21-qa-report.md), [Security](reviews/2026-11-21-security-review.md) |
| 6 Delivery | ✅ CI + Pages workflow — **pending owner: create GitHub repo, push, enable Pages** |

## personal-islands — implemented 2026-11-21 (branch `feat/personal-islands`)
| Item | State |
|---|---|
| Design (ADR-005, ADR-006) | ✅ |
| Personal projects as islands (4) | ✅ |
| Project Park hub: gateways + "Find it in the world" | ✅ |
| Sysco LABS district: Lab ↔ Career City ↔ Project Park bridges | ✅ |
| Tests / lint / typecheck / build / browser smoke | ✅ 62 tests, no page errors |

## Open items (owner input)
- LinkedIn and GitHub profile URLs (`src/content/contact.ts`).
- CV PDF (`public/cv/…` + `cv.path`).
- Screenshots / media for projects; the Skill Up and MySpend repositories are private, so no repo links are shown.
- Confirm the skills added from the personal projects (Python, C#, LangChain, LangGraph, Ollama).
- Confirm Tala's license (website says Apache-2.0, GitHub says MIT) if it should be shown.
- Role-specific details for Software Engineer and Senior Software Engineer (optional).

## Next iteration candidates
Self-host fonts · trim drei · E2E smoke in CI · real .glb hero models · background music · Skill Up / MySpend
screenshots.
