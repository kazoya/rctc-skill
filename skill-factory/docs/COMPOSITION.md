# Composition Planner

Order of preference:
1. **Reuse** an existing skill from `registry/skills.json`
2. **Compose** a short chain (document why each step)
3. **Extend** an existing skill with a thin adapter
4. **Generate New** via Skill Factory `draft` only if the registry has no fit

Reject circular chains and contradictory permissions (e.g. compose a "no-network" skill after one that requires network without an explicit bridge).
