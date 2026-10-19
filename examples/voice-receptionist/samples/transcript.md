# Sample call transcript (fictional)

Call `call_demo_0001` · 2 min 26 s · Arabic (Jordanian) · caller and clinic are fictional.

| Speaker | Line |
|---|---|
| Agent | مرحبا، عيادة النموذج لطب الأسنان، معك المساعد الآلي. كيف بقدر أساعدك؟ *(Hello, Example Dental Clinic, this is the automated assistant. How can I help?)* |
| Caller | مرحبا، بدي أسأل قديش سعر تنظيف الأسنان؟ |
| Agent | تنظيف الأسنان عنا بيبلّش من 25 دينار، والسعر النهائي بيحدده الطبيب بعد الفحص. بتحب أحجزلك موعد؟ |
| Caller | آه، بس إيمتى بتفتحوا؟ |
| Agent | من السبت للخميس، من 10 الصبح لـ 7 المسا. الجمعة مسكّرين. |
| Caller | طيب الأربعاء الساعة 5 العصر. |
| Agent | تمام. شو الاسم الكريم؟ |
| Caller | أحمد خالد. |
| Agent | ورقمك 0790000001، صح؟ |
| Caller | صح. |
| Agent | بنحتاج نتواصل معك على هاد الرقم لتأكيد الموعد. موافق؟ |
| Caller | موافق. |
| Agent | سجّلت طلبك: تنظيف أسنان، الأربعاء 21 الشهر الساعة 5 العصر، باسم أحمد خالد. هاد طلب حجز، والاستقبال رح يتصل فيك يأكد الموعد. في إشي ثاني؟ |
| Caller | لا، شكراً. |
| Agent | أهلاً وسهلاً، يومك سعيد. |

## What the agent extracted

See [call-ended.payload.json](call-ended.payload.json) → `extracted`, and the lead the webhook must write: [expected-lead.json](expected-lead.json).

Things the agent did **not** do, on purpose:
- It did not confirm the slot as booked. It said "request" and left confirmation to staff (no calendar write without a human, unless you wire one in).
- It quoted the price exactly as the FAQ states it ("from 25 JOD, final after exam"), with no discount.
- It asked for consent before saving the number for a callback.
