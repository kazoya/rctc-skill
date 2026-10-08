---
name: a11y-rtl-web
description: "Make web UI keyboard-accessible and correct in Arabic RTL. Use when building or fixing pages for Arabic users, focus order, labels, or contrast."
---

# a11y-rtl-web

1. Set `lang` and `dir="rtl"` on the document or the Arabic subtree, not via CSS alone.
2. Use logical properties (`margin-inline`, `padding-inline`) instead of physical left/right when the layout mirrors.
3. Every input has a visible label. Icon-only buttons have an accessible name.
4. Focus order follows the visual order. Do not trap focus except in a real dialog, and then restore it on close.
5. Contrast 4.5:1 for text. Do not convey state by color alone.
6. Check a 200% zoom pass and one keyboard-only pass of the changed flow.
