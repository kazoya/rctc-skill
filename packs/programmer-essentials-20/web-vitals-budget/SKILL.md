---
name: web-vitals-budget
description: "Keep a web page inside a small performance budget: LCP, INP, and CLS. Use when a page feels slow, images are heavy, or a change might cause layout shift."
---

# web-vitals-budget

Measure before tuning. Targets for a marketing or app shell:

- LCP under 2.5s on a mid-tier mobile profile.
- INP under 200ms for the main interaction.
- CLS under 0.1.

Fixes in this order: correct image dimensions and modern formats, font subsetting, less client JS on the first screen, no layout-shifting banners. Do not add a performance library to "fix" a single oversized image.
