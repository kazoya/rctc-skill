# ما تعلّمناه · المهارات المكتسبة · القدرات · الأدوات
# What we learned · Acquired skills · Capabilities · Tools

> لائحة حيّة — تُحدَّث في كل جلسة. النسخة المباشرة تعيش على المنصة (`mb brain-platform` / صفحة «العقل العام») وهذه نسخة موثّقة داخل المهارة.
> Living list — updated every session. The live copy is on the platform (`mb brain-platform` / “Platform brain” page); this is the documented copy inside the skill.

آخر تحديث / Last update: **2026-09-03** · بواسطة / by: **Cursor + Claude Opus (`xhigh`)**

## 0) دورة جوائز / Prize-hunt operating note

| قاعدة | Rule |
|-------|------|
| التركيز الأساسي عند طلب المالك: مسابقات Kaggle والجوائز، و**ARC** تحديداً | Primary focus when requested: Kaggle prizes, especially ARC |
| الموديل: `claude-opus-5[1m]` · الجهد: `xhigh` (ليس `max`) | Model Opus 5 1M · effort `xhigh` (not `max`) |
| لا رفع Kaggle بلا بوابة محلية ناجحة؛ السكور فقط من CLI | No Kaggle submit without local gate; quote scores only from CLI |
| دورات N-pairs تستمر في الخلفية ما لم يطلب المالك الإيقاف | Background N-pair loops keep running unless owner stops them |

---

## 1) دروس مستفادة / Lessons learned

| # | الدرس | Lesson | من / by |
|---|-------|--------|---------|
| 1 | تقنيات التقارير Crystal/RDLC تنتمي لعالم .NET ولا تعمل في Node.js؛ البديل المجاني الموجود على كل Windows: HTML قابل للطباعة → PDF عبر Edge/Chrome headless + Excel + Markdown | Crystal/RDLC are .NET; free alternative on every Windows: printable HTML → PDF via headless Edge/Chrome + Excel + Markdown | Fable |
| 2 | ملف `.xlsx` يُبنى يدوياً بلا مكتبات: ZIP (zlib المدمج) + SpreadsheetML بخلايا `inlineStr` + `rightToLeft="1"` للعربية | A valid `.xlsx` needs no library: ZIP (built-in zlib) + SpreadsheetML with `inlineStr` cells + `rightToLeft` for Arabic | Fable |
| 3 | خادم MCP عبر stdio = JSON-RPC مفصول بأسطر؛ `initialize` → `tools/list` → `tools/call` → `resources/*` → `prompts/*`؛ stdout للبروتوكول فقط والسجلات إلى stderr | An MCP stdio server is newline-delimited JSON-RPC; keep stdout clean, log to stderr | Fable |
| 4 | مبدأ portfolio-commander: الأداة عامة على GitHub والبيانات (المسارات، العقول، التقارير) محلية دائماً — `.gitignore` يحمي `config.json` و`data/` و`seed/initial-*.json` | portfolio-commander principle: publish the tool, never the registry | Fable |
| 5 | «العقل الهندسي» يجب أن يكون **مُولَّداً** من مصدر واحد للحقيقة (`brain.json` + `journal/`) — أي تعديل يدوي على `BRAIN.md` يضيع؛ لذلك كل القنوات (CLI/MCP/API/لوحة) تكتب في المصدر نفسه | The engineering mind must be *generated* from one source of truth; every channel writes to the same files | Fable |
| 6 | نسب كل مقترح إلى النموذج (`by: opus|sonnet|fable|haiku`) يجعل التقارير قادرة على مقارنة النماذج وتتبّع من اقترح ماذا | Model attribution on every suggestion makes reports comparable across models | Fable |
| 7 | أتمتة LinkedIn Easy Apply تنجح عبر `apply/?openSDUIApplyFlow=true` مع محاكاة شاشة 1280×900 (من الجلسات السابقة) | LinkedIn Easy Apply automation works via the SDUI flow URL + 1280×900 viewport | Claude |
| 8 | تطبيقات متجر Microsoft لإنستقرام/فيسبوك/تيك توك تعمل داخل Edge ولا يمكن التحكم بها؛ إضافة Claude in Chrome على بروفايل العمل هي القناة الكاملة الوحيدة | Microsoft-Store social apps can't be automated; the Chrome extension on the work profile is the only full channel | Claude |
| 9 | لا تُقل «تم» بلا دليل: اختبار أخضر، ملف موجود، لقطة شاشة (focused3: DONE = IMPLEMENTATION × TEST × VERIFICATION × EVIDENCE) | Never claim done without evidence | Fable |
| 10 | عند بناء أدوات لمستخدم عربي: RTL في كل شيء (اللوحة، التقرير، Excel)، أرقام لاتينية للتواريخ، وواجهة ثنائية اللغة بمفتاح تبديل | Arabic-first tooling: RTL everywhere, Latin digits for dates, bilingual toggle | Fable |

## 2) المهارات المكتسبة / Acquired skills

| المهارة | المصدر | الحالة | كيف تُستخدم |
|---------|--------|--------|-------------|
| **start-skill** (مهارة البدء) | هذه الحزمة | مثبّتة | `/start-skill` — تأسيس منصة متابعة لأي محفظة مشاريع |
| **master-brain** | هذه الحزمة | مثبّتة | تشغيل المنصة من Claude Code/Desktop: اقرأ العقل → نفّذ → سجّل → انسب |
| **rctc-method** | [kazoya/rctc-skill](https://github.com/kazoya/rctc-skill) (MIT) | مضمّنة (vendor) | Role → Context → Task → Constraints؛ سؤال واحد مركّز قبل التنفيذ |
| **portfolio-commander** | [kazoya/rctc-skill/portfolio-commander](https://github.com/kazoya/rctc-skill/tree/master/portfolio-commander) (MIT) | مضمّنة (vendor) | سجل المشاريع، سكون/أولوية/دخل، العقل الهندسي، خصوصية البيانات |
| **focused3-agentic-phases** | [kazoya/rctc-skill/focused3-agentic-phases](https://github.com/kazoya/rctc-skill/tree/master/focused3-agentic-phases) (MIT) | مضمّنة (vendor) | THINK → EXECUTE → PROVE؛ بوابات جودة؛ لا تقدّم زائف |
| **ui-ux-pro-max** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (MIT) | موصى بها | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` ثم `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` — 79 نمطاً، 192 لوحة ألوان، 74 زوج خطوط، 119 قاعدة UX |
| **n8n-skills** | [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills) | موصى بها | 14 مهارة لبناء تدفقات n8n (تحتاج n8n-mcp) — للأتمتة والجدولة |
| **anthropics/skills** (docx · xlsx · pptx · pdf · webapp-testing) | [anthropics/skills](https://github.com/anthropics/skills) | موصى بها | `/plugin marketplace add anthropics/skills` → `/plugin install document-skills@anthropic-agent-skills` |
| **awesome-agent-skills** | [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | كتالوج | 1000+ مهارة — نقطة البحث الأولى عند الحاجة لمهارة جديدة |
| **awesome-claude-skills** | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | كتالوج | قائمة منسّقة لمهارات Claude |

## 3) القدرات / Capabilities (what this setup can do)

1. مجلد مستقل لكل مشروع مع عقل هندسي من 9 أقسام (منجز، نتائج، جاري، تالٍ، تحسينات، مقترحات منسوبة، قرارات، عوائق، قيود) يقرؤه Claude قبل العمل ويحدّثه بعده.
2. سجل تقدّم Markdown لكل مدخل (تاريخ، نوع، نسبة، نموذج، مصدر) — يُحسب منه التقدّم والفترات.
3. تقارير بفترة زمنية وفرز حسب الحالة / طبيعة التقدّم / النموذج / نسبة الإنجاز، وتجميع حسب الحالة أو الأولوية — HTML (طباعة PDF)، PDF تلقائي، Excel، Markdown، JSON.
4. قناة MCP موحّدة (19 أداة + موارد + prompts) لـ Claude Code وClaude Desktop، + CLI `mb`، + REST API، + كتلة سياق للّصق في أي محادثة.
5. صندوق مهام من المالك إلى Claude، وطلبات أدوات من Claude إلى المالك (موافقة/رفض من اللوحة).
6. لوحة تحكم عربي/إنجليزي RTL/LTR بلا أي اعتمادية npm — تعمل بـ `node` وحده.
7. توثيق ذاتي: كل درس/مهارة/أداة/قدرة تُسجَّل في العقل العام وتظهر في التقارير عند الطلب (`--platform`).

## 4) الأدوات / Tools

| الأداة | النوع | الحالة | الدور |
|--------|------|--------|-------|
| Node.js ≥ 18 | runtime | مطلوب | التشغيل الوحيد المطلوب |
| Claude Code | CLI | متاح | `.mcp.json` في جذر المنصة + `CLAUDE.md` في كل مجلد |
| Claude Desktop | app | متاح | `claude_desktop_config.json` (يضيفه `scripts/install.ps1`) أو `mb context` |
| Claude Cowork | app | مستخدم | الجلسات السحابية المرتبطة بمجلد المنصة — بُنيت المنصة من هنا |
| Claude in Chrome | extension | متاح | النشر الاجتماعي من بروفايل العمل |
| Microsoft Edge / Chrome (headless) | app | متاح | `mb report --format pdf` |
| Git | CLI | مطلوب للنشر | رفع `start-skill` والمنصة إلى GitHub |
| Python 3 | runtime | موصى به | خطوط بيانات (قرار سابق للمالك) |
| n8n | service | **بانتظار الموافقة** | جدولة التقارير والتنبيهات وخطوط البيانات |
| Notion (MCP) | mcp | متاح في Cowork | مزامنة اختيارية للعقل |
| XAMPP | app | عند الحاجة فقط | عمل محلي على Laravel/MySQL |
| Cursor | editor | مستخدم | يمكن تحميل المهارات نفسها في `.cursor/skills` |

---

### كيف تُحدَّث هذه اللائحة / How to update
```
mb learn learned "درس جديد…" --by fable
mb learn skills "وصف" --name <skill> --url <repo> --status installed|recommended --install "<cmd>"
mb learn tools  "وصف" --name <tool> --status installed|available|requested
mb learn capabilities "قدرة جديدة…"
mb request-tool <tool> --reason "…"      # ثم موافقة المالك من اللوحة أو: mb approve <id>
```
