# ADR-001: Portfolio content as typed TypeScript data modules

**Status:** Accepted
**Date:** 2026-11-21
**Feature:** wonderland
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
Content must be independently editable (plan §17), accurate, and shared by the 3D panels and the Classic mode.
Unknown values (LinkedIn/GitHub URLs, CV, media) must stay placeholders and be hidden.

## Decision
All facts live in `src/content/*.ts` as typed, `readonly` data with explicit `null` for unknown optional values.
Entities reference each other by string ids (award → projectId, role → projectIds, skill ↔ projects).
A Vitest suite enforces referential integrity. UI components render optional fields only when present.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| JSON/YAML files | Editable by non-devs | No type safety, needs schema lib | TS gives compile-time checks for free |
| Headless CMS | Web editing | Backend, cost, network dependency | Overkill for a single owner |
| Markdown + frontmatter | Rich text | Parsing, weak typing | Content is structured, not prose |

## Consequences
### Positive
- Compile-time validation, tree-shaken, refactor-safe ids.
### Negative
- Editing requires a commit and redeploy (acceptable for a portfolio).
### Risks
- Dangling ids: caught by the integrity tests.

## Dependencies
- Constrains UI: every component must tolerate `null` optional fields.
