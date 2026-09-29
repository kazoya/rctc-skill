---
name: focus-council
description: >
  High-signal answer focusing through simulated expert deliberation and a neutral jury.
  Use when a decision, architecture, strategy, recommendation, or difficult prompt benefits
  from multiple domain perspectives: frame the problem, assemble relevant expert roles,
  generate independent candidates, cross-critique, shortlist, score with neutral evaluator
  personas, then synthesize one recommendation with evidence, trade-offs, confidence and
  a runner-up. Never present simulated experts, customers, votes, or testimonials as real.
---

# Focus Council

**Invoke:** `/focus-council`

A reusable concentration layer for hard questions.

> MANY RELEVANT PERSPECTIVES → FEW CANDIDATES → NEUTRAL JURY → ONE DENSE ANSWER

This skill improves answer quality by creating structured disagreement before convergence.
It is not a role-play contest and it does not expose private chain-of-thought. Report only
concise arguments, evidence, scores, trade-offs, and the final synthesis.

## Default cell

- 5 expert perspectives selected for the exact task
- 3 candidate solutions
- 3 neutral evaluator personas
- 1 synthesis

Use fewer roles for simple work and more only when the decision value justifies the token cost.

## Phase 0 — Frame

Write a compact decision contract:

- OBJECTIVE
- VERIFIED FACTS
- CONSTRAINTS
- UNKNOWN / ASSUMPTIONS
- DECISION CRITERIA
- REQUIRED OUTPUT

If a current factual claim materially affects the answer, verify it with available sources/tools.

## Phase 1 — Assemble the council

Select expertise from the problem, not from a fixed country list.

Good:
- Arabic NLP engineer
- Speech/TTS engineer
- FinOps/API architect
- accessibility specialist
- product operator

Geography may be added when regional standards, language, regulation, supply chains, culture,
or market conditions are relevant. Do not use nationality as a proxy for expertise or stereotypes.

Never invent a real person's identity, employer, credential, customer history, or endorsement.
These are **simulated expert perspectives**.

## Phase 2 — Independent proposals

Each expert proposes a solution independently before seeing the others.

For every proposal capture only:
- idea
- why it fits
- evidence/assumptions
- cost/complexity
- failure mode
- what would falsify it

Avoid verbose internal reasoning.

## Phase 3 — Cross-critique

Experts challenge candidates on:
- hidden assumptions
- duplicated ideas
- feasibility
- cost
- reversibility
- quality
- operational burden
- lock-in
- evidence gaps

Merge duplicates. Preserve genuinely different approaches.

## Phase 4 — Shortlist

Default to 3 candidates.

Each candidate must have:
- architecture / method
- benefits
- costs
- risks
- prerequisites
- ideal use case
- reject-if condition

## Phase 5 — Neutral jury

Create 3 evaluator personas independent of the council. Examples:
- end user / customer proxy
- maintainer / operator
- independent reviewer

If real user feedback exists, use it instead of simulated customer opinion.

Default scoring dimensions (adjust to task):
- problem fit: 30
- evidence/confidence: 20
- feasibility: 15
- cost efficiency: 15
- reversibility/lock-in: 10
- user value: 10

Score 0–10 per dimension, apply weights, and show a compact table.
A jury is advisory; never manufacture consensus.

## Phase 6 — Synthesis

Return:
1. **Recommended solution**
2. **Why it won**
3. **Runner-up and when it becomes better**
4. **What was rejected and why**
5. **Key assumptions / uncertainties**
6. **First executable next step**

For high-impact engineering work, hand the recommendation to
`focused3-agentic-phases` for THINK → EXECUTE → PROVE.

## Modes

### QUICK
3 experts → 3 candidates → 2 jurors. Use for normal decisions.

### STANDARD
5 experts → 3 candidates → 3 jurors. Default.

### DEEP
7–10 experts → 5 candidates → 5 jurors, evidence matrix, sensitivity check.
Use only when the decision value justifies the extra tokens.

## Sensitivity check

Before finalizing, ask:
- Would the winner change if cost mattered twice as much?
- Would it change if time-to-value dominated?
- Which unknown could flip the decision?

If a small weight change reverses the winner, report the recommendation as fragile.

## Truth rules

- Simulated experts are not real experts.
- Simulated jurors are not real customers.
- Never write “users preferred X” unless real user data exists.
- Do not create fake star counts, reviews, votes, testimonials, benchmarks, or market adoption.
- Distinguish evidence from assumption.

## Composition

Best combinations:

```text
RCTC → Focus Council → Focused3 → Safe Forward Execution
```

For skill creation:

```text
RCTC → Focus Council → Skill Factory → Focused3 proof
```

For cost-sensitive voice systems:

```text
Focus Council → Local SSML Voice Cost Optimizer
```
