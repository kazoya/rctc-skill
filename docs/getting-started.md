# Getting Started with RCTC Method

## What You'll Have in 5 Minutes

A Claude setup that:
- Analyzes every prompt for missing components
- Asks ONE focused question when it matters
- Tells you exactly WHY it's asking
- Learns your patterns over time
- Suggests relevant skills for your workflow

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/kazoya/rctc-skill.git
cd rctc-skill
```

---

## Step 2: Load the Skill into Claude

### Option A: Claude.ai Project (Recommended)

1. Go to [claude.ai](https://claude.ai)
2. Create a new **Project**
3. Open **Project Instructions**
4. Paste the full contents of `SKILL.md`
5. Save

Every conversation in that project will use RCTC automatically.

### Option B: System Prompt in Any Claude Interface

Paste this at the start of your system prompt:

```
You are equipped with the RCTC prompt engineering skill.

[PASTE FULL CONTENTS OF SKILL.md HERE]
```

### Option C: Cursor (Recommended for this repo)

This repo ships a ready-made Cursor rule:

```
.cursor/rules/rctc.mdc   ← loaded automatically in every chat in this project
```

**If Cursor asks you something**, it is usually one of these three things:

| What Cursor asks | What to do |
|------------------|------------|
| **Model / API Key** | Pick **Claude Sonnet** or **Opus** in Settings → Models. API key only if you use your own Anthropic key. |
| **Rules / System Prompt** | Settings → **Rules for AI** → paste `SKILL.md` into **User Rules** (applies to all projects). |
| **Context files** | Copy `.cursor/rules/rctc.mdc` into any project's `.cursor/rules/` folder. |

**Short answer if Cursor prompts you:**

> I want Claude Sonnet as the default model, and a custom system prompt for all conversations.

Then paste `SKILL.md` into User Rules, or clone this repo so `rctc.mdc` applies automatically.

### Option D: Claude Code / Other IDEs

Add a `CLAUDE.md` or copy `SKILL.md` into your IDE's custom-instructions path.

```bash
cp SKILL.md CLAUDE.md
```

---

## Step 3: Configure Your Preferences

```bash
cp config/config.yaml config/my-config.yaml
```

Open `my-config.yaml` and adjust:

```yaml
# For Arabic users:
question_language: "arabic"

# If you want faster responses (less explanation):
token_optimization: true
show_reasoning: false

# If you find suggestions annoying:
skill_recommendations: false
```

See [docs/configuration.md](configuration.md) for all options.

---

## Step 4: Test It

Try these prompts to see RCTC in action:

**Test 1 — Missing Task:**
```
Help me with marketing
```
*Expected: RCTC asks what specific deliverable you need*

**Test 2 — Missing Role:**
```
Write a cold email for my consulting services
```
*Expected: RCTC asks who the target recipient is*

**Test 3 — Complete RCTC:**
```
Act as a senior copywriter. I run a freelance UX studio targeting early-stage startups. Write 3 subject lines for a cold email campaign. Max 8 words each. No emojis.
```
*Expected: RCTC responds directly with high-quality output*

---

## Step 5: Let It Learn

After 5+ interactions, RCTC starts adapting to your patterns.

To see what it's learned, ask:
```
What patterns have you noticed in how I prompt?
```

To reset the learning profile:
```
Reset my RCTC user profile
```

---

## What RCTC Is NOT

- ❌ Not a rigid form you must fill out
- ❌ Not something that blocks you until all 4 boxes are checked
- ❌ Not another layer of friction

It's a **thinking partner** that gets out of the way when it doesn't need to be there, and steps in with one precise question when it does.

---

## Troubleshooting

**RCTC is asking too many questions:**
→ Set `max_clarifying_questions: 1` in config (should already be default)
→ Enable `token_optimization: true`

**RCTC isn't asking anything even for vague prompts:**
→ Check that the full `SKILL.md` was loaded in your system prompt
→ Ensure `skip_obvious_components` isn't set too aggressively

**Responses are in the wrong language:**
→ Set `question_language: "arabic"` or `"english"` explicitly

---

## Next: Using RCTC in IDEs

See [docs/ide-integration.md](ide-integration.md) for using RCTC inside:
- Cursor
- VS Code with Claude extension
- JetBrains + Claude
- GitHub Copilot alternative setup
