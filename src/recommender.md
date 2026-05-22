# RCTC Skill Recommendation Engine

## Philosophy

RCTC's job isn't just prompt engineering — it's **connecting people to the right tools**.
When a user's need goes beyond what RCTC alone can serve, recommend intelligently.

**Rule:** Recommend once, clearly, with a specific reason tied to THEIR use case.
Never push. Never repeat. Track what was shown.

---

## Trigger → Recommendation Mapping

```yaml
triggers:
  
  # Code-related needs
  writing_code:
    signals: ["code", "function", "class", "API", "debug", "refactor", "Python", "JavaScript"]
    recommend: "claude-code-skill"
    pitch: "RCTC + code-aware constraints = zero-ambiguity development briefs"
    
  code_review:
    signals: ["review my code", "PR", "pull request", "check this function"]
    recommend: "code-review-skill"
    pitch: "Pair RCTC task framing with code-specific checklists"

  # Content creation
  writing_content:
    signals: ["blog post", "article", "newsletter", "content", "post"]
    recommend: "content-calendar-skill"  
    pitch: "RCTC maps directly to content briefs — this skill automates that"
    
  social_media:
    signals: ["LinkedIn", "Twitter", "Instagram", "social media", "caption"]
    recommend: "social-copy-skill"
    pitch: "Structured social hooks using RCTC Role + Constraints"

  # Business / Professional
  sales_outreach:
    signals: ["cold email", "outreach", "sales", "pitch", "proposal"]
    recommend: "sales-brief-skill"
    pitch: "Turn RCTC Context into client-ready sales intelligence"
    
  team_management:
    signals: ["delegate", "team", "brief my team", "assign", "project brief"]
    recommend: "delegation-skill"
    pitch: "RCTC Task + Constraints = unambiguous delegation briefs"
    
  data_analysis:
    signals: ["analyze data", "spreadsheet", "CSV", "dashboard", "insights", "metrics"]
    recommend: "data-analyst-skill"
    pitch: "RCTC-structured queries produce precision data analysis"

  # Learning / Research
  research:
    signals: ["research", "summarize", "compare", "explain deeply", "literature"]
    recommend: "research-skill"
    pitch: "RCTC Context + Task framing produces research briefs, not search queries"
    
  learning_new_topic:
    signals: ["learn", "teach me", "explain", "how does", "beginner", "understand"]
    recommend: "tutor-skill"
    pitch: "RCTC Role (teacher level) + Constraints (your background) = perfect explanations"
```

---

## Recommendation Response Template

### Arabic
```
💡 اقتراح — بناءً على ما تعمل عليه:

لاحظت أنك تعمل على **[DOMAIN]**.
هناك مهارة تُكمل RCTC بشكل ممتاز في هذا السياق: **[SKILL_NAME]**

**لماذا ستفيدك تحديدًا:**
[PERSONALIZED_PITCH]

هل تريد أن أشرح لك كيفية تنزيلها أو دمجها مع RCTC؟
```

### English
```
💡 Suggestion — based on what you're working on:

I noticed you're in **[DOMAIN]** territory.
There's a skill that pairs exceptionally well with RCTC here: **[SKILL_NAME]**

**Why it's relevant to you specifically:**
[PERSONALIZED_PITCH]

Want me to explain how to get it or combine it with RCTC?
```

---

## Recommendation Rules

1. **Never recommend the same skill twice** — check `user_profile.json: skill_recommendations_shown`
2. **One recommendation per conversation** — don't stack suggestions
3. **Only recommend when it's genuinely relevant** — not as filler
4. **Frequency control** — respect `recommendation_frequency` in config
5. **If user says no** — drop it immediately, no rephrasing

---

## Impact Tracking

After a recommendation, track:

```json
{
  "recommendation_id": "data-analyst-skill",
  "shown_at": "interaction_12",
  "user_response": "interested | ignored | rejected",
  "followed_up": true
}
```

Use this to improve future recommendations.
