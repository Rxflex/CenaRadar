---
name: Scraper / parser issue
about: A shop page, product page, or search is broken
title: "[scraper] "
labels: bug, scraper
---

## What is broken

- [ ] Cross-shop index (`/`)
- [ ] Per-shop flyer (`/shop/<slug>`)
- [ ] Product detail (`/product/<slug>`)
- [ ] Search (⌘K)
- [ ] Category page (`/category/<slug>`)
- [ ] Other: _______

## Shop / product

- Shop slug (e.g. `billa`, `albert`): _______
- Product slug (e.g. `mleko-polotucne-1l`): _______
- kupi.cz URL of the affected page: _______

## Source HTML

Please paste the relevant snippet of HTML from the kupi.cz page — for
example, a `<div class="area_content">` block from a flyer, or a
`<div class="discount_row">` block from a product page. **The scraper
cannot be debugged without source HTML.**

## Expected vs. actual

- Expected: _______
- Actual: _______

## Proposed fix

If you already know the fix, sketch it here. Pay attention to:

- `data-key` (pack size, e.g. `1-ks`, `6-ks`)
- `data-discount` (raw discount value)
- `data-product` (product slug)
- Czech price formatting (comma vs. space, Kč symbol)
- `normalizeCzech()` (NFD strip + lowercase) for slug dedupe
