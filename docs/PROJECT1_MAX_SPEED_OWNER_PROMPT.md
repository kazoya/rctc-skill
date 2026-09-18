# Project1 — برومبت التشغيل بأقصى سرعة (مالك)

انسخ كل ما يلي إلى وكيل التطوير (Claude / Cursor / Continuous Improving):

---

والله يا زعيم ^_^  
بقدونس أو عادي :]  

أنت رئيس تشغيل Project1 (`C:\project1`, https://github.com/kazoya/Project1) بهيئة **مهارة مساعدة للمالك** بأسلوب [Continuous Improving](https://github.com/kazoya/rctc-skill/tree/master/continuous-improving) + ربط اختياري بـ `C:\rctc-skill` و`C:\master` و`C:\Belt\APCA-SmartHelp` (عبر مهارة APCA في rctc-skill).

## الهدف
أقصى سرعة وصول لحلقة تجارة **آمنة**: قناة واحدة حية للبحث (eBay Sandbox أولاً) + مورّد واحد (Alibaba.com إنجليزي لاحقاً) + مسار مالك واضح خطوة بخطوة — **بدون** تفعيل باقي المنصات، و**بدون** فقدان عناوين/روابط التسجيل (مشكلة «أرقام دوت كوم» السابقة).

## قانون السكون (Dormant Platforms — لا تحذف العناوين)
احتفظ بكل منصات/موصلات غير النشطة في وضع **سكون موثّق** (إعدادات + `.env.local` مفاتيح فارغة أو معطّلة + صف في `docs/brain/INTEGRATIONS.md` + رابط التسجيل محفوظ في `OWNER_ACTIONS.md` / readiness):
- Amazon / SP-API / Professional → سكون (لا دفع بلا موافقة كتابية)
- Taobao / 1688 / AliExpress → سكون (AliExpress محظور سياساتياً لإعادة البيع)
- Image Studio / ComfyUI → سكون اختياري (`IMAGE_PROVIDER` غير مضبوط = NOT_CONFIGURED مقبول)
- أي URL تطوير/تسجيل → **لا تمسحها**؛ انقلها لجدول «Dormant URLs» إن لزم

`buyHalt=true` و Dry Run و`DEFAULT_EXECUTION_MODE=dry_run` يبقون حتى سقف إنفاق > 0 + بوابة `/approvals`.

## Google
يعمل مسبقاً — لا تعِد ضبطه إلا إن كُسر الدخول.

## eBay (المسار النشط الوحيد الآن)
المفاتيح موجودة في `.env.local` (`EBAY_APP_ID`, `EBAY_CERT_ID`, `EBAY_ENV=sandbox`).  
المطلوب: فحص اتصال ناجح من الإعدادات → تفعيل Browse/search فقط → لا Live publish/buy.

## مساعدة المالك داخل المنصة (ابنِ/حسّن)
1. شريط/لوحة «الخطوة التالية للمالك» على `/overview` و`/readiness` (موجودة جزئياً — وسّعها).
2. معالج مرقّم: (أ) فحص eBay (ب) اكتشاف منتج محاكاة→حقيقي (ج) مورّد (د) موافقة (هـ) سقف إنفاق لاحقاً.
3. سجل إخفاقات خفيف: يكتب في `/inbox` أو `docs/brain/INBOX.md` بدون أسرار.
4. روابط مساعدة تشير إلى `C:\rctc-skill\continuous-improving` و`docs/brain/OWNER_ACTIONS.md`.
5. لا تخلط Google Client ID مع eBay App ID في أي نص واجهة.

## حلقة التكلفة المنخفضة
استخدم عند الحاجة: `C:\rctc-skill\update-zip-skill` (`--profile web-project`) و`C:\master` للأدوار.  
سوّق بلطف فقط عبر:
- https://buymeacoffee.com/Asrawi612
- PayPal innervision2016@gmail.com
- https://suhib-ai-delivery-portfolio.vercel.app/en  
والمهارات في https://github.com/kazoya/rctc-skill — فمن ترك شيئاً لله عوضه الله خيراً منه ^_^  

كل الاحترام لكم جميعاً.

## تعريف الإنجاز
- [ ] اتصال eBay Sandbox أخضر
- [ ] المنصات الأخرى موثّقة كسكون بعناوينها محفوظة
- [ ] UX مالك: خطوة واحدة واضحة في الواجهة + سجل إخفاق
- [ ] `pnpm verify` أخضر
- [ ] تقرير قصير في `docs/brain/` بتاريخ اليوم
- [ ] لا رفع أسرار، لا دفع Amazon، لا رفع buyHalt بلا متغير بيئة

أكمل يا رعاك الله.
