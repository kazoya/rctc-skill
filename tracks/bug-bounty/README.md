# Ethical Bug-Bounty Training Track / مسار تدريب Bug Bounty الأخلاقي

> **Education / Ethical hacking / Cybersecurity demo only.**  
> للتعليم والإيثيكال هاكينغ وتجربة الأمن السيبراني كديمو فقط — مع الالتزام بالاتفاقيات وسياسة الاستخدام والقانون.  
> See also: [SAFETY_MODEL.md](SAFETY_MODEL.md) · [ETHICAL framing](../../docs/ETHICAL_USE.md) (if present)

**North Star:** Teach people to find and report vulnerabilities responsibly — **not** to attack systems.

## Languages
| Module | English | العربية |
|---|---|---|
| 00 Ethics & scope | [en/00-…](en/00-ethics-authorization-and-scope.md) | [ar/00-…](ar/00-ethics-authorization-and-scope.md) |
| 01 Safe recon | [en/01-…](en/01-safe-recon-and-scope-analysis.md) | [ar/01-…](ar/01-safe-recon-and-scope-analysis.md) |
| 02 Labs | [en/02-…](en/02-vulnerability-reasoning-labs.md) | [ar/02-…](ar/02-vulnerability-reasoning-labs.md) |
| 03 Reports | [en/03-…](en/03-report-writing.md) | [ar/03-…](ar/03-report-writing.md) |
| 04 Triage | [en/04-…](en/04-triage-and-responsible-disclosure.md) | [ar/04-…](ar/04-triage-and-responsible-disclosure.md) |
| 05 Platforms | [en/05-…](en/05-platform-workflows.md) | [ar/05-…](ar/05-platform-workflows.md) |

## Scope Guard
```bash
node scope-guard/scope-guard.js fixtures/valid/local-lab-context.json
node scope-guard/scope-guard.js fixtures/invalid/uncertain-live-target.json
```
Uncertainty → `INSUFFICIENT_SCOPE_EVIDENCE` (STOP/GAP). Guard **does not scan**.

## Safe demos
See [examples/](examples/) — localhost / synthetic only. No third-party production required.

## Validate
```bash
node scripts/validate-track.js
```

## Capability
`ethical-bugbounty-training` — see [../../capabilities/ethical-bugbounty-training.json](../../capabilities/ethical-bugbounty-training.json)

## Packaging
Proposal only: [../../docs/BUG_BOUNTY_PACKAGING_PROPOSAL.md](../../docs/BUG_BOUNTY_PACKAGING_PROPOSAL.md)
