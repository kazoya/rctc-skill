# Lessons from prior ARC projects (do NOT regress)

## From C:\arc_solver_web (AGI-2) — CRITICAL
1. Task-ID memorization → 0.00 on hidden (AGI2_ZERO_SCORE_POSTMORTEM)
2. Train-fit false positives (120/120 train, 0/120 test)
3. Soft leakage via studied eval IDs (V10_HIDDEN_TRANSFER)
4. Packaging ≠ score; scorer was healthy — solver failed
5. Do NOT copy AGI-2 rulebanks / ID maps into AGI-3

## From C:\arc_solver_web_agi3
1. Restrict actions to available_actions (click-only vs move-only games)
2. Prefix key game_id.split("-")[0] only
3. 37k plays / 0 wins = wasted MAX_ACTIONS theater — need verified level banks
4. Official daily submit limit is 1 for AGI-3 (not 5)

## Reuse NOW
- Plan-replay MyAgent + banked plans (tu93 9/9) + MAX_ACTIONS=500
- available_actions already enforced in PlanRunner
- Live baseline 0.17 must not be replaced by weaker/random agent
