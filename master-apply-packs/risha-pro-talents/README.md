# حزمة تطبيق المهارات المفتوحة على مشروع `E:\master`

**المستوى النشط:** ريشة برو — المستوى التسويقي الخاص بالمواهب (`risha360.com`).

هذه الحزمة تجيب على طلب واحد: *«طبّق على مشروع `E:\master` كل ما يلزم من مهارات الغيتهاب المفتوح، ونحن الآن في مستوى ريشة برو التسويقي الخاص بالمواهب»* — بصيغة قابلة للتنفيذ، لا بصيغة نصيحة.

---

## 1) حدود صادقة قبل أي شيء

| الحقيقة | الأثر |
|---|---|
| `E:\master` قرص محلي على جهاز المالك | الجلسة السحابية التي أنتجت هذه الحزمة **لا تصل إليه**، ولم تكتب فيه ولا حرفاً |
| المهارات المفتوحة تعيش في هذا المستودع (`kazoya/rctc-skill`) وفي كتالوج خارجي | التطبيق = نسخ منضبط + تسجيل قدرات + بوابات، لا «تنصيب سحري» |
| مستويات المشروع الأربعة غير موثقة داخل المستودع | [`LEVELS.md`](LEVELS.md) يثبّت المستوى النشط ويترك الثلاثة الباقية لملء المالك بدل اختراعها |
| محتوى `risha360.com` الفعلي غير مقروء من هنا | كل رقم أو ادعاء تسويقي في المخرجات يجب أن يأتي من المالك أو من الموقع نفسه — لا اختراع |

بمعنى آخر: ما تقرأه هنا **جاهز للتشغيل على جهازك**، وليس تقريراً عن تشغيل حدث بالفعل.

---

## 2) ما الذي تحتويه الحزمة

| الملف | الدور |
|---|---|
| [`LEVELS.md`](LEVELS.md) | سجل المستويات الأربعة، المستوى النشط، وقاعدة عدم التسريب بين المستويات |
| [`APPLY-PLAN.md`](APPLY-PLAN.md) | الخطة الأساسية: أي مهارة مفتوحة تُطبَّق، لماذا، بأي أمر، وبأي بوابة ودليل قبول |
| [`CHECKLIST.md`](CHECKLIST.md) | بوابات القبول — `DONE` لا يُعلن إلا بدليل |
| [`capabilities/risha-pro-talents-level.json`](capabilities/risha-pro-talents-level.json) | بطاقة قدرة بصيغة المستودع، جاهزة للنسخ إلى `E:\master\files\capabilities\` |
| [`prompts/`](prompts/) | خمسة تكاليف RCTC جاهزة للنسخ إلى Cursor / Claude Code محلياً |
| [`scripts/apply-risha-pro-level.mjs`](scripts/apply-risha-pro-level.mjs) | التطبيق الفعلي (Node) — **جفاف افتراضي (Dry Run)**، لا يكتب إلا مع `--apply`، ولا يحذف أبداً |
| [`scripts/apply-risha-pro-level.ps1`](scripts/apply-risha-pro-level.ps1) · [`.cmd`](scripts/apply-risha-pro-level.cmd) | غلافا ويندوز يمرران الوسائط إلى نفس المنطق — لا نسخة ثانية من القواعد |
| [`scripts/validate-pack.js`](scripts/validate-pack.js) | تحقق آلي من سلامة الحزمة نفسها (يعمل في CI ومحلياً) |

---

## 3) التشغيل في ثلاث خطوات

المتطلب الوحيد: **Node.js 18+** (نفس ما يتطلبه Master Brain أصلاً).

```powershell
# 1) اسحب المهارات المفتوحة بجانب المشروع (مرة واحدة)
git clone https://github.com/kazoya/rctc-skill.git E:\rctc-skill

# 2) معاينة بلا كتابة — اقرأ كل سطر قبل الموافقة
node E:\rctc-skill\master-apply-packs\risha-pro-talents\scripts\apply-risha-pro-level.mjs `
  --master E:\master --skills E:\rctc-skill

# 3) نفّذ فعلياً بعد اقتناعك بالمعاينة
node E:\rctc-skill\master-apply-packs\risha-pro-talents\scripts\apply-risha-pro-level.mjs `
  --master E:\master --skills E:\rctc-skill --apply
```

ومن يفضّل PowerShell أو موجّه الأوامر، الغلافان يمرران الوسائط إلى نفس المنطق المختبَر:

```powershell
.\apply-risha-pro-level.ps1 -MasterPath E:\master -SkillsPath E:\rctc-skill -Apply
```

```bat
apply-risha-pro-level.cmd E:\master E:\rctc-skill --apply
```

**ضمانات السكربت — مُختبَرة لا موعودة:**

| الضمان | كيف تتحقق منه بنفسك |
|---|---|
| المعاينة لا تكتب شيئاً | شغّل بلا `--apply` ثم `dir` — لا ملف جديد |
| لا حذف إطلاقاً | لا يحتوي الكود على `rmSync` / `unlinkSync` — والمُحقِّق يفشل إن أُضيفت |
| لا استبدال صامت | التشغيل الثاني يطبع `SKIP` لكل ملف قائم، ولا يكتب |
| كل ما كُتب مُوثَّق | `E:\master\levels\risha-pro-talents\APPLY-MANIFEST.json` |
| فشل صريح لا صامت | مسار master خاطئ ⇦ رسالة عربية وخروج بالرمز 1 |

للتحقق من سلامة الحزمة نفسها في أي وقت:

```bash
node master-apply-packs/risha-pro-talents/scripts/validate-pack.js
```

ثم افتح `E:\master` في Cursor أو Claude Code، وابدأ من
[`prompts/00-bootstrap-master-level.md`](prompts/00-bootstrap-master-level.md).

---

## 4) قانون التركيب

`Reuse → Compose → Extend → Generate New`

لا تُولَّد مهارة جديدة لهذا المستوى قبل أن تفشل إعادة الاستخدام والتركيب. هذه القاعدة مأخوذة من
`registry/skills.json` و`digital-presence-factory/SKILL.md` في هذا المستودع، وهي ملزِمة هنا.
