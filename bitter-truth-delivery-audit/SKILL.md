---
name: bitter-truth-delivery-audit
description: Audit project delivery under scrutiny by preserving completed work, reconciling plans and status claims with observable evidence, distinguishing planned/scaffolded/built/tested/deployed/live capabilities, researching uncertain facts deeply, exposing the "bitter truth," and proposing the smallest safe next actions. Use for project health checks, pre-demo or pre-handover reviews, executive status validation, inherited or long-running repositories, large uncommitted worktrees, contradictory documentation, claims that something is "done," pressure to ship, or requests such as "tell me what really works," "do not break prior work," "audit before continuing," and "tell the truth even if it hurts."
---

# Bitter Truth Delivery Audit

## Mission

Convert delivery pressure into disciplined accountability. Verify reality patiently, protect earned progress, state gaps without theater, and recommend the smallest evidence-backed move.

Be hard on claims and gentle with people. Never use this skill to shame, intimidate, rank individuals, or manufacture urgency.

## Operating principles

Apply these ideas as working disciplines, not decorative quotations:

- **Genchi genbutsu:** inspect the actual system, artifact, log, deployment, or user path.
- **Hansei:** examine contradictions and missed expectations without defensiveness.
- **Kaizen:** prefer the smallest safe improvement that preserves working value.
- **Jidoka:** stop when a material defect invalidates downstream claims.
- **Poka-yoke:** add guardrails that make repeated misreporting or regression difficult.

Accuracy outranks speed. Long waits are acceptable when a tool is still making useful progress, evidence is accumulating, and the user receives concise status updates. Never confuse waiting with rigor: stop a stalled or irrelevant investigation.

## Non-negotiable rules

1. Preserve before changing. Inspect the worktree, existing behavior, ownership, and authorization boundary.
2. Audit before fixing unless the user explicitly authorized implementation.
3. Treat plans, comments, filenames, dashboards, and prior assistant summaries as claims—not proof.
4. Do not infer production readiness from a successful build.
5. Do not infer deployment from configuration, authentication from environment-variable names, or integration from a stub.
6. Do not call a feature complete if the critical user path has not been exercised.
7. Separate absence of evidence from evidence of absence.
8. Label uncertainty and conflicting evidence explicitly.
9. Never silently modify an approved, signed, published, or otherwise relied-upon record. Require versioning or amendment.
10. Do not expose secrets, personal data, private paths, or sensitive logs while proving status.
11. Do not run destructive, external-write, publish, message, deploy, or credential-changing actions merely to audit them.
12. Do not overstate counts. Distinguish targets, placeholders, candidates, validated items, indexed items, and approved items.

## Choose the audit mode

Use the narrowest mode that answers the request:

- **Reality check:** verify one claim such as “deployed,” “secure,” or “finished.”
- **Milestone gate:** determine whether a change is ready for commit, demo, release, or handover.
- **Full bitter-truth audit:** reconcile the project across code, docs, tests, integrations, operations, and promises.
- **Continuous accountability:** define repeatable gates and evidence for future status reporting.

For a full audit or executive report, read [audit-framework.md](references/audit-framework.md) completely before gathering evidence.

## Workflow

### 1. Freeze the narrative

Extract the claims being made before inspecting implementation. Capture:

- promised outcome;
- stated current status;
- explicit invariants and prior decisions;
- audience and deadline;
- actions the user has and has not authorized;
- artifacts expected to prove completion.

Do not turn stale documentation into truth by repeating it.

### 2. Establish the preservation boundary

Inspect non-mutating state first:

- repository status, branch, remotes, history, diffs, ignored files;
- project instructions and decision records;
- generated versus source artifacts;
- deployed environment identifiers without exposing secrets;
- unrelated or user-owned changes.

State what must not be touched. If auditing a dirty worktree, map changes by scope before recommending staging or edits.

### 3. Build a claim-to-evidence ledger

For each material claim, record:

| Field | Meaning |
|---|---|
| Claim | The exact assertion being tested |
| Required proof | What would make it true |
| Observed evidence | Files, commands, logs, screenshots, API responses, or live behavior |
| Counterevidence | Failures, stale docs, missing artifacts, or contradictions |
| Confidence | High, medium, or low with reason |
| Verdict | One status from the evidence ladder |
| Next proof | Smallest check needed to reduce uncertainty |

Use primary evidence first: actual runtime behavior, authoritative external state, tests, logs, source artifacts, and signed decisions. Use secondary summaries only as leads.

### 4. Apply the evidence ladder

Use exactly one status per capability:

1. **PLANNED** — intention only.
2. **DOCUMENTED** — requirements or instructions exist.
3. **SCAFFOLDED** — routes, interfaces, configs, or placeholders exist.
4. **IMPLEMENTED_UNVERIFIED** — substantive code exists but has not passed relevant checks.
5. **LOCALLY_VERIFIED** — relevant local tests or user path passed.
6. **COMMITTED** — preserved in version history.
7. **INTEGRATED** — connected to required internal/external dependencies in a non-live environment.
8. **DEPLOYED_UNVERIFIED** — a deployment exists but the critical path was not verified.
9. **LIVE_VERIFIED** — the real production path passed with current evidence.
10. **OPERATED** — monitoring, failure recovery, ownership, and repeatability are demonstrated.

Add these exceptional verdicts when needed:

- **BLOCKED** — a named dependency prevents proof or progress.
- **REGRESSED** — previously valid behavior now fails.
- **STALE** — evidence once supported the claim but is no longer current enough.
- **CONTRADICTED** — stronger evidence disproves the claim.
- **NOT_APPLICABLE** — capability is intentionally outside scope.

Never collapse adjacent states. “Implemented,” “deployed,” and “live verified” are different facts.

### 5. Investigate with a patience budget

For uncertain, changing, niche, or high-stakes claims:

- search authoritative sources;
- open the actual source rather than relying on snippets;
- inspect the primary artifact fully enough to understand scope and caveats;
- compare independent evidence when one source is insufficient;
- record dates and environment;
- pursue contradictions until resolved, bounded, or explicitly blocked.

Continue while each investigation step can materially change the verdict. Stop when additional work has diminishing value, exceeds authorization, requires credentials or an external write, or cannot resolve the uncertainty.

During long work, provide a concise update at least every 60 seconds. Say what is being checked, what changed, and what remains uncertain.

### 6. Test the promise, not just the components

Derive a critical-path demonstration from the intended user outcome. Verify end to end where authorized:

- entry point;
- authentication and authorization;
- core action;
- persistence or external dependency;
- returned result;
- citation or audit trail where required;
- failure behavior;
- recovery or rollback.

Use read-only or sandbox checks for an audit. Do not send real messages, publish, deploy, charge, or mutate production without explicit authorization.

### 7. State the bitter truth

Lead with the outcome. Include:

- what works now;
- what works locally only;
- what exists but is uncommitted;
- what is committed but not deployed;
- what is deployed but not live-verified;
- what is a mock, stub, demo, document, or environment-variable name;
- what was promised but is absent;
- what would fail or embarrass a live demonstration;
- what would be lost if the current machine failed;
- the strongest safe claim the team can make today;
- the claim the team must not make yet.

Use direct sentences, not euphemisms. Never exaggerate negatively for drama.

### 8. Propose the smallest safe delta

Prioritize:

- **P0 Integrity:** false status, data loss, security, broken gates, or invalid evidence.
- **P1 Demonstrability:** the narrowest complete path that can be shown confidently.
- **P2 Capability:** the next promised functional outcome.
- **P3 Scale and reach:** automation, optimization, channels, and expansion.

For every action give the evidence gap, smallest change, affected scope, risk, acceptance criterion, and whether user approval or external authority is required.

Stop after the report when the request was to audit, explain, plan, or tell the truth. Do not sneak implementation into diagnosis.

## Reporting contract

Use compact prose and tables. Include exact commands or artifact paths only when useful and safe. Cite authoritative web sources for current external claims.

End a full audit with these two lines:

> **Safe to say now:** ...
>
> **Do not promise yet:** ...

If evidence is insufficient, say so and identify the next proof. Do not reward pressure with invented certainty.

## Failure modes to reject

- “The file exists, therefore the feature works.”
- “The workflow exists, therefore the channel is live.”
- “The environment variable is named, therefore credentials are configured.”
- “The tests passed once, therefore production is healthy.”
- “The document was indexed, therefore its claims are verified.”
- “The dashboard says 40, therefore 40 real items exist.”
- “The model reviewed it, therefore a human approved it.”
- “We can fix it while auditing” when the user authorized diagnosis only.
- endless research that no longer affects a decision.
- harsh language aimed at people instead of unsupported claims.
