# Execution Protocol — Web Marketing & Personal Builder

Aligned with **safe-forward-execution** + **focused3** spirit: no phase skip, no fake progress.

```text
INTAKE → ROUTE → INSPECT → CONTRACT → BUILD → PROVE → SHIP → HAND OFF
```

---

## GATE 0 — Intake understood

- Mode known: person | company | factory | product-concept
- Minimum fields present or assumptions **stated aloud**
- Labels: `[VERIFIED]` `[ASSUMPTION]` `[UNKNOWN]` `[DECISION]`

## GATE 1 — Path routed

- Absolute folder chosen and confirmed (or user said proceed)
- Not writing into dormant / backup / wrong product core
- Reference stack chosen (e.g. Banoon / Al-Majjarra / Muqasa-Jo marketing)

## GATE 2 — Source inspected

- Home + About + Products/Services + Contact (+ visible categories)
- Facts ledger + thin surfaces + automation opportunities recorded
- Brand colors noted from logo/site

## GATE 3 — Task contract

One primary objective, e.g.:

> Ship Arabic RTL concept site for {Brand} with WhatsApp CTA and one interactive engine; deploy to Vercel.

Non-goals listed (no CRM integration, no real email send, no partner logos without auth).

## GATE 4 — Implementation

- App runs locally; pages exist with real behavior
- Config phones/emails from verified sources only
- Human-in-the-loop on sensitive actions
- Independent-concept footer present

## GATE 5 — Static prove

| Check | Rule |
|-------|------|
| `npm run build` | Must pass |
| lint / typecheck | Run if scripts exist; record `NOT EXECUTED` if skipped — never invent PASS |

## GATE 6 — Runtime smoke

- Home loads RTL
- Primary CTA opens correct `wa.me` or `tel:`
- Demo actions show “illustrative / no real send” when applicable
- Mobile nav does not cover content (`pb` / safe-area)

## GATE 7 — Ship

- Clean commit (no secrets)
- GitHub public repo pushed
- Vercel project linked; production `READY`
- Aliases noted (`*.vercel.app`)

## GATE 8 — Hand-off

User receives folder + GitHub + live URL + unknowns. Brief/registry updated locally if portfolio tools exist.

---

## Failure

If any gate fails: stop claiming success. Fix or ask one blocking question. Do not “hope” past PROVE.

Rework loop:

```text
FAIL → diagnose evidence → smallest fix → re-PROVE → continue
```

---

## Risk scaling

| Risk | Extra |
|------|-------|
| LOW (new concept site, no payments) | Gates 0–6, 8; ship after user habit or standing “publish” preference |
| MEDIUM (reposition live production marketing URL) | Explicit publish permission; keep preview first if unsure |
| HIGH (customer PII scraping, real WhatsApp blast, billing) | **Stop** — out of scope for this skill |

---

## Fake progress (forbidden as “done”)

Empty folders, TODOs, architecture-only docs, mock APIs that always return success, screenshots of localhost claimed as production, inventing READY deploy status.
