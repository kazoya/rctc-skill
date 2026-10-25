# Self-Pulse (Free) — Evidence-Grounded Agent Self-State

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)

**Self-Pulse** helps AI agents track operational confidence, verified task outcomes, customer-scoped interaction state, calibration, escalation, and recovery — as **JSON you can audit**.

> This skill does **not** create consciousness, genuine emotions, or subjective experience.  
> `FunctionalSatisfactionScore` is a **computational** operational index, not a feeling.  
> Customer satisfaction is **never manufactured**; only explicit customer feedback is stored.

## Why it exists

Most agents narrate success. Self-Pulse forces a split:

| Model-reported | Externally verified |
|---|---|
| Pre-task `p_success` | Pass/fail from your harness |
| Self-praise | Evidence IDs required |
| In-memory chatter | Customer isolation + deletion |

Inspired by Project SELF research patterns. Scientific conclusions of that lab remain independent and are **not** altered by this product.

## Quick start

```bash
cd self-pulse
npm test          # 13 offline tests
npm run demo      # writes examples/sample-output.json
```

```js
const { SelfPulseEngine } = require('./src');
const eng = new SelfPulseEngine({ agentId: 'support-bot' });
const { dashboard } = eng.runTaskCycle({
  taskId: 'ticket-42',
  customerId: 'cust_demo',
  pSuccess: 0.7,
  verifiedSuccess: true,
  evidenceIds: ['log-9']
});
console.log(JSON.stringify(dashboard, null, 2));
```

## Install as an agent skill

| Host | Path |
|---|---|
| Cursor | Copy folder → `.cursor/skills/self-pulse/` |
| Claude Code | Copy folder → `.claude/skills/self-pulse/` |
| Codex / SKILL.md hosts | Place where skills are discovered |

See `docs/INSTALL.md`, Arabic overview `docs/README.ar.md`, security `docs/SECURITY.md`.

## Free vs Premium

| | Free (this repo) | Premium (private package) |
|---|---|---|
| Core evaluation + Brier | ✅ | ✅ |
| In-memory customer isolation | ✅ | ✅ + **persistent** store |
| Dashboard JSON | Basic | Analytics + error patterns + policies |
| CRM adapters | ❌ | Stubs (credentials owner-gated) |
| MIT public source | ✅ | ❌ private only |

Premium suggested launch price: **USD $29 one-time** (pending owner approval). Comparison: `docs/FREE_VS_PREMIUM.md`.

## License & attribution

MIT — see repository root `LICENSE`.  
Zero runtime npm dependencies.

## Support

Issues via the `rctc-skill` repository after the owner publishes this branch. No live customer data is collected by the skill itself.
