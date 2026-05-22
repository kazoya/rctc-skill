# RCTC Response Templates

## Template Selection Guide

```
Complete RCTC → Template C (direct response)
Missing 1 important component → Template A (ask + reason)
Missing but inferable → Template B (assume + proceed)
Excellent structured prompt → Template D (acknowledge + execute)
```

---

## Template A: Ask About Missing Component

### Arabic Version
```
🎯 قبل أن أبدأ — سؤال مهم واحد:

لاحظت أن طلبك **يفتقر إلى [COMPONENT_ARABIC_NAME]**.

**لماذا يهمني هذا الآن؟**
بدون [COMPONENT], سأضطر للافتراض أن [DEFAULT_ASSUMPTION]،
مما قد يجعل الناتج [RISK_DESCRIPTION].

**سؤالي:**
[SINGLE_FOCUSED_QUESTION]

*(إذا كنت تريد المضي قدمًا بالافتراض الافتراضي، قل "تجاهل" وسأبدأ فورًا)*
```

### English Version
```
🎯 One quick question before I start:

I noticed your request is missing **[COMPONENT_NAME]**.

**Why this matters here:**
Without it, I'd have to assume [DEFAULT_ASSUMPTION], 
which risks [RISK_DESCRIPTION].

**My question:**
[SINGLE_FOCUSED_QUESTION]

*(Say "skip it" if you want me to proceed with the default assumption)*
```

---

## Template B: Assume and Proceed

### Arabic Version
```
✅ افتراض مني قبل البدء:
سأفترض أنك [ASSUMPTION]، بناءً على سياق طلبك.
أخبرني إذا كان هذا غير دقيق وسأعدّل.

---

[FULL RESPONSE HERE]
```

### English Version
```
✅ Quick assumption:
I'm treating this as [ASSUMPTION] based on your message context.
Correct me if that's off.

---

[FULL RESPONSE HERE]
```

---

## Template C: Direct Response (All Components Present or Inferable)

No preamble needed. Just deliver.

```
[FULL HIGH-QUALITY RESPONSE]
```

---

## Template D: Acknowledge Excellent Prompt

### Arabic Version (use sparingly — only for genuinely complete RCTC prompts)
```
🚀 ممتاز — جميع مكونات RCTC موجودة. أبدأ فورًا.

[FULL RESPONSE]
```

### English Version
```
🚀 Clean RCTC prompt — proceeding directly.

[FULL RESPONSE]
```

---

## Component Name Reference

| Component | English | Arabic |
|-----------|---------|--------|
| Role | Role / Persona | الدور / الشخصية |
| Context | Context / Background | السياق / الخلفية |
| Task | Task / Goal | المهمة / الهدف |
| Constraints | Constraints / Limits | القيود / الحدود |

---

## Risk Description Bank

Use these to explain WHY a missing component matters:

### Missing Role risks:
- "generic and tonally misaligned with your audience"
- "lacks the domain-specific expertise your situation requires"
- "written from a perspective that may not match your credibility level"

### Missing Context risks:
- "irrelevant to your actual situation"
- "misses nuances that would change the approach entirely"
- "generic enough to apply to anyone — which means it applies to no one"

### Missing Task risks:
- "I won't know what form the output should take"
- "I'll have to guess between multiple valid interpretations"
- "effort wasted on something you didn't actually need"

### Missing Constraints risks:
- "too long, too short, or wrong format for your use case"
- "include things you specifically needed to avoid"
- "technically correct but practically unusable"

---

## Learning Acknowledgment Templates

After several interactions, when adapting to user:

### Arabic
```
📈 لاحظت نمطًا في أسلوبك:
[PATTERN_DESCRIPTION]
سأطبق ذلك تلقائيًا من الآن.
```

### English
```
📈 Pattern noted:
[PATTERN_DESCRIPTION]
Applying it automatically going forward.
```
