# 60-second quickstart — RCTC starter

Prove the tree works before you install everything.

## 1. Clone

```bash
git clone --depth 1 https://github.com/kazoya/rctc-skill.git
cd rctc-skill
```

## 2. Install the starter pack (one command)

```bash
npm run install:starter
# same as: node scripts/install-starter.js --host cursor --target .
```

This copies six canonical skills into `.cursor/skills/` (whole folders when the skill has sibling files). Details: [skills/INSTALL.md](../skills/INSTALL.md).

## 3. Plan-only demo (no deploy)

```bash
node digital-presence-factory/cli.js --type personal --source .
```

You should get a JSON plan: reused skills, gaps, owner gates, verify commands. A green plan is **not** permission to publish.

List recipes:

```bash
node digital-presence-factory/cli.js --list
```

## 4. Check the tree

```bash
npm run validate:repo
```

## 5. Optional next steps

- Star the repo if it saved you time.
- Arabic hand-build path (before ready skills): [build-your-own-agent-ar](https://github.com/kazoya/build-your-own-agent-ar).
- Full skill map: [skills/CATALOG.md](../skills/CATALOG.md).