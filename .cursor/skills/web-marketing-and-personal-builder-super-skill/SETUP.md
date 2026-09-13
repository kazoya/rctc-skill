# Setup — قليل من الإعدادات (GitHub + Vercel + Cursor)

الهدف: بعد إنشاء الحسابات مرة واحدة، تشغيل المهارة يصير أقرب لـ **بدون أدنى تدخل**.

---

## 0) ماذا تحتاج مرة واحدة فقط

| حساب / أداة | لماذا |
|-------------|--------|
| حساب **GitHub** + `gh` مصادَق (`gh auth login`) | إنشاء المستودع والدفع |
| حساب **Vercel** مربوط بنفس GitHub | نشر تلقائي عند كل push |
| فريق Vercel (في محفظة صهيب: **muqasa**) | عزل المشاريع عن الحساب الشخصي Hobby إن لزم |
| **Cursor** مع Agent Skills من هذا الريبو | تحميل المهارة تلقائياً أو عبر `/` |
| (اختياري) إضافة Vercel MCP في Cursor | `create_git_project` / مراقبة READY |
| (اختياري) `ui-ux-pro-max` | ذكاء تصميم |
| (اختياري) Ollama محلي | مسودات نصية رخيصة / خاصة |

---

## 1) تثبيت المهارة في Cursor

### أ) من المستودع

```bash
git clone https://github.com/kazoya/rctc-skill.git
```

ثم أحد الخيارين:

**مشروعياً** — انسخ المجلد إلى:

```text
{your-workspace}/.cursor/skills/web-marketing-and-personal-builder-super-skill/
```

**شخصياً (كل المشاريع):**

```powershell
Copy-Item -Recurse `
  "C:\rctc-skill\web_marketing_and_personal-builder-super-skill" `
  "$env:USERPROFILE\.cursor\skills\web-marketing-and-personal-builder-super-skill"
```

أو أبقِ الاختصار داخل `C:\rctc-skill\.cursor\skills\` عند فتح ريبو `rctc-skill`.

### ب) الاستدعاء

في دردشة Agent:

```text
/web-marketing-and-personal-builder
https://www.example.com
```

أو الصق الرابط فقط — إذا كانت المهارة مكتشفة، يفترض الوكيل المسار بعد `projects-connector`.

---

## 2) GitHub — الحد الأدنى

```powershell
gh auth status
# إن فشل:
gh auth login
```

قواعد الأمان:

- لا ترفع `.env` أو مفاتيح.
- لا ترفع سجلات المحفظة الحقيقية (`projects-registry.xml`, `briefs/`).
- المستودع العام باسم واضح (PascalCase شائع في المحفظة: `Banoon`, `VStrata`).

أمر الإنشاء النموذجي بعد نجاح `npm run build`:

```powershell
gh repo create {Name} --source=. --remote=origin --push --public
```

---

## 3) Vercel — الحد الأدنى

1. سجّل في [vercel.com](https://vercel.com) وادخل بحساب GitHub.
2. اقبل صلاحيات الوصول للمستودعات (أو للمنظمة).
3. أنشئ / انضم لفريق العمل (مثال المحفظة: slug `muqasa`).
4. لا تنشر يدوياً بالسحب والإفلات إذا وُجد ريبو — اربط Git.

### عبر MCP (مفضّل للوكلاء)

أداة: `create_git_project` في `plugin-vercel-vercel`

| Parameter | Example |
|-----------|---------|
| `repo` | `kazoya/VStrata` |
| `teamId` | `team_33SV2q7GqfsqIuQ9eJ9jfE1b` أو slug `muqasa` |
| `provider` | `github` |
| `projectName` | `vstrata` (lowercase) |
| `deploy` | `true` |

انتظر `readyState = READY` ثم افتح `https://{project}.vercel.app`.

### لماذا ليس `deploy_to_vercel` أولاً؟

`create_git_project` يربط الريبو بفرع الإنتاج حتى كل `git push` يعيد البناء.  
`deploy_to_vercel` للرفع اليدوي فقط عند غياب الريبو أو طلب صريح.

---

## 4) متغيرات بيئة اختيارية (موقع التصور)

في Vercel → Project → Settings → Environment Variables (أو `.env.local` محلياً فقط):

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL للـ metadata |
| `NEXT_PUBLIC_DEVELOPER_WHATSAPP_PHONE` | رقم منفّذ التصور |
| `NEXT_PUBLIC_DEVELOPER_WHATSAPP_PREFILL` | نص واتساب مسبقاً |
| `NEXT_PUBLIC_COMPANY_PHONE` | رقم الشركة إن لزم |
| `NEXT_PUBLIC_COMPANY_WEBSITE` | الموقع الرسمي المصدر |

لا تضع أسراراً في `NEXT_PUBLIC_*`.

---

## 5) تفعيل «شبه بدون تدخل»

| إعداد | أثر |
|-------|------|
| `gh` + Vercel Git مربوطان | الوكيل ينهي بـ push واحد |
| مهارة **`safe-forward-execution`** مثبّتة | بوابات أمان قبل أوامر خطرة |
| `/focused3-agentic-phases` | THINK → EXECUTE → PROVE داخل البناء |
| Browser MCP / logged-in-browser | فحص الموقع بلا نسخ يدوي |
| سماح Cursor لـ `npm` / `gh` / `git` في Allowlist بحذر | أقل نقرات موافقة |

**لا** تضع في Allowlist: `git push --force`, حذف قواعد بيانات، أو أي إنفاق مالي تلقائي.

---

## 6) تحقق سريع بعد الإعداد

```powershell
gh auth status
vercel whoami   # إن وُجد CLI
node -v
npm -v
```

ثم جرّب برومبت التجربة:

```text
/web-marketing-and-personal-builder
ابنِ تصوراً من https://example.com في مجلد تجريبي ولا تنشر للإنتاج حتى أوافق
```

(وضع «لا تنشر» يختبر الإعداد دون المخاطرة — انزع القيد لاحقاً.)
