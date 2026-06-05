## Summary

<!-- One or two sentences. -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (please describe)
- [ ] Refactor / chore
- [ ] Documentation only
- [ ] Scraper / parser fix (see below)

## Scraper changes

If you touched anything in `src/lib/scraper/`, please confirm:

- [ ] I read the relevant `parse-*.ts` file end-to-end before changing it.
- [ ] I tested the parser on a real kupi.cz URL (paste the URL here: _______).
- [ ] I checked the output of `npm run build` — no new warnings.
- [ ] I have not introduced `useEffect`-based data fetching anywhere.

## UI / i18n changes

If the change has user-facing surface:

- [ ] I added translations to **all three** catalogs (`messages/ru.json`,
      `messages/en.json`, `messages/cs.json`).
- [ ] I went through `useTranslations` / `getTranslations` — no hard-coded
      literals in JSX.
- [ ] I have not added a new route-level `loading.tsx` for client-fetched
      data (the cache would bypass the Suspense fallback).
- [ ] I have not removed the `.t-enter` page transition from `template.tsx`.

## Performance / caching

- [ ] I have not introduced layout-thrashing animations (animating `width`,
      `height`, `top`, `left`, `margin`, `padding`).
- [ ] I have not added a non-`transform`/`opacity` property to a transition
      that uses `transitions.dev` tokens.
- [ ] I have not put a server function inside `'use cache'` that reads
      cookies / headers (those are forbidden in cache scope).

## Self-review checklist

- [ ] `npm run build` passes locally.
- [ ] `npm run lint` passes locally.
- [ ] No file is over 500 lines.
- [ ] No personal data (emails, API keys, internal paths) in the diff.
- [ ] I have not committed secrets, `.env*` files, or build artifacts.

## Screenshots / recordings

If the change is visual, attach before / after screenshots or a screen
recording. The masonry grid in particular is sensitive to image aspect
ratios — please include a screenshot of the home feed if you changed the
card layout.
