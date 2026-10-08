---
name: supply-chain-pinning
description: "Pin dependency installs to a lockfile and review new packages before adding them. Use when adding a library, bumping versions, or checking a suspicious install script."
---

# supply-chain-pinning

1. Install with the lockfile (`npm ci`, not a floating `npm install` in CI).
2. Before adding a package: check weekly downloads are not the only signal — read the repo, the install script, and whether a stdlib or an existing dependency already does the job.
3. Prefer a direct dependency you import over a chain of unused extras.
4. Commit the lockfile in the same change as `package.json`.
5. If an install script needs network or shell, say so in the PR. Do not disable TLS or ignore signature checks to make an install pass.
