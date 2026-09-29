# Tests — AI Portability Advisor

## Generate fixtures

```powershell
cd C:\rctc-skill\ai-portability-advisor
python tests\generate_fixtures.py
```

## Validate reports (stdlib)

```powershell
python scripts\validate_report_schema.py tests\fixtures\report-scenario-01-valid.json tests\fixtures\report-scenario-02-valid.json tests\fixtures\report-scenario-03-valid.json
python scripts\validate_report_schema.py tests\fixtures\report-scenario-invalid-migrate.json
# expect: first command OK, second FAIL
```

## Install safety

```powershell
powershell -NoProfile -File tests\test_install_safety.ps1
```

## Scenario review

Read `scenarios/*.md` and confirm fixture JSON aligns with `expected-behaviors.yaml`.

No pytest required in v1; validator + install script provide automated checks.
