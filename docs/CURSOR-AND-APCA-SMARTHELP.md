# كيف يتعامل Cursor مع APCA-SmartHelp

1. عند فتح `C:\Belt\APCA-SmartHelp` كمشروع، Cursor يقرأ `.cursor/skills/*/SKILL.md` ويعرضها كـ Agent Skills في الشات.
2. `ai-portability-advisor` مهارة مستقلة قابلة للتثبيت/النسخ إلى أي repo (موجودة أيضاً في جذر `rctc-skill`).
3. `belt-apca-smarthelp-cx` مهارة CX خاصة بمسارات Belt/SmartHelp.
4. التطبيق نفسه (FastAPI + Vite) منفصل عن المهارات: المهارات توجّه الوكيل؛ الكود يشغّل المساعدة الدلالية على `8787`/`5173`.
5. للضم الفيروسي: ابقِ نسخة خفيفة في `rctc-skill/apca-smarthelp` + رابط Belt + صف في README، دون رفع `.venv` أو بيانات محلية.
