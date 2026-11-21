# CTO — wonderland

- **Build vs buy:** Build. A bespoke explorable world is the product; templates/site builders cannot deliver it.
- **Stack:** Vite + TS strict + React Three Fiber 9 / drei 10 / three r187 + Zustand 5. React chosen for the
  accessible DOM UI and Classic mode sharing the same content components.
- **Hosting:** GitHub Pages (free, static). No server, no secrets, no runtime cost.
- **Risk:** scope (7 islands + full UI). Mitigated by a data-driven world and procedural assets, so islands are
  config rather than bespoke scenes.
- **Tech direction:** a physics engine is not required; custom 2.5D walkable-surface collision (ADR-003).
