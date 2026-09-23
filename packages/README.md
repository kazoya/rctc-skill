# RCTC Skill Packages — باقات مترابطة (Cursor · Claude · Codex)

اللهم ارزقني وارزق مني.

These **packages** are curated chains of existing skills. Agents (Cursor, Claude, Codex) should load the **package card** first — then only the linked `SKILL.md` files — instead of pasting the whole monorepo. That cuts tokens and keeps real steps for students, hobbyists, and quiet learners (yes, even the anonymous ones ^_^).

## How agents should load

| Agent | Entry |
|---|---|
| **Cursor** | Open this repo → `.cursor/rules/rctc-packages.mdc` + `.cursor/skills/` |
| **Claude** | Project knowledge / system: paste `packages/CLAUDE_PACKAGES.md` or attach listed paths |
| **Codex** | `packages/CODEX_PACKAGES.md` as instructions; prefer `registry/skills.json` for lookup |

**Law:** Reuse → Compose → Extend → Generate New (`skill-factory`).

## Packages

See `packages/catalog.json` (machine-readable) and below (human).

### 1. `beginner-coding-path` — أول خطوة للبرمجة
**For:** طلاب، هواة، باحثون عن مسار واضح  
**Chain:** `start-skill` → `rctc-method` (root SKILL) → `focused3-agentic-phases` → `safe-forward-execution`  
**Outcome:** فكرة → خطة → تنفيذ آمن → إثبات  
**Token tip:** Load only these four SKILL.md files + this card.

### 2. `oss-skill-builder` — صناعة مهارة ونشرها بحذر
**Chain:** `skill-factory` → `continuous-improving` → `dev-agora-skill`  
**Outcome:** draft → validate → review → package → repo-ready (*publish = owner gate*)

### 3. `portfolio-ops` — إدارة عدة مشاريع بعقل واحد
**Chain:** `portfolio-commander` → `master-brain` → `start-skill` → `update-zip-skill`  
**Also link:** local `C:\\master` when present

### 4. `ship-marketing-site` — موقع تسويقي بأقل تدخل
**Chain:** `web_marketing_and_personal-builder-super-skill` → `safe-forward-execution` → optional `factory-sales-concept`

### 5. `commerce-owner-ops` — تشغيل مالك (Dry Run أولاً)
**Chain:** Project1 prompt `docs/PROJECT1_MAX_SPEED_OWNER_PROMPT.md` + `continuous-improving` + `update-zip-skill` (`--profile web-project`)  
**Keep:** dormant marketplace URLs; `buyHalt` / Dry Run until spend cap

### 6. `local-helpdesk` — مساعدة دلالية من PDF
**Chain:** `apca-smarthelp` + `ai-portability-advisor` (Cursor skills under apca-smarthelp/.cursor/skills)

### 7. `community-agora` — مجتمع تعلّم بلا سبام
**Chain:** `dev-agora-skill` + GitHub templates under `.github/` + `docs/SUPPORT_BLOCK.md`

## Support (optional)
- https://buymeacoffee.com/Asrawi612
- PayPal: innervision2016@gmail.com
- https://suhib-ai-delivery-portfolio.vercel.app/en
- Star: https://github.com/kazoya/rctc-skill


### 8. `coffee-pass` — شرف داعمي القهوة
**For:** من دفعوا BMC، ومن يهدي قهوة لزميل، ومن يتعلم مجاناً عبر GitHub  
**Paths:** `packages/coffee-pass/`  
**Rule:** لا مشاركة لأرقام البطاقات — هدية قهوة أو مسار مجاني فقط.


### 9. `digital-presence-factory` — مصنع الحضور الرقمي / التصور
**DNA:** discover→inspect→reason→design→build→verify→package→publish
**Recipes:** personal / delivery portfolio / factory / company / product / evidence portal
**Compose only** — not a god-skill. Proving grounds: Portfolio + factory-sales-concept; protect Project1/Master.


### 10. `decision-focus` — مجلس التركيز قبل القرار
**Chain:** `rctc-method` → `focus-council` → `focused3-agentic-phases`  
**Outcome:** مشكلة → زوايا خبرة محاكاة → حلول مستقلة → Jury محايد → توصية مركزة → إثبات عند التنفيذ  
**Truth rule:** لا نعرض الشخصيات أو “الزبائن” على أنهم أشخاص حقيقيون.

### 11. `arabic-voice-cost` — صوت عربي أعلى جودة بأقل استهلاك مدفوع
**Chain:** `focus-council` → `local-ssml-voice-cost-optimizer` → `focused3-agentic-phases`  
**Outcome:** نص عربي → تنسيق/سياق/تشكيل اختياري محلي → W3C SSML IR → Preview محلي → Cache → Premium فقط للمقاطع اللازمة  
**Dogfooding:** تم اختيار هذه المعمارية عبر Focus Council، ثم أعادت مبادئ FinOps تحسين QUICK/STANDARD/DEEP في Focus Council.
