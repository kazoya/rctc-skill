# Full Audit Framework

Use this reference for full-project, executive, pre-demo, release, or handover audits.

## Contents

1. Evidence hierarchy
2. Audit surfaces
3. Capability matrix
4. Demo readiness
5. Contradiction handling
6. Portability and loss test
7. Report template

## 1. Evidence hierarchy

Prefer evidence in this order, adjusting for the claim:

1. Current end-to-end behavior in the target environment.
2. Authoritative external state or primary source.
3. Reproducible tests, logs, signed records, and immutable artifacts.
4. Source code and configuration.
5. Generated reports and dashboards.
6. Documentation, tickets, comments, and prior summaries.
7. Memory or unsupported assertion.

Require multiple forms of evidence for high-risk claims. A security control may need code, configuration, a negative test, and deployment verification.

## 2. Audit surfaces

Inspect only surfaces relevant to the promise, but consider:

- product behavior and critical user journeys;
- source control and preservation;
- tests, lint, build, types, and CI;
- deployment and environment drift;
- data quality, provenance, approvals, and retention;
- security, privacy, secrets, access, and audit logs;
- external integrations and write authority;
- operations, monitoring, backups, restore, and ownership;
- portability and new-machine reproducibility;
- documentation and decision-record freshness;
- commercial or executive claims;
- accessibility, localization, and failure behavior.

## 3. Capability matrix

Use one row per capability or channel:

| Capability | Promised | Evidence | Current state | Last verified | Environment | Missing proof | Risk | Next safe action |
|---|---:|---|---|---|---|---|---|---|

For external channels, add:

- account or connector available;
- authenticated;
- read tested;
- write tested in sandbox;
- live write tested;
- approval gate;
- failure and retry behavior;
- last successful receipt by the destination.

Do not test a live write without authorization.

## 4. Demo readiness

Write the five to ten questions a skeptical owner would ask. For each, assign:

- **PASS:** current end-to-end evidence supports the answer.
- **PARTIAL:** a bounded portion works and the limitation can be shown honestly.
- **FAIL:** the promised path does not work.
- **NOT SAFE TO DEMO:** attempting it risks data, reputation, cost, or unauthorized external action.

Record the exact safe fallback for every non-pass result.

## 5. Contradiction handling

When evidence conflicts:

1. Preserve both observations.
2. Check date, branch, environment, scope, definition, and generated/source distinction.
3. Prefer the more direct and current evidence.
4. Reproduce the conflict when safe.
5. Mark the verdict `CONTRADICTED`, `STALE`, or `BLOCKED` until resolved.
6. Update documentation only after the source of truth is established and editing is authorized.

Never rewrite history so an old approval appears to cover a later change.

## 6. Portability and loss test

Ask:

- What is preserved remotely?
- What exists only on this machine?
- Which ignored files are irreplaceable?
- Where are secrets and encryption keys?
- Is there a second backup independent of the machine?
- Can a new operator clone, configure, validate, and run?
- Can derived indexes be rebuilt?
- Has restore actually been tested?
- What is the recovery point and recovery time?

Classify portability as:

- **DOCUMENTED_ONLY**
- **REPRODUCED_ON_SECOND_ENVIRONMENT**
- **RESTORE_TESTED**
- **OPERATED_REPEATIVELY**

## 7. Report template

### Executive reality

State the overall verdict, strongest evidence, largest gap, and immediate risk in a short paragraph.

### Constants and authorization

List invariants, decisions, protected work, environment, and actions not authorized.

### Counts with definitions

Separate targets, placeholders, candidates, validated artifacts, indexed artifacts, approved records, deployments, and live-verified paths.

### Claim-to-evidence ledger

Include all material promises and verdicts.

### Capability matrix

Cover the critical product, data, security, deployment, integration, and operational capabilities.

### Critical-path demonstration

Report PASS, PARTIAL, FAIL, or NOT SAFE TO DEMO for each owner question.

### Contradictions and stale records

Name conflicting artifacts and the evidence that should govern.

### Preservation and loss exposure

Explain uncommitted work, ignored but irreplaceable files, backups, and restore evidence.

### The bitter truth

Answer directly:

- What works today?
- What is local only?
- What is uncommitted, undeployed, unverified, mocked, or planned?
- What would fail in front of the owner?
- What can the team demonstrate confidently?

### P0–P3 plan

Recommend the smallest evidence-backed deltas with acceptance criteria.

### Actions not taken

List external writes, fixes, deploys, publishes, messages, or destructive actions intentionally not performed.

Conclude:

> **Safe to say now:** ...
>
> **Do not promise yet:** ...
