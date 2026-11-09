---
name: sector-catalog-config
description: >
  Configure a sector product catalog, aliases, destinations, units, and market
  reference book for master-skills-factory. Use before parsing inquiries or when
  switching industries via JSON sector config. Do not enable clinical decisions.
version: 0.2.0
compatibility: node>=18, master-skills-factory>=0.2
---

# sector-catalog-config

## When to use
- Adding or switching a business sector without changing core workflow logic.
- Defining aliases, units, destinations, and market reference ranges.

## When not to use
- Live customer catalogs with PII/prices destined for public git.
- Clinical diagnosis/Rx configuration (`clinicalDecisionsEnabled` must stay false).

## Inputs
```json
{
  "id": "string",
  "businessIdentity": { "name": "string", "locale": "string" },
  "sectorType": "string",
  "catalog": { "products": [], "destinations": [], "requireDestination": false },
  "units": { "quantityPatterns": [] },
  "pricing": { "currency": "JOD", "taxBps": 0, "discountBps": 0, "priceBook": [] },
  "approvals": {},
  "messaging": { "channels": ["whatsapp_preview"], "sendImplemented": false },
  "aiKnowledgeSources": [],
  "escalation": {},
  "dashboard": {}
}
```

## Outputs
Loaded sector object with `aliasIndex` ready for `parseInquiry`.

## Stacks
Node.js ≥18 CommonJS. Optional JSON config files under `config/examples/`.

## Parameters
| Param | Meaning |
|---|---|
| `currency` | ISO code; money computed in minor units |
| `taxBps` / `discountBps` | Explicit basis points |
| `administrativeOnly` | Forced true for clinic/pharmacy sector types |

## Success example
`config/examples/wholesale_produce.sector.json` → parse `2 طن خيار عمان`.

## Failure examples
- Missing `catalog.products` → `CATALOG_REQUIRED`
- `clinicalDecisionsEnabled: true` → `CLINICAL_DECISIONS_FORBIDDEN`

## Security
No secrets in config. Market ranges ≠ sell prices.

## Tests
`npm test` — sector config switch + acceptance matrix.

## Limitations
Synthetic demos only unless host injects private config **outside** public RCTC.

## Provenance
Generalized from Saqr `parse.ts` SPECS pattern — see `evidence/SOURCE_TRACE.md`.
