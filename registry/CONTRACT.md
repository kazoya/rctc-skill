# Skill discovery contract

Issue #3 showed that consumers should not need repository-specific glob exceptions.

## Stable contract

1. `registry/skills.json` is the machine-readable discovery index of **installations**.
2. `registry/canonical.json` groups installations into canonical capabilities.
3. Every executable skill entry point is named `SKILL.md` and must contain `name` and `description` frontmatter.
4. Multiple installations of one capability are allowed for host compatibility, but they are not counted as independent capabilities.
5. New consumers SHOULD read the registry instead of guessing directory depth.
6. New skills SHOULD prefer one primary source. Host-specific copies should be generated/synchronized or explicitly marked as installations.
7. A skill that depends on sibling files SHOULD ship `skill.manifest.json` listing its required files.

The long-term migration target is `skills/<slug>/SKILL.md`. Existing paths remain compatible while consumers migrate to the registry, avoiding a breaking mass move.
