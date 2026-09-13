# Sub-skills & companion tools

This super-skill **orchestrates**; it does not replace specialists.

---

## 1) Must-pair for “بدون أدنى تدخل”

| Skill | Role |
|-------|------|
| **`safe-forward-execution`** (`../safe-forward-execution/`) | Continue beyond planning with authorized, reversible, verified steps. **Required marketing pair.** |
| **`focused3-agentic-phases`** | Local sibling in this repo: THINK → EXECUTE → PROVE, evidence gates. Use when safe-forward is not installed. |
| **`rctc-method`** | One clarifying question; state assumptions. |

Pitch line (keep with the main marketing sentence):

> …خصوصا عندما تستعمل معها **safe-forward-execution**.

---

## 2) Design — UI/UX Pro Max

Source: [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

Use when:

- Choosing palette / typography / layout pattern for a new brand
- Avoiding generic “AI purple SaaS” look
- Checking UX rules (tap targets, hierarchy, motion budget)

Install (Claude/Cursor plugin ecosystem varies):

```text
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

If unavailable: fall back to [reference.md](reference.md) + brand logo colors.

---

## 3) Factory specialist

Path in this repo: `../factory-sales-concept/`

Invoke `/factory-sales-concept` when the target is a manufacturer and the workspace is under Factories / Al-Majjarra / Banoon patterns.

The super-skill still owns: routing, multi-agent, Vercel setup narrative, personal-brand modes.

---

## 4) WhatsApp QR (production protocol)

There is no separate marketplace skill required — implement inside the site:

**Stack:** `qrcode.react` (`QRCodeSVG`)

**Rules:**

1. Digits only in `wa.me/{digits}` (country code, no `+` spaces).
2. Prefill text via `?text=` URL-encoded; keep professional, no hire-or-buy threats.
3. Wrap QR in `<a target="_blank" rel="noopener noreferrer">` with Arabic `aria-label`.
4. Show QR in **at most two places** (prefer implementer page + final CTA). Do not spam every route.
5. Distinguish **company** WhatsApp vs **builder** WhatsApp in labels.
6. Client-only render if SSR hydration flickers (`useMounted` pattern).

Minimal component sketch:

```tsx
import { QRCodeSVG } from "qrcode.react";

export function WhatsAppQr({ url, label }: { url: string; label: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <span className="rounded-md bg-white p-2">
        <QRCodeSVG value={url} size={112} level="M" marginSize={4} />
      </span>
    </a>
  );
}
```

Config helpers typically live in `lib/config.ts`: `getDeveloperWhatsAppUrl()`, `getCompanyWhatsAppUrl()`.

---

## 5) Routing & portfolio

| Skill | Use |
|-------|-----|
| `projects-connector` | Correct disk root; Factories vs Belt vs Muqasa |
| `portfolio-skills-router` | Which skills install where |
| `portfolio-commander` | Priority / dormant |

---

## 6) Browser inspection

| Tool | Use |
|------|-----|
| Cursor IDE Browser MCP | Public site snapshots, RTL checks, screenshots |
| `logged-in-browser` | Only when the operator’s real Chrome session is required |

Prefer public fetch/browser for factory marketing sites. Do not scrape LinkedIn private dossiers into the product.

---

## 7) Continuous improving

`/continuous-improving` may keep iterating **after** the first live URL — but **human gates** remain for real money, destructive deletes, and confidential submissions.

---

## 8) Recommendation order (for RCTC recommender)

When user signals: موقع، مصنع، تصور، personal brand، Vercel، muqasa-jo:

1. Recommend **this super-skill**
2. Mention pairing with **safe-forward-execution**
3. Optionally mention **ui-ux-pro-max** for craft
