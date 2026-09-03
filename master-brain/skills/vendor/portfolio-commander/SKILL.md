---
name: portfolio-commander
description: >
  Portfolio Commander — scan all Cursor workspace projects, maintain projects-registry.xml
  (active/dormant, last modified, engineering mind), and execute user requests only on active
  projects. Use when the user asks about project portfolio, dashboard, which project to work on,
  dormant/sleep mode, XML registry, time spent across projects, or sends a "Portfolio Commander"
  task with a project path. Always read the registry before developing across multiple repos.
---

# Portfolio Commander — مدير محفظة مشاريع Cursor

## مصدر الحقيقة (XML)

| ملف | الغرض |
|-----|--------|
| `%USERPROFILE%\.cursor\portfolio\projects-registry.xml` | كل المشاريع: فعال/سكون، آخر تعديل، عقل هندسي |
| `%USERPROFILE%\.cursor\portfolio\requests\inbox.xml` | طلبات المستخدم للوكيل |
| `%USERPROFILE%\.cursor\portfolio\config.yaml` | مسارات المسح والعتبات |

**حدّث السجل:**

```powershell
python "%USERPROFILE%\.cursor\portfolio\scripts\scan_projects.py"
```

**الداشبورد:**

```
%USERPROFILE%\.cursor\portfolio\dashboard\index.html
```

افتحه في المتصفح بعد كل مسح.

## قواعد التطوير (إلزامية)

1. **اقرأ `projects-registry.xml` قبل أي تطوير** عبر محادثات متعددة المشاريع.
2. **`lifecycle="dormant"` (سكون)** → لا تطوير، لا refactor، لا features — فقط إجابة معلوماتية أو اقتراح تفعيل.
3. **`active="false"`** → نفس معاملة السكون ما لم يطلب المستخدم التفعيل صراحة.
4. **Flutter/Dart** (`pubspec.yaml`) → لا تُنشئ/تُحدّث "عقل هندسي"؛ نفّذ المهمة التقنية فقط.
5. **عقل هندسي** = أول موجود من: `SKILL.md`, `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*.mdc`, `README.md` (انظر `engineeringMind` في XML).

## عند استلام طلب من الداشبورد

النمط المتوقع:

```
Portfolio Commander — طلب مشروع
المسار: ...
المهمة: ...
```

1. حدّد المشروع في XML بالمسار أو `id`.
2. إن كان `dormant` → أبلغ المستخدم ولا تبدأ التطوير إلا بعد موافقة.
3. افتح/انتقل للمشروع (`move_agent_to_root` أو اطلب من المستخدم فتح المجلد).
4. إن وُجد `engineeringMind` → اقرأه قبل التنفيذ (ما عدا Flutter).
5. نفّذ المهمة.
6. حدّث `inbox.xml` إن طُلب تتبع الحالة.

## تعديل يدوي للسجل

في XML، على عنصر `<project>`:

```xml
<project id="..." path="C:\rctc-skill" active="true" lifecycle="active">
```

- `lifecycle="dormant"` — سكون (لا تطوير من الوكيل)
- `active="false"` — خارج الأولوية

بعد التعديل اليدوي، شغّل `scan_projects.py` — يحافظ على `lifecycle` إذا كان `dormant` مسبقاً.

## الربط مع RCTC

عند طلبات غامضة عبر Portfolio Commander، طبّق **RCTC** (Role, Context, Task, Constraints) قبل التنفيذ — خاصة عندما يختار المستخدم مشروعاً من الداشبورد بدون تفاصيل.

## المقاييس

- `gitCommits30d` — من `git log --since=30.days`
- `activityScore` — تقدير للترتيب في الداشبورد (ليس وقت Cursor الفعلي؛ لاحقاً يمكن ربط telemetry)

## لا تفعل

- لا تسحب مشاريع من الإنترنت دون إذن.
- لا تطوّر مشاريع `dormant` تلقائياً.
- لا تضع skills داخل `~/.cursor/skills-cursor/` (محجوز لـ Cursor).
