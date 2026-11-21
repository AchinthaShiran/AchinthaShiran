# ADR-005: Personal projects as dedicated islands; project categories and topics

**Status:** Accepted
**Date:** 2026-11-21
**Feature:** personal-islands
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The owner supplied four personal projects (Tala, Skill Up, MySpend, OpenAI-Unity) and asked for them to be
"descriptive islands", separate from the corporate projects in the resume (SAGE, Excellence Hub, TA Portal).
Plan §5.4 allowed additional projects once details were confirmed. Two of the four repositories are private, so
their facts come from public store listings and websites. Each project has several distinct features worth
explaining, which a single exhibit cannot do.

## Decision
- Add `category: 'corporate' | 'personal'`, `links`, `topics` and a nullable `exhibitModel` to `Project`.
  A **topic** is one explainable feature (title, summary, points) and opens as a `project-topic` panel.
- Corporate projects keep their exhibits in Project Park (generator now filters by category).
- Each personal project gets **one island** declared in `zones.ts`: a central landmark that opens the project
  panel, plus one station per topic. Islands form a southern arc ("Makers' Row") linked by bridges.
- `PanelRef` gains `project-topic` and an optional `category` on `projects`.
- Quick navigation lists personal projects in their own group, derived from content + zone config.
- Technologies stated in the repos are added to the skill list under a new `personal-project` source, in a new
  "AI & Agents" category. Technologies are never guessed for projects that do not publish a stack.
- Links are only shown when public: private repositories get no `repoUrl`.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Add personal projects as extra Project Park exhibits | Zero new islands, fully generated | One small exhibit per project cannot describe its features; mixes corporate and personal work | Owner asked for descriptive islands |
| One shared "Side Projects" island with four large exhibits | Smaller world | Still crowded; every feature needs a station, so the island would be dense | Distinct identities per project are a plan requirement (§18.3) |
| Auto-generate personal islands from content | Truly zero-config | Each island needs bespoke stations/models; generic placeholders would look empty | Hand-authored islands, with a documented recipe, give better quality |

## Consequences
### Positive
- Each project is explained feature by feature, in the same panel system, Classic mode and quick navigation.
- Corporate and personal work stay clearly separated; cross-links via skills show where technologies appear.
### Negative
- Adding a personal project means authoring a `ZoneDef` (and optionally models); documented in the README.
- The world is larger (13 zones), so travel and the map matter more.
### Risks
- Facts drifting from the sources: topics only restate public text; unknown stacks stay empty.
- License wording differs between a project's website and its repository, so licenses are not displayed.

## Dependencies
- ADR-001 (typed content) and ADR-002 (data-driven world).
