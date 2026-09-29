# تقييم قابلية النقل — APCA SmartHelp CX (Belt)

**التاريخ:** 2026-08-06  
**النطاق:** `C:\Belt\flutter_sms_gateway` + `C:\Belt\APCA-SmartHelp` (+ إشارة إلى `pipecat` كـ P2 مؤجل)  
**JSON:** `belt-smarthelp-cx-2026-08-06.json` (نفس المجلد)

---

## 1. الملخص التنفيذي

لديك **منتج قابل للبيع كنص (واتساب) أقوى من متوسط السوق المحلي**: معرفة محلية (FTS + embeddings + تصدير `.apcahelp`)، وحدّ HTTP واضح (`BeltKnowledgeClient` → `:8787`)، وطابور رسائل مع **FIFO** و**إعادة محاولة** و**idempotency** للوارد.

**لا تنتقل بعيدًا عن SmartHelp في 90 يومًا.** ركّز على: موثوقية الرد + handoff + إكمال الحجز + طبقة موحدة للـ LLM.

أعلى **lock-in:** واتساب عبر **مستمع Android** (مقبول للـ Pilot، ليس للتوسع دون خطة). أعلى **rework:** منطق المحادثة في `BeltConversationService` (ملف كبير، مسارات OpenAI/Ollama/HTML).

---

## 2. خريطة الطبقات الست (مختصر)

| الطبقة | الوضع | lock-in (0–5) | قابلية النقل |
|--------|--------|---------------|--------------|
| Data & Knowledge | قوي محليًا | 2 | 4 |
| Models | مختلط Ollama/OpenAI | 3 | 3 |
| Training/Eval | learned Q&A + pytest | 1 | 4 |
| Apps/RAG/Agents | PHP + HTTP | 3 | 3 |
| Inference | FastAPI ذاتي | 2 | 4 |
| Orchestration | MySQL + هاتف WA | 4 | 2 |

---

## 3. ما يجب أن يبقى تحت سيطرتك

- مستندات العميل والفهارس وملفات `.apcahelp`
- قاعدة MariaDB (محادثات + حجوزات)
- مفاتيح المزوّدين في `.env` فقط
- قرار الانتقال إلى **WhatsApp Cloud API**

---

## 4. التوصيات (تحليلية — ليست تنفيذًا)

| إجراء | ماذا |
|--------|------|
| **KEEP** | نواة SmartHelp — أصل المنتج |
| **ABSTRACT** | واجهة واحدة لـ LLM بدل تفرّع OpenAI/Ollama في PHP |
| **OPTIMIZE** | handoff + حجز كامل + تدقيق (30 يومًا) |
| **HYBRIDIZE** | Pilot Cloud API لرقم واحد — **بعد موافقتك** |
| **DEFER** | صوت / Pipecat |
| **REJECT** | إعادة كتابة المنصة بالكامل أثناء البيع |

---

## 5. هل أنتقل؟ (Architecture Transition Advisor)

**القرار المختصر:** لا هجرة بعيدة الآن؛ **حسّن وتجريب قناة واتساب فقط**.

| سؤال | جواب |
|------|------|
| هل الانتقال مطلوب الآن؟ | **لا** — إلا pilot واتساب Cloud |
| الطبقة المتأثرة | Orchestration + قناة الواتساب |
| الوجهة المقترحة | هجين: Android للـ Pilot + webhook Cloud تدريجيًا |
| ماذا تنسخ أولًا؟ | DB + `.apcahelp` + تصدير learned Q&A |
| Pilot | عميل واحد، 4–8 أسابيع، مقاييس تسليم وزمن |
| التراجع | إعادة التوجيه لمسار Android |

---

## 6. خارطة 30/90 يومًا

انظر `roadmap` في JSON — متوافقة مع خطة SmartHelp CX (نص فقط أولًا، بدون صوت).

---

## 7. بوابات الموافقة

- `gate-hybrid-wa-01` → **PENDING_HUMAN_APPROVAL** (Cloud API + تكلفة + PII)
- `gate-opt-01` / `gate-abstract-01` → **PENDING** قبل تغيير إنتاجي

---

## 8. No-bluff

تمت القراءة من ملفات المشروع محليًا؛ لم تُقاس تكلفة أو latency حية. **AIPRO** (Next/Supabase) مسار منفصل ولم يُدمج في هذا التقييم.

---

*Portfolio Commander (اختياري): بعد اعتماد الأولويات، يمكن ترتيب المستودعات من لوحة المحفظة — بدون تكامل عميق في v1.*
