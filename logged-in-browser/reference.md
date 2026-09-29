# logged-in-browser — reference

Lessons sealed 2026-09-04 on Windows 10, Chrome/152, YesWeHack Dojo create-report (account **suhib**). Do not treat these as guesses.

## Three different "Chromes"

| Surface | Cookie jar | Typical failure |
|---|---|---|
| Visible window the operator screenshots | **Live session** | Agents talk to a different surface and conclude "logged out" |
| `C:\ArabBank\chrome-cdp-profile` with `--remote-debugging-port=9222` | Whatever profile that user-data-dir holds | May *be* the live jar (it was, for Dojo) while MCP tabs are not |
| Claude-in-Chrome MCP tab group | Extension-controlled tabs | New `navigate` to the same URL hits `/auth/login` even when a sibling tab in the same OS Chrome is logged in |
| Playwright persistent profile / Cursor IDE Chromium | Fresh or IDE profile | Login wall; MCP often `provider did not re-register` |

**Same OS Chrome process is not the same jar.** Claude-in-Chrome can be installed on the CDP Chrome (service worker visible in `/json/list`) and still drive a tab group that does not inherit the page cookies.

## CDP

Start Chrome (dedicated dir) only when no in-memory form is at risk:

```
chrome.exe --remote-debugging-port=9222 --remote-allow-origins=* --user-data-dir=<dir>
```

Without `--remote-allow-origins=*`:

- `curl http://127.0.0.1:9222/json/list` may still work
- Playwright `connect_over_cdp` may print `<ws connected>` then hang until timeout
- Python `websocket-client` handshake returns **403** listing the rejected Origin

Do not spend a hunt loop "fixing" that websocket if a titled logged-in window is already on screen — use UIA.

`urllib` to `127.0.0.1:9222` can time out while `curl.exe` succeeds. Prefer `curl.exe` for the diagnose script.

## UI Automation notes

- Chrome exposes `Edit` with stable `automation_id` on YesWeHack (`report-title-input`, `report-description`, …).
- ng-select often has **no ComboBox**. Placeholder is `Text` ("Select a bug type"). Options appear as `ListItem` after click. Search field name like "Search a bug type" is optional; typing `284` into it once returned zero hits — clicking the `ListItem` that contains `CWE-284` worked.
- `get_value()` / `SetValue` work off-screen. `type_keys` / `click_input` on wrappers below the viewport raise `ElementNotVisible` or paste into the wrong place.
- There is a real `SUBMIT REPORT 0` `Button`. Never click it from this skill unless the operator's current message authorizes that exact submit.

## What this is not

- Not Anthropic Desktop **computer use** (Windows CLI does not expose `computer-use` MCP; Desktop toggle is a different product).
- Not `--dangerously-skip-permissions` as a lifestyle.
- Not a password manager. If the live jar is logged out, `HUMAN_GATE` for the operator to log in **in the window they want driven**.
