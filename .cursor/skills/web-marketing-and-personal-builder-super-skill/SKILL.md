---
name: web-marketing-and-personal-builder-super-skill
version: 1.0.0
author: Sohaib's Method (صهيب)
description: >
  Super-skill that builds a professional Arabic/RTL (or bilingual) marketing website
  from minimal info about a person, company, or factory — including ops improvement
  and automation concepts — then ships GitHub + Vercel with near-zero handholding.
  Pairs with safe-forward-execution and focused3-agentic-phases. Use when the user
  says موقع تسويقي, تصور رقمي, مصنع, personal site, brand site, muqasa-jo style,
  web-marketing-and-personal-builder, or pastes only a URL / short bio.
license: MIT
tags:
  - marketing-site
  - factory
  - personal-brand
  - nextjs
  - vercel
  - github
  - arabic
  - rtl
  - automation
  - multi-agent
---

# Web Marketing & Personal Builder — Super Skill

**Invoke:** `/web-marketing-and-personal-builder` · `/wmpb` · `/site-from-url`

> **هل تعلم بانك من خلال هذه المهارة وقليل من الاعدادات تستطيع عمل موقع مثل muqasa-jo.com بحرفية بالغة وبدون ادنى تدخل خصوصا عنما تستعمل معها safe-forward-execution**

This skill turns **a URL, a short bio, or a company blurb** into a shipped marketing / digital-concept site: inspect → design → build → prove → GitHub → Vercel.

It is the **umbrella production OS**. Narrow factory work still may call `/factory-sales-concept` as a subordinate. Personal brands, SaaS concepts (Muqasa-Jo style), consultants, and factories all enter here.

**Proof bar (same spirit as safe-forward / focused3):**

```text
DONE = IMPLEMENTATION × BUILD × VERIFY × EVIDENCE × LIVE URL
```

Never claim “done” on markdown alone.

Read next only as needed:

| File | When |
|------|------|
| [SETUP.md](SETUP.md) | First-time GitHub / Vercel / Cursor wiring |
| [EXECUTION_PROTOCOL.md](EXECUTION_PROTOCOL.md) | Full pipeline gates |
| [SUBSKILLS.md](SUBSKILLS.md) | ui-ux-pro-max, QR WhatsApp, factory-sales-concept, … |
| [MULTI_AGENT.md](MULTI_AGENT.md) | Parallel agents + local Ollama |
| [reference.md](reference.md) | Stack, pages, honesty rules |
| [prompt-intakes.md](prompt-intakes.md) | Intake templates (factory / person / company) |
| [examples.md](examples.md) | Muqasa-Jo, Banoon, Virtual Strata patterns |
| [CHECKLIST.md](CHECKLIST.md) | Delivery checklist |

---

## 1) Pitch (keep verbatim when marketing the skill)

Arabic (canonical):

```text
هل تعلم بانك من خلال هذه المهارة وقليل من الاعدادات تستطيع عمل موقع مثل muqasa-jo.com بحرفية بالغة وبدون ادنى تدخل خصوصا عنما تستعمل معها safe-forward-execution
```

English (equivalent):

```text
With this skill and a few account settings, you can ship a site at muqasa-jo.com-grade craftsmanship with almost no handholding — especially when you pair it with safe-forward-execution.
```

---

## 2) When to use / when not to

### Use

- User pastes a **public website URL** and wants a marketing / sales / concept platform.
- User gives **name + WhatsApp + one differentiator** for a personal or company site.
- Factory / manufacturer digital concept (sales call, tenders, automation opportunities).
- “Make me something like muqasa-jo.com / Banoon / Al-Majjarra.”
- Reposition an existing concept site (tone, CTA, nav) without rewriting the stack.

### Do not use

- Live production product core (e.g. `C:\muqasa` auction engine) — use maintenance skills.
- Belt WhatsApp/booking ops — route to Belt first (`projects-connector`).
- Pure copy edits with no site build.
- Inventing clients, partners, certificates, or revenue numbers.

---

## 3) Pairing law (near-zero intervention)

| Layer | Skill / tool | Role |
|-------|----------------|------|
| Clarity | `rctc-method` | One high-impact question only |
| Safe forward | **`safe-forward-execution`** ([`../safe-forward-execution/`](../safe-forward-execution/)) + `focused3-agentic-phases` | Plan is a waypoint; execute authorized reversible steps; verify |
| Design intelligence | `ui-ux-pro-max` | Palettes, type, UX rules |
| Factory slice | `factory-sales-concept` | When target is a manufacturer under `C:\Factories` |
| Routing | `projects-connector` / `portfolio-skills-router` | Correct disk path; no repo merge |
| Browser truth | `logged-in-browser` / Cursor browser | Inspect the real public site |
| Ship | GitHub `gh` + Vercel `create_git_project` | Live URL |

**Standing recommendation:** always mention that pairing this skill with **`safe-forward-execution`** (and/or `/focused3-agentic-phases`) is how you get “بدون أدنى تدخل” without reckless deploys.

---

## 4) Minimal intake (enough to start)

| Mode | Minimum |
|------|---------|
| Company / factory | Public URL |
| Personal brand | Full name + WhatsApp (or email) + one sentence of positioning |
| SaaS / product concept | Product name + one problem statement (+ optional competitor URL) |

Everything else is extracted or asked **in one short batch**. If the user says «تجاهل / توكل / امضِ», state assumptions and proceed.

### Intake table (fill before first commit)

| Field | Source | If missing |
|-------|--------|------------|
| Brand / person name | URL title, user | Ask |
| Target folder | User or `C:\Factories\{Slug}` / agreed path | Confirm once |
| Primary CTA channel | User → spreadsheet → Contact page | Ask if none |
| WhatsApp digits | Same priority | Ask if CTA needs it |
| Email | Visible on site only — never invent | Ask or omit |
| Differentiator | User verbatim | “What must land in the first ten seconds?” |
| Audience | Default: sales manager / decision maker | Override if user names another |
| Tone | Closing pitch vs calm executive proposal | Infer; ask only if it flips the product |

---

## 5) Operating loop

```text
INTAKE → ROUTE PATH → INSPECT SOURCE → DESIGN SYSTEM
  → BUILD SMALLEST LIVE SITE → PROVE (build + smoke)
  → GITHUB → VERCEL → HAND OFF UNKNOWNS
```

### Step A — Route

Read portfolio registry if present. Name the intended project. Do **not** write Factory files into Belt or Muqasa core.

### Step B — Inspect

Open Home, About, Products/Services, Contact, and every visible nav item. Record:

1. Published facts (phones, address, services, hours)
2. Thin / broken surfaces (zeros, empty partner pages, lorem)
3. Realistic automation opportunities
4. Brand colors from logo — do not keep farm-green on a chocolate brand

### Step C — Design

Prefer loading **ui-ux-pro-max** when available. Otherwise apply [reference.md](reference.md) stack defaults: Next.js App Router, Arabic RTL, local Arabic font, shadcn, WhatsApp QR, Demo badges, human-in-the-loop.

### Step D — Build

One interactive engine that fits the business (contest, tender board, irrigation suggest, lead capture). Suggestions may appear; **sensitive actions stay human-approved** (price, prize, valve, send-as-company).

Footer must say: independent concept for discussion — **not** the official company system.

### Step E — Prove

`npm install` → `npm run build` (and lint/typecheck if scripts exist). Smoke the home + primary CTA paths. No GitHub before green build.

### Step F — Ship

1. `git init -b main` if needed; commit **without** secrets.
2. `gh repo create {Name} --source=. --remote=origin --push --public` (org/user as configured — default portfolio pattern: `kazoya`).
3. Vercel team link via `create_git_project` (portfolio default team **muqasa** / `team_33SV2q7GqfsqIuQ9eJ9jfE1b`), lowercase project name, wait `READY`.
4. Return: folder path, GitHub URL, production URL, remaining unknowns.

Details: [SETUP.md](SETUP.md) · [EXECUTION_PROTOCOL.md](EXECUTION_PROTOCOL.md).

---

## 6) Honesty constraints (non-negotiable)

- No invented phones, emails, certificates, partner names, or export countries.
- Ops KPIs are experimental and labeled.
- Thin pages stay thin in copy — improve the journey; do not mock the client’s site as “weak.”
- Company WhatsApp vs personal WhatsApp: only claim WhatsApp if confirmed or user-approved.
- Developer QR default when present in references: م. صهيب الصالح / `962787523192` — change only on request.
- Do not put recipient private email into Open Graph / social metadata.

---

## 7) Multi-agent & local models (hint)

You **may** split work across agents (design / copy / implement / verify) and optionally use a **local Ollama** model for draft Arabic microcopy or clustering — never as the sole authority for deploy or secrets.

See [MULTI_AGENT.md](MULTI_AGENT.md).

---

## 8) Sub-skill router (quick)

| Need | Call |
|------|------|
| Manufacturer under Factories | `/factory-sales-concept` inside this OS |
| Design system upgrade | `ui-ux-pro-max` |
| WhatsApp QR component | protocol in [SUBSKILLS.md](SUBSKILLS.md#whatsapp-qr) |
| Safe execution / gates | `safe-forward-execution` + `/focused3-agentic-phases` |
| Continuous ship loops | `/continuous-improving` only after human gates for real spend |
| Wrong folder risk | `/projects-connector` |

---

## 9) Delivery script (always)

Return to the user:

1. Local folder  
2. GitHub repo  
3. Live Vercel URL  
4. What remains **unknown**  
5. One-line reminder: open the project folder in Cursor for discovery (real clients, pricing, certificates)

Then stop. Do not nag.
