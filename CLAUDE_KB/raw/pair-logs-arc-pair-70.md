╪ز╪ص┘é┘ّ┘é╪ز ┘à┘ ╪د┘╪ز┘é╪▒┘è╪▒ ┘à╪ذ╪د╪┤╪▒╪ر┘ï ┘┘è ╪د┘┘à╪│╪ز┘ê╪»╪╣ ظ¤ **╪د┘╪ث╪▒╪ذ╪╣ ┘┘é╪د╪╖ ╪╡╪ص┘è╪ص╪ر╪î ┘ê╪د┘╪«╪│╪د╪▒╪ر ┘╪╣┘╪د┘ï ┘┘à ╪ز╪ز╪ص┘é┘ّ┘é ╪ذ╪╣╪»**╪î ┘┘â┘ ╪د┘╪╣┘è╪ذ ╪ث╪│┘ê╪ث ┘é┘┘è┘╪د┘ï ┘à┘à┘ّ╪د ┘ê┘╪╡┘:

**1) ┘à┘╪ز╪د╪ص ╪د┘╪ز╪▒╪ز┘è╪ذ (`src/agi3/hybrid.py:593`)** ┘à╪ج┘â┘┘ّ╪» ╪ص╪▒┘┘è╪د┘ï:
```python
best = max(runs, key=lambda r: (r["levels_completed"], -r["seconds"]))
```
┘╪د ╪░┘â╪▒ ┘┘`score` ╪▒╪║┘à ╪ث┘ `score_row` (╪│╪╖╪▒ 427) ┘è╪ص╪│╪ذ┘ç ┘┘â┘ ╪░╪▒╪د╪╣ ┘┘è ╪د┘╪ص┘┘é╪ر ╪ث╪╣┘╪د┘ç ┘à╪ذ╪د╪┤╪▒╪ر (╪│╪╖╪▒ 588ظô589). ┘┘à╪س╪د┘┘â ╪»┘é┘è┘é: ╪╣┘╪» ╪ز╪╣╪د╪»┘ 6/6 ┘è┘┘ê╪▓ ╪د┘╪ث╪│╪▒╪╣ ╪▓┘à┘┘è╪د┘ï ┘╪د ╪د┘╪ث╪╣┘┘ë ┘┘é╪د╪╖╪د┘ï╪î ┘ê╪د┘╪ز╪╣┘┘è┘é ┬سTies go to the cheaper runظخ never displaces an equal first arm┬╗ ┘è╪╡┘ ┘┘è┘ّ╪ر **╪س╪ذ╪د╪ز ╪د┘╪ز╪▒╪ز┘è╪ذ** ╪ذ┘è┘┘à╪د ╪د┘┘â┘ê╪» ┘è┘┘┘ّ╪░ **╪د┘╪ث╪│╪▒╪╣**╪î ┘ê┘ç┘à╪د ╪┤┘è╪خ╪د┘ ┘à╪«╪ز┘┘╪د┘.

**2) ╪ث╪«╪╖╪▒ ┘à┘à┘ّ╪د ┘┘è ╪ز┘é╪▒┘è╪▒┘â:** ┘╪▒╪╣ ╪د┘╪د╪│╪ز╪س┘╪د╪ة ┘┘è `_run_arm` (╪│╪╖┘ê╪▒ 541ظô553) ┘è╪╣┘è╪» `levels_completed: 0` ┘ê`win_levels: 0` ┘ê`status: "error"` ┘à╪╣ `seconds` ╪╡╪║┘è╪▒ ╪ش╪»╪د┘ï. ┘╪د┘╪░╪▒╪د╪╣ ╪د┘╪░┘è **┘è┘┘ç╪د╪▒ ┘┘è 0.01s** ┘è┘ç╪▓┘à ظ¤ ╪ز╪ص╪ز `-seconds` ظ¤ ╪ز╪┤╪║┘è┘╪د┘ï ╪ص┘é┘è┘é┘è╪د┘ï 0/8 ╪د╪│╪ز╪║╪▒┘é 89s. ╪د┘┘╪ز┘è╪ش╪ر ╪د┘┘à┘╪┤┘ê╪▒╪ر ╪ز╪╡╪ذ╪ص `0/0 error`╪î ╪ث┘è ╪ث┘ `win_levels` ┘┘╪│┘ç ┘è┘┘ç╪د╪▒ ┘┘è ╪د┘┘à╪«╪▒╪ش╪د╪ز╪î ┘╪د ┘à╪ش╪▒╪» ╪د┘╪ص╪د┘╪ر.

**3) ┘╪د ╪د╪«╪ز╪ذ╪د╪▒ ┘è╪ص╪▒╪│ ┘ç╪░╪د:** `tests/test_agi3_hybrid.py:211` ┘è╪ج┘â┘ّ╪» ╪د┘╪▒╪ز╪د╪ذ╪ر ┘┘é╪╖ (`>= runs[0]`)╪î ┘ê┘ç┘è ╪ز╪╡┘à╪» ╪ص╪ز┘ë ┘à╪╣ ╪د┘┘à┘╪ز╪د╪ص ╪د┘╪«╪د╪╖╪خ.

**4) ╪د┘╪ز╪│╪▒┘è╪ذ ╪ح┘┘ë ╪د┘╪ز┘é╪▒┘è╪▒:** `write_score_report` (╪│╪╖┘ê╪▒ ~789ظô797) ┘è╪ذ┘┘è `runs_by_game` ┘à┘ `rows` ┘┘é╪╖ ╪س┘à ┘è┘à╪▒┘ّ╪▒┘ç ╪ح┘┘ë `best_run_score`╪î ┘┘`max` ╪د┘╪▒╪│┘à┘è ┘╪د ┘è╪▒┘ë ╪ث╪ذ╪»╪د┘ï ┘┘é╪د╪╖ ╪د┘╪░╪▒╪د╪╣ ╪د┘╪«╪د╪│╪▒ ╪د┘┘à╪ص┘┘ê╪╕╪ر ┘┘è `runs` ظ¤ ╪ذ┘è┘┘à╪د ┘ç┘ê ╪╣┘┘ë ╪د┘╪ذ╪╖╪د┘é╪ر ╪ز╪┤╪║┘è┘ ╪ص┘é┘è┘é┘è ┘┘╪╣╪ذ╪ر ┘┘╪│┘ç╪د ┘ê┘è╪ص┘é┘ّ ┘┘ç ╪»╪«┘ê┘ ╪د┘┘`max`.

**╪ص╪د┘╪ر ╪د┘╪ث╪»┘╪ر:** `experiments/agi3_hybrid_smoke.json` ┘é╪»┘è┘à ┘╪╣┘╪د┘ï ظ¤ `runs` ┘ê╪د╪ص╪» ┘┘â┘ ┘╪╣╪ذ╪ر ┘ê`score: null` ┘┘è ╪د┘╪│╪ز╪ر ┘â┘┘ç╪د (ls20/vc33/ft09/cd82/sp80/ar25)╪î ┘┘╪د ╪│┘é┘ê╪╖ ┘ê┘é╪╣ ╪ص╪ز┘ë ╪د┘╪ت┘.

**╪ز╪ص┘┘ّ╪╕ ╪╣┘┘ë ╪د┘╪ح╪╡┘╪د╪ص ╪د┘┘à┘é╪ز╪▒╪ص:** ╪ز╪▒╪ز┘è╪ذ `score` ╪ث┘ê┘╪د┘ï ┘é╪» ┘è┘╪╢┘ّ┘ ╪ز╪┤╪║┘è┘╪د┘ï ╪ذ┘à╪│╪ز┘ê┘è╪د╪ز ╪ث┘é┘ ┘ê┘┘é╪د╪╖ ╪ث╪╣┘┘ë (╪│┘é┘ ╪د┘╪ز╪║╪╖┘è╪ر ┘è╪│┘à╪ص ╪ذ╪░┘┘â ┘╪╕╪▒┘è╪د┘ï) ┘ê┘è┘â╪│╪▒ ╪د┘╪▒╪ز╪د╪ذ╪ر ╪د┘┘à╪╣┘┘╪ر╪ؤ ┘╪░┘┘â ╪ث╪س╪ذ┘ّ╪ز `levels` ╪ث┘ê┘╪د┘ï ┘ê`score` ╪س╪د┘┘è╪د┘ï╪î ┘ê╪ث┘ê╪س┘ّ┘é ╪د┘╪ص╪د┘╪ر ╪د┘╪ص╪»┘ّ┘è╪ر ╪ذ╪»┘ ╪د╪ذ╪ز┘╪د╪╣┘ç╪د.

**┘à┘╪«╪╡ ╪د┘╪ز┘é╪»┘ّ┘à (╪▓┘ê╪ش 70/210) ظ¤ ╪س┘╪د╪س╪ر ╪ث╪│╪╖╪▒:**
1. ┘à╪│╪د╪▒ ARC: ╪╣┘è╪ذ ┘â╪د┘à┘ ┘à╪ج┘â┘┘ّ╪» ┘┘è ╪»┘à╪ش ╪د┘╪ث╪░╪▒╪╣ (╪ز╪▒╪ز┘è╪ذ ╪▓┘à┘┘è ╪ذ╪»┘ ┘┘é╪د╪╖┘è) + ╪د┘┘ç┘è╪د╪▒ `win_levels` ╪╣┘╪» ╪«╪╖╪ث ╪░╪▒╪د╪╣╪ؤ ┘┘à ┘è┘┘┘ê┘┘ّ╪س ╪ث┘è ╪»┘┘è┘ ┘à┘╪┤┘ê╪▒ ╪ذ╪╣╪».
2. ╪ث╪»┘ê╪د╪ز Cursor ╪د┘┘à╪│╪ز╪«╪»┘à╪ر ┘ç╪░╪د ╪د┘╪▓┘ê╪ش: ┘é╪▒╪د╪ة╪ر/╪ز┘╪ز┘è╪┤ ┘à╪ص┘┘è ┘┘┘à╪╡╪»╪▒ ┘ê╪د┘╪د╪«╪ز╪ذ╪د╪▒╪د╪ز + ┘╪ص╪╡ `experiments/*.json` ظ¤ ╪ذ┘╪د Kaggle CLI ┘ê╪ذ┘╪د ╪ث┘è ╪▒┘╪╣.
3. ╪د┘╪ذ┘ê╪د╪ذ╪ر: ┘╪د ╪ز╪│┘┘è┘à ARC ┘é╪ذ┘ ╪ح╪╡┘╪د╪ص ╪د┘┘à┘╪ز╪د╪ص + ╪د╪«╪ز╪ذ╪د╪▒┘┘è ╪ص╪▒╪د╪│╪ر + ╪ح╪╣╪د╪»╪ر ╪ز┘ê┘┘è╪» ╪د┘╪»┘┘è┘ ╪ذ┘┘é╪د╪╖ ╪║┘è╪▒ `null`.

```text
TRACK: ARC-AGI-3 ظ¤ pair 70/210. Fix the arm-merge ranking in src/agi3/hybrid.py. No Kaggle submit this pair.

CONTEXT (verified, do not re-litigate):
- src/agi3/hybrid.py:593 ranks merged arms by (levels_completed, -seconds). `score` is computed for every run at lines 588-589 but never used to pick the winner.
- src/agi3/hybrid.py:541-553 (_run_arm except branch) returns levels_completed=0, win_levels=0, status="error", secondsظëê0.0. Under -seconds a crashed arm BEATS a genuine 0-level 89s run, and the merged row then publishes 0/0 error.
- tests/test_agi3_hybrid.py:211 only asserts monotonicity vs runs[0]; it passes with the broken key.
- write_score_report (~lines 789-797) builds runs_by_game from `rows` only, so best_run_score never sees the losing arm's score stored in row["runs"].

TASK 1 ظ¤ ranking key (hybrid.py ~588-594)
Replace the max() with an index-stable, score-aware, error-demoting key:

    def _merge_key(item):
        idx, r = item
        s = r.get("score")
        return (
            r["levels_completed"],
            -1.0 if s is None else float(s),
            0 if r.get("status") == "error" else 1,
            -idx,
        )
    best = max(enumerate(runs), key=_merge_key)[1]

Rewrite the comment above it to state the real rule, in this order:
levels first (never report fewer levels than the first arm), then the card
score (equal levels are separated by points, not by wall clock), then a
non-error run beats a crashed one, then earliest arm wins so a fallback never
displaces an equal first arm. Delete the "cheaper run" wording ظ¤ seconds must
not appear in the key at all. Add one line noting the documented edge case:
a run with fewer levels but a higher score is NOT promoted, by design.

TASK 2 ظ¤ card max over all runs (write_score_report)
Collect every run's score per game, not just the merged row's:

    for r in rows:
        key = str(r.get("game_id") or r.get("game"))
        cand = [r.get("score")] + [x.get("score") for x in (r.get("runs") or [])]
        vals = [float(v) for v in cand if isinstance(v, (int, float))]
        if vals:
            runs_by_game.setdefault(key, []).extend(vals)

Keep `scored`/`runs_scored` semantics coherent with the new collection (a game
counts as played if ANY of its runs scored). Update the docstring comment to say
the max is taken over every run of the game, including fallback arms, because
each is a real play on the card.

TASK 3 ظ¤ guard tests (tests/test_agi3_hybrid.py), monkeypatching _run_arm:
  a) test_equal_levels_are_broken_by_score_not_seconds: two arms, both 6/6;
     arm A seconds=85 score=41.0, arm B seconds=20 score=8.0 -> merged row
     must report arm A and score 41.0.
  b) test_a_crashed_arm_never_wins_the_merge: first arm status="error",
     levels 0, win_levels 0, seconds 0.01; second arm status="stalled",
     levels 0, win_levels 8, seconds 60.0 -> merged row must report the second
     arm, win_levels 8, status "stalled" (regression for `0/8 sent 0 stalled`).
  c) test_ties_go_to_the_first_arm: two identical rows (same levels, same
     score, both non-error) -> merged arm == runs[0]["arm"], i.e. fell-back
     arm does not displace it.
  d) test_card_max_sees_the_losing_arm_score: build rows where the winning row
     scores 10.0 and row["runs"] holds a 40.0 run of the same game_id ->
     write_score_report's played_mean uses 40.0.

TASK 4 ظ¤ evidence
Run: python -m pytest tests/test_agi3_hybrid.py tests/test_agi3_score_markers.py -q
Then regenerate the smoke evidence with the same command that produced
experiments/agi3_hybrid_smoke.json (keep the existing budget), writing to
experiments/agi3_hybrid_merge_pair70.json. Report in the reply:
 - full pytest tail (counts, not a claim),
 - a 6-row table game | first_arm | winning arm | levels | score | secs,
 - whether any score is still null and, if so, which game_id lacks a baseline,
 - a one-line diff summary of hybrid.py.
Do NOT touch experiments/agi3_hybrid_smoke.json, do not submit anything to
Kaggle, and do not edit docs/agi3_score_measured.md by hand ظ¤ regenerate it if
the runner writes it.
```

