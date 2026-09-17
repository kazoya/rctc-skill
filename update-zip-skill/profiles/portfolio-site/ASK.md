# المطلوب — حزمة IMPROVE لموقع المحفظة

اقرأ `SUMMARY.md` (الحقائق المقيسة) ثم `CONSTRAINTS.md` (ملزمة) ثم `BRAIN.md` (العقل الهندسي) ثم `docs/` ثم `source/`.
لا تبدأ من الصفر: الموقع منشور ومختبر؛ مهمتك تحسين مقيس لا إعادة بناء.

## أعد مجلدًا باسم `IMPROVE/` بهذه الملفات حصرًا

```
IMPROVE/
  REPORT.md                 التقرير بالحقول الثمانية (انظر CONSTRAINTS.md)
  01-diagnosis.md           ما يضعف الموقع فعلًا مستندًا إلى أرقام SUMMARY.md لا إلى الانطباع
  02-ux-findings.md         ملاحظات تجربة المستخدم على 390/768/1440 مع اللقطة المرجعية لكل ملاحظة
  03-seo-findings.md        ما ينقص البيانات الوصفية/البنية/JSON-LD لكل مسار، مع الدليل
  04-content-suggestions.md اقتراحات صياغة أو ترتيب — اقتراحات فقط، لا تُطبَّق على data/
  05-experiments.md         تجارب قياس مقترحة بفرضية ومقياس لكل واحدة
  changed-files/            ملفات الكود الكاملة بمسارها في المستودع (app/ components/ lib/ public/ tests/ scripts/)
```

## قواعد التسليم
- كل تغيير كود يمر ببوابات `CONSTRAINTS.md`؛ اذكر نتائج `npm run verify` وLighthouse في `REPORT.md` بصدق. إن لم تستطع تشغيلها، قل ذلك ولا تدّعِ.
- لا تلمس `data/` ولا `OUT/`؛ إن رأيت خطأ فيهما اكتبه في `04-content-suggestions.md` بدليله.
- لا مكتبات جديدة. لا نشر. لا أسرار.
- اختم `REPORT.md` بـ `Safe to say now` و`Do not promise yet` و`Rollback`.
