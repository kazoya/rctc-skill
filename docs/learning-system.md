# Learning System — RCTC Method

## Philosophy

RCTC's learning system is built on one principle:

> *Stop asking people what they've already told you.*

Most AI tools treat every conversation as if it's the first. RCTC builds a lightweight model of how YOU work — and uses it.

---

## What Gets Learned

### 1. Component Patterns

Which RCTC components you consistently provide vs. skip:

```json
{
  "usually_provides": ["task", "role"],
  "usually_skips": ["constraints"],
  "skip_threshold": 0.8
}
```

Once `skip_threshold` is reached (80% of interactions skip a component), RCTC stops asking about it and proceeds with smart defaults.

### 2. Domain Context

Your professional world, inferred from repeated signals:

```json
{
  "primary_domain": "B2B SaaS",
  "secondary_domains": ["content marketing", "team management"],
  "target_audience": "non-technical founders",
  "company_stage": "early-stage"
}
```

Used to enrich context when it's thin in your prompt.

### 3. Style Preferences

How you like outputs formatted:

```json
{
  "preferred_length": "concise",
  "tone": "direct, no corporate speak",
  "format_preference": "bullet points over prose",
  "language": "arabic"
}
```

Learned from explicit feedback ("too long", "more formal", "shorter") and implicit signals (you always edit outputs in the same direction).

### 4. Feedback Patterns

What you consistently correct:

```json
{
  "corrections": [
    {"type": "tone", "direction": "less formal", "count": 4},
    {"type": "length", "direction": "shorter", "count": 6}
  ]
}
```

After 3+ corrections of the same type, RCTC applies the preference automatically.

---

## How Learning Activates

### Phase 1: Observation (interactions 1–4)
RCTC behaves normally — asks when needed, notes patterns silently.

### Phase 2: Adaptation (interactions 5+)
RCTC starts applying learned patterns. First time it does, it announces:

```
📈 لاحظت نمطاً: دائماً تعمل في سياق تسويق B2B.
سأطبق هذا السياق تلقائياً ما لم تذكر خلافه.
```

### Phase 3: Refinement (interactions 10+)
RCTC fine-tunes. Fewer announcements, more seamless adaptation.

---

## User Profile Structure

```json
{
  "version": "1.0",
  "created_at": "session_1",
  "last_updated": "session_N",
  
  "component_patterns": {
    "role": { "provided_rate": 0.9, "ask": false },
    "context": { "provided_rate": 0.6, "ask": true },
    "task": { "provided_rate": 1.0, "ask": false },
    "constraints": { "provided_rate": 0.2, "ask": false }
  },
  
  "domain_context": {
    "primary": "fintech",
    "audience": "enterprise clients",
    "role_title": "product manager"
  },
  
  "style": {
    "length": "medium",
    "tone": "professional",
    "language": "arabic",
    "format": "structured"
  },
  
  "feedback_history": [],
  
  "skill_recommendations_shown": [],
  
  "interaction_count": 0,
  "adaptation_active": false
}
```

---

## Resetting the Profile

To start fresh:

```
أعد ضبط ملف RCTC الخاص بي
```

or in English:

```
Reset my RCTC user profile
```

RCTC will confirm and clear all learned patterns.

---

## Inspecting What Was Learned

Ask at any time:

```
ما الأنماط التي تعلمتها من أسلوبي؟
```

RCTC responds with a plain-language summary:

```
📊 ما تعلمته عنك حتى الآن:

• تقدم الدور والمهمة دائماً — لن أسألك عنهما
• نادراً ما تذكر القيود — سأفترض "متوسط الطول، نبرة مهنية"  
• تعمل غالباً في سياق SaaS / تسويق رقمي
• تفضل الردود المختصرة — عدّلت 5 ردود في هذا الاتجاه
• لغتك العربية في الأسئلة، الإنجليزية في البرومبتات التقنية
```

---

## Privacy

- All learning is **session-based** by default — nothing persists between conversations unless you're in a Claude Project with persistent memory enabled.
- No data leaves your environment.
- The profile is a mental model Claude maintains in-context, not a database entry.

---

## Disabling Learning

In `config/config.yaml`:

```yaml
learning_enabled: false
```

Or disable just the announcements while keeping adaptation:

```yaml
disabled_features: ["progress_acknowledgment"]
```

---

## How Learning Interacts with Explicit Instructions

**Explicit always wins.**

If your learned profile says "prefers Arabic" but your current prompt is in English, RCTC responds in English. Learned preferences are defaults, never overrides.

```
Learned pattern + Explicit instruction → Explicit wins
Learned pattern + No instruction → Learned pattern applies
No pattern + No instruction → Smart default applies
```
