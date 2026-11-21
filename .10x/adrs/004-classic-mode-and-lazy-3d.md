# ADR-004: Classic (conventional) mode as a first-class route; 3D world lazy-loaded

**Status:** Accepted
**Date:** 2026-11-21
**Feature:** wonderland
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The portfolio must be usable without game experience, without WebGL, and on low-end devices (plan §15, §18.13).

## Decision
Hash routing: `#/` → 3D experience (lazy `import()` chunk containing three/R3F); `#/classic` → semantic HTML page
rendered from the same content components as the panels. No WebGL → automatic Classic mode with a notice.
Hash routing because GitHub Pages has no SPA rewrites.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Separate static HTML page | Simple | Duplicate content rendering | Violates single source of truth |
| History API routes | Clean URLs | Needs 404.html hack on Pages | Hash is robust and simple |

## Consequences
### Positive
- Fast first paint for Classic, crawlable text, resilient to WebGL failures.
### Negative
- Two layouts to style.
### Risks
- Drift between panel and classic rendering: both use shared section components.

## Dependencies
- ADR-001 (shared content).
