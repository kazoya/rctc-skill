# Need map

One row per need. The local skill is the default. The ECC name is the upstream skill to install only when this repo does not already do that job. Names are from [affaan-m/ECC](https://github.com/affaan-m/ecc) at `b92f181b3b748d1abbc2afd94af6aa7d8c8fca29`. They are pointers, not copies.

| Need | Local skill | ECC skill, if the local one is not enough |
|---|---|---|
| Vague request, handoff, one clarifying question | `rctc-method` | none |
| Think, then build, then proof | `focused3-agentic-phases` | `verification-loop` |
| Stay inside authority already granted | `safe-forward-execution` | `operator-approval-loop` |
| Claim only what was measured | `evidence-before-claim` | `eval-harness` |
| What strong engineers prove | `htpaap` | `production-audit` |
| Compare options before a decision | `focus-council` | `council` |
| Improve a path that is already allowed | `continuous-improving` | `continuous-learning` |
| Remember project state | `master-brain` | `unified-memory` |
| Start from the portfolio brain | `start-skill` | none |
| Turn a repeated lesson into a skill | `skill-factory` | `skill-stocktake` |
| Install or retarget the harness | `ecc-harness` | `configure-ecc` |
| Frontend taste and anti-slop | `design-taste-rctc` then vendored `design-taste-frontend` | `frontend-design-direction` |
| Arabic motion, clock, theme light, and AR/EN | `arabic-stage-craft` | none |
| Operator-owned secrets | `owner-credential-vault` | none |
| Signed-in browser window | `logged-in-browser` | `browser-qa` |
| Flutter or Dart app | `flutter-dart-app` | `dart-flutter-patterns` |
| Android structure beyond that app skill | `flutter-dart-app` | `android-clean-architecture` |
| Git branch isolation and a small PR | `git-worktree-flow` | `git-workflow` |
| Review a diff for bugs and missing tests | `pr-review-surgeon` | `security-review` |
| Failing test, then the smallest fix | `test-first-slice` | `tdd-workflow` |
| Authorized security learning | `wehm` | `agent-security-hardening` |
| Marketing site | `web-marketing-and-personal-builder-super-skill` | none |
| WhatsApp or channel agent inside an approval gate | `whatsapp-agent-orchestrator-super-skill` | `email-ops` only for mail, not for WhatsApp |
| Arabic voice cost | `local-ssml-voice-cost-optimizer` | none |
| Prize or contest go/no-go | `prize-hunt-skill-fit` | none |
| Context too large for a local model | `ecc-harness` (this map) | `context-budget` |

## Mechanisms

ECC ships these as its own product. This repo uses them by name.

| Mechanism | Role | Rule here |
|---|---|---|
| Agents | Specialized roles (plan, review, security, domain) | Keep focused3 roles local. Call an ECC agent only after the owner installs the harness. |
| Skills | Domain procedures | One skill from the table. Never the full upstream catalog. |
| Commands | Short entry points | Prefer the skill. Commands are a compatibility surface upstream. |
| Hooks | Session enforcement and extra context | Owner runs `ecc-universal` setup. Cursor in this repo does not gain those hooks automatically. |
| Rules | Language or project standards loaded every turn | Select the upstream rule for the language in the task. Do not duplicate it in this tree. |
| Memory and instincts | Session notes and learned triggers | Project truth stays in Master Brain. Instincts do not override `safe-forward-execution`. |
| AgentShield | Scan of prompts, hooks, MCP, permissions, secrets | Run it upstream before enabling a new hook pack. It does not replace `owner-credential-vault`. |

## Adding a row

A new need gets one local skill and at most one ECC skill name. If both cells would be new writing, use `skill-factory` for the local skill and leave the ECC cell as a name from upstream.
