# المطلوب — حزمة IMPROVE لمشروع PtreeLink

اقرأ `SUMMARY.md` (القياسات: بوابات الجودة، حالة الخطة، البنية، آخر commits، سجل الأدلة) ثم `CONSTRAINTS.md` (ملزمة) ثم `BRAIN.md` و`docs/` (الخطة، سجل الأدلة، ADRs، الحزمة الملزمة في `docs/blueprint/`) ثم `source/`.
لا تبدأ من الصفر: Slices 0–3 منفذة ومثبتة باختبارات؛ مهمتك تحسين مقيس وتخطيط Slice التالية، لا إعادة بناء.

## أعد مجلدًا باسم `IMPROVE/` بهذه الملفات حصرًا

```
IMPROVE/
  REPORT.md                 Baseline observed · Changed files · Behavior evidence · Quality gates · Safe to say now · Do not promise yet · Rollback
  01-diagnosis.md           أهم 5 مخاطر/نقاط ضعف، كلٌّ منها يذكر الصف أو السطر الذي بُني عليه من SUMMARY.md أو WORKLOG.md
  02-ux.md                  تحسينات واجهة محددة (RTL/LTR، 360px، a11y، صفحة الملف، Explore) بصيغة قبل/بعد مع الملف المتوقع تعديله
  03-search-matching.md     مراجعة معادلة الدرجة والتفسير وسلم النتائج الصفرية: ما يتغير ولماذا، وأي اختبار يثبته
  04-security-privacy.md    ثغرات محتملة في RLS/الاستيراد/الخصوصية: سيناريو استغلال محدد + اختبار سلبي مقترح لكل واحدة
  05-backlog.json           {"items":[{"id":"IMP-01","title":"..","area":"ux|search|security|data|dx|growth","priority":1..5,"evidence":"..","acceptance":"..","files":[".."]}],"why":{..}}
  06-experiments.md         5 تجارب قياس (زمن أول مسودة، أول نتيجة مفيدة، معدل صفر نتائج قبل/بعد الاقتراح…) بفرضية وما يُقاس وعتبة النجاح
  07-next-slice-plan.md     خطة Slice 4 (Opportunities وconsented contact) بخطوات صغيرة وتبعيات واختبارات ومعايير قبول
  changed-files/            (اختياري) ملفات الكود الكاملة بمسارها في المستودع: src/ tests/ messages/ drizzle/ docs/ scripts/ public/
```

## قواعد التسليم
- `05-backlog.json`: 8–15 عنصرًا قابلًا للتنفيذ في Slice واحدة، **كل عنصر بمعيار قبول قابل للاختبار**، وهو الملف الوحيد الذي يُطبَّق آليًا (يُلحق بـ `docs/IMPROVE-BACKLOG.md` بعد تحقق). الباقي مراجعة بشرية.
- كل تغيير كود يمر ببوابات `CONSTRAINTS.md`؛ اذكر نتائج `pnpm check` في `REPORT.md` بصدق. إن لم تستطع تشغيلها، قل ذلك ولا تدّعِ.
- لا مكتبات جديدة. لا نشر. لا أسرار. لا تلمس `docs/blueprint/` (المصدر الملزم) ولا `.data/`.

## ما لا نريده
- توصيات عامة تصلح لأي مشروع («أضف اختبارات»، «حسّن الأداء»).
- أي اقتراح يخالف `CONSTRAINTS.md` أو يفترض معطى لم نرسله — إن نقصك معطى فاذكره في `01-diagnosis.md`.
- إعادة كتابة المعمارية أو استبدال ORM/Auth/i18n؛ المطلوب تحسين ما هو قائم ومثبت.
