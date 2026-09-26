# خطة التطبيق — المهارات المفتوحة على `E:\master` · مستوى ريشة برو للمواهب

> القراءة الصحيحة: هذا ليس «جرد مهارات»، بل **ترتيب تشغيل**. كل سطر فيه: المهارة، ما تنتجه في هذا المستوى، مدخل التشغيل، البوابة، ودليل القبول.

## 0) قاعدة الحسم قبل التطبيق

لا تُطبَّق مهارة لأنها موجودة. تُطبَّق إذا أجابت **نعم** على الثلاثة:

1. هل تنتج مخرجاً يخص تسويق المواهب في `risha360.com` تحديداً؟
2. هل مخرجها قابل للتحقق بدليل (بناء، اختبار، رابط، ملف)؟
3. هل تبقى داخل صلاحية `E:\master\levels\risha-pro-talents\` أو مستودع الموقع؟

لذلك: `apca-smarthelp`، `dev-agora-skill`، `factory-sales-concept`، `tracks/bug-bounty` — **خارج هذا المستوى**،
وتبقى متاحة لمستويات أخرى. إقصاؤها هنا قرار، لا سهو.

---

## الموجة 0 — التأسيس والحوكمة (لا محتوى بعد)

| # | المهارة المفتوحة | ما تنتجه في L2 | مدخل التشغيل | البوابة | دليل القبول |
|---:|---|---|---|---|---|
| 0.1 | [`rctc-method`](../../SKILL.md) | تحويل كل طلب تسويقي مبهم إلى تكليف Role/Context/Task/Constraints | `SKILL.md` في موجّه النظام | لا | كل تكليف في `prompts/` مكتوب بالبنية الرباعية |
| 0.2 | [`start-skill`](../../start-skill/) | ذاكرة المستوى: أين نحن، ما القرارات، ما المحظور | `start-skill/CHECKLIST.md` + `PROMPT-TEMPLATE.md` | لا | `E:\master\levels\risha-pro-talents\BRAIN.md` منشأ ومحدَّث |
| 0.3 | [`portfolio-commander`](../../portfolio-commander/) | تسجيل L2 كمشروع بأولوية وحالة نشاط وعلم إيراد | `portfolio-commander/projects-registry.example.xml` | لا | سجل فيه `risha-pro-talents` بأولوية معلنة |
| 0.4 | [`master-brain`](../../master-brain/) | لوحة + سجل قرارات + تقارير قابلة للاستخراج | `node master-brain/bin/mb.js init` ثم `new` ثم `scan` | لا | `mb list` يُظهر المشروع، و`mb report` يُخرج تقريراً |
| 0.5 | [`safe-forward-execution`](../../safe-forward-execution/) | منع التوقف عند الخطة + تثبيت حدود الصلاحية | يُحمّل مع أي مهارة تنفيذية | **نعم** — النشر والدفع والحسابات خارج التفويض التلقائي | عقد تنفيذ مكتوب: Outcome / Scope / Evidence / Stop |
| 0.6 | [`focused3-agentic-phases`](../../focused3-agentic-phases/) | بوابات THINK → EXECUTE → PROVE | `focused3-agentic-phases/QUALITY_GATES.md` | **نعم** | لا إعلان `DONE` بلا `IMPLEMENTATION × TEST × VERIFICATION × EVIDENCE` |

**مخرج الموجة 0:** مستوى مُسجَّل، له ذاكرة وبوابات، وبطاقة قدرة في `E:\master\files\capabilities\`.
بدون هذه الموجة، كل ما بعدها يتحول إلى شغل متناثر بلا أثر.

---

## الموجة 1 — الواجهة التسويقية للمواهب

| # | المهارة المفتوحة | ما تنتجه في L2 | مدخل التشغيل | البوابة | دليل القبول |
|---:|---|---|---|---|---|
| 1.1 | [`web-marketing-and-personal-builder`](../../web_marketing_and_personal-builder-super-skill/) | صفحات اكتساب المواهب: الوعد، كيف تعمل، من يناسب، الأسئلة، CTA، RTL عربي | `prompt-intakes.md` → `EXECUTION_PROTOCOL.md` | **نعم عند النشر** | build أخضر + لقطات + رابط معاينة |
| 1.2 | [`digital-presence-factory`](../../digital-presence-factory/) | ضبط المسار كوصفة بدل ارتجال: discover→inspect→reason→design→build→verify→package→publish | `recipes/company-marketing-site.json` (أقرب وصفة) | **نعم عند publish** | سجل مراحل مكتمل في `digital-presence-factory/out/` |
| 1.3 | `ui-ux-pro-max` (خارجي، مُوصى به) | نظام تصميم متسق: لوحة، خطوط، قواعد UX لصفحات المواهب | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` | لا | قرار تصميم موثق (لوحة + زوج خطوط) لا ذوق ارتجالي |
| 1.4 | `document-skills` (anthropics، خارجي) | ملف تعريف المواهب PDF/DOCX من نفس مصدر البيانات | `/plugin install document-skills@anthropic-agent-skills` | لا | ملف مولَّد من بيانات الموقع، بلا أرقام مخترعة |
| 1.5 | [`htpaap`](../../htpaap/) | معيار هندسي للكود المكتوب في الموقع (ليس زينة) | `htpaap/references/sources.json` | لا | مراجعة ذاتية مكتوبة قبل الدمج |

**قاعدة الصدق في هذه الموجة:** لا عدد مواهب، ولا شهادة، ولا شعار عميل، ولا نسبة نجاح — إلا من مصدر يملكه المالك.
المحتوى بلا مصدر يُكتب كـ «قيد التأكيد» ويُترك ظاهراً في مراجعة المالك، لا يُملأ بنص مُقنِع مخترع.

---

## الموجة 2 — التشغيل والقنوات

| # | المهارة المفتوحة | ما تنتجه في L2 | مدخل التشغيل | البوابة | دليل القبول |
|---:|---|---|---|---|---|
| 2.1 | [`whatsapp-agent-orchestrator`](../../whatsapp-agent-orchestrator-super-skill/) | شريحة آمنة أولى للمواهب: إشعار → عرض تفاصيل → **مسودة** رد | `PROJECT-RECIPES.md § Risha360` | **نعم** — أي التزام تجاري يحتاج تأكيداً صريحاً | سجل محادثة تجريبي يثبت أن الإرسال الفعلي محجوب |
| 2.2 | [`update-zip-skill`](../../update-zip-skill/) | دورة تحسين مغلقة للمحتوى الاجتماعي بحقائق مقيسة | `node update-zip-skill/bin/uz.js cycle --profile risha360-social` | **نعم** — `ingest` لا يكتب بلا `--apply` | حزمة `IMPROVE` مراجَعة في `review/` قبل أي تطبيق |
| 2.3 | [`local-ssml-voice-cost-optimizer`](../../local-ssml-voice-cost-optimizer/) | صوت عربي مشكَّل للفيديو بأقل استدعاء مدفوع | `local-ssml-voice-cost-optimizer/SKILL.md` | لا | مقارنة تكلفة قبل/بعد + عينة صوت |
| 2.4 | [`focus-council`](../../focus-council/) | حسم قرار تسويقي متنازع عليه (الرسالة، الجمهور، التسعير) بخبراء ثم Jury | `focus-council/SKILL.md` | لا | محضر قرار بأسباب، لا رأي واحد |

**تنبيه ملف `risha360-social`:** موثَّق أصلاً لحساب ريشة 360 **القانوني**. قبل استخدامه لخطاب المواهب،
يؤكد المالك أي قيود الهوية تنتقل وأيها يتغير — انظر [`LEVELS.md § 3`](LEVELS.md).

---

## الموجة 3 — القياس والتحسين الدوري

| # | المهارة المفتوحة | ما تنتجه في L2 | مدخل التشغيل | البوابة | دليل القبول |
|---:|---|---|---|---|---|
| 3.1 | [`continuous-improving`](../../continuous-improving/) | دورة تحسين مقيسة بدل «تحسينات» انطباعية | `continuous-improving/SKILL.md` | **نعم** عند قرار بشري أو عائق مادي | قبل/بعد برقم واحد متفق عليه لكل دورة |
| 3.2 | `webapp-testing` (خارجي) | اختبار Playwright لمسار التسجيل والتحويل | `/plugin install example-skills@anthropic-agent-skills` | لا | تقرير اختبار أخضر مُرفق بالتسليم |
| 3.3 | [`master-brain`](../../master-brain/) | تقرير أسبوعي من السجل، لا من الذاكرة | `node master-brain/bin/mb.js report --project risha-pro-talents` | لا | تقرير مؤرَّخ محفوظ في المستوى |
| 3.4 | [`wehm`](../../wehm/) | ضبط أخلاقي وأمني لأي تعامل مع بيانات المواهب | `wehm/references/sources.json` | **نعم** — لا اختبار أمني بلا تفويض | قائمة تحقق خصوصية موقعة قبل جمع أي بيانات شخصية |
| 3.5 | `n8n-skills` (خارجي، عند اعتماد n8n) | جدولة التقارير والتنبيهات | يحتاج `n8n-mcp` + موافقة المالك | **نعم** | موافقة مكتوبة قبل ربط أي حساب |

---

## ترتيب التنفيذ الموصى به

```text
الموجة 0 (يوم واحد)  →  بوابة مالك: هل التسجيل والذاكرة صحيحان؟
الموجة 1 (الأثقل)    →  بوابة مالك: هل الرسالة والتصميم يمثلان ريشة برو؟
الموجة 2             →  بوابة مالك: هل نسمح بأي إرسال فعلي؟ (الافتراضي: لا)
الموجة 3 (مستمرة)    →  دورة كل أسبوعين برقم واحد
```

## ما لا تفعله هذه الخطة

- لا تنشر شيئاً، ولا تربط حساباً، ولا ترسل رسالة، ولا تشتري نطاقاً.
- لا تعدّل مستوى آخر من المستويات الأربعة.
- لا تولّد مهارة جديدة قبل أن تفشل إعادة الاستخدام والتركيب (`Reuse → Compose → Extend → Generate New`).
- لا تعلن «تم» على ملفات Markdown وحدها.
