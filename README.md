# 🧠 RCTC Method — Sohaib's Prompt Engineering Skill

<div align="center">

![RCTC Banner](https://img.shields.io/badge/RCTC-Sohaib's%20Method-6C3483?style=for-the-badge&logo=anthropic&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen?style=for-the-badge)
![Language](https://img.shields.io/badge/language-AR%20%7C%20EN-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**Transform vague AI prompts into professional, precision-grade outputs.**  
*A portable AI skill suite that clarifies, executes, and verifies.*

[⚡ Quick Start](#-quick-start) · [📖 How It Works](#-how-it-works) · [🛠 Configuration](#-configuration) · [💡 Examples](#-examples) · [🔔 Pro](#-pro-version-coming) · [🤝 Contribute](#-contribute) · [🧰 Skill Suite](docs/SKILLS-SHOWCASE.md)

---

</div>

## ✍️ Original authorship

**Start Skill / مهارة البدء is an original workflow conceived and authored by [Suhaib Asrawi (@kazoya)](https://github.com/kazoya).**

It is designed to govern complex, high-fidelity AI and software projects through persistent project memory, attributable decisions, controlled agent collaboration, and proof-based completion. AI tools may assist with implementation and documentation; the originating concept and workflow authorship remain explicitly attributed to Suhaib Asrawi.

- [Authorship and provenance](AUTHORS.md)
- [High-fidelity project positioning](docs/START-SKILL-AUTHORSHIP.md)
- [Machine-readable citation](CITATION.cff)

---

## 🚀 Sohaib's Skill Suite

> **هل تعلم أنك من خلال [Web Marketing & Personal Builder](web_marketing_and_personal-builder-super-skill/) وقليل من الإعدادات تستطيع إنشاء موقع بمستوى حرفي قريب من muqasa-jo.com، مع أقل قدر ممكن من التدخل—خصوصاً عندما تستخدم معها [Safe Forward Execution](safe-forward-execution/)؟**

| المسار | المهارة المناسبة |
|---|---|
| بناء موقع شركة، مصنع، منتج أو علامة شخصية | [Web Marketing & Personal Builder](web_marketing_and_personal-builder-super-skill/) |
| تحويل موقع مصنع إلى تصور مبيعات وأتمتة | [Factory Sales Concept](factory-sales-concept/) |
| مواصلة التنفيذ بعد الخطة بأمان | [Safe Forward Execution](safe-forward-execution/) |
| تجهيز المشروع لاستشارة وكيل خارجي واستيعاب ZIP عائد بأمان | [Update-Zip Skill](update-zip-skill/) |
| THINK → EXECUTE → PROVE | [Focused3 Agentic Phases](focused3-agentic-phases/) |
| إدارة عدة مشاريع وعقول هندسية | [Start Skill](start-skill/) + [Portfolio Commander](portfolio-commander/) + [Master Brain](master-brain/) |
| تحسين دوري مبني على النتائج | [Continuous Improving](continuous-improving/) |
| مساعدة PDF دلالية (JavaHelp-style) + مهارات Cursor للمشروع | [APCA SmartHelp](apca-smarthelp/) + [AI Portability Advisor](ai-portability-advisor/) |
| عقل ماستر وربط الأدوار بين المشاريع | [Master Brain](master-brain/) ↔ مشروع `C:\\master` |
| مجتمع مبرمجين للتعلم والنقاش (StackOverflow-like + AI) | [Dev Agora Skill](dev-agora-skill/) |

**[افتح العرض الكامل للمهارات، حالات الاستخدام، ووصفات الدمج →](docs/SKILLS-SHOWCASE.md)**

---

## 🌟 Why RCTC Exists

Most people talk to AI like this:
> *"Write me a marketing email."*

And get... generic soup.

RCTC teaches an AI assistant to work from a senior consultant-grade brief — it **analyzes your request** before answering, identifies what's missing, and asks ONE focused question when it matters.

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

When a request needs clarification or prompt design, RCTC runs a compact 4-point check:

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

RCTC can adapt when the host environment provides an approved, writable profile.

Over time it learns:
- Which components you consistently provide (and stops asking about the others)
- Your domain and communication style
- Which suggestions you found useful

The repository includes an optional profile schema, but no persistent memory is assumed. Enable it only in an environment that explicitly supports local state and after choosing what may be stored.

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
├── 📋 SKILL.md                 ← Core RCTC skill logic (load this in Claude)
├── 📖 README.md                ← You're here
├── 📝 CHANGELOG.md             ← Version history
├── 🎯 .cursor/rules/rctc.mdc   ← Cursor rule (auto-loaded in this project)
├── 🚀 start-skill/             ← Sessions → tracked portfolio
├── 🧠 master-brain/            ← CLI + MCP + reports platform
├── 🧭 portfolio-commander/     ← Multi-project registry & focus rules
├── 🔁 continuous-improving/    ← Measured improvement loops
├── 🔬 focused3-agentic-phases/ ← THINK → EXECUTE → PROVE
├── 🛡️ safe-forward-execution/ ← Safe, reversible execution after planning
├── 📦 update-zip-skill/        ← Harvest → pack → consult → ingest (profiles)
├── 🌐 web_marketing_and_personal-builder-super-skill/
│                               ← Company, factory & personal marketing sites
├── 🏭 factory-sales-concept/   ← Factory digital sales platforms
├── ⚙️ config/                  ← User configuration
├── 🧠 src/                     ← Analyzer, templates & recommender
├── 💡 examples/
└── 📚 docs/
```

### Sibling skills (this repo)

- 🌐 [Web Marketing & Personal Builder](web_marketing_and_personal-builder-super-skill/) — turn a URL, company brief, or personal bio into an Arabic RTL or bilingual marketing platform, then build, verify, and prepare it for GitHub/Vercel delivery.
- 🛡️ [Safe Forward Execution](safe-forward-execution/) — continue beyond planning through authorized, safe, reversible, and verified execution; co-designed and forward-tested with GPT-5.6 Sol Medium.
- 📦 [Update-Zip Skill](update-zip-skill/) — مهارة التطوير والضغط: closed improvement loop for any project — harvest measured facts, pack them with binding CONSTRAINTS and a literal ASK into one zip, consult an external agent (ChatGPT/Claude/Codex), then ingest the returned zip under gates. Profiles: `risha360-social` (default), `portfolio-site` (review branch + `npm run verify`), `web-project` (any repo with `package.json`; review-only `DIFF-REPORT.md`, nothing written to the project). Documented run: World Cup Fintech Festival, 2026-09-17.
- 🏭 [Factory Sales Concept](factory-sales-concept/) — specialize the journey for industrial sales, automation opportunities, CRM, and human-approved commercial decisions.
- 🚀 [Start Skill](start-skill/) — turn scattered sessions into one tracked portfolio with persistent project memory.
- 🧭 [Portfolio Commander](portfolio-commander/) — scan, register, prioritize, and govern multi-project work.
- 🧠 [Master Brain](master-brain/) — zero-dependency Node.js control platform with dashboard, reports, MCP tools, and CLI.
- 🔬 [Focused3 Agentic Phases](focused3-agentic-phases/) — THINK → EXECUTE → PROVE with evidence gates.
- 🔁 [Continuous Improving](continuous-improving/) — measured improvement loops for authorized engineering and research tracks.

**[Explore the complete skill showcase and combination recipes →](docs/SKILLS-SHOWCASE.md)**

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

## 🔔 Pro Version Coming

**RCTC Pro** (planned): team profiles, shared learning, analytics, advanced prompt builder.

**Want early access?** Leave a note in [GitHub Discussions](https://github.com/kazoya/rctc-skill/discussions/new?category=ideas&title=Pro%20early%20access&body=I%27m%20interested%20in%20RCTC%20Pro.%20My%20use%20case%3A%20) — one click, no form.

Every question or suggestion in [Discussions](https://github.com/kazoya/rctc-skill/discussions) also shapes **v1.1** and the free skill.

📋 **Launch copy ready to paste:** [docs/launch-kit.md](docs/launch-kit.md)

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


---

## ☕ Support & portfolio

If these skills save you hours — buy Suhaib a coffee or hire delivery:

- [Buy Me a Coffee](https://buymeacoffee.com/Asrawi612)
- PayPal: `innervision2016@gmail.com`
- Portfolio: [suhib-ai-delivery-portfolio](https://suhib-ai-delivery-portfolio.vercel.app/en)

**Master loop:** open `C:\\master` + this repo + [Continuous Improving](continuous-improving/) + [Update-Zip](update-zip-skill/) so roles, content, and low-cost cycles stay linked without losing dormant platform URLs.

## 📜 License

MIT — use freely, credit appreciated.

---

<div align="center">

**Built with ❤️ on Sohaib's Method**  
*Inspired by the principle: the quality of your output is bounded by the clarity of your input.*

⭐ Star this repo if RCTC improved your AI workflow

**Made with love for the people of Gaza.**  
**صنع بمحبة أهل غزة وصمودهم**  
كنت أنا الآن في أوج نشاطي ^_^ مكيف بدون زن الوايف :]

</div>
