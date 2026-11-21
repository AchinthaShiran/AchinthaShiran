# DevOps - wonderland

- **Pipeline:** `.github/workflows/ci.yml`. On PR: format check, lint, typecheck, test, build. On `main`: same
  then `upload-pages-artifact` → `deploy-pages` (environment `github-pages`).
- **One-time setup:** create the GitHub repo, push `main`, Settings → Pages → Source: **GitHub Actions**.
- **Build:** `base: './'` + hash routing → works on `user.github.io/<any-repo>/` and custom domains.
- **Rollback:** re-run the deploy workflow for a previous commit (Actions → run → Re-run) or `git revert` +
  push. Pages keeps the last successful deployment if a build fails.
- **Branching:** feature branches → `--no-ff` merge into `main`; conventional commits; no Claude co-author trailers.
