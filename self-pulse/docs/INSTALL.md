# Installation Guide — Self-Pulse Free

## Cursor

1. Copy `self-pulse/` to `.cursor/skills/self-pulse/` or your user skills root.
2. Ensure `SKILL.md` frontmatter is intact.
3. Restart agent session or reload skills.
4. Run `npm test` inside the folder once.

## Claude Code

1. Copy to `.claude/skills/self-pulse/` or `~/.claude/skills/self-pulse/`.
2. Invoke when the task matches the skill description (confidence, customer isolation, calibration).

## Codex / other SKILL.md hosts

1. Place the folder where the host discovers skills.
2. No network required for core evaluation (offline Node).

## Verification

```bash
cd self-pulse && npm test && npm run demo
```

Expected: all tests pass; `examples/sample-output.json` written.
