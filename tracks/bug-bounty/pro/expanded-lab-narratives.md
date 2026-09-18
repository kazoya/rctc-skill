# Expanded lab narratives (Pro)

All scenarios are localhost / synthetic. Network to third parties stays off.

## Narrative A — Access control assumption
Fixture: `examples/lab/mock-api-access.json`  
Ask: What did the designer assume? What smallest check falsifies it in-lab?

## Narrative B — Reflection vs impact
File: `examples/lab/reflection-demo.html`  
Ask: Is reflection alone impact? What victim interaction would be required *in lab*? Write observation vs impact columns.

## Narrative C — Synthetic HTTP reasoning
File: `examples/synthetic/sample-get.http.json`  
Ask: Hypothesize a misconfiguration class **without** sending packets. Document UNKNOWN fields.

## Mentor prompt (RCTC)
Role: defensive coach  
Task: run narratives A→C; produce three mini-reports  
Constraints: no network; no third-party targets; no weaponized payloads
