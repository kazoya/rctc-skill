---
name: start-skill
description: >
  مهارة البدء (Start Skill) — turns a scattered set of chats/sessions and side-projects into ONE tracked portfolio:
  a folder per project, a "conscious engineering mind" (done / findings / current / next / improvements /
  model-attributed suggestions), period & progress reports, and a Node.js platform reachable from
  Claude Code and Claude Desktop (MCP + CLI). Use when the user says: مهارة البدء, ابدأ منصة متابعة,
  "set up a tracking platform for my projects", "one slot per project", "engineering brain",
  "portfolio dashboard", "track all my sessions", or hands you several session ids and asks to
  organise them. Pairs with portfolio-commander (kazoya/rctc-skill) and master-brain.
---

# مهارة البدء — Start Skill

> **الفكرة في سطر:** عندما يكون لدى المالك عدة محادثات/جلسات، كل واحدة عن مشروع مختلف، حوّلها إلى منصة متابعة واحدة:
> مجلد لكل مشروع + عقل هندسي واعٍ + تقارير + قناة مباشرة مع Claude Code وClaude Desktop — ثم وثّق ما تعلمته وما اكتسبته من مهارات وأدوات.
>
> **One line:** when the owner has several chats/sessions, each about a different project, turn them into one tracked portfolio:
> a folder per project + a conscious engineering mind + reports + a direct channel to Claude Code / Claude Desktop — then document what you learned.

**Invoke:** `/start-skill` · **Reference implementation:** `master-brain/` (zero-dependency Node.js) · **Sibling skills:** `portfolio-commander`, `rctc-method`, `focused3-agentic-phases`, `master-brain`

## Authorship and provenance

**Original concept and workflow author:** **[Suhaib Asrawi (@kazoya)](https://github.com/kazoya), 2026.**

Start Skill's originating contribution is the operating model that converts scattered sessions into a governed portfolio with persistent engineering brains, attributable model suggestions, and evidence-based completion. AI systems may assist with research, code, tests, and documentation; retain transparent attribution for the human author, third-party work, and later contributors.

Use the preferred citation in [../CITATION.cff](../CITATION.cff). For the authorship record and responsible marketing language, read [../docs/START-SKILL-AUTHORSHIP.md](../docs/START-SKILL-AUTHORSHIP.md).

### High-fidelity mode

For complex or high-fidelity projects, extend the ordinary project brain with:

- explicit requirements and acceptance criteria;
- an architecture decision record and interface/data boundaries;
- traceability from requirement → implementation → test → verification → evidence;
- security, privacy, accessibility, performance, and domain-review gates as applicable;
- attributable approvals, risks, exceptions, and release decisions.

Do not market “high fidelity” as autonomous perfection. Treat it as a verifiable delivery standard: each important claim must link to observable evidence, and regulated or safety-sensitive domains still require qualified human review.

---

## Effort & model defaults (Claude Code)

When this skill (or a sibling prize-hunt loop) drives Claude Code:

| Setting | Value | Why |
|---------|-------|-----|
| Model | `claude-opus-5[1m]` | Strongest available Opus with 1M context |
| Effort | `xhigh` | Above high, **not** `max` — deep reasoning without max-cost burn |
| Flag | `claude --model claude-opus-5[1m] --effort xhigh -p "..."` | Pin both explicitly |

Do not silently drop to Sonnet for prize / ARC / Kaggle work unless the owner asks.

---

## 1. البرومبت المرجعي (معمَّم) / The reference prompt (generalised)

هذا هو الطلب الأصلي الذي وُلدت منه المهارة، بعد تعميمه بلا ذكر مشاريع بعينها. استخدمه كما هو أو عدّله:

```text
لديّ عدة جلسات/محادثات (<الجلسة-1>، <الجلسة-2>، …) كل واحدة منها تتحدث عن مشروع مستقل،
وجلسة إضافية لمواضيع فرعية متفرقة ليس بينها ترابط.

ما أريده بالضبط: بناء منصة متابعة فيها خانة لكل مشروع، بحيث نضع مجلداً لكل مشروع داخل
<مجلد-المشاريع>\<اسم-المشروع>، مع إمكانية إضافة مشاريع جديدة لاحقاً، وتقارير احترافية
(أياً كانت تقنيتها) تفرز حسب الفترات الزمنية أو حسب طبيعة التقدّم في المشروع.

وأن يكون في المنصة "العقل الهندسي الواعي": ما تم إنجازه، ما توصلنا إليه، ما نعمل عليه
حالياً، ما نتطلع إلى تحسينه، ومقترحات التحسين منسوبةً إلى النموذج الذي قدّمها
(Claude أو Opus أو Fable أو غيرها).

المنصة Node.js وتتعامل مع Claude Code وClaude Desktop بطريقة سهلة (قنوات أو طرفية —
اختر الأنسب). ابحث عن المهارات المتاحة على GitHub (مثل kazoya/rctc-skill وui-ux-pro-max
وما يخص الأتمتة) وطبّق المفيد منها. من حقك أن تطلب تنزيل أي أداة ترفع مستوى التنفيذ
(n8n، Notion، VM، حتى XAMPP وملحقاته) لغرض إدامة العمل — بعد موافقتي.

وثّق هذا الطلب كمهارة اسمها "مهارة البدء" لرفعها بجانب portfolio-commander، وبعد تجهيز
الملفات البورتابل اضغطها لأرفعها إلى GitHub، وطبّقها فعلياً، ولا تنسَ لائحة بما تعلمته
والمهارات المكتسبة وقدراتك وأدواتك داخل المهارة وعلى المنصة حتى يكون العمل واضحاً
وقوياً وقابلاً للتتبع.
```

```text
I have several sessions/chats (<session-1>, <session-2>, …), each about a separate project,
plus one session of unrelated side topics.

What I want exactly: a tracking platform with one slot per project — a folder per project under
<projectsRoot>\<project-name>, the ability to add projects later, and professional reports (any
technology) filtered by time period or by the nature of progress.

The platform must hold a "conscious engineering mind": what was done, what we found, what we are
working on now, what we aim to improve, and improvement suggestions attributed to the model that
made them (Claude, Opus, Fable, …).

It must be Node.js and talk to Claude Code and Claude Desktop simply (channels or terminal — you
choose). Research the skills available on GitHub (kazoya/rctc-skill, ui-ux-pro-max, automation
skills…) and apply what helps. You may request any tool that raises execution quality (n8n,
Notion, a VM, even XAMPP) to sustain the work — after my approval.

Document this request as a skill called "start-skill" next to portfolio-commander, zip the portable
files so I can push them to GitHub, actually apply them, and include a list of what you learned,
the skills you acquired, your capabilities and tools — in the skill and on the platform — so the
work is clear, strong and traceable.
```

---

## 2. بروتوكول التنفيذ / Execution protocol

| # | الخطوة | Step | المخرج |
|---|--------|------|--------|
| 0 | **اقرأ الذاكرة أولاً** — كل ما تعرفه عن جلسات المالك ومشاريعه | Read memory / prior context first | خريطة الجلسة ← المشروع |
| 1 | **RCTC**: سؤال واحد مركّز فقط عمّا يغيّر النتيجة (مكان التثبيت، صيغ التقارير، اللغة، تعبئة العقل من الجلسات السابقة) | Ask ≤ 4 decisive questions in one go | قرارات معتمدة |
| 2 | **ابحث في GitHub** عن المهارات المطلوبة (§4) وسجّلها في كتالوج | Research skills | `docs/SKILLS-CATALOG.md` |
| 3 | **ثبّت المنصة المرجعية** `master-brain` (أو ابنِ ما يكافئها): مجلد لكل مشروع، عقل هندسي، تقارير، MCP + CLI | Install/build the platform | `mb init` |
| 4 | **عبّئ العقل الهندسي** لكل مشروع مما تعرفه: المنجز، النتائج، الجاري، التالي، التحسينات، المقترحات (منسوبة) | Seed each brain | `seed/*.json` → `brain.json` |
| 5 | **اربط Claude**: `.mcp.json` لـ Claude Code، `claude_desktop_config.json` لـ Claude Desktop، `CLAUDE.md` في كل مجلد | Wire Claude Code / Desktop | `mb doctor` ✔ |
| 6 | **وثّق ما تعلمته**: دروس، مهارات مكتسبة، أدوات، قدرات — في `LEARNED.md` وفي العقل العام للمنصة | Record learnings | `mb learn …` |
| 7 | **اختبر بدليل**: CLI، تقارير بكل الصيغ، API، MCP (THINK → EXECUTE → PROVE) | Prove with evidence | `npm test` |
| 8 | **الحزمة البورتابل**: zip بلا بيانات خاصة (المسارات والعقول تبقى محلية) + zip كامل كنسخة احتياطية | Package | `*-for-github.zip` |
| 9 | **التسليم**: أين ثُبِّت، كيف يُشغَّل، ماذا ينقص، ماذا يقرر المالك | Hand-off | ملخص عربي واضح |

**القاعدة الذهبية:** لا يُقال "تم" إلا مع دليل (ملف موجود، أمر نجح، لقطة، اختبار أخضر). `DONE = IMPLEMENTATION × TEST × VERIFICATION × EVIDENCE` (من focused3-agentic-phases).

---

## 3. الهيكل المعياري / Standard layout

```
<platformRoot>\                 مثلاً E:\master
  bin\mb.js  bin\server.js  bin\mcp.js      CLI · لوحة HTTP · خادم MCP
  src\  public\  skills\  docs\  seed\  scripts\
  config.json  .mcp.json  CLAUDE.md
  data\registry.json  data\platform-brain.json  data\requests.json  data\reports\

<projectsRoot>\<project-id>\    مثلاً D:\projects\my-project
  project.json   الاسم (عربي/إنجليزي)، الحالة، الأولوية، التقدّم، الوسوم، الجلسات المرتبطة
  brain.json     العقل الهندسي: done · findings · current · next · improvements · suggestions(by) · decisions · blockers · constraints
  journal\       مدخل Markdown لكل تقدّم (date/type/progress/model)
  files\         ملفات العمل
  BRAIN.md       عرض مُولَّد للعقل (لا يُعدَّل يدوياً)
  CLAUDE.md      تعليمات Claude Code عند فتح المجلد
```

**الحالات:** planning · active · paused · blocked · done · dormant (سكون — لا تطوير بلا إذن، من portfolio-commander)
**أنواع المدخلات (طبيعة التقدّم):** progress · milestone · decision · blocker · suggestion · note · report
**النماذج للنسب:** claude · opus · sonnet · haiku · fable · human · other

---

## 4. المهارات التي تُبحث وتُطبَّق / Skills to research & apply

| المهارة | المصدر | لماذا |
|---------|--------|-------|
| rctc-method | github.com/kazoya/rctc-skill | تحليل Role/Context/Task/Constraints وسؤال واحد قبل التنفيذ |
| portfolio-commander | github.com/kazoya/rctc-skill/tree/master/portfolio-commander | سجل المشاريع، سكون/أولوية/دخل، العقل الهندسي، لوحة، الخصوصية (الأداة عامة والبيانات محلية) |
| focused3-agentic-phases | github.com/kazoya/rctc-skill/tree/master/focused3-agentic-phases | THINK → EXECUTE → PROVE، لا تقدّم زائف، دليل لكل إنجاز |
| ui-ux-pro-max | github.com/nextlevelbuilder/ui-ux-pro-max-skill | نظام تصميم احترافي للوحة والتقارير (79 نمطاً، 192 لوحة ألوان) |
| n8n-skills | github.com/czlonkowski/n8n-skills | أتمتة الجداول والتنبيهات وخطوط البيانات (تحتاج n8n-mcp) |
| anthropics/skills | github.com/anthropics/skills | docx / xlsx / pptx / pdf / webapp-testing |
| awesome-agent-skills | github.com/VoltAgent/awesome-agent-skills | كتالوج 1000+ مهارة للبحث عند الحاجة |

سجّل كل مهارة تعتمدها في العقل العام: `mb learn skills "<وصف>" --name <اسم> --url <رابط> --status installed|recommended`.

---

## 5. حقوق Claude وحدوده / Claude's rights & limits

- ✅ **يحق لك طلب أي أداة** ترفع مستوى التنفيذ (n8n، Notion، VM، XAMPP، خادم MCP…) — عبر `request_tool` / `mb request-tool` — وتنتظر موافقة المالك على اللوحة. **لا تثبيت صامت.**
- ✅ انسب كل مقترح تحسين إلى النموذج الذي قدّمه (`--by opus|sonnet|fable|haiku`).
- ✅ اقرأ `BRAIN.md` قبل العمل، وسجّل بعده (`mb log`), وحدّث نسبة التقدّم بصدق.
- ⛔ لا تتجاوز CAPTCHA/OTP/2FA؛ توقف واطلب المالك. ⛔ لا تختلق أرقاماً أو تواريخ. ⛔ لا ترفع بيانات المالك (المسارات، العقول، التقارير) إلى GitHub — الأداة فقط.
- ⛔ لا تطوّر مشروعاً في حالة `dormant` بلا إذن صريح.

---

## 6. ما تعلّمناه وما اكتسبناه / What we learned & acquired

اقرأ [LEARNED.md](LEARNED.md) — لائحة حيّة بالدروس والمهارات المكتسبة والقدرات والأدوات. تُحدَّث في كل جلسة، وتُعرض أيضاً على المنصة (صفحة "العقل العام").

## 7. قالب جاهز / Ready template

[PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md) — انسخه، املأ الأقواس، أرسله. و[CHECKLIST.md](CHECKLIST.md) — قائمة تحقق التسليم.
