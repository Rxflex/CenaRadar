---
name: Bug report
about: Something is broken or showing wrong data
title: "[bug] "
labels: bug
---

## What happened

A clear, one-paragraph description of the bug.

## What was expected

What you expected to see.

## Steps to reproduce

1. Go to '…'
2. Click on '…'
3. Scroll to '…'
4. See error

## Screenshots / recordings

If applicable, add screenshots or a screen recording to help explain.

## Environment

- Browser + version:
- Device (desktop / mobile, OS):
- App version / commit hash (visible in footer or `git log -1 --format=%H`):
- Locale (RU / EN / CS):

## Source data

If the bug is about pricing or product content, please include:

- The kupi.cz URL the app was reading (e.g. `https://www.kupi.cz/sleva/<slug>`).
- A snippet of the relevant HTML from the page (kupi.cz pages are public).
- The expected vs. actual product/price.

This is the most important part of the report — the scraper is brittle and
debugging without source HTML is usually impossible.

## Console / network

Open DevTools → Console and Network tabs. Paste any red errors or failed
requests here.
