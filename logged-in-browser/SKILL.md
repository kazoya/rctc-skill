---
name: logged-in-browser
description: >
  Drives the operator's already-logged-in Chrome window (same cookie jar as the
  visible tab). Diagnoses Playwright/CDP origin blocks, Claude-in-Chrome MCP
  cookie-jar mismatch, and fills Angular/ng-select forms via Windows UI Automation
  ValuePattern — never via a fresh MCP/Playwright profile. Use on every request
  that touches a browser, Chrome, form, login, session, Playwright, CDP, Claude in
  Chrome, YesWeHack, Intigriti, HackerOne, or "fill this tab". Standing RCTC
  complementary skill: always in the recommendation set.
---

# logged-in-browser — التحكم في المتصفح المسجّل

**Canonical:** `C:\rctc-skill\logged-in-browser\`  
**Invoke:** `/logged-in-browser`  
**Proven:** 2026-09-04 Windows Chrome/152 + YesWeHack create-report (suhib tab)

Drive **the window the human is looking at**. A second Chrome, a Playwright profile, or a Claude-in-Chrome MCP tab is a different session until proven otherwise.

## Standing rule (RCTC)

This skill is **always** in the complementary-skills set. Mention it at most once per conversation unless the task is already browser work — then **read this file before acting**.

## Ladder (stop at the first that shares the live cookies)

1. **Cursor IDE browser** — only if *that* tab shows the logged-in account (not a login wall).
2. **Claude in Chrome** (`--chrome` / MCP `claude-in-chrome`) — only if `read_page` on the target URL stays logged in. If it redirects to `/auth/login` or shows REGISTER/LOGIN, the MCP tab group is a **different cookie jar**. Do not keep opening tabs there.
3. **CDP + Playwright** `connect_over_cdp('http://127.0.0.1:9222')` — only if Chrome was started with `--remote-allow-origins=*` **and** a page websocket handshake succeeds. HTTP `/json/list` working is **not** enough.
4. **Windows UI Automation** on the titled window (`pywinauto` backend `uia`) — this is the respectable path when 1–3 miss the live jar. Proven: click `ListItem` for ng-select; `iface_value.SetValue` for off-screen Angular fields.

Do not close a Chrome that holds an in-memory form just to add CDP flags.

## Diagnose before filling

```powershell
python C:\rctc-skill\logged-in-browser\scripts\diagnose_cdp.py
```

| Symptom | Meaning | Next |
|---|---|---|
| `/json/list` OK, Playwright `TimeoutError` after `<ws connected>` or `403` origin | Chrome lacks `--remote-allow-origins=*` (or handshake origin rejected) | UIA on the visible window |
| Claude-in-Chrome two browsers both `/auth/login` while a visible tab is logged in | MCP cookie jar ≠ visible tab | UIA on the visible window |
| Cursor browser MCP `provider did not re-register` | IDE browser dead | skip to 3 or 4 |
| Window title matches the site, UIA sees `suhib` / account control | You are on the live jar | fill here |

## Fill without Submit

```
find window by title
→ dump UIA names + automation_id
→ ng-select: click placeholder Text → click ListItem (search box is optional)
→ text fields: ValuePattern SetValue (works off-screen)
→ verify get_value + screenshot
→ STOP
```

**Do not** use `SendKeys` / `{PGDN}` / click-then-Ctrl-V as the primary fill. PageDown often never reaches the page; clicks miss off-screen controls; a stray click can hit **SUBMIT**.

SetValue:

```python
from pywinauto import Application
w = Application(backend="uia").connect(title_re=".*Create a report.*").window(title_re=".*Create a report.*")
for c in w.descendants(control_type="Edit"):
    if c.element_info.automation_id == "report-title-input":
        c.iface_value.SetValue("the title")
```

Helpers: [scripts/uia_dump.py](scripts/uia_dump.py), [scripts/uia_set_value.py](scripts/uia_set_value.py).

## Hard stops (operator only)

- CAPTCHA / passkey / OTP the agent cannot receive
- Entering the operator's password into a login form the agent opened in the *wrong* jar
- **Submit / Send / Purchase** on YesWeHack, HackerOne, Intigriti, Kaggle, email, or payments unless the operator's **this-turn** phrase authorizes that exact click

Hand-off:

```text
HUMAN_GATE: <type>
URL: <url>
Why: <one line>
You: <one action>
Reply: <exact resume phrase>
```

## Pairing

- **RCTC** — Role = operator in the live session; Constraint = no Submit unless gated.
- **human-operator-browser** (ArabBank) — etiquette, harvest playbooks, zero-bypass gates. This skill is the **hands**.
- **operator-control-plane** — if the browser path is gated, continue another ready track.

## Evidence

Screenshot + one JSON line: `via`, `window_title`, `account_hint`, `submit_clicked: false`.

## Details

Cookie jars, CDP flags, and the 2026-09-04 proof: [reference.md](reference.md).
