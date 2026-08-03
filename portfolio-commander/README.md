# Portfolio Commander

**Open-source Cursor portfolio manager** — scan workspaces, rank projects, dormancy rules, local XML registry, private dashboard. Pairs with [RCTC](https://github.com/kazoya/rctc-skill).

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Cursor](https://img.shields.io/badge/Cursor-ready-6C3483)](https://cursor.com)

> Your project paths **never** ship to GitHub — only this template. Data stays in `%USERPROFILE%\.cursor\portfolio\`.

## Why

- One XML registry for every Cursor project you touch
- **Active** vs **dormant** (سكون) — agents skip dev on dormant repos
- **Priority 1–5** and **revenue** flags you control
- Dashboard + copy-paste agent requests
- Engineering mind path (`SKILL.md`, rules) — skipped for Flutter/Dart

## Quick install (Windows)

```powershell
git clone https://github.com/kazoya/rctc-skill.git
cd rctc-skill\portfolio-commander
.\scripts\install.ps1
python "$env:USERPROFILE\.cursor\portfolio\scripts\scan_projects.py"
start "$env:USERPROFILE\.cursor\portfolio\dashboard\index.html"
```

Copy skill to Cursor: see `skill/SKILL.md` → `%USERPROFILE%\.cursor\skills\portfolio-commander\`

## Share (viral one-liner)

```
Open-source Cursor dashboard: rank your repos, mark dormant projects, stop AI from coding the wrong folder — github.com/kazoya/rctc-skill/tree/master/portfolio-commander
```

Arabic:

```
لوحة مشاريع Cursor مفتوحة المصدر — أولويات، سكون، وXML محلي بدون رفع مساراتك — github.com/kazoya/rctc-skill
```

## Docs

- [Start here (AR)](docs/START-HERE-AR.md)
- [Prioritization & XML fields](docs/PRIORITIZATION-AR.md)
- [Privacy model](docs/PRIVACY.md)

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Made with love for the people of Gaza.**

</div>
