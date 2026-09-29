---
name: projects-connector
description: >
  Connects Cursor portfolio projects without merging repos: Factories sales
  concepts, Belt WhatsApp, Muqasa auctions, RCTC, and continuous improving.
  Use when the user mixes project paths, sends a prompt in one repo meant for
  another, asks for Mashareena / ربط المشاريع / projectsConnector, or needs
  GitHub+Vercel routing across C:\Factories, C:\Belt, C:\muqasa, C:\rctc-skill.
---

# projectsConnector — موصّل المشاريع

لا تدمج المستودعات. الربط = سجل أولويات + مهارة التنفيذ + قناة واتساب + منتج حي + تصور تسويقي.

**استدعاء:** `/projects-connector` أو `projectsConnector`

## 1) اقرأ السجل أولاً

`%USERPROFILE%\.cursor\portfolio\projects-registry.xml`  
ثم `project-overrides.yaml` و`project-skills-map.yaml`.

| مسار | دور | لا تخلط مع |
|------|-----|-------------|
| `C:\Belt` | P1 واتساب/حجز/handoff | تصور مصنع |
| `C:\Factories\*` | تصور مبيعات عربي للمصانع | نظام تشغيل حي |
| `C:\almajjarra` | مرجع ري/أسمدة | بنون |
| `C:\Factories\Banoon` | مرجع أطفال/مسابقة | خط PLC |
| `C:\muqasa` | P4 منتج مزاد حي | مجلد التسويق |
| `C:\Factories\Muqasa-jo` | تسويق المقاسة بنفس أسلوب المصانع | `C:\muqasa` و`C:\muqasa-jo` (نسخة احتياطية) |
| `C:\rctc-skill` | RCTC + Commander + المهارات | بيانات السجل الحقيقية |

`lifecycle=dormant` أو `role=backup` → لا تطوير إلا بطلب صريح.  
Muqasa P4: صيانة حرجة في `C:\muqasa` فقط. غلاف تسويقي جديد في `C:\Factories\Muqasa-jo` استثناء إذا طلب المستخدم ذلك صراحة.

## 2) RCTC قبل التنفيذ

إن نقص الدور أو المهمة بما يغيّر الناتج: اسأل سؤالاً واحداً. وإلا افترض وصرّح.

| إن قال المستخدم | افترض |
|-----------------|--------|
| مصنع + رابط موقع | `/factory-sales-concept` |
| مزاد / مقاصة / تقييم ذكي | تسويق في Factories أو صيانة في `C:\muqasa` حسب المجلد المذكور |
| واتساب/حجز | Belt أولاً |
| تحسين مستمر / حلقة | `/continuous-improving` مع بوابات بشرية فقط عند إنفاق حقيقي |

## 3) قانون الموجّه

```
INSPECT REGISTRY → NAME THE INTENDED PROJECT → PICK SKILL → SMALLEST SLICE → PROVE → UPDATE BRIEF
```

إذا وصلت المحادثة من مصنع والنص يقصد آخر:

1. سمِّ المشروع المقصود والمسار.
2. لا تكتب في المجلد الخطأ.
3. اذكر الرابط الخفي (واتساب Belt، أسلوب بنون، فريق فيرسيل muqasa) دون نسخ بيانات عميل.

## 4) كيف يبدو «مشروع متكامل»

ليس monorepo واحداً. التكامل التشغيلي:

1. التصور في `C:\Factories\{slug}` يقنع صاحب القرار اليوم.
2. المنتج الحي (إن وُجد) يبقى في مساره الكانوني.
3. Belt يلتقط القناة لاحقاً بعد اعتماد P1.
4. GitHub `kazoya` + فيرسيل فريق `muqasa` (`team_33SV2q7GqfsqIuQ9eJ9jfE1b`).
5. قرار السعر/الجائزة/التقييم/فتح الصمام يبقى بشرياً.

## 5) مصنع ذكي (عرض 4.0) ≠ منصة مبيعات

وثائق `demo.pdf` / `Smart Factory Demo` خط تعليمي (PLC، Profinet، RFID).  
منصات المصانع رقمية. أدرج المقابل فقط إن كانت طبيعة العمل تتطلبه:

- صناعي: صفحات `/smart-factory` ومجموعتها
- غذاء/تجزئة: تتبع وجودة فقط (`smart-factory.analog.ts`)
- مقاصة جو وBankJourneyDemo: لا تدرج خط 4.0

المصدر: `_kit/scripts/inject-smart-factory.ps1`  
المقارنة: `C:\Factories\قبل دمج الملف الثلاثي وبعده - مقارنة.md`

## 6) بعد المهمة

حدّث `briefs\{id}.yaml` ثم:

```powershell
python "%USERPROFILE%\.cursor\portfolio\scripts\scan_projects.py"
```

لا ترفع `projects-registry.xml` أو `briefs/` الحقيقية إلى GitHub.

## 7) GitHub لهذه المهارة

المستودع العام المقصود: `projectsConnector` تحت حساب `kazoya`.  
ثبّت نسخة في `~/.cursor/skills/projects-connector` وفي `C:\rctc-skill\projectsConnector`.
