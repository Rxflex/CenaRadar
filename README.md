# Cena Radar

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca)](https://react.dev)

> Real-time price comparison of on-sale groceries across Czech retailers, built
> by scraping public leaflet data from [kupi.cz](https://www.kupi.cz).

Cena Radar aggregates per-shop flyers ("letáky") and surfaces the cheapest
deals — including per-unit pricing so you can compare a 1.75 L bottle against
a 0.33 L can honestly. The whole UI is bilingual (RU/EN/CS) and runs entirely
on local-friendly infrastructure: Next.js 16 with cache components, no
database, no user accounts.

---

## Features

- 🛒 **Per-shop flyer feeds** — each shop's current leaflet is parsed into
  100–200+ product cards.
- 💰 **Per-unit comparison** — prices are normalized to `Kč / l` or
  `Kč / kg` so a 0.33 L can is compared to a 1.75 L bottle correctly.
- 🔍 **Live ⌘K search** — diacritics-insensitive (`mleko` matches `Mléko`),
  debounced, rate-limited.
- 🌗 **Dark by default** with system override; smooth-scroll via Lenis.
- 🌍 **i18n** — Russian (default), English, Czech via `next-intl`.
- ⚡ **Aggressive caching** — function-level `'use cache'` + `Cache-Control`
  headers; the first request to a flyer is the only one that scrapes.

## Stack

| Layer        | Choice                                                     |
| ------------ | ---------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Cache Components, Turbopack)       |
| UI           | shadcn (`base-nova` preset) on `@base-ui/react` primitives |
| Styling      | Tailwind v4 + custom OKLCH theme (`--radar`, `--hot`)      |
| Animation    | `transitions.dev` (CSS-only)                               |
| State        | TanStack Query (server) · Zustand (UI, granular selectors) |
| i18n         | `next-intl` (cookie-based, no URL routing)                |
| Scraper      | Native `fetch` + DOM regex (no headless browser)           |
| Lint / fmt   | Biome 2.2                                                  |

## Getting started

### Prerequisites

- **Node.js 20+**
- npm / pnpm / yarn

### Install

```bash
git clone https://github.com/Rxflex/CenaRadar.git
cd CenaRadar
npm install
```

### Develop

```bash
npm run dev          # http://localhost:3000
```

The first request to `/`, `/shop/<slug>`, or any product page triggers
scraping of the underlying flyer (~1–2s per shop, parallel). Subsequent
requests hit the cache.

### Build

```bash
npm run build
npm start
```

### Lint / format

```bash
npm run lint         # biome check
npm run format       # biome format --write
```

## Project layout

```
src/
├── app/              # Next.js App Router
│   ├── api/          # /api/{products,product,search,categories}
│   ├── category/[slug]
│   ├── product/[slug]
│   ├── shop/[slug]   # per-shop flyer page
│   ├── shops/        # shop index
│   └── page.tsx      # home — hero + per-shop sections + cross-shop feed
├── components/       # React components (server + client)
│   └── ui/           # shadcn primitives
├── i18n/             # next-intl config
├── lib/
│   ├── hooks/        # client-side React hooks
│   ├── query/        # TanStack Query factory
│   ├── rate-limit.ts # in-memory sliding-window rate limiter
│   └── scraper/      # kupi.cz scrapers (server-only)
├── messages/         # {ru,en,cs}.json i18n catalogs
└── stores/           # Zustand stores
```

## How it works

Cena Radar scrapes two layers from kupi.cz:

1. **Cross-shop index** — `GET /slevy` returns ~40 featured products with
   category, image, and cheapest price. This is the curated landing page
   kupi.cz shows to all users.
2. **Per-shop flyers** — `GET /letaky/<shop>` lists current flyers, each of
   which links to `GET /letaky/<shop>-<name>-leták-<id>`. A single flyer page
   has 80–200 `<div class="area_content">` product blocks with positional
   data, names, and prices. Parsing one such page takes ~1s.

The two layers are deduped by product slug to build a unified searchable
index. The unified index is what powers ⌘K (so `mleko` finds `Mléko
polotučné` even though the cross-shop index only has 40 products and never
includes plain milk).

Images are served from `img.kupi.cz/kupi/thumbs/<slug>_<w>_<h>.jpg`. The
server probes each image once (HEAD + first 32 KB to parse the JPEG SOF or
PNG IHDR marker) and caches the dimensions per slug for the masonry layout.

## Deployment

The app is designed to run as a single Node instance — there is no database
or external state. Recommended:

- **Node 20+** behind a reverse proxy (Caddy / nginx) with HTTPS.
- Set `NEXT_TELEMETRY_DISABLED=1` if you don't want to phone home.
- The rate limiter is in-memory; for multi-instance deployments swap
  `src/lib/rate-limit.ts` for a Redis-backed limiter (Upstash, etc.).

## Disclaimer

**Cena Radar is an independent, unofficial project.** It is not affiliated
with, endorsed by, or sponsored by kupi.cz or any of the retailers whose
flyers it indexes (Albert, Tesco, Lidl, BILLA, Kaufland, Globus, Penny
Market, Makro, dm drogerie, Rossmann, Pilulka, Benu, COOP Jednota, Norma,
Flop TOP, Teta drogerie, and others).

- **Prices, validity dates, and product data** are scraped from public
  kupi.cz pages and may be inaccurate, outdated, or misleading. Always
  double-check the deal on the merchant's website or in-store before
  buying.
- **Per-unit prices** are computed by dividing the displayed total by the
  pack size declared in the source. When the source data is wrong, the
  per-unit price will be wrong too.
- **Trademarks and brand names** belong to their respective owners; their
  use in this project is for descriptive purposes only.
- **Use at your own risk.** The authors and contributors of this project
  accept no responsibility for any decisions you make based on information
  displayed in the app, including but not limited to financial loss,
  mis-pricing, or allergic reactions to foods you purchased as a result of
  using the app.

By using this software you agree that you do so at your own risk and that
the authors and contributors are not liable for any damages arising from
its use.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Bug reports and PRs are welcome,
but please be aware that the scraper is brittle by design — kupi.cz is a
moving target and parsers break when they change their HTML.

## License

[MIT](./LICENSE) — do whatever you want, but no warranty.
