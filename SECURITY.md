# Security

## Supported versions

Only the latest release on `main` is actively maintained. Older commits are
not patched.

## Reporting a vulnerability

If you discover a security issue, **do not open a public issue**. Instead,
open a GitHub Security Advisory on this repository or contact the
maintainers directly via the email listed on the GitHub profile.

Include:

- A clear description of the issue and the attack vector.
- Steps to reproduce.
- The expected vs. actual behaviour.
- (Optional) A patch or suggested fix.

We will acknowledge within 72 hours and aim to ship a fix within 14 days for
critical issues. Credit is given to reporters who request it.

## Threat model

Cena Radar is a public, read-only price aggregator. There are no user
accounts, no authentication, no database, and no write paths. The main
risks are:

- **Scraper abuse** — a malicious actor could spam the search endpoint to
  make the upstream kupi.cz rate-limit our IP. The in-memory rate limiter
  in `src/lib/rate-limit.ts` mitigates this; for multi-instance
  deployments, swap it for a Redis-backed limiter.
- **Cache poisoning** — kupi.cz is trusted; if their HTML is ever tampered
  with, the parsed output will be tampered with too. Verify deals in
  person before relying on them.
- **Image content** — product images are served from `img.kupi.cz` with
  `unoptimized={true}` because the Next.js image optimizer would re-fetch
  them and waste bandwidth. CSP is not set; add one if you deploy
  publicly.

## Out of scope

- Pricing or product data accuracy (see the [disclaimer in the
  README](./README.md#disclaimer)).
- kupi.cz availability — if the source goes down, the app breaks.
