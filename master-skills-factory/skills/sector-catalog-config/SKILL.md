---
name: sector-catalog-config
description: >
  Configure a sector product catalog, aliases, destinations, and market reference
  book for the master-skills-factory desk. Use before parsing inquiries. Synthetic
  demos only unless the host injects an authorized private catalog outside git.
---

# sector-catalog-config

1. Pick or add a sector under `src/sectors.js` (or host-supplied JSON).
2. Define products with `aliases`, `complete`, `requiredAttrs`, `attrHints`.
3. Market ranges go in `priceBook` — they are **references**, not sell prices.
4. Prove with `npm test` covering at least two sectors.
