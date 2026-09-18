# Community → Skill Factory experiment (DRAFT — STOP before publication)

**Date:** 2026-09-19  
**Status:** draft for owner review — **not published**  
**Source material:** `docs/GITHUB_DISCUSSION_DRAFT.md` + Dev Agora / Phase 2 growth docs in `kazoya/rctc-skill`  
**Gate:** Draft → Validate → Review → Test → Package → **Owner approval** → Publish

---

## 1. Genuine useful question (from supplied community material)

From the Phase 2 Lightspeed / Dev Agora discussion draft and skill-ecosystem framing, the recurring useful developer question is:

> **“How do I turn a working agent recipe into a reusable skill without inventing a new god-skill or auto-publishing untrusted code?”**

This is not a fake FAQ — it is the explicit pain Phase 2 and `docs/COMMUNITY_TO_SKILL.md` exist to solve:
`Question → Answer → Reproduction → Recipe → Candidate Skill → Validation → Release`

---

## 2. Reproducible problem

**Given:** A developer has a multi-step Cursor/Claude workflow that works once (e.g. “inspect factory URL → Arabic RTL Next concept → honesty badges → build”).  
**When:** They want the next teammate (or future self) to run the same path.  
**Then:** They currently either (a) paste a long prompt again, (b) grow a monolithic skill, or (c) skip validation and “publish” early.

**Acceptance for a fix:**
1. Prefer **Reuse → Compose → Extend → Generate New**
2. Emit a **draft** skill package only
3. Never auto-trust / auto-publish
4. Keep Project1 `buyHalt` / Dry Run and Master roles untouched

---

## 3. Recipe candidate

**Recipe id (candidate):** `compose-existing-skills-before-generate`  
**Composes:**
- `digital-presence-factory` (plan-only CLI)
- `skill-factory` (draft pipeline)
- `safe-forward-execution`
- `focused3-agentic-phases`

**Steps:**
1. Capture the question + one concrete reproduction folder/URL  
2. Run DPF CLI plan against that intake  
3. If compose chain covers ≥80% of steps → stop; document recipe only  
4. If gap remains → open skill-factory **draft** (this experiment)  
5. Owner review before any registry publish

---

## 4. Skill-factory draft (NOT published)

### Proposed skill name
`compose-first-skill-gate`

### Description (draft)
Guardrail skill: before generating a new skill, require a composition plan against the registry and Digital Presence Factory recipes. Outputs a gap report and, only if needed, a skill-factory draft folder marked `status: draft`.

### Contract sketch
- **Inputs:** question text, optional source path/URL, optional `--force-draft`
- **Outputs:** `GAP_REPORT.md`, optional `draft/` tree, never mutates `registry/skills.json` without owner flag
- **Side effects:** write under `skill-factory/out/drafts/<slug>/` only
- **Verify:** `node skill-factory/scripts/*` + DPF `validate-recipes.js`
- **Publish:** owner approval required

### Why this is not a duplicate
Registry already has skill-factory and DPF. This draft is a **thin gate** documenting the preference order — Extend of process, not a second god-skill.

---

## 5. STOP line

**Do not:** merge to registry, open a public Discussion as “released”, or auto-push a new skill repo.  
**Do:** return this draft in the handoff ZIP for ChatGPT + owner review.

