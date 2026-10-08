---
name: design-taste-rctc
description: "Anti-slop UI direction for landing pages, dashboards, and redesigns. Infer the brief, set variance/motion/density dials, prefer an official design system, and run a pre-flight check. Use when the user asks for design taste, UI polish, or a less generic interface. Complements upstream Leonxlnx/taste-skill; does not replace its full rulebook."
---

# design-taste-rctc

RCTC-sized design direction. The long rulebook lives upstream at [Leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill) (`design-taste-frontend`). Use that file when the project already vendors it. Use this skill to decide direction before writing CSS.

## Procedure

1. Read the brief: audience, page type (marketing / app / dashboard), brand constraints, RTL or LTR.
2. Write one design sentence: who it is for, the mood, and what must not look templated.
3. Set three dials (1–10) and keep them for the whole page:
   - `DESIGN_VARIANCE` — 1 centered/symmetric, 10 asymmetric.
   - `MOTION_INTENSITY` — 1 static, 10 cinematic. Honor `prefers-reduced-motion`.
   - `VISUAL_DENSITY` — 1 airy, 10 dense data.
4. If the brief names Material, Fluent, Carbon, Polaris, Primer, GOV.UK, Radix, shadcn, or Tailwind, use that official package. Do not hand-draw a fake version.
5. Lock one accent, one corner radius, and one type scale. Do not mix three visual languages.
6. Hero: one claim, at most two lines, one primary action. Sections must not all be the same three-column card row.
7. Motion only on `transform` and `opacity`.

## Pre-flight

- Text contrast at least 4.5:1 for body copy.
- Focus rings visible.
- Clickable targets at least 44px on touch.
- No emoji as the only icon.
- Redesigns keep URLs, form field names, and the wordmark unless the user asked to change them.

## Stop

Ask once if brand colors or an existing design system are unknown and the choice would change the page.
