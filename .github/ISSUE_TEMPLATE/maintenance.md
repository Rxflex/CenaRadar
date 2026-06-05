---
name: Maintenance
about: Refactor, dependency upgrade, or chore
title: "[chore] "
labels: maintenance
---

## What is being changed

A brief description.

## Why

Why is this needed? (Tech debt, dep freshness, perf, etc.)

## Risk

- [ ] Low — internal refactor, no behaviour change
- [ ] Medium — touches a hot path, may affect cache hit rate
- [ ] High — breaks a public API, schema change, deprecation

## Test plan

How will you verify the change is safe?

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Manually verified on `/`, `/shop/billa`, `/product/<slug>`, ⌘K
- [ ] Other: _______
