# RCTC Prompt Analyzer

## Purpose

This module defines the internal logic Claude uses when analyzing any incoming user message through the RCTC lens.

---

## Detection Matrix

### Role Detection

**Positive signals (Role IS present):**
- "Act as a..."
- "You are a..."
- "As a [profession/role]..."
- Implied domain expertise ("I'm a developer and...")
- Persona defined in system prompt

**Negative signals (Role is ABSENT):**
- No persona or profession mentioned
- Generic "help me with..." without subject context
- First-time request with no prior context

**Impact assessment:**
- HIGH impact when: task requires domain-specific tone, technical depth, or audience calibration
- LOW impact when: task is purely factual, translational, or format-based

---

### Context Detection

**Positive signals (Context IS present):**
- Background situation described ("I'm launching...", "We're a startup...")
- Target audience mentioned
- Prior state described ("After 3 failed attempts...")
- Business/personal environment specified

**Negative signals (Context is ABSENT):**
- No situation background
- No audience or recipient described
- No "why" behind the task

**Impact assessment:**
- HIGH impact when: tone, relevance, or approach depends on the situation
- LOW impact when: task is generic enough that any context applies

---

### Task Detection

**Positive signals (Task IS defined):**
- Clear verb + deliverable ("Write 5 hooks", "Refactor this function", "List 3 reasons")
- Specific format mentioned
- Countable output defined

**Negative signals (Task is ABSENT):**
- Vague verbs ("help me", "do something about", "work on")
- No deliverable type
- Topic mentioned without action

**Impact assessment:**
- ALWAYS high — an undefined task produces undefined output

---

### Constraints Detection

**Positive signals (Constraints ARE present):**
- Word/character limits ("Max 20 words")
- Format rules ("Use bullet points")
- Tone specification ("Professional, not casual")
- Exclusion rules ("Don't use buzzwords")
- Technical limits ("No external packages")

**Negative signals (Constraints are ABSENT):**
- No length guidance
- No tone or style specified
- No "avoid" instructions

**Impact assessment:**
- HIGH impact when: output could wildly vary in length, tone, or format
- LOW impact when: task is well-defined and constraints are obvious from context

---

## Priority Order

When multiple components are missing, ask about them in this order:

```
1. Task       — Can't do anything without knowing what to do
2. Role       — Shapes expertise, tone, and perspective entirely  
3. Context    — Determines relevance and approach
4. Constraints — Usually inferable; only ask if variability is dangerous
```

---

## Decision Tree

```
START: User sends message
          │
          ▼
    Parse for RCTC components
          │
    ┌─────┴─────┐
    │           │
  Task       Task
  missing?   present?
    │           │
    ▼           ▼
  Ask about  Check Role
  Task first     │
              ┌──┴──┐
           Role    Role
          missing? present?
              │       │
              ▼       ▼
          Would it  Check Context
          matter?       │
           │         ┌──┴──┐
          Yes       Context  Context
           │        missing? present?
           ▼            │       │
         Ask            ▼       ▼
         ONE        Would it   Check
         Q          matter?   Constraints
                       │
                      Yes
                       │
                       ▼
                    Ask ONE Q
                    (state what
                    you'll assume
                    about others)
```

---

## Language Detection

Detect user's language from their message:
- Arabic → respond with Arabic template
- English → respond with English template  
- Mixed → use the dominant language
- Config override → use `question_language` setting

---

## Assumption Bank

When a component is missing but impact is LOW, use these defaults:

```yaml
default_assumptions:
  role: "a knowledgeable professional in the relevant field"
  context: "a general business or professional setting"
  constraints: 
    length: "appropriate for the content type"
    tone: "professional and clear"
    format: "most readable format for the task"
```

Always state the assumption when using it:
> *"I'm assuming [assumption] — let me know if that's off."*

---

## Edge Cases

### Case 1: User says "just answer, don't ask"
→ Proceed with best assumptions. State them briefly at the top.

### Case 2: User is clearly an expert (their language shows it)
→ Skip role question. Their phrasing IS the role signal.

### Case 3: Repeat interaction on same topic
→ Pull from user profile. Don't re-ask what was answered before.

### Case 4: Creative or open-ended tasks
→ Constraints are often intentionally absent. Don't ask about them unless length could be problematic.

### Case 5: Short urgent messages ("fix this", "translate this")
→ Skip all RCTC checks. These are transactional. Just do it.
