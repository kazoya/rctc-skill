# Architecture Transition Advisor Pattern

Trigger: user asks **"Should I migrate? Where to?"** (or Arabic equivalent)

## Response order (human report)

1. **Short decision** — one sentence
2. **Is migration required now?** — yes / no / not yet (with conditions)
3. **Affected layer(s)** — layer_id list
4. **Target pattern or destination class** — e.g. "hybrid: self-hosted data plane + managed inference" (not a single vendor name unless user-named and evidenced)
5. **Why** — evidence-linked
6. **Extract / backup first** — artifacts, exports, configs
7. **Small pilot plan** — scope, duration range, success metrics
8. **Success criteria** — measurable
9. **Rollback conditions** — when to abort
10. **User approval required** — list gates

## Language

Follow `question_language` from intake (auto from user message).

## Machine-readable

Set `report_mode`: `architecture_transition_advisor`.
