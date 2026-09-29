---
name: portfolio-commander
description: >
  Portfolio Commander — scan all Cursor workspace projects, maintain projects-registry.xml
  (active/dormant, last modified, engineering mind), and execute user requests only on active
  projects. Use when the user asks about project portfolio, dashboard, Mashareena, مشاريعنا,
  which project to work on, dormant/sleep mode, XML registry, time spent across projects, or
  sends a "Portfolio Commander" task with a project path. Always read the registry before
  developing across multiple repos.
---

# Portfolio Commander — مشاريعنا

## مصدر الحقيقة

| ملف | الغرض |
|-----|--------|
| `%USERPROFILE%\.cursor\portfolio\projects-registry.xml` | كل المشاريع: فعال/سكون، أولوية، عقل هندسي |
| `%USERPROFILE%\.cursor\portfolio\briefs\{id}.yaml` | تقرير: منجز · وضع · خطوة · عرض · حاجز |
| `%USERPROFILE%\.cursor\portfolio\requests\inbox.xml` | طلبات المستخدم للوكيل |
| `%USERPROFILE%\.cursor\portfolio\config.yaml` | مسارات المسح والعتبات |

**حدّث السجل:**

```powershell
python "%USERPROFILE%\.cursor\portfolio\scripts\scan_projects.py"
```

**الداشبورد (مشاريعنا):**

```
%USERPROFILE%\.cursor\portfolio\dashboard\index.html
```

أو: `.\scripts\serve-dashboard.ps1` (منفذ 8765).

حلقة التحسين: `docs\MASHAREENA-AR.md`

## استراتيجية التركيز (P1–P6)

اقرأ `%USERPROFILE%\.cursor\portfolio\docs\STRATEGY-FOCUS-AR.md` و`project-overrides.yaml`.

| priority | المعنى |
|----------|--------|
| 1 | APCA SmartHelp CX — واتساب، حجز، handoff (Belt, SmartHelp, AIPRO) |
| 2 | صوت/دور/موقع APCA — باقة على نفس المنتج |
| 3 | Bug Bounty — وقت محدود فقط |
| 4 | Muqasa — صيانة حرجة فقط |
| 5 | ERP وما شابه — لا بدون عقد ودفعة |
| 6 | ARC — بحث جانبي ضيق |

إذا طلب المستخدم عملاً على مشروع `priority` > 2 أو `lifecycle=dormant` خارج P3/P4 صيانة، ذكّره بالاستراتيجية واطلب تأكيداً.

## قواعد التطوير (إلزامية)

1. **اقرأ `projects-registry.xml` قبل أي تطوير** عبر محادثات متعددة المشاريع.
2. **`lifecycle="dormant"` (سكون)** → لا تطوير، لا refactor، لا features — فقط إجابة معلوماتية أو اقتراح تفعيل.
3. **`active="false"`** → نفس معاملة السكون ما لم يطلب المستخدم التفعيل صراحة.
4. **Flutter/Dart** (`pubspec.yaml`) → لا تُنشئ/تُحدّث "عقل هندسي"؛ نفّذ المهمة التقنية فقط.
5. **عقل هندسي** = أول موجود من: `PORTFOLIO.md`, `SKILL.md`, `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*.mdc`, `README.md`.
6. **بعد كل مهمة على مشروع فعّال:** حدّث `briefs/{id}.yaml` (`current`, `next`, `updated`) ثم شغّل `scan_projects.py`.

## عند استلام طلب من الداشبورد

```
Portfolio Commander — طلب مشروع
المسار: ...
المهمة: ...
```

1. حدّد المشروع في XML بالمسار أو `id`.
2. إن كان `dormant` → أبلغ المستخدم ولا تبدأ التطوير إلا بعد موافقة.
3. افتح/انتقل للمشروع (`move_agent_to_root` أو اطلب من المستخدم فتح المجلد).
4. اقرأ `PORTFOLIO.md` ثم `briefs/{id}.yaml` إن وُجد (ليس لـ Flutter).
5. نفّذ المهمة.
6. حدّث الـ brief ثم أعد المسح. حدّث `inbox.xml` إن طُلب تتبع الحالة.

## تعديل يدوي للسجل

`lifecycle="dormant"` — سكون (لا تطوير من الوكيل).  
`active="false"` — خارج الأولوية.

بعد التعديل اليدوي، شغّل `scan_projects.py` — يحافظ على `lifecycle` إذا كان `dormant` مسبقاً.

## الربط مع RCTC

عند طلبات غامضة عبر Portfolio Commander، طبّق **RCTC** قبل التنفيذ.

## المقاييس

- `gitCommits30d` — من `git log --since=30.days`
- `activityScore` — تقدير للترتيب (ليس وقت Cursor الفعلي)
- `briefUpdated` — تاريخ تقرير العقل الهندسي

## لا تفعل

- لا تسحب مشاريع من الإنترنت دون إذن.
- لا تطوّر مشاريع `dormant` تلقائياً.
- لا تضع skills داخل `~/.cursor/skills-cursor/` (محجوز لـ Cursor).
- لا ترفع `projects-registry.xml` أو `briefs/` الحقيقية إلى GitHub.
