#!/usr/bin/env python3
"""Dump UI Automation tree of a Chrome window (title regex). No clicks."""
from __future__ import annotations

import argparse
import sys


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--title", required=True, help="regex matched against window title")
    p.add_argument("--limit", type=int, default=40)
    args = p.parse_args()
    from pywinauto import Application

    app = Application(backend="uia").connect(title_re=args.title)
    w = app.window(title_re=args.title)
    print("WINDOW", w.window_text(), w.rectangle())
    for spec in ("Edit", "Button", "Text", "ListItem", "ComboBox"):
        ctrls = w.descendants(control_type=spec)
        print("===", spec, len(ctrls), "===")
        for c in ctrls[: args.limit]:
            info = c.element_info
            val = ""
            try:
                val = (c.get_value() or "")[:80]
            except Exception:
                pass
            print(repr(info.name)[:70], "|", repr(info.automation_id)[:50], "|", val)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
