---
name: htpaap
description: Extract and apply professional software-engineering judgment from exemplary open-source codebases. Use when mapping a repository, planning a deep code-reading path, studying architecture/testing/performance/compatibility practices, tracing a bug fix or design decision, comparing elite engineering styles, or converting a lesson from TigerBeetle, SQLite, curl, ripgrep, xv6, or another approved source into a small verified improvement. Layer 1 maps sources and relationships; later layers require direct evidence. Never claim mastery from summaries alone.
---

# HTPAAP — How To Program As A Pro

Build durable engineering judgment from primary sources. Treat this skill as a map and extraction protocol, not a quotation library or a substitute for reading code.

## Core rule

Use this evidence chain:

`source → design claim → code/test evidence → local experiment → verified lesson → reusable pattern`

Do not write “the project teaches X” unless a primary file, test, issue, pull request, benchmark, or commit supports it. Label inference as inference.

## Layer selection

1. **Layer 1 — Topography:** map the project, anchors, prerequisites, relationships, and reading order. Read `references/source-map.md` and `references/sources.json`.
2. **Layer 2 — Mechanisms:** trace one subsystem end to end and record invariants.
3. **Layer 3 — Decisions:** study issues, rejected alternatives, regressions, and trade-offs.
4. **Layer 4 — Transfer:** apply one bounded lesson to an authorized codebase.
5. **Layer 5 — Contribution:** produce a tested fix, note, benchmark, or upstream contribution.

Default to Layer 1 unless the user explicitly asks to go deeper.

## Workflow

1. **Define the learning target.** Choose one: correctness, architecture, testing, performance, portability, operability, or clarity.
2. **Select one source.** Follow the ranking and prerequisites in `references/source-map.md`; do not load every repository.
3. **Pin evidence.** Record repository, branch/tag/commit, file paths, access date, and links. Re-check moving branches before quoting conclusions.
4. **Map before reading deeply.** Identify entry points, modules, data/control flow, tests, docs, build/release path, and failure boundaries.
5. **Extract one lesson.** Fill the evidence receipt in `references/evidence-protocol.md`.
6. **Run a bounded transfer.** Prefer a test, benchmark, ADR, invariant, or small refactor. Preserve user work and existing constraints.
7. **Prove the transfer.** Run relevant checks and compare before/after evidence. A passing build alone does not prove the lesson.
8. **Record uncertainty.** Separate observed fact, source claim, inference, and unverified hypothesis.

## Required output for Layer 1

Produce:

- project purpose and why it is exemplary;
- repository topography and five first reading anchors;
- dominant engineering lessons;
- prerequisites and difficulty;
- upstream/downstream relationships to other sources;
- one safe exercise and its verification method;
- evidence ledger with exact links;
- next recommended source and reason.

## RCTC composition

When used inside `kazoya/rctc-skill`, compose rather than duplicate:

`RCTC → HTPAAP → Focus Council (optional) → Focused3 → Safe Forward Execution → Continuous Improving`

- Use RCTC to bound Role/Context/Task/Constraints.
- Use Focus Council only for genuine design alternatives.
- Use Focused3 to separate thinking, implementation, and proof.
- Use Safe Forward Execution for reversible authorized changes.
- Use Continuous Improving only after a metric and stop condition exist.

## Guardrails

- Do not copy large portions of third-party code or documentation. Preserve license and attribution.
- Do not use star count as proof of quality.
- Do not modify the studied upstream repository unless the user explicitly requests a contribution.
- Do not turn a source-specific idiom into a universal rule.
- Do not confuse cleverness with maintainability.
- Stop before destructive, paid, credentialed, production, or scope-expanding actions.

## Bundled resources

- `references/source-map.md` — ranked Layer-1 learning graph.
- `references/sources.json` — machine-readable primary-source catalog.
- `references/evidence-protocol.md` — fact/inference/transfer receipt.
- `scripts/validate-sources.mjs` — deterministic catalog validator.

Validate the catalog before packaging or publishing:

```bash
node scripts/validate-sources.mjs references/sources.json
```
