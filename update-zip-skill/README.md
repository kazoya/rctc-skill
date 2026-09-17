# 📦 Update-Zip Skill — Evidence in, verified improvement out

> **لا ترسل مشروعك إلى وكيل آخر وتقل له “حسّنه”. أرسل له الحقائق والقيود والسؤال الصحيح، ثم راجع عودته قبل الدمج.**

مهارة عملية تبني حلقة تحسين مغلقة للمشاريع والمواقع والمحتوى:

```text
حصاد أدلة → حزمة ZIP منضبطة → استشارة خارجية → مراجعة آمنة → تحقق
```

## هل تعلم؟

من خلال هذه المهارة وقليل من الإعدادات تستطيع تجهيز مشروع كامل ليستفيد من ChatGPT أو Claude أو Codex كمستشار ثانٍ، دون إرسال `node_modules` أو الأسرار، ودون السماح للحزمة العائدة بأن تكتب في المشروع مباشرة.

وعند دمجها مع [Safe Forward Execution](../safe-forward-execution/) و[Focused3 Agentic Phases](../focused3-agentic-phases/) تحصل على مسار قوي:

```text
UPDATE-ZIP → SAFE FORWARD → THINK / EXECUTE / PROVE
```

## الملفات التعريفية

| Profile | مناسب لـ | النتيجة |
|---|---|---|
| `risha360-social` | بيانات المحتوى والتفاعل | اقتراحات للمراجعة وجدول لا يطبق إلا بـ`--apply` |
| `portfolio-site` | موقع محفظة منشور | فرع مراجعة + بوابات تحقق |
| `web-project` | مشروع ويب عام | تقرير فرق فقط بلا كتابة في المشروع |

## بداية سريعة

```bash
node bin/uz.js profiles
node bin/uz.js cycle --profile web-project --root C:/my-project
node bin/uz.js ingest C:/Downloads/improved.zip --profile web-project --root C:/my-project
```

لريشة 360، الاستيعاب آمن افتراضياً:

```bash
node bin/uz.js ingest C:/Downloads/IMPROVE
node bin/uz.js ingest C:/Downloads/IMPROVE --apply
```

استخدم الأمر الثاني فقط بعد مراجعة أوقات النشر المقترحة.

## ما الذي يميزها؟

- تنقل أرقاماً وملفات قابلة للتحقق، لا انطباعات عامة.
- تحمل `CONSTRAINTS.md` حتى لا يهدر المستشار الدورة بتوصيات تخالف المشروع.
- تفصل بين الاقتراح والتطبيق.
- تحفظ حزمة أو تقرير فرق يمكن مراجعته وإسناده.
- مناسبة للتعاون بين Cursor وClaude Code وChatGPT/Codex.

[تعليمات التشغيل](SKILL.md) · [تفاصيل الملفات التعريفية](references/profiles.md) · [منظومة مهارات صهيب](../docs/SKILLS-SHOWCASE.md)
