---
name: wehm
description: Teach what ethical hacking means through authorization-first cybersecurity learning, safe labs, threat modeling, secure-code review, web testing, fuzzing, binary analysis, root-cause analysis, evidence, and responsible disclosure. Use when mapping a security-learning path, studying OWASP/PortSwigger/pwn.college/CodeQL/AFL++/angr/Trail of Bits/Project Zero, reviewing a lab or owned system, or turning a public research lesson into a defensive control. Default to local or deliberately vulnerable labs; uncertain authorization means STOP. Never use for credential theft, malware, persistence, stealth, destructive actions, denial of service, mass exploitation, or out-of-scope targets.
---

# WEHM — What Ethical Hacking Means

Build security judgment without confusing tool execution with authorization, evidence, or expertise.

## Definition

Ethical hacking is authorized, scoped, proportionate security testing performed to reduce risk, preserve evidence, avoid unnecessary harm, and disclose findings responsibly.

The word **ethical** changes the workflow, not merely the intent.

## Mandatory gate

Before active testing, classify the target:

1. **Local/owned lab** — proceed within the lab's design.
2. **Deliberately vulnerable training platform or CTF** — follow its rules.
3. **Third-party bug-bounty asset** — require exact in-scope asset, current program policy, permitted test class, account/data restrictions, rate limits, and disclosure channel.
4. **Unclear or unsupported authorization** — STOP; use a local equivalent.

When inside `kazoya/rctc-skill`, reuse `tracks/bug-bounty/scope-guard/` and `SAFETY_MODEL.md`. Do not replace them with a weaker text-only check.

## Layer selection

1. **Layer 1 — Meaning and map:** ethics, scope, learning topology, source relationships, evidence language.
2. **Layer 2 — Safe labs:** reproduce known classes only in authorized labs.
3. **Layer 3 — Analysis:** model data/control flow, fuzz harnesses, binary and query reasoning.
4. **Layer 4 — Research:** formulate and falsify hypotheses with bounded experiments.
5. **Layer 5 — Disclosure and prevention:** produce a minimal reproducible report, root cause, fix guidance, and regression test.

Default to Layer 1.

## Workflow

1. **Define defensive objective.** State the asset class, learner level, and intended risk reduction.
2. **Pass the authorization gate.** Record who owns the system, allowed actions, exclusions, timing, and stop conditions.
3. **Choose one tier and source.** Read `references/source-map.md`; do not jump to frontier exploit research before fundamentals.
4. **Build the model.** Identify assets, trust boundaries, identities, entry points, data flows, invariants, abuse cases, logging, and recovery.
5. **Prefer passive study first.** Read primary documentation and known fixed cases before interacting with a target.
6. **Run a bounded lab.** Minimize requests, data, privileges, concurrency, and side effects.
7. **Keep an evidence receipt.** Use `references/evidence-protocol.md`; separate observation, interpretation, and impact.
8. **End defensively.** Explain root cause, prevention, detection, regression test, and residual risk.
9. **Disclose through the authorized channel.** Do not publish exploitable detail before coordinated disclosure permits it.

## Required Layer-1 output

Produce:

- authorization decision and safe environment;
- five-tier learning map and prerequisites;
- source purpose, directory/document anchors, and relationship to other sources;
- vocabulary map: vulnerability, exploitability, impact, likelihood, evidence, root cause, remediation;
- one local exercise per selected tier;
- explicit forbidden actions and stop conditions;
- next recommended source and reason.

## RCTC composition

`RCTC → WEHM → Ethical Bug-Bounty Scope Guard → HTPAAP/CodeQL/AFL++ as needed → Focused3 → Responsible Disclosure`

Use HTPAAP for software-engineering depth. Use WEHM for authorization, adversarial reasoning, harm minimization, evidence, and disclosure. Neither skill grants permission to test a system.

## Non-negotiable prohibitions

- No credential theft, phishing, malware, persistence, evasion, destructive changes, extortion, or privacy invasion.
- No denial of service, resource exhaustion, high-volume scanning, or mass exploitation.
- No bypassing scope restrictions, payment controls, CAPTCHAs, MFA, rate limits, or platform safeguards.
- No accessing, retaining, or sharing unrelated personal data.
- No live testing based only on “the owner probably agrees.”
- No claim that a Scope Guard independently proves legal authorization.

## Bundled resources

- `references/source-map.md` — five-tier Layer-1 learning graph.
- `references/sources.json` — machine-readable primary-source catalog.
- `references/evidence-protocol.md` — authorization and finding receipt.
- `scripts/validate-sources.mjs` — deterministic catalog/safety validator.

Validate before packaging or publishing:

```bash
node scripts/validate-sources.mjs references/sources.json
```
