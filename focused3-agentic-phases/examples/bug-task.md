# Example — Bug cell

Use when behavior is wrong, not when a feature is missing.

## TASK (illustrative)

README lists `docs/SECURITY.md` but the file is absent. A later agent claimed "security docs complete".

## RISK

LOW if the fix is "stop claiming it exists". MEDIUM if someone "fixed" it by adding a fake complete security program.

## THINK

```
TASK: Align documentation claims with the repository.
CURRENT STATE: [VERIFIED] inspect docs/ and README. Count files. Do not trust the claim.
DESIRED STATE: README only names files that exist, OR the missing file is intentionally created as a real artifact (only if that is the authorized task).
SCOPE: documentation honesty.
NON-GOALS: implementing RLS, adding a security product, writing a full SECURITY.md unless authorized.
```

## AGENTS

Builder: Documentation Agent  
Verifier: DiffAuditor  
Supervisor: skip if LOW and the change is a README line.

## PROVE

`Test-Path` / directory listing. `[VERIFIED]` file exists or README no longer cites it.

Fake progress: creating an empty SECURITY.md titled "TODO" is not a security program. Confidence stays `planned` or `scaffolded`.
