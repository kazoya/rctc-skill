# Ethical Bug-Bounty Training Track / مسار تدريب Bug Bounty الأخلاقي

> **Education / Ethical hacking / Cybersecurity demo only.**  
> للتعليم والإيثيكال هاكينغ وتجربة الأمن السيبراني كديمو فقط — مع الالتزام بالاتفاقيات وسياسة الاستخدام والقانون.  
> See: [SAFETY_MODEL.md](SAFETY_MODEL.md) · [ETHICAL_USE](../../docs/ETHICAL_USE.md) · [Packaging](../../docs/BUG_BOUNTY_PACKAGING_PROPOSAL.md)

**North Star:** Teach people to find and report vulnerabilities responsibly — **not** to attack systems.

> **RCTC-SKILLS motto / شعار:**  
> ليست كل الحكم تصلح دائماً ولكن من طلب العلى سهر الليالي ^_^  
> _Not every rule fits every case — but those who seek excellence keep the night watch. ^_^_

## Portland–Pozzolanic packaging
| Layer | Path | Audience |
|---|---|---|
| Portland (Free MIT) | `en/`, `ar/`, `scope-guard/`, `examples/`, `scripts/` | Everyone |
| Pozzolan (Pro) | `pro/` | Buy Me a Coffee + [Coffee Pass](https://github.com/kazoya/rctc-skill/issues/new?template=coffee_pass.yml) |

## Languages
| Module | English | العربية |
|---|---|---|
| 00 Ethics & scope | [en/00](en/00-ethics-authorization-and-scope.md) | [ar/00](ar/00-ethics-authorization-and-scope.md) |
| 01 Safe recon | [en/01](en/01-safe-recon-and-scope-analysis.md) | [ar/01](ar/01-safe-recon-and-scope-analysis.md) |
| 02 Labs | [en/02](en/02-vulnerability-reasoning-labs.md) | [ar/02](ar/02-vulnerability-reasoning-labs.md) |
| 03 Reports | [en/03](en/03-report-writing.md) | [ar/03](ar/03-report-writing.md) |
| 04 Triage | [en/04](en/04-triage-and-responsible-disclosure.md) | [ar/04](ar/04-triage-and-responsible-disclosure.md) |
| 05 Platforms | [en/05](en/05-platform-workflows.md) | [ar/05](ar/05-platform-workflows.md) |

## Scope Guard
```bash
node scope-guard/scope-guard.js fixtures/valid/local-lab-context.json
node scope-guard/scope-guard.js fixtures/invalid/uncertain-live-target.json
```
Uncertainty → `INSUFFICIENT_SCOPE_EVIDENCE` (STOP/GAP). Guard **does not scan**.

## Validate
```bash
node scripts/validate-track.js
```

## Capability
`ethical-bugbounty-training` — [manifest](../../capabilities/ethical-bugbounty-training.json)
