# 🧠 RCTC Method — Sohaib's Prompt Engineering Skill

<div align="center">

![RCTC Banner](https://img.shields.io/badge/RCTC-Sohaib's%20Method-6C3483?style=for-the-badge&logo=anthropic&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen?style=for-the-badge)
![Language](https://img.shields.io/badge/language-AR%20%7C%20EN-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**Transform vague AI prompts into professional, precision-grade outputs.**  
*A Claude skill that thinks before it answers.*

[⚡ Quick Start](#-quick-start) · [📖 How It Works](#-how-it-works) · [🛠 Configuration](#-configuration) · [💡 Examples](#-examples) · [🤝 Contribute](#-contribute)

---

</div>

## 🌟 Why RCTC Exists

Most people talk to AI like this:
> *"Write me a marketing email."*

And get... generic soup.

RCTC teaches Claude to think like a senior consultant — it **analyzes your request** before answering, identifies what's missing, and asks ONE focused question when it matters.

The result? Outputs that feel like they were written by someone who actually understood your situation.

---

## 🔬 The Framework

RCTC stands for **Role → Context → Task → Constraints**:

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR PROMPT                             │
│                                                             │
│  R  Role        → Who should Claude BE?                    │
│  C  Context     → What's the SITUATION?                    │
│  T  Task        → What exactly should it DO?               │
│  C  Constraints → What are the LIMITS?                     │
└─────────────────────────────────────────────────────────────┘
```

### Without RCTC:
> "Write a LinkedIn post about productivity."  
> *→ Generic, forgettable, could be from anyone.*

### With RCTC:
> "Act as a startup CTO. I just shipped a feature after 3 months of delays.  
> Write 1 LinkedIn post. Max 150 words. No corporate speak. Vulnerable tone."  
> *→ Specific, resonant, unmistakably YOU.*

---

## ⚡ Quick Start

### 1. Clone the skill

```bash
git clone https://github.com/kazoya/rctc-skill.git
```

### 2. Add to your Claude system prompt

Open your Claude project or system prompt and add:

```
You are equipped with the RCTC skill. 
Load and follow all instructions from SKILL.md.
```

Or paste the contents of `SKILL.md` directly into your system prompt.

**Using Cursor?** This repo includes `.cursor/rules/rctc.mdc` — it loads automatically in every chat when you open this project. See [Getting Started → Cursor](docs/getting-started.md#option-c-cursor-recommended-for-this-repo).

### 3. Configure (optional)

Copy and customize the config file:

```bash
cp config/config.yaml config/my-config.yaml
```

Edit to your preferences — see [Configuration Guide](docs/configuration.md).

### 4. Start prompting

Just talk to Claude normally. RCTC runs silently in the background, analyzing every prompt and asking exactly what it needs to — nothing more.

---

## 🧩 How It Works

### The Analysis Engine

Every time you send a message, RCTC runs a silent 4-point check:

```
Your Message
     │
     ▼
┌─────────────────────┐
│  RCTC Analyzer      │
│                     │
│  ✓ Role present?    │
│  ✓ Context clear?   │
│  ✓ Task defined?    │
│  ✓ Constraints set? │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
  Missing?     Complete?
    │             │
    ▼             ▼
Ask ONE       Respond
Question      Directly
(with reason) 🚀
```

### The Smart Question Rule

RCTC does NOT mechanically demand all 4 components every time.

It uses **engineering judgment**:
- If a missing component would **significantly change** the output → asks about it
- If it's **inferable from context** → states the assumption and proceeds
- **One question maximum** per turn, always

### Why It Tells You What It's Skipping

Every time RCTC decides NOT to ask about something, it tells you:
> *"I'm assuming [X] — tell me if that's wrong."*

No silent assumptions. Full transparency.

---

## 🧠 Learning System

RCTC remembers how you work.

Over time it learns:
- Which components you consistently provide (and stops asking about the others)
- Your domain and communication style
- Which suggestions you found useful

This data is stored locally in `user_profile.json` — nothing leaves your environment.

After ~5 interactions, RCTC starts adapting to YOU.

---

## 🗺️ Horizontal Skill Recommendations

When your needs go beyond prompt structuring, RCTC notices and suggests:

```
You: "Help me analyze my sales data with Claude"

RCTC: 💡 Suggestion — this use case pairs well with a 
      data-analyst skill that specializes in structured 
      queries. Here's why it would help you specifically: [...]
      
      Want me to recommend it?
```

It's like having a senior developer who knows the whole ecosystem.

---

## 🛠 Configuration

Edit `config/config.yaml` to customize behavior:

```yaml
rctc_config:
  # 🚀 Performance
  token_optimization: true        # Shorter, faster responses
  skip_obvious_components: true   # Don't ask what context implies
  
  # 🗣️ Communication
  question_language: "auto"       # auto | arabic | english
  max_clarifying_questions: 1     # Hard limit per turn
  
  # 🧠 Learning
  learning_enabled: true
  adaptation_threshold: 5         # Interactions before adapting
  
  # 💡 Recommendations  
  skill_recommendations: true
  recommendation_frequency: "low" # low | medium | high
  
  # ⚡ Disable features to save tokens
  disabled_features: []
  # ["learning", "recommendations", "reasoning_explanation"]
```

Full documentation: [docs/configuration.md](docs/configuration.md)

---

## 💡 Examples

### Arabic Prompt — Missing Role

**You:** `اكتب لي بروبوزال لمشروع تطوير تطبيق`

**RCTC:**
```
🎯 قبل أن أبدأ — سؤال مهم واحد:

لاحظت أن طلبك لا يحدد **الدور** الذي يجب أن أكتب منه.

لماذا يهمني هذا الآن؟
بروبوزال من مطور فري لانسر يختلف جوهريًا عن واحد من 
شركة توريد أو استشاري تقني.

سؤالي: ما طبيعة علاقتك بالعميل، ومن أنت في هذا المشروع؟

*(قل "تجاهل" للمضي بافتراض "مستشار مستقل")*
```

---

### English Prompt — All Components Present

**You:** `Act as a senior Django developer. I'm building a multi-tenant SaaS app for HR departments. Refactor this auth middleware for security. Max 50 lines. No third-party packages.`

**RCTC:**
```
🚀 Perfect RCTC prompt — all 4 components present.
Proceeding directly with high-quality output...
```

---

### Advanced: RCTC Improvement Suggestion

**You:** *(after 10 interactions)* `write a cold email`

**RCTC:**
```
📈 Pattern noticed: You usually work in B2B SaaS sales.
I'll apply that context automatically.

Also — I noticed you rarely set constraints. 
Your last 3 emails were flagged as "too long" by recipients.
Consider adding: "Max 5 sentences. One CTA." next time.

Proceeding with: Senior B2B sales rep | SaaS | Cold outreach...
```

---

## 📁 Repository Structure

```
rctc-skill/
├── 📋 SKILL.md                 ← Core skill logic (load this in Claude)
├── 📖 README.md                ← You're here
├── 📝 CHANGELOG.md             ← Version history
├── 🎯 .cursor/rules/rctc.mdc ← Cursor rule (auto-loaded in this project)
├── ⚙️  config/
│   └── config.yaml             ← User configuration
├── 🧠 src/
│   ├── analyzer.md             ← Prompt analysis engine
│   ├── templates.md            ← Response templates
│   └── recommender.md         ← Skill recommendation logic
├── 💡 examples/
│   ├── arabic-examples.md      ← Arabic use cases
│   ├── english-examples.md     ← English use cases
│   └── advanced-cases.md       ← Edge cases & power user examples
└── 📚 docs/
    ├── getting-started.md      ← Step-by-step setup
    ├── configuration.md        ← Full config reference
    └── learning-system.md      ← How adaptation works
```

---

## 🗺️ Roadmap

- [x] Core RCTC analysis engine
- [x] Smart question system (one at a time)
- [x] Learning & adaptation system
- [x] Skill recommendation engine
- [x] Arabic + English support
- [x] Token optimization mode
- [x] Cursor rule (`.cursor/rules/rctc.mdc`)
- [ ] VSCode extension (broader IDE integration)
- [ ] Web UI for prompt builder
- [ ] Skill marketplace integration
- [ ] Team/shared profiles
- [ ] Analytics dashboard

---

## 🤝 Contribute

This skill is designed to be extended.

**Adding new response templates:**  
Edit `src/templates.md` — follow the existing format.

**Adding new skill recommendations:**  
Edit `src/recommender.md` — add your trigger condition + skill mapping.

**Improving the analyzer:**  
Edit `src/analyzer.md` — the analysis logic is modular and documented.

PRs welcome. Keep the philosophy: **clarity before generation**.

---

## 📜 License

MIT — use freely, credit appreciated.

---

<div align="center">

**Built with ❤️ on Sohaib's Method**  
*Inspired by the principle: the quality of your output is bounded by the clarity of your input.*

⭐ Star this repo if RCTC improved your AI workflow

</div>
