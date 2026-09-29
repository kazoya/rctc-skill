#!/usr/bin/env python3
"""Diagnose Chrome CDP :9222. HTTP list vs websocket origin. No clicks."""
from __future__ import annotations

import json
import subprocess
import sys

PORT = 9222


def curl_json(path: str) -> object | None:
    try:
        raw = subprocess.check_output(
            ["curl.exe", "-s", "--max-time", "5", f"http://127.0.0.1:{PORT}{path}"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
        return json.loads(raw)
    except Exception as e:
        print("curl_fail", path, type(e).__name__, e)
        return None


def chrome_cmd() -> None:
    ps = (
        "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" |"
        " Where-Object { $_.CommandLine -match 'remote-debugging-port' -and $_.CommandLine -notmatch '--type=' } |"
        " Select-Object -ExpandProperty CommandLine"
    )
    try:
        out = subprocess.check_output(["powershell", "-NoProfile", "-Command", ps], text=True, timeout=15)
        print("chrome_cmd:", (out or "").strip()[:500] or "(none)")
        if "--remote-allow-origins=" in (out or ""):
            print("allow_origins: present")
        else:
            print("allow_origins: MISSING — expect WS 403 / Playwright hang")
    except Exception as e:
        print("chrome_cmd_fail", e)


def try_ws(url: str) -> None:
    try:
        import websocket
    except ImportError:
        print("ws: websocket-client not installed")
        return
    try:
        ws = websocket.create_connection(url, timeout=5, origin="*")
        ws.close()
        print("ws: connected with Origin=*")
    except Exception as e:
        print("ws:", type(e).__name__, str(e)[:220])


def main() -> int:
    chrome_cmd()
    ver = curl_json("/json/version")
    listing = curl_json("/json/list")
    if isinstance(ver, dict):
        print("browser", ver.get("Browser"))
        print("ws_browser", ver.get("webSocketDebuggerUrl"))
    pages = [t for t in (listing or []) if isinstance(t, dict) and t.get("type") == "page"]
    print("n_pages", len(pages))
    for t in pages[:8]:
        print("-", (t.get("title") or "")[:70], "|", (t.get("url") or "")[:90])
    page = next((t for t in pages if t.get("webSocketDebuggerUrl")), None)
    if page:
        try_ws(page["webSocketDebuggerUrl"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
