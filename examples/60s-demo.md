# 60-second demo script

Copy-paste path for a first-time visitor. No publish, no spend.

```bash
git clone --depth 1 https://github.com/kazoya/rctc-skill.git
cd rctc-skill
npm run install:starter
node digital-presence-factory/cli.js --type personal --source .
npm run validate:repo
```

Expected: installer JSON with six skills, a plan-only factory report, and `validate:repo` status `PASS`.

If the factory prints help instead of a plan, pass both `--type` and `--source` as above.