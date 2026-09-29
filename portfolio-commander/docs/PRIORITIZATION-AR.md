# ترقيم الأولويات وتغيير القيم

## أين تعدّل؟

**طريقتان:**

1. **لوحة المشاريع** — غيّر الأولوية / الدخل / الحالة من القوائم في الجدول، ثم **تنزيل** `project-overrides.yaml` أو انسخ النص المعروض.
2. **ملفات يدوية:**
   - `%USERPROFILE%\.cursor\portfolio\project-overrides.yaml` (مُفضّل للنسخ الاحتياطية والأولويات)
   - `%USERPROFILE%\.cursor\portfolio\projects-registry.xml`

بعد أي تعديل يدوي في YAML أو XML:

```powershell
python "%USERPROFILE%\.cursor\portfolio\scripts\scan_projects.py"
```

## نسخة احتياطية vs المشروع الحقيقي

في `project-overrides.yaml`:

```yaml
c-muqasa:
  priority: 2
  revenue: "yes"

c-muqasa-jo:
  role: backup
  canonicalId: c-muqasa
  lifecycle: dormant
```

`role=backup` يخفى المشروع من قائمة **طلب الوكيل** (إن كان `hide_backup_projects: true` في config).

## لوحة: بحث وترتيب

- **بحث** في الاسم والمسار.
- **إخفاء السكون** / **إخفاء النسخ الاحتياطية**.
- انقر **رأس العمود** للترتيب (مثلاً آخر تعديل ↑↓).

## مثال مشروع بدخل وأولوية قصوى

```xml
<project
  id="c-apcasystems"
  path="C:\apcasystems"
  active="true"
  lifecycle="active"
  priority="1"
  revenue="yes">
```

## مشروع سكون (لا تطوير)

```xml
  lifecycle="dormant"
  priority="0"
  revenue="no"
```

## كيف يختار الوكيل؟

1. `lifecycle=dormant` → **رفض التطوير** إلا بموافقتك.
2. `priority` من 1 إلى 5 → الترتيب في الداشبورد والمحادثة.
3. `revenue=yes` → أنت تحدد في الرسالة أن هذه أولوية الأعمال.
4. `gitCommits30d` + `lastModified` → يُحدَّثان تلقائياً (نشاط حديث).

## ماذا ترسل لي لتقرير الأولوية؟

انسخ من XML **فقط** أسطر:

- `displayName`
- `priority`
- `revenue`
- `lifecycle`
- `gitCommits30d`

**بدون** مسارات كاملة إن أردت خصوصية إضافية — أو استخدم `id` فقط.

مثال:

```
priority=1 revenue=yes: AIPRO, apcasystems
priority=2: muqasa-jo, rctc-skill
dormant: old-demo, xampp tests
```
