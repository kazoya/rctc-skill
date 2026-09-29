# Deterministic Hybrid Multi-Arm Search for ARC-AGI-3
## Writeup draft (≤1500 words) — Paper Track eligibility artifact

**Subtitle:** Ranking play by evidence, not by wall-clock — a reproducible hybrid agent for ARC-AGI-3

> Status: DRAFT for Kaggle Writeup. Must link a scored ARC-AGI-3 (or AGI-2) submission ID before final Submit.
> Linked kernel (pending competition attach): `dannyaabdulhadi/arc-prize-2026-arc-agi-3-starter`
> Method siblings: RCTC (Role–Context–Task–Constraints), start-skill, master-brain — https://github.com/kazoya/rctc-skill

### Abstract
We present a hybrid multi-arm offline agent for ARC-AGI-3 environments. Several search/perception arms propose complete plays; a **deterministic total order** selects the winning arm from the run record alone—levels completed, error status, official points, actions spent, then a fixed arm priority—explicitly excluding wall-clock time so rankings are reproducible across hosts. The approach is gated: no Kaggle submission without a local format/play gate. We document the pipeline from local `arc-agi` play to a competition kernel producing `submission.parquet`.

### Intro
ARC-AGI-3 asks agents to act in interactive game environments under strict offline constraints (no internet at scoring time). Frontier LLMs alone score near zero on the public board; progress requires search, memory, and careful evaluation hygiene. Our inspiration is engineering discipline more than a single clever heuristic: treat every arm as an experiment, keep evidence on disk, and never let machine speed decide scientific winners.

### Prior work
Random baselines (Stochastic Goose / starter kits) prove plumbing. Search-based and hybrid systems improve level clearance on selected games offline. Portfolio and prompt frameworks (RCTC; focused THINK→EXECUTE→PROVE) improve human–agent iteration quality but are not substitutes for environment search. We differ by making **arm selection a pure function of the play record**, matching our offline scorecard philosophy.

### Approach
1. **Arms.** A fixed list `ARMS` (e.g. baseline random, search_v2, hybrid variants, IDA-style) each returns a run dict: `levels_completed`, `status`, `score`, `sent_actions`, `arm`.
2. **Total order.** `ARM_ORDER` maps arm name→index. `rank_key(run)` returns a tuple maximized by `max`/`sorted`:
   - levels completed (desc)
   - non-error status
   - score present + score value
   - fewer actions preferred
   - earlier arm index as final tie-break
   Wall-clock seconds are forbidden in the key.
3. **Local gate.** Before any Kaggle push: play ≥1 smoke game set; validate artifact shape.
4. **Submit path.** Official starter splices `MyAgent` into a notebook; kernel writes `submission.parquet`; human attaches Output→Submit to Competition (code comps).
5. **Ops.** Claude Code pairs at effort `xhigh` (not `max`) on Opus 5 (1M), with a living `CLAUDE_KB` logging decisions and reusable assets.

### Results
- Offline (local scorecard): hybrid restored strong play on selected games (e.g. ft09 full clear in prior cycles); aggregate still far from LB leaders (~7.51).
- Kaggle ARC-AGI-3: **first scored submission pending** (kernel COMPLETE with parquet; competition row was empty at last CLI check—attach Output to competition).
- Farm (kaggriculture) is out of scope for this paper; mentioned only as portfolio discipline (gated H2H, no voided end-glut pricing).

*(Replace this section with CLI-verified publicScore + submission ref once AGI-3 row exists.)*

### Conclusion
Reproducible hybrid ranking and gated submission hygiene are necessary (not sufficient) for ARC-AGI-3 progress. Linking a real AGI-3 entry unlocks Paper Track judging; further work is denser search under the same total order and richer perception arms without sacrificing determinism.

### Reproducibility
- Code: ARC offline `src/agi3/` + Kaggle starter snapshot under `.tmp/agi3_submit_snap_*`
- Skills/platform: https://github.com/kazoya/rctc-skill (`start-skill`, `master-brain`, `rctc-method`)
- Knowledge log: `.tmp/CLAUDE_KB/`

### Word count target
Keep final Kaggle Writeup body under **1500 words**. This draft is a scaffold—trim Results/Prior work after the first LB score lands.
