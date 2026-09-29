# مشاريعنا — حلقة التحسين المستمر

الداشبورد: `%USERPROFILE%\.cursor\portfolio\dashboard\index.html`  
التقارير: `%USERPROFILE%\.cursor\portfolio\briefs\{id}.yaml`

## بعد كل مهمة على مشروع فعّال

1. حدّث `current` و`next` و`blocker` و`updated` في `briefs/{id}.yaml`.
2. إن تغيّر الوعد التجاري: حدّث `offer` (لا تعد بما هو هيكل فقط).
3. أعد المسح:

```powershell
python "%USERPROFILE%\.cursor\portfolio\scripts\scan_projects.py"
```

4. افتح الداشبورد وتأكد أن لوحة التفصيل تعرض النص الجديد.

## للعقل الهندسي داخل المستودع

المشاريع **الفعالة** تحمل `PORTFOLIO.md` في الجذر — يقرأه الوكيل أولاً.  
لا تُنشئ `PORTFOLIO.md` لمشاريع Flutter/Dart (`pubspec.yaml`).

## السكون

لا تطوير. يكفي brief قصير: الوضع + «لا تطوير».
