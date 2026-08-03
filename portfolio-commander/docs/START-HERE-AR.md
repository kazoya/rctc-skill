# من أين تبدأ؟ (Portfolio Commander)

## الخطوة 1 — تثبيت (مرة واحدة)

```powershell
cd c:\rctc-skill\portfolio-commander
.\scripts\install.ps1
```

## الخطوة 2 — مسح المشاريع

```powershell
python "$env:USERPROFILE\.cursor\portfolio\scripts\scan_projects.py"
```

## الخطوة 3 — افتح الداشبورد

```powershell
start "$env:USERPROFILE\.cursor\portfolio\dashboard\index.html"
```

## الخطوة 4 — رتّب الأولويات (أنت)

افتح **محلياً فقط**:

```
C:\Users\<you>\.cursor\portfolio\projects-registry.xml
```

عدّل على كل `<project>`:

| السمة | القيم | المعنى |
|-------|-------|--------|
| `priority` | `1` … `5` أو `0` | **1 = أعلى أولوية**، `0` = ترتيب تلقائي بالنشاط |
| `revenue` | `yes` / `no` / `unknown` | هل المشروع مرتبط بدخل؟ |
| `lifecycle` | `active` / `dormant` | **سكون** = الوكيل لا يطوّر |
| `active` | `true` / `false` | خارج التركيز |

ثم أعد المسح (الخطوة 2).

## الخطوة 5 — أخبر الوكيل

أرسل رسالة مثل:

```
راجع projects-registry.xml — المشاريع ذات priority=1 و revenue=yes هي الأعلى.
نفّذ X على المشروع Y فقط.
```

## الخطوة 6 — نشر GitHub (فيرال + خصوصية)

- انشر مجلد `portfolio-commander` من مستودع **rctc-skill** (أو fork).
- **لا ترفع** `projects-registry.xml` الحقيقي أبداً.
- استخدم نص المشاركة من `portfolio-commander/README.md`.

## إضافة مشاريع لاحقاً

افتح مشروعاً جديداً في Cursor → شغّل المسح → يظهر تلقائياً في XML.
