---
name: master-skills-factory
description: >
  Portland–Pozzolanic master skills factory for sector-configurable trade desks.
  Compose catalog → parse → validate → pricing guards → quotation → local store →
  WhatsApp preview → inbound guard → verified outcome. Use when extracting reusable
  business workflows from Saqr/Rakan-style desks or porting across industries.
  Never claim live WhatsApp send or production gateway readiness without evidence.
---

# Master Skills Factory (Portland–Pozzolanic)

**North star:** Configure the business sector. Compose the skills. Verify the workflow. Never fake the result.

**Law:** REUSE → COMPOSE → EXTEND → CREATE.

## Invoke

```bash
cd master-skills-factory
npm test
npm run demo
npm run evidence
```

## Composed pipeline

```
sector catalog → customer choices → validation → pricing rules
→ quotation (incomplete RFQ | approved) → database (local JSON)
→ dashboard text → WhatsApp PREVIEW → inbound guard → verified result
```

## Child skills

| Skill | Path |
|---|---|
| sector-catalog-config | `skills/sector-catalog-config/SKILL.md` |
| inquiry-validate-quote | `skills/inquiry-validate-quote/SKILL.md` |
| guarded-messaging-preview | `skills/guarded-messaging-preview/SKILL.md` |
| verified-trade-outcome | `skills/verified-trade-outcome/SKILL.md` |

## Companions (existing RCTC)

`skill-factory` · `dogfood-tool-router` · `focused3-agentic-phases` · `test-first-slice` · `evidence-before-claim` · `safe-forward-execution`

## Evidence labels

| Capability | Status |
|---|---|
| Synthetic multi-sector parse/validate/quote | IMPLEMENTED + tested |
| Local JSON persistence + tenant forbid | IMPLEMENTED + tested |
| WhatsApp `wa.me` preview | PREVIEW_ONLY |
| Live WhatsApp / SMS gateway send | **NOT_IMPLEMENTED** |
| Production multi-tenant SaaS | **NOT_IMPLEMENTED** |
| Saqr private price book / customer data | **EXCLUDED** (not copied) |

## Source provenance

Patterns inspected from `C:\A\ghoor\saqrrakan` branch `pozzolan-trade-prime` (`src/lib/trade-desk/*`, order WhatsApp URL builder). Public pack contains **synthetic** catalogs only.

## Constraints

- No deploy, no real customer messages, no paid API spend.
- No Premium / gateway license secrets in this tree.
- Publication / push = **owner gate** via `skill-factory` publish mode.
