# DBA — wonderland

No database. Data model = typed content modules (ADR-001):
- Entities: Organization, Role, Project, Skill/SkillCategory, Award, Education, MentoringActivity, ContactChannel,
  SageTopic, IdeaSeed. Relations by kebab-case id (Role→Organization/Projects, Award→Project, Project→Skills).
- Integrity enforced by `src/content/content.test.ts` (unique ids, kebab-case, references resolve, exact role dates,
  link schemes) and `src/world/world.test.ts` (every entity appears in the world).
- Client persistence: localStorage keys `wonderland:settings` and `wonderland:progress` (versioned via zustand
  `persist`, `version: 1`). Bump `version` + add `migrate` when the shape changes. No PII stored.
