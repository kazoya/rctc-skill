# WEHM Layer 1 — ethical security learning map

## Strength order: foundations before power

| Tier | Sources | What to absorb | Exit gate |
|---:|---|---|---|
| 0 | OpenSSF, OWASP WSTG | secure-development baseline, testing methodology, evidence vocabulary | threat model plus written scope |
| 1 | PortSwigger Academy/Research Labs, pwn.college | controlled hands-on practice and reproducible lab notes | solve locally and explain remediation |
| 2 | CodeQL, Trail of Bits Testing Handbook | data flow, static/dynamic analysis, review automation, false-positive discipline | tested query/check or review recipe |
| 3 | AFL++, angr | fuzzing, harness design, symbolic/binary analysis and limitations | bounded lab result with reproducible artifact |
| 4 | Google Project Zero tools and 0-day RCAs | root-cause analysis, variant analysis, exploit-chain thinking, disclosure discipline | defensive RCA of an already disclosed/fixed case |

## Relationship graph

```text
OpenSSF ──secure design──┐
OWASP ──test method─────┴──▶ PortSwigger / pwn.college ──safe practice──┐
                                                                       ▼
Trail of Bits ──tool discipline──▶ CodeQL ──source flow──▶ AFL++ / angr
                                                                       │
                                                                       ▼
                                               Project Zero RCA ──▶ prevention
```

This is a learning progression, not a claim that one project depends on another.

## Read-first anchors

- OpenSSF: course README and secure-development modules.
- OWASP WSTG: introduction, testing framework, scenario structure.
- PortSwigger: Academy topic pages; run only official labs or local `research-labs`.
- pwn.college: official dojo map and rules before challenges.
- Trail of Bits: Testing Handbook introduction and tool-specific chapters.
- CodeQL: README, supported-query policy, language library, query tests.
- AFL++: `docs/fuzzing_in_depth.md` and best practices before running campaigns.
- angr: README/docs, loader, IR, CFG, symbolic-execution constraints.
- Project Zero: `p0tools` docs and `0days-in-the-wild` RCA index; use disclosed/fixed cases.

## Layer-1 exercises

1. Draw a trust-boundary diagram for a toy web app.
2. Convert one WSTG scenario into a local test plan with stop conditions.
3. Solve one official beginner lab and write cause, impact, remediation, and regression test without publishing secrets.
4. Read one supported CodeQL query and identify source, sink, sanitizer, tests, and false-positive controls.
5. Read one public RCA and list the original bug, missed variants, fix class, and prevention opportunities.

## Exit gate

Do not advance because a tool ran successfully. Advance when the learner can explain authorization, mechanism, evidence, impact, limitations, remediation, and a safe verification plan.
