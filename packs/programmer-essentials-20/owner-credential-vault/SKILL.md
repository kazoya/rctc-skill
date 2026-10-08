---
name: owner-credential-vault
description: "Store the operator's own automation secrets in the OS credential store (Windows Credential Manager or keyring), never in git. Use when saving API tokens, SMTP, or OAuth client secrets the operator owns so later runs can read them without printing them. Do not use to extract browser passwords, decrypt Chrome cookies, or sign into accounts the operator does not own."
---

# owner-credential-vault

Chrome remembers passwords inside the user's profile. This skill does the same job for **automation secrets the operator owns**, using the operating system store. It does not read Chrome's Login Data, cookie jars, or anyone else's accounts.

Pair browser work that already has a live login with `logged-in-browser`. Do not replay a password into a site when a visible logged-in window already exists.

## Allowed

- API tokens, webhook secrets, and OAuth client secrets the operator created.
- A dedicated automation Chrome profile the operator signed into once, launched by them.
- Names in the vault; values stay in the OS store.

## Forbidden

- Decrypting Chrome/Edge password databases.
- Copying cookies to impersonate a session.
- Printing, logging, or committing secret values.
- Storing credentials for an account the operator does not control.

## Windows (default)

`cmdkey` puts the secret on the command line. Prefer Python `keyring` (DPAPI-backed on Windows):

```powershell
python -m pip install --user keyring
python -c "import keyring; keyring.set_password('rctc-owner-vault','NAME', input('secret: '))"
python -c "import keyring; import os; v=keyring.get_password('rctc-owner-vault','NAME'); os.environ['NAME']=v or ''; print('loaded' if v else 'missing')"
```

Use the secret only as an environment variable for the next process. Do not echo it.

## Layout

| Item | Where |
|---|---|
| Secret value | OS credential manager, service `rctc-owner-vault` |
| Secret name + purpose | repo file `vault.names.md` (names only) |
| `.env` | local, gitignored, generated at runtime if a tool insists on a file |

## Check

- `git status` shows no secret material.
- A fresh shell can resolve the name without opening a password manager UI only when the operator is logged into Windows.
