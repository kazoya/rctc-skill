# Example — Feature cell (OmniAgent M1)

This is a **pattern**, not authorization to execute. Do not initialize Next.js unless the user explicitly authorizes execution.

## TASK

Initialize the web application in `apps/web`.

## RISK

MEDIUM (new app, new toolchain, first runtime).

## AGENTS

| Role | Agent |
|------|--------|
| Orchestrator | Principal |
| Builder | NextScaffoldBuilder / Next.js Agent |
| Supervisor | FrontendSupervisor |
| Verifier | RuntimeVerifier |

## THINK (contract)

```
TASK: Git (if absent) + Next.js 15 App Router in apps/web with title, URL input, primary CTA.
CURRENT STATE: [VERIFIED] apps/web exists and contains no application. [VERIFIED] no package.json. [VERIFIED] no .git.
DESIRED STATE: npm run dev serves a page with OmniAgent working title, URL input, primary CTA.
SCOPE: apps/web scaffold + root git if missing. TypeScript + Tailwind if that is the repo default.
NON-GOALS: Supabase, RAG, Stripe, widget, OAuth, scraper.
DEPENDENCIES: Node/npm available on the machine [UNKNOWN until checked].
RISKS: create-next-app writes extra files; keep the page minimal.
ACCEPTANCE:
  - npm install succeeds
  - npm run dev launches
  - page loads
  - URL input visible
  - no build-breaking error
EXPECTED FILE CHANGES: apps/web/* (package.json, app/page.tsx, configs). Possibly root .git.
TEST PLAN: install, dev, open /, confirm input. Optional npm run build.
ROLLBACK: delete apps/web generated files; keep empty dir if that was prior truth.
```

## EXECUTE constraints

Allowed: `apps/web/**`, root `.gitignore` if required for Next.js.
Forbidden: `packages/ai`, `packages/database`, backend routes that pretend to crawl, Stripe, env secrets.

## PROVE

Verifier runs install/dev/build themselves. File evidence must include `apps/web/package.json` and a page that renders an `<input>` for URL.

## NEXT (only after PASS)

Record truth, then stop. Do not start M2 until asked.
