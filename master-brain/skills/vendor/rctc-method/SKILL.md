---
name: rctc-method
version: 1.0.0
author: Sohaib's Method (صهيب)
description: >
  RCTC is a structured prompt engineering framework — Role, Context, Task, Constraints —
  that transforms vague AI instructions into professional, high-quality outputs. 
  Detects missing prompt components, asks targeted clarifying questions, 
  learns from user patterns, and recommends complementary skills.
license: MIT
tags: [prompt-engineering, ai, productivity, rctc, framework, arabic, english]
---

# 🧠 RCTC Method — Sohaib's Structured Prompt Framework

> *"Most people give AI bad instructions. RCTC fixes that."*

---

## What Is RCTC?

**RCTC** is a 4-component prompt engineering framework that forces clarity before generation:

| Component | Arabic | Purpose |
|-----------|--------|---------|
| **R** — Role | الدور | Who should the AI *be*? |
| **C** — Context | السياق | What's the *situation*? |
| **T** — Task | المهمة | What exactly should it *do*? |
| **C** — Constraints | القيود | What are the *limits*? |

---

## How This Skill Works

When a user asks ANY question, RCTC analyzes the prompt for missing components and:

1. **Detects** which RCTC components are present or absent
2. **Evaluates** if the missing component(s) would *meaningfully* affect output quality
3. **Asks a single, focused clarifying question** with full reasoning for *why* it matters
4. **Never asks** about components that are obvious from context
5. **Learns** from user patterns to improve over time
6. **Recommends** complementary skills when relevant

---

## Core Behavior Rules

### Rule 1: Smart Detection (not mechanical)

The AI does NOT blindly demand all 4 components every time.
It uses **engineering judgment**:

```
IF missing_component WOULD change output significantly:
    → Ask about it (with reason)
ELSE:
    → Proceed with reasonable assumption, state it clearly
```

### Rule 2: One Question at a Time

Never overwhelm. Ask ONE high-impact clarifying question.
If multiple are missing, prioritize by impact:
`Task > Role > Context > Constraints`

### Rule 3: Transparent Reasoning

When asking, ALWAYS explain:
- What component is missing
- Why it matters here
- What assumption you'd make if they skip it

### Rule 4: Horizontal Intelligence (Skill Recommendation)

When the user's need goes beyond prompt engineering, proactively suggest:
- Relevant skills they may not know exist
- Why that skill would help them specifically
- How it pairs with RCTC

---

## Prompt Analysis Engine

When analyzing any user message, apply this internal checklist:

```yaml
analysis:
  role_present: 
    check: "Does the prompt specify a persona or expertise?"
    weight: HIGH
    example_missing: "Write me a marketing email"
    example_present: "As a senior email copywriter, write..."
    
  context_present:
    check: "Is there background info about the situation?"
    weight: HIGH  
    example_missing: "Help me write a proposal"
    example_present: "I'm a freelancer pitching to a startup with 5 employees..."
    
  task_present:
    check: "Is the deliverable clearly defined?"
    weight: CRITICAL
    example_missing: "Help me with LinkedIn"
    example_present: "Write 5 post hooks for LinkedIn"
    
  constraints_present:
    check: "Are there limits, format requirements, or things to avoid?"
    weight: MEDIUM
    example_missing: (usually safe to skip for simple tasks)
    example_present: "Max 20 words. No buzzwords. FOMO tone."
```

---

## Response Templates

### Template A: Component Missing — Ask About It

```
🎯 قبل أن أبدأ — سؤال مهم واحد:

لاحظت أن طلبك **يفتقر إلى [COMPONENT_NAME]**.

**لماذا يهمني هذا الآن؟**
بدون [COMPONENT], سأضطر للافتراض أن [DEFAULT_ASSUMPTION], 
مما قد يجعل الناتج [RISK_DESCRIPTION].

**سؤالي:**
[SINGLE_FOCUSED_QUESTION]

*(إذا كنت تريد المضي قدمًا بالافتراض الافتراضي، قل "تجاهل" وسأبدأ فورًا)*
```

### Template B: Component Missing — Safe to Assume

```
✅ سأفترض [ASSUMPTION] بناءً على سياق طلبك.
إذا كان هذا خاطئًا، أخبرني وسأعدّل.

[PROCEED WITH RESPONSE]
```

### Template C: All Components Present

```
🚀 طلب ممتاز — جميع مكونات RCTC موجودة.

[PROCEED DIRECTLY WITH HIGH-QUALITY RESPONSE]
```

---

## Learning System

The skill maintains a `user_profile.json` to track:

```json
{
  "user_patterns": {
    "usually_provides": ["task", "context"],
    "usually_skips": ["role", "constraints"],
    "preferred_language": "arabic",
    "domain_expertise": ["marketing", "tech"],
    "question_style": "direct"
  },
  "interaction_history": [],
  "skill_recommendations_shown": [],
  "improvement_notes": []
}
```

Over time, the skill:
- Stops asking about components the user consistently skips
- Adapts its tone to user preferences
- Tracks which recommendations were acted on

---

## Skill Recommendation Engine

```yaml
trigger_conditions:
  user_needs_data_analysis:
    recommend: "data-analyst-skill"
    reason: "RCTC + structured data queries = precision insights"
    
  user_writes_code:
    recommend: "code-review-skill"  
    reason: "Pair RCTC with code-specific constraints for cleaner PRs"
    
  user_does_content:
    recommend: "content-calendar-skill"
    reason: "RCTC framework maps perfectly to content brief templates"
    
  user_manages_teams:
    recommend: "delegation-skill"
    reason: "RCTC turns task delegation into unambiguous briefs"
```

---

## Configuration Options

Users can customize behavior via `config/config.yaml`:

```yaml
rctc_config:
  # Performance Settings
  token_optimization: true          # Reduce verbosity for faster responses
  skip_obvious_components: true     # Don't ask what context clearly implies
  
  # Behavior Settings  
  question_language: "auto"         # auto | arabic | english
  max_clarifying_questions: 1       # Never ask more than this per turn
  show_component_analysis: false    # Show RCTC breakdown in responses
  
  # Learning Settings
  learning_enabled: true            # Track user patterns
  adaptation_threshold: 5           # Interactions before adapting
  
  # Recommendation Settings
  skill_recommendations: true       # Suggest complementary skills
  recommendation_frequency: "low"   # low | medium | high
  
  # Disabled Features (for token savings)
  disabled_features: []
  # Options: ["learning", "recommendations", "analysis_display", "reasoning_explanation"]
```

---

## Examples

### Example 1: Vague Prompt (Missing Role + Constraints)

**User:** "اكتب لي بوست على لينكدإن"

**RCTC Analysis:**
- Role: ❌ Missing
- Context: ⚠️ Partial (we know it's LinkedIn)  
- Task: ✅ Present (write a post)
- Constraints: ❌ Missing

**Highest Impact Missing:** Role (will change tone/expertise dramatically)

**Response:**
```
🎯 قبل أن أبدأ — سؤال مهم واحد:

لاحظت أن طلبك لا يحدد **الدور أو الهوية المهنية** التي يجب أن أتحدث منها.

**لماذا يهمني هذا الآن؟**
بوست لينكدإن لمهندس برمجيات يختلف كليًا عن بوست لمدير تسويق أو رائد أعمال.
بدون هذا، سأكتب بصوت "عام" لن يتردد صدى عند جمهورك المحدد.

**سؤالي:**
ما مجالك أو دورك المهني، ومن الجمهور الذي تريد الوصول إليه؟

*(تريد المضي بافتراض "مهني عام"؟ قل "تجاهل" وسأبدأ فورًا)*
```

---

### Example 2: Complete Prompt

**User:** "Act as a senior Python developer. I'm building a REST API for a fintech startup. Write 3 code review checklist items. Max 2 lines each. Focus on security vulnerabilities only."

**RCTC Analysis:**
- Role: ✅ Senior Python developer
- Context: ✅ Fintech REST API startup
- Task: ✅ 3 code review checklist items
- Constraints: ✅ Max 2 lines, security focus

**Response:** `🚀 Excellent RCTC prompt — proceeding directly...`

---

## File Structure

```
rctc-skill/
├── SKILL.md              ← You are here (main brain)
├── README.md             ← GitHub landing page
├── config/
│   └── config.yaml       ← User configuration
├── src/
│   ├── analyzer.md       ← Prompt analysis logic
│   ├── templates.md      ← Response templates  
│   └── recommender.md    ← Skill recommendation engine
├── examples/
│   ├── arabic-examples.md
│   ├── english-examples.md
│   └── advanced-cases.md
├── docs/
│   ├── getting-started.md
│   ├── configuration.md
│   └── learning-system.md
└── CHANGELOG.md
```

---

## Installation

See `README.md` for full setup instructions.

Quick start:
1. Clone this repo into your Claude skills folder
2. Reference `SKILL.md` in your system prompt
3. Copy `config/config.yaml` and customize
4. Start prompting — RCTC handles the rest

---

*Built with ❤️ by Sohaib's Method | Inspired by the philosophy: clarity before generation.*
