# Programmer essentials

**Twenty daily skills, plus Taste Skill.** One job per folder. Install the row you need, not the whole table.

These skills ship with [kazoya/rctc-skill](https://github.com/kazoya/rctc-skill). Taste Skill's full rulebook is vendored unmodified from [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill).

Install · Skills · Settings · License

## Installing

```bash
git clone --depth 1 https://github.com/kazoya/rctc-skill.git .rctc-skill
```

Copy one folder into `.cursor/skills/<install-name>/`. The install name is the `name:` field, which matches the folder name.

Upstream install, if you want Leonxlnx's CLI path instead of the vendored file:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

## Skills

| Skill (folder) | Install name | Description |
|---|---|---|
| **design-taste-rctc** | `design-taste-rctc` | Brief, three dials, official design system, pre-flight. |
| **design-taste-frontend** | `design-taste-frontend` | Vendored Taste Skill. Path: `vendor/leonxlnx-taste-skill/design-taste-frontend/`. |
| **owner-credential-vault** | `owner-credential-vault` | OS store for secrets the operator owns. |
| **git-worktree-flow** | `git-worktree-flow` | Worktree, small pull request. |
| **pr-review-surgeon** | `pr-review-surgeon` | Bugs, security, missing tests. |
| **debugger-hypothesis** | `debugger-hypothesis` | Hypothesis, observation, fix. |
| **api-error-contracts** | `api-error-contracts` | Stable error codes. |
| **sql-migration-safety** | `sql-migration-safety` | Expand, then contract. |
| **test-first-slice** | `test-first-slice` | Failing test first. |
| **github-actions-min-ci** | `github-actions-min-ci` | Small CI workflow. |
| **docker-compose-dev** | `docker-compose-dev` | Local dependencies. |
| **a11y-rtl-web** | `a11y-rtl-web` | Keyboard and Arabic RTL. |
| **web-vitals-budget** | `web-vitals-budget` | LCP, INP, CLS. |
| **twelve-factor-config** | `twelve-factor-config` | Env config, no secrets in git. |
| **observability-starter** | `observability-starter` | Request id and ready versus health. |
| **refactor-characterization** | `refactor-characterization` | Behavior lock, then move. |
| **typescript-boundaries** | `typescript-boundaries` | Parse untrusted input. |
| **release-notes-from-git** | `release-notes-from-git` | Notes from the log. |
| **supply-chain-pinning** | `supply-chain-pinning` | Lockfile installs. |
| **incident-debug-playbook** | `incident-debug-playbook` | Mitigate, then explain. |
| **consistent-character-video** | `consistent-character-video` | Character bible. Dialect is not the video model. |

### Which one should I use?

- **design-taste-rctc** when you are choosing the page direction.
- **design-taste-frontend** when you are writing the interface and need the long rulebook.
- **owner-credential-vault** for tokens you created. **logged-in-browser** (repo root) when Chrome is already signed in.

## Settings

- **DESIGN_VARIANCE**: 1 centered, 10 asymmetric.
- **MOTION_INTENSITY**: 1 still, 10 cinematic. Honor reduced motion.
- **VISUAL_DENSITY**: 1 airy, 10 dense.

## License

Repository MIT, copyright Suhaib Asrawi. Vendored Taste Skill MIT, copyright (c) 2026 Leonxlnx.
