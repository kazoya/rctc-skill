# مهارات Agent Skills حسب المشروع

Cursor يكتشف المهارات من:

- **عالمي:** `%USERPROFILE%\.cursor\skills\`
- **مشروع:** `{مشروع}\.cursor\skills\` (أو `.agents/skills/`)

## الإعداد (مرة)

1. انسخ الخريطة:

```powershell
Copy-Item "C:\rctc-skill\portfolio-commander\project-skills-map.example.yaml" `
  "$env:USERPROFILE\.cursor\portfolio\project-skills-map.yaml"
```

2. عدّل مسار `rctc-skill` في `sources` إن لزم.

3. ثبّت المهارات على المسارات الفعّالة:

```powershell
python "$env:USERPROFILE\.cursor\portfolio\scripts\install_project_skills.py"
```

أو من المستودع:

```powershell
python "C:\rctc-skill\portfolio-commander\scripts\install_project_skills.py"
```

## ماذا يُثبَّت؟

| حزمة | مسار | مهارات |
|------|------|--------|
| belt-cx | `C:\Belt` + nested | SmartHelp CX, gateway PHP, bitter-truth, portability, portfolio |
| aipro-hub | `C:\AIPRO` | portfolio, portability, bitter-truth |
| smart-branch | `C:\atalkingQMS` | portfolio, portability, SmartHelp CX |
| apca-web | apcasystems / apccasystems.com | marketing, portfolio |
| muqasa | `C:\muqasa` | maintenance, bitter-truth |
| bounty | `C:\gandalf` | security-bounty-window |
| rctc-repo | `C:\rctc-skill` | rctc-method, portfolio, portability, focused3-agentic-phases |
| omniagent | `C:\airealpro\chatbase` | `/focused3-agentic-phases` نظام THINK→EXECUTE→PROVE |
| factories | `C:\Factories` + المجرة + بنون + نور | `/factory-sales-concept` تصور رقمي للمصنع ثم GitHub وVercel |

المشاريع `lifecycle: dormant` أو `role: backup` **لا تُثبَّت** عليها حزمة (سياسة الخريطة).

## للوكيل

- `/portfolio-skills-router` — تذكير بالخريطة والأولويات.
- المهارات ذات `paths:` تظهر فقط عند العمل على ملفات مطابقة (PHP vs Python).
- `security-bounty-window` يتطلب استدعاءً صريحًا (`disable-model-invocation: true`).

## بعد تغيير الأولويات

```powershell
python "%USERPROFILE%\.cursor\portfolio\scripts\scan_projects.py"
python "%USERPROFILE%\.cursor\portfolio\scripts\install_project_skills.py"
```

النتيجة: `%USERPROFILE%\.cursor\portfolio\project-skills-manifest.json`
