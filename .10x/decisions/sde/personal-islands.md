# SDE - personal-islands (what was built)

## Delivered
- Content: four personal projects (Tala, Skill Up, MySpend, OpenAI-Unity) with categories, topics, public links;
  skills Python, C#, LangChain, LangGraph, Ollama (new "AI & Agents" category); four idea seeds.
- Assets: 27 procedural models in `models/makers.ts` (+ manifest entries), each visualizing a described feature.
- World: Tala Workshop, Skill Up Academy, MySpend Market, Unity Arcade; Project Park relocated into a Sysco LABS
  district; bridges lab–park, career–park, park–tala, lab–tala, tala–skillup, skillup–horizon, horizon–unity,
  unity–myspend; park gateways per personal project; `projectIslands` / `personalSections`.
- UI: project topics + links + category lists, "Find it in the world" Guide/Travel, Explore menu group,
  Classic "Personal projects" section, world-map label layer and bounds fix.
- Camera: occlusion rises over obstacles before zooming in.
- Tests: 62 (was 46) - categories/topics/links, per-island invariants, project connections.

## Deviations
- Facts for the two private repositories come from their public Play Store listings and the MySpend website.
- Tala's website states Apache-2.0 while GitHub lists MIT, so no license is displayed.

## Tech debt
- Each personal island is hand-authored in `zones.ts`; adding a project means a ZoneDef (README recipe).
- Park gateways have four slots (throws beyond that).
- World map labels still touch neighbours in a few spots (cosmetic).
