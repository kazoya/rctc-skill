# Changelog

## [Unreleased] — Master Apply Pack: Risha Pro talents level

### Added
- `master-apply-packs/risha-pro-talents/` — an executable pack that applies the open skill suite to one declared level of the local `E:\master` project (Risha Pro talents marketing, `risha360.com`) instead of dumping the whole catalogue on it.
- `APPLY-PLAN.md` — four waves (governance → marketing surface → channels → measurement), each row naming skill, output, entry command, human gate, and acceptance evidence; four skills are explicitly excluded from this level as a decision, not an omission.
- `LEVELS.md` — levels register: the active level is fixed, the other three are left for the owner rather than invented, plus a no-leak rule and a cross-level request queue.
- `scripts/apply-risha-pro-level.mjs` — Node applier: dry-run by default, never deletes, never silently overwrites (`--force` required), writes `APPLY-MANIFEST.json` of everything it touched, exits non-zero on a bad path. PowerShell and `.cmd` wrappers forward to the same tested logic.
- `scripts/validate-pack.js` — pack self-check (required files, capability-card keys and gates, composed skills exist in this repo, RCTC shape of every prompt, relative links, and a guard that the applier keeps every write behind `--apply`); wired into the expertise CI workflow.
- Five copy-ready RCTC briefs in `prompts/` for bootstrap, talents site build, social improvement cycle, safe WhatsApp slice, and the measured improvement loop.
- `capabilities/risha-pro-talents-level.json` — capability card in the repo format, ready to register in `E:\master\files\capabilities\`.

### Fixed
- Prompt 00 assumed the applier had not run yet, so it told the agent to re-create the three level files the script writes; it now starts from the post-script state, verifies the manifest, and fills the memory files with real project state instead.
- `--force` could wipe a `BRAIN.md`, `DECISIONS.md`, or `CROSS-LEVEL-REQUESTS.md` the owner had filled in. Those three are now protected even under `--force`; overwriting them requires the explicit `--force-memory` flag, so refreshing the pack after a pull no longer risks the owner's notes.

### Notes
- Nothing was written to `E:\master` from the authoring session; the pack is prepared to run on the owner's machine.
- Brand constraints documented for `risha360-social` belong to the legal account and are referenced, not assumed, for the talents level.

## [Unreleased] — Focus Council + Local SSML Voice Cost Optimizer

### Added
- `focus-council` — answer-concentration skill: simulated domain experts → independent proposals → cross-critique → shortlist → neutral jury → sensitivity check → final synthesis. Truth rule forbids presenting simulated experts/customers as real.
- `local-ssml-voice-cost-optimizer` — Arabic-first local preprocessing, W3C SSML intermediate representation, local preview, content-addressed cache, changed-only/selective premium rendering, and provider adapters (Narakeet documented as one example, not a free local API).
- Dogfooding record showing the two skills shaping each other.
- `decision-focus` and `arabic-voice-cost` package recipes.
- Focus Council community/supporter recognition issue template; public MIT core remains usable without payment.

## [Unreleased] — Ethical Bug-Bounty Training (Portland–Pozzolanic)

> Track status: **Unreleased**. Root `SKILL.md` remains `version: 1.0.0`. This is not a stable 1.1 / 1.1.0-rc product release.

### Added
- Bilingual ethical bug-bounty track under `tracks/bug-bounty/` (EN+AR, modules 00–05)
- Scope Guard (declaration-only decisions) + track validator + fixtures
- Capability `ethical-bugbounty-training` (`release_state: unreleased`)
- Public Pro catalog `tracks/bug-bounty/pro/README.md` + Coffee Pass pointers (no Pro lesson bodies in MIT tree)
- Multi-track extension point `tracks/README.md` (future competition labs not implemented)
- RCTC-SKILLS motto

### Changed (pre-push)
- Renamed `AUTHORIZED_FOR_DECLARED_ACTIVITY` → `DECLARED_SCOPE_CONTEXT_ACCEPTED`
- Explicit `authorization_verified_by_rctc: false` and human confirmation for declared live targets
- Removed supporter-only Pro lesson files from the public tree

## [Unreleased]

### Changed
- Hardened `update-zip-skill`: profile documentation, UI metadata, failed-harvest stop for `cycle`, and review-only by default for `risha360-social` schedule ingestion; database writes now require explicit `--apply`.
- Refocused the root RCTC skill on prompt and handoff design instead of universal invocation or assumed persistent memory.

### Added
- `update-zip-skill` — مهارة التطوير والضغط: project-agnostic improvement loop (harvest → pack → consult → ingest) with adapters (`web-project`, `risha360`), zero npm dependencies, PowerShell/zip archiving, ChatGPT bridge over CDP as a secondary path, and a review-first ingest that produces `DIFF-REPORT.md` instead of writing into the project. Lesson recorded from the first documented run (World Cup Fintech Festival): re-verify every claim in a returned package against the product's own docs before merging. Canonical: `update-zip-skill/`.
- `web_marketing_and_personal-builder-super-skill` — umbrella production OS: from a public URL / short bio / company blurb to a professional Arabic (RTL) marketing or digital-concept site, then GitHub + Vercel. Marketed with: *هل تعلم بانك من خلال هذه المهارة وقليل من الاعدادات تستطيع عمل موقع مثل muqasa-jo.com بحرفية بالغة وبدون ادنى تدخل خصوصا عنما تستعمل معها safe-forward-execution*. Includes SETUP (accounts), execution gates, sub-skill router (`ui-ux-pro-max`, WhatsApp QR protocol, `factory-sales-concept`), and multi-agent / local Ollama hints. Canonical: `web_marketing_and_personal-builder-super-skill/`.
- `logged-in-browser` — drive the operator's already-logged-in Chrome (same cookie jar as the visible tab). Standing RCTC complementary skill. UIA ValuePattern for Angular; do not trust Playwright/CDP or Claude-in-Chrome MCP tabs until they share that jar. Canonical: `logged-in-browser/`.
- `start-skill` — مهارة البدء: kickoff protocol that turns several sessions/projects into one tracked portfolio with a conscious engineering mind, period/progress reports, and a Claude Code / Claude Desktop channel. Includes `LEARNED.md` (lessons, acquired skills, capabilities, tools). Pins Claude Code to `claude-opus-5[1m]` with effort **`xhigh`** (not `max`) for deep prize/ARC work.
- `master-brain` — reference implementation (Node.js ≥ 18, no npm dependencies): file-based project brains, CLI, Arabic/English dashboard, reports (HTML → PDF, XLSX, Markdown, JSON), MCP stdio server, installers, smoke tests. Vendors focused3 + portfolio-commander docs under `skills/vendor/`.
- `focused3-agentic-phases` — 3-phase agentic engineering OS (THINK → EXECUTE → PROVE) with agent cells, prompt factory, quality gates, and evidence rules. Source: `focused3-agentic-phases/`. Mapped to OmniAgent (`C:\airealpro\chatbase`) and installed as a user skill.

## [1.0.0] — Initial Release

### Added
- Core RCTC analysis engine (Role, Context, Task, Constraints detection)
- Smart question system — one question at a time, with reasoning
- Template system for Arabic and English responses
- User learning & adaptation system
- Horizontal skill recommendation engine
- Configuration system (`config.yaml`)
- Full documentation suite
- Arabic and English example libraries

### Philosophy
- Component detection based on engineering judgment, not mechanical checklist
- Transparency: always explain why a question is being asked
- Respect user's time: never ask what context makes obvious

---

## [1.0.1] — Documentation

### Added
- `docs/launch-kit.md` — copy-paste posts for LinkedIn, Reddit, WhatsApp/Telegram
- README Pro section + GitHub Discussions early-access link

---

## [Planned — 1.1.0]

- IDE integration guides (Cursor, VS Code, JetBrains)
- Web-based prompt builder UI
- Shared team profiles
- Analytics dashboard
- Skill marketplace integration
