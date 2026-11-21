# SRE — wonderland

- **SLO (informal):** Pages availability is GitHub's (~99.9%). Content must always be reachable: Classic mode
  works without WebGL and is the automatic fallback.
- **Resilience built in:** WebGL detection → Classic; context loss → Classic with notice; model build/load
  failure → placeholder via error boundary; storage failure → in-memory state; player off-surface → respawn.
- **Monitoring:** none (no analytics by design). Optional later: privacy-friendly analytics or a Pages uptime check.
- **Runbook:**
  - *Site blank / 404:* check Actions run; confirm Pages source = GitHub Actions; check `base: './'`.
  - *3D fails on a device:* visitors land on Classic automatically; reproduce with quality=Low; check console.
  - *Content wrong:* edit `src/content/*`, `npm test`, push to `main`.
  - *Deploy broke:* re-run previous green workflow or `git revert` the offending commit.
