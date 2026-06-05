# Cena Radar

Real-time price comparison of on-sale groceries across Czech retailers, built
by scraping public leaflet data from kupi.cz.

## Quick reference

- `npm run dev` — local dev server on http://localhost:3000
- `npm run build` — production build
- `npm run start` — start the built app
- `npm run lint` — Biome check
- `npm run format` — Biome format

## Requirements

- Node.js 20 or newer
- npm (or pnpm / yarn / bun)

## Environment

This project does not require any environment variables to run. Everything
works out of the box using the public kupi.cz pages. If you fork it and
want to add analytics or a third-party API, do it via `.env.local`
(see `.env.example` for the shape).

## Architecture

Read the top-level [README.md](./README.md#how-it-works) for a
high-level overview. In short:

- Server-side scraping is in `src/lib/scraper/`. Each module is
  `server-only` and uses `fetch` with a Czech user-agent. No headless
  browser.
- Server state (data) flows through TanStack Query hooks in
  `src/lib/query/hooks.ts`. Cached at the function level via Next.js
  `'use cache'`.
- Client state (palette open/close, search query) is in
  `src/stores/ui-store.ts` and `src/stores/search-store.ts`.
- UI components are split into server (data-fetching) and client
  (`"use client"`) — server components never hold UI state.
- Styling is Tailwind v4 with a custom OKLCH theme defined in
  `src/app/globals.css`. Animation tokens are in
  `src/app/transitions.css`.

## Project rules

`AGENTS.md` at the root captures the project's conventions for AI agents
(Next.js quirks, animations, state management, i18n). It is also useful
reading for human contributors.

## Adding a new shop

1. Add the slug + display name to `src/lib/scraper/shops.ts`.
2. (Optional) Add the slug to the `LEAFLET_SHOPS` array in
   `src/lib/scraper/feed.ts` if kupi.cz publishes a per-shop flyer.
   Not every shop does — some only appear on the cross-shop index.
3. Verify `/shop/<slug>` renders by visiting it locally. If kupi.cz
   returns 404 on `/letaky/<slug>`, the page will render an empty
   flyer — that's expected.

## Internationalization

Strings live in `messages/{ru,en,cs}.json` as flat key-value JSON with
ICU plural support. Add a new locale by:

1. Adding the locale code to `LOCALES` and `LOCALE_LABELS` in
   `src/lib/locales.ts`.
2. Creating `messages/<locale>.json` with the full key set (copy from
   `en.json` as a starting point).
3. The new locale automatically appears in the language switcher.

Never inline user-facing copy in JSX. Always go through `useTranslations`
(client) or `getTranslations` (server).

## Reporting bugs

Open a GitHub issue. For scraper issues (broken parsing, missing shop,
wrong price), include:

- The URL on kupi.cz that the app failed to parse correctly.
- A snippet of the relevant HTML (the page is public).
- The expected vs. actual output.

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](./SECURITY.md).

## License

MIT — see [LICENSE](./LICENSE).
