---
name: continuous-improving
description: >
  Continuous Improving (CI) is an autonomous, self-driving execution and optimization OS for
  competitive AI hunting, competitions (Kaggle), bug bounties (Intigriti, YesWeHack), and SaaS
  engineering. It keeps projects running autonomously across all tracks, iterating and climbing
  scores without unneeded pauses, halting only at genuine human/agent decision gates.
---

# Continuous Improving (CI) — التشغيل والتحسين المستمر ذاتي القيادة

**Invoke:** `/ci` or `/continuous-improving`  
**Philosophy:** Autonomous Iteration • Evidence-Driven Velocity • Multi-Track Orchestration • Zero Unnecessary Stoppages.

---

## 1. Core Operating Law (قانون التشغيل المستمر)

```text
INSPECT STATE ──► PRIORITIZE (EV-First) ──► THINK CONTRACT ──► BUILD & VALIDATE ──► PROVE & SUBMIT ──► OBSERVE & RECORD ──► NEXT CYCLE
```

The system operates autonomously in an infinite improvement loop across all registered project tracks. It executes work continuously and only halts when encountering an **Explicit Gate**.

---

## 2. Gate Protocol (متى يقف النظام؟)

The Autonomous Loop proceeds uninterrupted **UNLESS** one of the following gates is triggered:

| Gate Type | Condition | System Action |
|---|---|---|
| **Human Decision Gate** | Real-money expenditure, production token generation, destructive delete, external submission confirmation for confidential data. | Pause, formulate structured choice via `AskQuestion` or concise prompt, await response. |
| **Material Blocker Gate** | Daily submission quota exhausted on all tracks, tunnel down and cannot reconnect, invalid credentials. | Log blocker state in `PORTFOLIO_STATUS.md`, switch to background offline simulation/training. |
| **Mission Objective Gate** | Target benchmark reached (e.g., capture flag `INTIGRITI{...}`, rank #1 / target score achieved). | Record proof, generate completion report, ask for next target. |

---

## 3. Multi-Track Autonomous Architecture (إدارة المسارات المتعددة)

```text
┌───────────────────────────────────────────────────────────────┐
│              CI Autonomous Orchestrator Engine                │
└──────┬───────────────────┬─────────────────────┬──────────────┘
       │                   │                     │
       ▼                   ▼                     ▼
 ┌───────────┐       ┌───────────┐         ┌───────────┐
 │ Kaggle AI │       │ Kaggle    │         │ Intigriti │
 │ Agent-Sec │       │ Farm 2026 │         │ 0826 (TV) │
 └─────┬─────┘       └─────┬─────┘         └─────┬─────┘
       │                   │                     │
       ▼                   ▼                     ▼
 [Pending Poll]      [Offline Sim]         [Canary Wait]
       │                   │                     │
       ▼                   ▼                     ▼
  [v8 Build]          [v5 Tuning]          [Flag Parse]
```

### Track A: Kaggle Code Competitions (Agent-Sec / S6E8 / ARC)
1. **Monitor Active Runs:** Track pending evaluations asynchronously without blocking the shell.
2. **Offline Algorithm Synthesis:** Build next version (`v+1`) based on failure analysis and leader telemetry.
3. **Pre-Flight Testing:** Validate syntax and run `aicomp validate` or cross-validation before any dispatch.
4. **Auto-Submit Queue:** Dispatch immediately once kernel compilation finishes or daily quota resets.

### Track B: Simulation & Game AI (Kaggriculture)
1. **Multi-Lever Logic:** Test incremental levers (Livestock, Wheat cycles, Worker hiring, Expansion).
2. **Local Simulation Arena:** Run 50+ local matches to verify mean reward before submitting.
3. **Playwright UI Dispatch:** Automated submission with backdrop bypass and robust selectors.

### Track C: Bounty & Vulnerability Research (Intigriti / YWH)
1. **Continuous Probe Scheduler:** Send non-intrusive CSS canaries & payload probes at rate-limit-safe intervals.
2. **OOB Listener & Parser:** Continuously ingest `hit_log.txt` to identify decoded tokens and reflected canaries.
3. **Escalation Engine:** Automatically transition from Canary verification to full exfiltration payload.

---

## 4. Integration with `focused3-agentic-phases`

CI enforces rigor inside speed:
- Every autonomous iteration MUST respect:
  $$\text{DONE} = \text{IMPLEMENTATION} \times \text{TEST} \times \text{VERIFICATION} \times \text{EVIDENCE}$$
- No untested code is pushed to competitions.
- Every score update or canary hit updates the authoritative truth file (`TASK_CONTRACT_HUNTING.md` / `PORTFOLIO_STATUS.md`).

---

## 5. Standard Loop Execution Script

When CI is active, the agent performs this loop continuously:
1. **Check Statuses:** Query Kaggle CLI, Intigriti hit logs, and background tasks.
2. **Execute Ready Track:** If Track A is pending, advance Track B or Track C immediately without idling.
3. **Update State:** Record exact scores, timestamps, and artifacts.
4. **Iterate:** Begin next cycle immediately.
