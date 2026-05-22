# Configuration Guide

RCTC behavior is controlled by `config/config.yaml`. Copy it to customize without editing the default:

```bash
cp config/config.yaml config/my-config.yaml
```

Point your setup at `my-config.yaml` if your environment supports a custom config path; otherwise edit `config/config.yaml` directly.

---

## Full Reference

```yaml
rctc_config:
  token_optimization: false
  skip_obvious_components: true
  question_language: "auto"
  max_clarifying_questions: 1
  show_component_analysis: false
  show_reasoning: true
  learning_enabled: true
  adaptation_threshold: 5
  domain_memory: true
  skill_recommendations: true
  recommendation_frequency: "low"
  disabled_features: []
```

---

## Performance Settings

### `token_optimization`

| Value | Behavior |
|-------|----------|
| `false` (default) | Full RCTC responses — reasoning, headers, acknowledgments |
| `true` | Shorter replies; skips non-essential preamble |

**Use `true` when:** token budget matters and you already know RCTC well.

**Trade-off:** Less teaching moment per interaction; faster answers.

---

### `skip_obvious_components`

| Value | Behavior |
|-------|----------|
| `true` (default) | Don't ask about components clearly implied by context |
| `false` | Stricter checking — may ask even when context hints at the answer |

**Example:** User says *"I'm a lawyer, draft a client email"* → Role is obvious; RCTC skips asking about Role.

---

## Communication Settings

### `question_language`

| Value | Behavior |
|-------|----------|
| `"auto"` (default) | Match the user's language (Arabic → Arabic questions, English → English) |
| `"arabic"` | Always ask clarifying questions in Arabic |
| `"english"` | Always ask clarifying questions in English |

---

### `max_clarifying_questions`

Hard cap per turn. **Default: `1`**. Never set above `2`.

RCTC prioritizes by impact: `Task > Role > Context > Constraints`.

---

### `show_component_analysis`

| Value | Behavior |
|-------|----------|
| `false` (default) | Internal analysis only — user sees the question or answer, not the RCTC grid |
| `true` | Shows Role / Context / Task / Constraints breakdown in responses |

**Use `true` while learning the framework; disable once comfortable.**

---

### `show_reasoning`

| Value | Behavior |
|-------|----------|
| `true` (default) | Explains *why* a missing component matters when asking |
| `false` | Asks the question without the "why this matters" block |

Requires `reasoning_explanation` not be in `disabled_features`.

---

## Learning Settings

### `learning_enabled`

| Value | Behavior |
|-------|----------|
| `true` (default) | Track patterns (what user usually provides/skips, domain, language) |
| `false` | Every interaction treated fresh |

Disable via config or `disabled_features: ["learning"]`.

---

### `adaptation_threshold`

Number of interactions before adaptation kicks in. **Default: `5`**.

After threshold: RCTC stops asking about components the user consistently skips and adjusts tone to observed preferences.

---

### `domain_memory`

| Value | Behavior |
|-------|----------|
| `true` (default) | Remember domain context (e.g. marketing, tech) across sessions |
| `false` | No cross-session domain carry-over |

Learning data is conceptual in the skill spec; implement in your environment if you persist a user profile.

---

## Recommendation Settings

### `skill_recommendations`

| Value | Behavior |
|-------|----------|
| `true` (default) | Suggest complementary skills when clearly relevant |
| `false` | No skill suggestions |

See `src/recommender.md` for trigger logic.

---

### `recommendation_frequency`

| Value | Behavior |
|-------|----------|
| `"low"` (default) | Only when highly relevant — minimal noise |
| `"medium"` | More frequent suggestions |
| `"high"` | Aggressive surfacing — use sparingly |

---

## Feature Toggles — `disabled_features`

List of features to turn off (useful for token savings or minimal mode):

| Feature key | Effect when disabled |
|-------------|----------------------|
| `"learning"` | No pattern tracking or adaptation |
| `"recommendations"` | No skill suggestions |
| `"reasoning_explanation"` | No "why this matters" when asking |
| `"assumption_statements"` | Don't announce assumptions before proceeding |
| `"progress_acknowledgment"` | Skip "Excellent RCTC prompt" / "🚀 complete prompt" headers |

**Example — minimal mode:**

```yaml
rctc_config:
  token_optimization: true
  show_reasoning: false
  disabled_features:
    - "recommendations"
    - "progress_acknowledgment"
    - "assumption_statements"
```

---

## Preset Profiles

### Arabic-first, teaching mode

```yaml
rctc_config:
  question_language: "arabic"
  show_component_analysis: true
  show_reasoning: true
  recommendation_frequency: "low"
```

### English power user, fast mode

```yaml
rctc_config:
  question_language: "english"
  token_optimization: true
  show_component_analysis: false
  max_clarifying_questions: 1
  disabled_features: ["progress_acknowledgment"]
```

### Strict RCTC coach

```yaml
rctc_config:
  skip_obvious_components: false
  show_component_analysis: true
  show_reasoning: true
  max_clarifying_questions: 1
```

---

## Cursor & Claude Setup

- **Cursor:** Rule in `.cursor/rules/rctc.mdc` reads these defaults; override in `config/config.yaml` for this repo.
- **Claude Projects:** Paste `SKILL.md` + mention your config choices in project instructions, or paste relevant YAML snippet.

---

## Related Docs

- [Getting Started](getting-started.md)
- [English examples](../examples/english-examples.md)
- [Arabic examples](../examples/arabic-examples.md)
- [Analyzer logic](../src/analyzer.md)
- [Response templates](../src/templates.md)
