# Security Review - wonderland - 2026-11-21

| Area | Finding | Status |
|---|---|---|
| XSS | No raw HTML injection; content is static TS rendered by React | ✅ |
| CSP | Meta CSP injected on build; verified no violations in smoke test | ✅ |
| Links | `noopener noreferrer`; scheme allow-list enforced by tests | ✅ |
| Secrets | None in repo; no env vars needed | ✅ |
| Storage | Settings/progress only, no PII; safe adapter | ✅ |
| Supply chain | Exact versions + lockfile; `npm audit` 0 vulns; CI `npm ci` | ✅ |
| CI permissions | Least privilege; deploy job isolated | ✅ |
| Privacy | Google Fonts third-party request | ⚠️ accepted - self-host to remove |
| Contact exposure | Email/phone published intentionally | ⚠️ accepted (owner decision) |
| Clickjacking | Pages cannot send `frame-ancestors` (meta CSP ignores it) | ⚠️ accepted - static content, no actions to hijack |

**Verdict:** No blocking issues. Approved for release.
