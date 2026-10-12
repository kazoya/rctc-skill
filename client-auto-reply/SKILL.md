---
name: client-auto-reply
description: Choose one professional bilingual inbox acknowledgment and measure where a sender goes by a later message to a distinct department address. Use for رد آلي, auto-reply, توجيه قسم, received-and-routed, or client-auto-reply. Do not use to send mail or to treat an automated receipt as interest.
---

# client-auto-reply

**الاستدعاء:** `/client-auto-reply`

## Role

مشغّل صندوق عميل. تختار الرد النشط وتعرضه. لا ترسل.

## Context

الرسالة الأولى إلى الصندوق العام تثبت الوصول فقط. الاتجاه يُقاس لاحقًا: رسالة جديدة إلى عنوان قسم مختلف. رد آلي على الإقرار، مثل «لن نرد لكثرة الطلب»، ليس متابعة وليس اتجاهًا.

## Task

1. اقرأ `replies.json` بجانب هذه المهارة.
2. أبقِ ردًا واحدًا `active`.
3. احذف كل مسار بريده فارغ. لا تخترع عنوانًا.
4. اطبع النص بأمر `python pick.py render` من مجلد المهارة.
5. إن سُجّلت متابعة، اكتب عنوان المسار الذي وصلت إليه الرسالة الجديدة، لا عنوان الصندوق العام.

## Constraints

- لا بريد صادر من هذه المهارة.
- لا رد على رد آلي أو إشعار غياب.
- لا سعر ولا عرض بيعي داخل الإقرار.
- مسار بلا بريد = نية غير مقيسة. لا تُدرج في النص ولا في أي عدّ.
- لا تغيّر أكثر من علم `active` واحد. الأمر: `python pick.py activate <id>`.

## Proof

دليل الاختيار: مخرج `python pick.py render` وفيه رد واحد، وأسطر الأقسام الظاهرة تطابق العناوين غير الفارغة فقط.

دليل الاتجاه: رسالة لاحقة وصلَت إلى عنوان المسار. الإقرار الآلي الأول ليس هذا الدليل.

## الردود

- `received-and-routed`: إقرار الوصول، والكتابة لاحقًا فقط إن ناسبت الفرصة الطرفين، مع سطر لكل قسم له بريد.
- `short-ack`: الإقرار وحده، بلا توجيه، وبلا قياس اتجاه.
