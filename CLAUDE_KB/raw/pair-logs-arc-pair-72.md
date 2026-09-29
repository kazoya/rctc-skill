**╪د┘┘╪ص╪╡ ┘é╪ذ┘ ╪╡┘è╪د╪║╪ر ╪د┘╪ذ╪▒┘ê┘à╪ذ╪ز (┘é╪▒╪ث╪ز ╪د┘┘à┘┘ ┘╪╣┘┘è╪د┘ï):**

- `src/agi3/hybrid.py:593` ┘ç┘ê ┘à┘ê╪╢╪╣ ╪د┘╪«┘┘: `best = max(runs, key=lambda r: (r["levels_completed"], -r["seconds"]))`.
- ╪س┘╪د╪س ╪╣┘è┘ê╪ذ ╪ص┘é┘è┘é┘è╪ر ┘┘è ┘ç╪░╪د ╪د┘┘à┘╪ز╪د╪ص:
  1. **`score` ╪║╪د╪خ╪ذ ╪ز┘à╪د┘à╪د┘ï** ╪▒╪║┘à ╪ث┘ `hybrid_play` ┘è╪ص╪│╪ذ┘ç ┘┘â┘ ╪░╪▒╪د╪╣ ┘┘è ╪د┘╪│╪╖╪▒ 589ظّ590 ╪س┘à ┘è┘ç┘à┘┘ç ╪╣┘╪» ╪د┘╪د╪«╪ز┘è╪د╪▒ ظ¤ ┘╪░╪▒╪د╪╣ ╪ذ┘┘╪│ ╪╣╪»╪» ╪د┘┘à╪│╪ز┘ê┘è╪د╪ز ┘┘â┘ ╪ذ┘┘é╪د╪╖ ╪▒╪│┘à┘è╪ر ╪ث╪╣┘┘ë (`sent_actions` ╪ث┘é┘) ┘è╪«╪│╪▒ ╪ث┘à╪د┘à ╪░╪▒╪د╪╣ ╪ث╪│╪▒╪╣ ╪ذ╪د┘╪│╪د╪╣╪ر.
  2. **`-seconds` ┘à┘é┘è╪د╪│ ╪ت┘╪ر ┘╪د ┘à┘é┘è╪د╪│ ┘╪╣╪ذ╪ر** ظ¤ ┘┘╪│ ╪د┘╪ز╪┤╪║┘è┘╪ر ╪ز╪╣╪╖┘è ╪ز╪▒╪ز┘è╪ذ╪د┘ï ┘à╪«╪ز┘┘╪د┘ï ╪╣┘┘ë ╪ش┘ç╪د╪▓ ╪ت╪«╪▒ ╪ث┘ê ╪ز╪ص╪ز ╪ص┘┘à┘╪î ┘╪د┘┘╪ز┘è╪ش╪ر ╪║┘è╪▒ ┘é╪د╪ذ┘╪ر ┘╪ح╪╣╪د╪»╪ر ╪د┘╪ح┘╪ز╪د╪ش.
  3. **╪د┘╪ز╪╣╪د╪»┘ ┘è┘╪ص╪│┘à ╪ذ╪ز╪▒╪ز┘è╪ذ `runs`** (╪ز╪▒╪ز┘è╪ذ ╪د┘┘à╪│╪ذ╪د╪▒/`FALLBACK_ORDER` ┘┘è 100ظّ104)╪î ╪ث┘è ┘╪د ┘è┘ê╪ش╪» ╪ز╪▒╪ز┘è╪ذ ┘â┘┘ّ┘è ┘à┘╪╣╪▒┘┘ّ┘ ╪╣┘┘ë ╪د┘╪ذ┘è╪د┘╪د╪ز ┘┘╪│┘ç╪د╪ؤ ┘ê╪╡┘ `status == "error"` (╪د┘╪│╪╖╪▒ 545) ┘╪د ┘è┘╪╣╪د┘é┘╪ذ ╪ث╪╡┘╪د┘ï╪î ┘╪╡┘ ┘à┘┘ç╪د╪▒ ┘é╪» ┘è┘à╪س┘ّ┘ ╪د┘┘╪╣╪ذ╪ر ╪ص┘è┘ ╪ز┘â┘ê┘ ┘â┘ ╪د┘╪ث╪░╪▒╪╣ ╪╡┘╪▒╪د┘ï.
- ┘è┘ê╪ش╪» ╪╣┘╪▒┘ ╪ذ┘è╪ز┘è ┘à╪╢╪د╪» ╪ذ╪د┘┘╪╣┘ ┘┘è `src/agi3/score.py:760ظّ768`: ╪ث┘╪╢┘ ┘┘é╪د╪╖ ظ ╪س┘à ╪د┘╪ص╪»┘ّ ╪د┘╪ث╪»┘┘ë ظ ╪س┘à ╪ث┘é┘ `total_actions`. ┘╪د ╪░┘â╪▒ ┘┘╪س┘ê╪د┘┘è. `hybrid_play` ┘ç┘ê ╪د┘╪د╪│╪ز╪س┘╪د╪ة ╪د┘╪┤╪د╪░ ┘ê┘è╪ش╪ذ ╪ث┘ ┘è╪ز╪ذ╪╣ ┘┘╪│ ╪د┘╪╣┘╪▒┘.

╪د┘╪ذ╪▒┘ê┘à╪ذ╪ز ╪د┘╪ز┘┘┘è╪░┘è ┘┘╪▓┘ê╪ش 72 (ARC ┘┘é╪╖╪î ╪ذ┘╪د ╪ث┘è ╪ز╪│┘┘è┘à Kaggle):

```text
TRACK: ARC-AGI-3 ظ¤ offline only. NO Kaggle submit, NO network calls in tests.
REPO: C:\ArabBank\arc_prize_2026

GOAL: make hybrid arm selection a deterministic total order on the run record itself,
so neither wall-clock speed nor list position can decide which arm represents a game.

1) EDIT src/agi3/hybrid.py

Add a module-level constant next to ARMS (line ~69) and a public function above hybrid_play:

    ARM_ORDER: dict[str, int] = {arm: i for i, arm in enumerate(ARMS)}

    def rank_key(run: dict) -> tuple:
        """Total order over arm runs: higher tuple wins under max()/sorted().

        Wall-clock seconds is deliberately absent: it is a property of the
        machine, not of the play, and ranking on it makes the winning row
        irreproducible across hosts.  The order mirrors score.py:760-768 --
        levels banked, then official points, then actions spent.
        """
        score = run.get("score")
        return (
            int(run.get("levels_completed") or 0),
            0 if str(run.get("status")) == "error" else 1,
            1 if score is not None else 0,
            float(score) if score is not None else 0.0,
            -int(run.get("sent_actions") or 0),
            -ARM_ORDER.get(str(run.get("arm")), len(ARMS)),
        )

Then replace line 593 and its comment with:

    # Ranked on the record, not on the clock: see rank_key.  When two runs tie
    # on every component, max() keeps the earlier one, so a fallback still
    # never displaces an equal first arm.
    best = max(runs, key=rank_key)

Export "rank_key" and "ARM_ORDER" in __all__ (the list starting line ~60).
Do NOT touch _run_arm, score_row, choose_arm, FALLBACK_ORDER, or write_report.

2) ADD TESTS in tests/test_agi3_hybrid.py (pure dicts, no env, no network):

  a. test_rank_key_ignores_wall_clock:
     two runs, identical levels/score/sent_actions, seconds 1.0 vs 900.0
     -> rank_key equal for both.
  b. test_higher_official_score_beats_faster_arm:
     A = levels 1, score 40.0, sent_actions 300, seconds 5.0
     B = levels 1, score 90.0, sent_actions 120, seconds 60.0
     -> max([A,B], key=rank_key)["arm"] == B's arm.
  c. test_scored_run_beats_unscorable_run:
     same levels, one score=None -> the scored one wins; and rank_key(None-run)
     must not raise.
  d. test_error_row_never_represents_the_game:
     all runs levels 0, one status "error" and one status "stalled"
     -> the stalled one wins.
  e. test_more_levels_still_dominates_points:
     levels 2 / score 10.0 beats levels 1 / score 300.0.
  f. test_rank_key_is_a_total_order_over_arms:
     build the three ARMS with fully identical payloads, assert
     sorted(runs, key=rank_key) is stable and independent of input permutation
     (shuffle-proof: compare sorted arm sequence over all 6 permutations).
  g. test_equal_runs_keep_the_first_arm:
     two fully identical dicts differing only in "arm";
     max(..., key=rank_key) returns whichever ARMS-earlier arm the tuple picks ظ¤
     assert the documented behaviour explicitly, no ambiguity left in the test.

3) RUN and record:
   python -m pytest tests/test_agi3_hybrid.py tests/test_agi3_armbench.py tests/test_agi3_armrescue.py tests/test_agi3_score.py -q
   then the full suite: python -m pytest -q
   If any existing test asserted the old seconds-based tie rule, do NOT weaken
   rank_key ظ¤ report the exact test name and line, and fix the test only if its
   assertion was about the clock rather than about the fallback contract.

4) EVIDENCE: write evidence/agi3_rank_key_p72.json with
   {"pair": 72, "file": "src/agi3/hybrid.py", "old_key": "(levels, -seconds)",
    "new_key": "(levels, not_error, is_scored, score, -sent_actions, -arm_index)",
    "tests_added": [...], "pytest": "<passed/failed counts>", "utc": "<iso>"}

5) REPORT BACK: the diff hunk of hybrid.py, the pytest tail line, and whether any
   pre-existing test changed behaviour. Commit locally only (no push, no submit).
```

