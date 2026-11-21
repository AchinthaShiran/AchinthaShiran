# Security — wonderland

Threat model: static site, no backend, no auth, no user input beyond navigation. Assets: owner reputation,
visitor privacy, integrity of published content.

Controls:
- Build-time CSP meta (`script-src 'self'`, `object-src 'none'`, `form-action 'none'`, fonts only from Google Fonts).
- No `dangerouslySetInnerHTML`; all text rendered via React escaping; canvas text only.
- External links `target=_blank` + `rel="noopener noreferrer"`; content tests restrict link schemes to
  `https:`, `mailto:`, `tel:`.
- localStorage holds only settings/progress, accessed through a throwing-safe adapter.
- CI uses least-privilege permissions (`contents: read`; `pages: write` + `id-token: write` only in deploy job).
- Dependencies pinned (exact versions + lockfile), `npm audit` clean.

Accepted risks: public email/phone (owner's choice, from plan) may attract spam; Google Fonts request reveals
visitor IP to Google (self-host fonts to remove).
