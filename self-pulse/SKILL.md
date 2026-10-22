---
name: self-pulse
description: >
  Evidence-grounded agent self-state and customer-interaction intelligence for operational
  confidence, calibration, escalation, and recovery tracking. Use when an agent must separate
  model-reported confidence from verified outcomes, isolate customer-scoped history, reject
  fabricated memory, or emit JSON performance dashboards. Do not use to claim consciousness,
  genuine emotions, or subjective experience. Inspired by Project SELF research patterns;
  does not modify SELF scientific conclusions.
---

# Self-Pulse — Evidence-Grounded Agent Self-State

> **Not consciousness.** Operational scores and “functional satisfaction” are **computational analogues** only.  
> Inspired by the separate Project SELF research lab; this skill does **not** bundle or modify that lab’s conclusions.

## When to use

- Pre-task confidence must be recorded **before** verified outcomes.
- Customer support / helpdesk agents need **isolated** per-customer history.
- You need JSON dashboards for calibration, errors, escalation, evidence quality.
- You must reject evidence-free self-praise and fabricated interaction history.

## Architecture (free edition)

| Module | Role |
|---|---|
| `AgentSelfState` | Operational snapshot (confidence, verified outcome, escalation) |
| `TaskConfidenceEvaluator` | Pre-outcome `p_success` + Brier calibration |
| `FunctionalSatisfactionScore` | Versioned formula — **not an emotion** |
| `CustomerInteractionState` | Pseudonymous, isolated customer records |
| `MemoryContinuityTracker` | Ephemeral vs persistent; reject fabricated provenance |
| `EvidenceQualityEvaluator` | Evidence sufficiency; reject praise without evidence |
| `ErrorAndRecoveryTracker` | Errors + verified corrections |
| `SelfModelRevisionTracker` | Evidence-gated capability beliefs |
| `InteractionEventJournal` | Hash-chained modelReported vs verified |
| `AgentPerformanceDashboard` | JSON aggregate |

## Quick start

```bash
cd self-pulse
npm test
node examples/demo-interaction.js
```

```js
const { SelfPulseEngine } = require('./src');
const eng = new SelfPulseEngine({ agentId: 'support-1' });
const { dashboard } = eng.runTaskCycle({
  taskId: 't-1',
  customerId: 'cust_abc',
  pSuccess: 0.7,
  verifiedSuccess: true,
  evidenceIds: ['ev-1']
});
```

## Hard rules

1. Separate **model-reported** assessments from **externally verified** results.
2. Never invent customer satisfaction (CSAT).
3. Never claim the agent is conscious or “feels” satisfied.
4. Customer data must not cross customer IDs (`ISOLATION_VIOLATION`).
5. Do not push, publish to Agensi, or collect live customer data from this skill alone.

## Premium

Advanced persistent analytics and CRM adapters live in a **separate private package** (not in this MIT tree). See `docs/FREE_VS_PREMIUM.md`.

## Docs

- English: this file + `README.md`
- Arabic: `docs/README.ar.md`
