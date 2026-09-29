## ╪د┘╪▓┘ê╪ش 68/210 ظ¤ ┘à╪│╪د╪▒ ARC-AGI-3 ظ¤ ╪ز┘é╪»┘ّ┘à ┘à┘╪ز╪ص┘é┘┘ّ┘é ┘à┘┘ç

**1) ╪ث┘ê┘ ╪ذ╪╖╪د┘é╪ر ┘â╪د┘à┘╪ر ╪ص┘é┘è┘é┘è╪ر: ft09 = 100.0000 ظ¤ ┘ê╪ز╪ص┘é┘ّ┘é╪ز┘ ┘à┘┘ç╪د ┘à╪ص┘┘è┘ï╪د ╪ذ╪»╪د┘╪ر ╪د┘╪ز╪│╪ش┘è┘ ┘┘╪│┘ç╪د**

╪┤╪║┘ّ┘╪ز `src.agi3.hybrid.score_row` ╪╣┘┘ë ╪╡┘┘ê┘┘â ╪ذ╪د┘╪╢╪ذ╪╖:

| ╪╡┘ | markers | sent | score | ╪د┘┘à┘é┘è┘┘ّ╪» |
|---|---|---|---|---|
| ft09 6/6 (╪ش╪»┘è╪») | `[4,12,27,44,66,80]` | 80 | **100.0000** | coverage |
| ft09 6/6 (sweep ╪د┘╪▓┘ê╪ش 64) | `[98,151,244,361,582,743]` | 743 | **6.9383** | efficiency |
| cd82 2/6 | `[5,11]` | 11 | 14.2857 | coverage cap |
| cd82 2/6 (╪د┘╪ز╪▒╪د╪╢┘è) | `[5,11]` | 400 | 14.2857 | coverage cap |

╪د┘╪«┘╪د╪╡╪ر ╪د┘╪▒┘é┘à┘è╪ر: **┘┘╪│ ╪د┘┘à╪│╪ز┘ê┘è╪د╪ز ╪د┘╪│╪ز╪ر**╪î ┘ê╪د┘┘╪▒┘é ╪ذ┘è┘ 80 ┘ê743 ╪ص╪▒┘â╪ر ┘ç┘ê ╪د┘┘╪▒┘é ╪ذ┘è┘ **100.00 ┘ê6.94**. ╪ث┘à╪د cd82 ┘╪│┘é┘┘ç ╪د┘╪ز╪║╪╖┘è╪ر (3/21 = 14.2857) ┘ê┘╪د ╪ز┘╪║┘è┘ّ╪▒┘ç ╪د┘╪ص╪▒┘â╪د╪ز ╪ح╪╖┘╪د┘é┘ï╪د. ┘ç╪░╪د ┘è╪╣┘┘è ┘é╪د╪╣╪»╪ر ╪ز╪┤╪║┘è┘┘è╪ر ┘ê╪د╪╢╪ص╪ر: ╪د┘┘â┘╪د╪ة╪ر ╪ز┘╪س┘à┘┘ّ┘ ┘┘é╪╖ ╪╣┘╪» **╪ح┘â┘à╪د┘ ╪د┘┘╪╣╪ذ╪ر**╪ؤ ┘ê╪ح┘╪د ┘╪د┘╪ز╪║╪╖┘è╪ر ┘ç┘è ┘â┘ ╪┤┘è╪ة.

**2) ╪╣┘è╪ذ ╪ص┘é┘è┘é┘è ┘┘è ╪»┘à╪ش ╪د┘╪ث╪░╪▒╪╣ ظ¤ `src/agi3/hybrid.py:593`**

```python
best = max(runs, key=lambda r: (r["levels_completed"], -r["seconds"]))
```

╪د┘╪ز╪▒╪ش┘è╪ص ╪ذ┘ **╪د┘╪س┘ê╪د┘┘è** ┘╪د ╪ذ┘ **╪د┘╪ص╪▒┘â╪د╪ز ╪د┘┘à┘╪▒╪│┘┘╪ر ┘ê┘╪د ╪ذ╪د┘┘╪ز┘è╪ش╪ر**. ╪ث╪س╪▒┘ç ┘à┘é┘è╪│ ╪ز┘à╪د┘à┘ï╪د ╪ذ╪ش╪»┘ê┘ ╪ث╪╣┘╪د┘ç: ┘┘ê ╪ذ┘┘╪ز octo 6/6 ╪ذ┘80 ╪ص╪▒┘â╪ر ┘┘è 85╪س ┘ê╪ذ┘┘╪ز v2 ┘┘╪│ 6/6 ╪ذ┘743 ╪ص╪▒┘â╪ر ┘┘è 20╪س╪î ┘╪د┘┘â┘ê╪» ┘è╪«╪ز╪د╪▒ v2 ┘ê┘è┘╪ذ┘┘ّ╪║ **6.94 ╪ذ╪»┘ 100.00** ظ¤ ╪ز╪│╪▒┘è╪ذ 93 ┘┘é╪╖╪ر ╪»╪د╪«┘ ╪د┘┘à┘╪ش┘à┘┘ّ╪╣ ┘┘╪│┘ç╪î ┘╪د ┘┘è ╪د┘╪ص┘. ┘ê╪╣┘╪» ╪ز╪╣╪د╪»┘ ╪╡┘╪▒┘è (┘â┘ ╪د┘╪ث╪░╪▒╪╣ 0 ┘à╪│╪ز┘ê┘ë) ┘è┘┘ê╪▓ ╪د┘╪░╪▒╪د╪╣ **╪د┘╪ث╪│╪▒╪╣**╪î ┘ê┘ç┘ê ╪ز╪ص╪»┘è╪»┘ï╪د ╪د┘╪░╪▒╪د╪╣ ╪د┘╪░┘è ┘ê┘é┘: ┘ç┘â╪░╪د ╪╕┘ç╪▒ `sb26 octo 0/8 sent 0 stalled` ظ¤ ╪╡┘ ╪ذ┘╪د ╪ث┘è ╪»┘┘è┘ ╪ث┘╪▒╪│┘┘╪î ╪ص╪ش╪ذ ┘à╪د ┘╪╣┘┘ç ╪د┘┘fallback ╪ذ╪╣╪»┘ç. ╪د┘╪╡┘┘ê┘ ╪د┘╪ث╪«╪▒┘ë ┘à╪ص┘┘ê╪╕╪ر ┘┘è `"runs"` ╪ذ╪د┘┘JSON (╪د┘╪│╪╖╪▒ 622) ┘┘â┘ ╪ش╪»┘ê┘ ╪د┘┘md ┘╪د ┘è╪╣╪▒╪╢ ╪ح┘╪د `best`.

**3) ┘╪د ┘è┘ê╪ش╪» ╪د╪«╪ز╪ذ╪د╪▒ ┘è╪ص╪▒╪│ ┘ç╪░╪د**: `tests/test_agi3_hybrid.py:210` ┘è╪ج┘â╪» ┘┘é╪╖ "┘┘è╪│ ╪ث╪│┘ê╪ث ┘à┘ ╪د┘╪ث┘ê┘" **╪ذ╪╣╪»╪» ╪د┘┘à╪│╪ز┘ê┘è╪د╪ز**╪î ┘╪د ╪ذ╪د┘┘╪ز┘è╪ش╪ر.

╪د┘╪ث┘ê┘┘ê┘è╪ر ┘┘è ┘ç╪░╪د ╪د┘╪▓┘ê╪ش ┘┘è╪│╪ز ╪ص┘┘ّ sb26 ظ¤ ╪ذ┘ ╪ح╪║┘╪د┘é ┘à┘╪│╪▒┘┘ّ╪ذ ╪د┘╪د╪«╪ز┘è╪د╪▒ ┘é╪ذ┘ ╪ث┘è submit╪î ┘╪ث┘ ╪ث┘è ╪ذ┘ê╪د╪ذ╪ر ╪ز┘╪«╪ز┘à ╪╣┘┘ë `best` ┘à╪║┘┘ê╪╖ ╪ز┘╪«╪ز┘à ╪╣┘┘ë ╪▒┘é┘à ╪«╪د╪╖╪خ.

```text
TRACK: ARC-AGI-3 ظ¤ pair 68/210. Fix the hybrid arm-merge leak, then re-run the 5-game table.

CONTEXT (verified by Claude locally, reproduce it first):
  python -c "from src.agi3.hybrid import score_row; print(score_row('ft09-0d8bbf25',[4,12,27,44,66,80],80)['score'], score_row('ft09-0d8bbf25',[98,151,244,361,582,743],743)['score'])"
  -> must print: 100.0 6.9383
  Same 6/6 levels. 80 actions = 100.00 (coverage-bound); 743 actions = 6.94 (efficiency-bound).

THE DEFECT ظ¤ src/agi3/hybrid.py:593
  best = max(runs, key=lambda r: (r["levels_completed"], -r["seconds"]))
  Every run in `runs` already carries a computed `score` (score_row runs on the loop above,
  line ~588). The merge then throws that score away and ranks by wall-clock seconds.
  Two consequences, both must be fixed:
  (a) On equal levels, a fast-but-wasteful arm displaces a slow-but-efficient one.
      Measured exposure on ft09: 100.00 -> 6.94.
  (b) On an all-zero tie the FASTEST arm wins, which is the arm that stalled without
      sending anything (sb26 octo 0/8 sent 0 stalled). A row with zero sent actions
      carries zero evidence and must never outrank a row that actually played.

TASKS
1. Replace the merge key with a score-first, evidence-aware ordering:
     key = (levels_completed, score or 0.0, 1 if sent_actions > 0 else 0, -sent_actions, -seconds)
   Keep the existing comment's intent (a fallback never displaces an EQUAL first arm) by
   making `seconds` the LAST tiebreaker only, never the first. Do not change score_row.
2. Add to the returned record so a stall can never hide a fallback again:
     "arms_tried": [r["arm"] for r in runs],
     "arm_scores": {r["arm"]: r.get("score") for r in runs},
     "displaced": <the runner-up arm name or None>,
   and add these three as columns/lines to the markdown table writer (~line 667) so the
   md shows every arm's score, not just best's.
3. Tests in tests/test_agi3_hybrid.py (pure unit tests on the merge ظ¤ do NOT hit the env):
   - test_merge_prefers_higher_score_on_equal_levels: two synthetic runs, both 6/6,
     one score=100.0/80 sent/85s, one score=6.9383/743 sent/20s -> best is the 100.0 one.
   - test_merge_never_picks_a_zero_sent_stall_over_a_run_that_played: octo 0 levels /
     0 sent / 2s vs v2 0 levels / 40 sent / 80s -> best is v2, and displaced == "octo".
   - test_merge_ties_go_to_the_first_arm_when_score_and_actions_are_equal (guards the
     original intent).
   Refactor the key into a module-level helper (e.g. `def _merge_key(run) -> tuple`) so the
   tests can call it without running hybrid_play.
4. Re-run the 5 games at the SAME budget you used for the table you reported
   (ft09, cd82, r11l, sb26, tn36), writing:
     --out experiments/agi3_merge_fix_pair68.json --md docs/agi3_merge_fix_pair68.md
   Report the table with the new columns, and state explicitly for each game whether the
   reported row CHANGED vs your previous table, and which arm was displaced.
5. Write evidence/merge_key_pair68.txt in the house style: the defect in one paragraph,
   the before/after merge choice per game (measured, not remembered), the ft09 100.00 vs
   6.94 arithmetic, and one line on what sb26's stall actually was (crash? zero-action
   return? probe consumed the budget?) ظ¤ read it off runs[] in the JSON, do not guess.

GATES
- pytest -q must pass fully before you report anything. Quote the count.
- NO kaggle submit this pair. NO deletions. NO secrets.
- Do NOT weaken the zero-actions guard from pair 63 ظ¤ this fix is in the merge, not the scorer.
- Quote every score with its run's age and its binding side (coverage vs efficiency).

REPORT BACK: pytest count, the 5-row new table, which rows changed, and the sb26 root cause.
```

