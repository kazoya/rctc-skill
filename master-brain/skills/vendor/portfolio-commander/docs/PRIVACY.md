# Privacy — Portfolio Commander

## Open source ≠ your data is public

| What | GitHub (public) | Your PC (private) |
|------|-----------------|-------------------|
| Scripts, skill, dashboard template | ✅ | ✅ |
| `projects-registry.xml` with real paths | ❌ never | ✅ |
| Dashboard `index.html` with embedded JSON | ❌ never | ✅ |
| `requests/inbox.xml` with client names | ❌ never | ✅ |

## Design rules

1. **Scan runs locally** — reads Cursor `workspaceStorage` on your machine only.
2. **No telemetry** — no phone-home in v1.
3. **You choose** what to paste into Cursor chat (dashboard copy button).
4. **Example XML** in repo uses fake paths (`C:\dev\...`).

## If you fork for GitHub stars

- Keep `.gitignore` as shipped.
- Do not commit `%USERPROFILE%\.cursor\portfolio\`.
- Share the **tool**, not your **registry**.
