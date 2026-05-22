# English Examples — RCTC Method

## Beginner: Very Incomplete Prompt

### Example 1: Vague Content Request

**User:**
```
Help me write something about marketing
```

**Internal RCTC Analysis:**
- R (Role): ❌ Missing — who are you? expert? beginner?
- C (Context): ❌ Missing — what kind of marketing? for whom?
- T (Task): ❌ Too vague — "something" is not a deliverable
- C (Constraints): ❌ Missing

**Highest-impact gap:** Task is too vague

**RCTC Response:**
```
🎯 One quick question before I start:

I noticed your request doesn't specify **exactly what you want written**.

**Why this matters here:**
"Something about marketing" could be a blog post, LinkedIn post, email, ad script,
strategy doc, or ten other formats — each needs a completely different approach.

**My question:**
What type of content do you need? (e.g. LinkedIn post, blog article, cold email)

*(Say "skip" and I'll pick the most likely format from general context)*
```

---

### Example 2: Slightly Better Request

**User:**
```
Write me a cold email to sell my graphic design services
```

**Internal RCTC Analysis:**
- R (Role): ✅ Graphic designer
- C (Context): ⚠️ Partial — we know the field, not the target client
- T (Task): ✅ Cold email
- C (Constraints): ❌ Missing

**Highest-impact gap:** Context — who is the recipient?

**RCTC Response:**
```
🎯 One quick question before I start:

I noticed your request doesn't specify **who you're sending this to**.

**Why this matters here:**
An email to an e-commerce founder reads completely differently from one to a
marketing agency director or a startup CEO. The pain points and credibility shift.

**My question:**
Who is your ideal recipient? (industry, company size, their role)

*(Say "skip" and I'll assume "marketing manager at a small company")*
```

---

## Intermediate: Good Prompt, One Gap

### Example 3: Strong Prompt Missing Constraints

**User:**
```
Act as a senior business consultant. I'm launching a digital product for teachers in Saudi Arabia.
Write me a marketing plan.
```

**Internal RCTC Analysis:**
- R (Role): ✅ Senior business consultant
- C (Context): ✅ Digital product, teachers, Saudi Arabia
- T (Task): ✅ Marketing plan
- C (Constraints): ❌ Missing — variance is huge

**Decision:** Ask about constraints? Yes — output could be 1 page or 20.

**RCTC Response:**
```
✅ Strong prompt — three RCTC components present. One last question:

What level of detail do you need?
e.g. executive summary (1 page), or full plan with channels, budget, and timeline?

*(Say "skip" and I'll write a medium-detail plan)*
```

---

## Advanced: Complete RCTC Prompt

### Example 4: Professional Full Prompt

**User:**
```
Act as a digital marketing director with 10 years of B2B experience.
I'm a SaaS founder targeting logistics companies in the Gulf.
Our product uses AI to track shipments. Budget is limited.
Write 3 LinkedIn campaign ideas.
Each idea in 3 lines only. No heavy technical jargon.
```

**Internal RCTC Analysis:**
- R (Role): ✅ B2B digital marketing director
- C (Context): ✅ SaaS, logistics, Gulf, limited budget
- T (Task): ✅ 3 LinkedIn campaign ideas
- C (Constraints): ✅ 3 lines each, no jargon

**RCTC Response:**
```
🚀 Complete RCTC prompt — proceeding directly.

---

**Idea 1: "A Day in the Life of a Truck"**
A content series following one shipment from warehouse to customer daily.
Shows real problems your product solves without hard-selling.
Goal: trust before the ask.

**Idea 2: "The Number Nobody Talks About"**
Posts highlighting logistics losses from poor tracking — pain first, you as the natural fix.
Goal: problem awareness for decision-makers.

**Idea 3: "Proof in Numbers"**
Share one measurable client result (even small): "Cut tracking time 40% in two weeks."
Goal: social proof for buyers on the fence.
```

---

## Learning & Adaptation Examples

### After 10 Interactions with a Marketing User

**User:**
```
Write a script for a short video
```

**RCTC (adapted):**
```
📈 Based on our past sessions, you usually work on B2B content for the Saudi market.

I'll assume:
- Role: professional content marketer
- Context: local B2B audience
- Task: short video script (60–90 seconds)

One question: what's the goal? (awareness, conversion, customer retention)
```

---

## Quick Reference: When RCTC Asks vs Proceeds

| Situation | RCTC behavior |
|-----------|---------------|
| Missing Task | Almost always ask — highest priority |
| Missing Role + creative output | Ask — tone changes dramatically |
| Missing Constraints + open-ended deliverable | Ask — scope varies too much |
| Missing Role + factual/translation task | Assume and proceed |
| All four present | Proceed immediately |

See also: [Arabic examples](arabic-examples.md) · [Configuration guide](../docs/configuration.md)
