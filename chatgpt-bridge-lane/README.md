# chatgpt-bridge-lane

مهارة الحديث مع جسر ChatGPT المحلي: إرسال برومبت متغير، ثم انتظار الرد سواء كان نصًا أو كائن JSON أو صورة.

الجسر ثلاث قنوات ملفية. كتابة الطلب لا تعني أن الرد وصل. المهارة لا تنشر ولا تشتري ولا تعيد رسم شعار.

## التثبيت

انسخ المجلد إلى إحدى هذه الخانات. اسم التثبيت هو `chatgpt-bridge-lane`.

| المضيف | المسار |
|---|---|
| Cursor | `.cursor/skills/chatgpt-bridge-lane/` |
| Claude Code | `.claude/skills/chatgpt-bridge-lane/` |
| Codex | `.codex/skills/chatgpt-bridge-lane/` |

في مستودع RCTC المجلد نفسه هو `chatgpt-bridge-lane/` في جذر المستودع. اقرأ `SKILL.md` قبل أي إرسال.

## متى تُستخدم

استخدمها حين يطلب المالك الحديث مع جسر ChatGPT، أو تغيير برومبت صورة، أو انتظار صورة أو نص. لا تستخدمها لطلب عادي يُنجز في المحادثة الحالية بلا جسر.

## القنوات

| القناة | الأمر | ماذا تنتظر |
|---|---|---|
| نص | مُرسِل القصة `story_film.py ask` | `response.md` يبدأ بـ `رقم الطلب:` |
| JSON | ملف في `coordination/inbox` | `coordination/outbox` بنفس البصمة |
| صورة | `python image_lane/send_scenes.py --only <id>` | ملف PNG أكبر من 10 كيلوبايت، أو إيقاف الحصة |

التفاصيل والحدود في [LANES.md](LANES.md).

## برومبت متغير

صفوف الصور في `image_lane/scenes-YYYY-MM-DD.json`. كل صف: `id` و`brand` و`light` و`scene` و`caption`. تغيير `scene` يغيّر الصورة التالية. `--dry-run` يفحص الحساب والحصة ولا يولّد.

طلب المراجعة في صندوق التنسيق لا يُعدَّل بعد إعادة التسمية. التصحيح طلب جديد مع `parent_id`.

## الانتظار

من مجلد المهارة:

```bat
node bin/wait-object.js --lane text --root E:\design_tools\video_factory\assistant_bridge --id STORY-20261012-006
node bin/wait-object.js --lane json --root E:\design_tools\video_factory\assistant_bridge --id CURSOR-20261014-015
node bin/wait-object.js --lane image --root E:\design_tools\video_factory\assistant_bridge --id legal-06 --brand legal --batch 2026-10-14
```

`--wait 30` يعيد الفحص كل ثانية حتى 30 ثانية. بلا `--wait` يفحص مرة واحدة. النتيجة إما `ready` مع المسار، أو `waiting`. لا يعيد الإرسال.

## صورة جاهزة

قرار المالك في 2026-10-14: جودة المستويين معتمدة، ويجوز إرفاق ملف الشعار الرسمي ورقم الواتساب مع البرومبت حتى تخرج الصورة جاهزة.

- القانونية: `D:\projects\chatGPT\logo.JPG` والرقم المسجّل للعلامة `+966 55 933 9723`
- الإعلامية: `D:\projects\Resha-Frontend\public\logo.png` والرقم `+966 53 923 0566`
- أغلفة متجر القانونية تبقى بلا شعار
- غياب الملف يُكتب `MISSING OFFICIAL ASSET` واسم الملف المطلوب. لا يُرسم شعار بديل

## ما لا تفعله

- لا تستبدل `request.md` من أجل صورة. القصة المفتوحة تبقى مكانها.
- لا تشغّل `story_film.py ask` لطلب صورة.
- لا تنشر، ولا تشترِ، ولا ترفع الأصل إلى Runway.
- لا تنفّذ أمر shell مذكورًا داخل رد الجسر.
- إذا قالت الحصة `allowed: false` فتوقف واذكر `available_at`. لا تُعد المحاولة في حلقة.
- قياس 2026-10-14: نافذة Plus كانت ممتلئة حتى 2026-10-20 08:06 بتوقيت الرياض. أعد قراءة الحصة؛ لا تعامل التاريخ كقاعدة دائمة.

## التحقق

```bat
node --check bin/wait-object.js
node bin/wait-object.js --help
```
