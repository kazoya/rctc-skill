# RCTC Skills

**Evidence-first skills for coding agents.** Make the brief precise, then do the work and show proof.

Portable Agent Skills for Cursor, Claude Code, and Codex. The root skill is [RCTC](SKILL.md): Role, Context, Task, Constraints. It does not turn a clear request into an interview.

Author: [Suhaib Asrawi (@kazoya)](https://github.com/kazoya). Provenance: [AUTHORS.md](AUTHORS.md).

Design work in this repo pairs two skills: the vendored [Taste Skill](vendor/leonxlnx-taste-skill/design-taste-frontend/SKILL.md) by [Leonxlnx](https://github.com/Leonxlnx/taste-skill) (MIT), and the RCTC adapter [design-taste-rctc](packs/programmer-essentials-20/design-taste-rctc/SKILL.md).

The Arabic course that builds an agent by hand lives in its own MIT repo: [build-your-own-agent-ar](https://github.com/kazoya/build-your-own-agent-ar). This repository is the ready-skills step at the end of that path, not the course itself.

## Disclaimer

This repository has no token, coin, or crypto project. Taste Skill is Leonxlnx's project. The copy under `vendor/leonxlnx-taste-skill/` keeps his copyright and MIT license. It is not a rebrand and it does not replace his repository.

Disclaimer · Install · Skills · Settings · Examples · FAQ · License · [Arabic course](https://github.com/kazoya/build-your-own-agent-ar)

## Feedback

Suggestions and bug reports: open a Pull Request or Issue on [kazoya/rctc-skill](https://github.com/kazoya/rctc-skill/issues).

## Installing

Clone the tree, then point the agent at the skill you need:

```bash
git clone --depth 1 https://github.com/kazoya/rctc-skill.git .rctc-skill
```

| Host | Where to copy `SKILL.md` |
|---|---|
| Cursor | `.cursor/skills/<install-name>/SKILL.md` |
| Claude Code | `.claude/skills/<install-name>/SKILL.md` |
| Codex | `.codex/skills/<install-name>/SKILL.md` |

The install name is the `name:` field in the skill frontmatter.

You can also paste a single `SKILL.md` into a ChatGPT or Codex conversation.

### Design taste (upstream plus this repo)

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

That command installs Leonxlnx's skill from his repository. This repo already vendors the same skill at `vendor/leonxlnx-taste-skill/design-taste-frontend/SKILL.md`. Use [design-taste-rctc](packs/programmer-essentials-20/design-taste-rctc/SKILL.md) first when the task is an RCTC brief. Open the vendored file when you need the full anti-slop rulebook.

### Programmer pack

Copy any folder under [packs/programmer-essentials-20](packs/programmer-essentials-20) into `.cursor/skills/`. Each folder name is the install name.

## Skills

Each skill does one job. You do not need all of them at once.

### Start here

| Skill (folder) | Install name | Description |
|---|---|---|
| **SKILL.md** | `rctc-method` | Precise brief, then finish the task. One question only when the answer would change the result. |
| **htpaap** | `htpaap` | What strong engineers actually prove before they call work done. |
| **focused3-agentic-phases** | `focused3-agentic-phases` | Think, execute, prove. |
| **safe-forward-execution** | `safe-forward-execution` | Continue only inside the authority you already have. |

Use that order for code. Do not start with a marketing skill.

### Programmer essentials

Daily skills. Canonical copies live in [packs/programmer-essentials-20](packs/programmer-essentials-20).

| Skill (folder) | Install name | Description |
|---|---|---|
| **design-taste-rctc** | `design-taste-rctc` | Read the brief, set variance / motion / density, prefer an official design system, run a pre-flight check. |
| **design-taste-frontend** | `design-taste-frontend` | Vendored Taste Skill v2 by Leonxlnx. Full anti-slop frontend rulebook. MIT. |
| **owner-credential-vault** | `owner-credential-vault` | Store secrets the operator owns in the OS credential store. No browser-password extraction. |
| **git-worktree-flow** | `git-worktree-flow` | Isolate a branch in a worktree and open a small pull request. |
| **pr-review-surgeon** | `pr-review-surgeon` | Review for bugs, security mistakes, and missing tests. |
| **debugger-hypothesis** | `debugger-hypothesis` | One hypothesis, one observation, then a fix. |
| **api-error-contracts** | `api-error-contracts` | Stable HTTP or RPC errors without leaked internals. |
| **sql-migration-safety** | `sql-migration-safety` | Expand, backfill, then contract. |
| **test-first-slice** | `test-first-slice` | A failing test, then the smallest change that passes. |
| **github-actions-min-ci** | `github-actions-min-ci` | A small workflow that runs the repo's real check. |
| **docker-compose-dev** | `docker-compose-dev` | Local dependencies only, no production secrets in Compose. |
| **a11y-rtl-web** | `a11y-rtl-web` | Keyboard access and Arabic RTL. |
| **web-vitals-budget** | `web-vitals-budget` | LCP, INP, and CLS before extra libraries. |
| **twelve-factor-config** | `twelve-factor-config` | Configuration in the environment. Example file committed, secrets not. |
| **observability-starter** | `observability-starter` | Request id, structured logs, health versus ready. |
| **refactor-characterization** | `refactor-characterization` | Lock current behavior, then move code. |
| **typescript-boundaries** | `typescript-boundaries` | Validate untrusted input at the edge. |
| **release-notes-from-git** | `release-notes-from-git` | Release notes from commits the log actually contains. |
| **supply-chain-pinning** | `supply-chain-pinning` | Install from the lockfile. Read a package before adding it. |
| **incident-debug-playbook** | `incident-debug-playbook` | Mitigate a live failure before refactoring. |
| **consistent-character-video** | `consistent-character-video` | ComfyUI character bible. Saudi dialogue stays outside the video model. |

The wider map is [skills/CATALOG.md](skills/CATALOG.md). Domain stories stay in [docs/SKILLS-SHOWCASE.md](docs/SKILLS-SHOWCASE.md).

### ECC harness

[ecc-harness](ecc-harness/SKILL.md) routes a need to a skill already in this repo, then names one skill in [affaan-m/ECC](https://github.com/affaan-m/ecc) (MIT) when the need is hooks, instincts, session memory, or a domain skill this tree does not ship. The map is [ecc-harness/NEED-MAP.md](ecc-harness/NEED-MAP.md). Upstream skill files stay upstream. The owner runs `npx ecc-universal` setup. This repo does not.

### Which one should I use?

- Start with **rctc-method** when the request is vague or needs a handoff.
- Use **htpaap**, then **focused3-agentic-phases**, then **safe-forward-execution** for implementation.
- Use **design-taste-rctc** to set direction, then **design-taste-frontend** for the full frontend rulebook.
- Use **owner-credential-vault** for the operator's own tokens. Use **logged-in-browser** when a visible Chrome window is already signed in.
- Use **prize-hunt-skill-fit** only when a measured contest class matches a dated public score.
- Use **evidence-before-claim** before saying something works.
- Use **ecc-harness** when the task is to add or organize [affaan-m/ECC](https://github.com/affaan-m/ecc). Use the local skill from its map for the actual work.
- Use **client-auto-reply** for one inbox acknowledgment. A later message to a department address is the direction. An auto-receipt is not.
- Use **chatgpt-bridge-lane** to send one prompt on the local ChatGPT file bridge and wait until the reply is text, JSON, or an image. A written request is not the returned object.

## Settings (design skills)

Numbers are 1 to 10. Set them once per page and keep them.

- **DESIGN_VARIANCE**: layout experimentation. Lower means centered and calm. Higher means asymmetric.
- **MOTION_INTENSITY**: animation depth. Lower means hover only. Higher means scroll-linked motion. Honor reduced motion.
- **VISUAL_DENSITY**: information per viewport. Lower means spacious. Higher means a dense dashboard.

`design-taste-rctc` sets the dials from the brief. `design-taste-frontend` holds the long rulebook those dials gate.

## Examples

- [Programmer examples check](scripts/check-programmer-examples.js) is what `npm run test:examples` runs.
- [Portable background effect](examples/portable-background-effects/README.md) is a small UI fixture, not a product screenshot gallery.
- [Evidence before claim](evidence-before-claim/SKILL.md) is the rule for any example you later call proof.

## Check the tree

```bash
npm run registry:check
npm run validate:repo
npm run test:integrity
npm run test:examples
```

Node 18 or newer. No install step. These commands reject merge-conflict markers, a `SKILL.md` without `name` and `description`, and two byte-identical skill files.

## Common questions

**How is this different from Taste Skill?**
Taste Skill is a frontend rulebook. RCTC is a brief plus proof, then a pack of programming skills. Design jobs use both: our adapter, then his rulebook.

**Does it work with React, Vue, and Svelte?**
Yes for the design skills. They target layout, type, motion, and contrast, not one framework API.

**What is SKILL.md?**
A portable instruction file. Agents load it when the description matches the task, or when you invoke it by name.

**Do I need every skill in the table?**
No. Install the one that matches the job.

## License

[MIT License](LICENSE) for this repository. Copyright (c) [Suhaib Asrawi (@kazoya)](https://github.com/kazoya).

The vendored Taste Skill file is [MIT](vendor/leonxlnx-taste-skill/LICENSE). Copyright (c) 2026 Leonxlnx.
