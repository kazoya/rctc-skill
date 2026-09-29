#!/usr/bin/env python3
"""Set an Edit control value via UIA ValuePattern. Never clicks Submit."""
from __future__ import annotations

import argparse
import sys


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--title", required=True, help="regex matched against window title")
    p.add_argument("--auto-id", required=True, help="automation_id of the Edit")
    p.add_argument("--value", required=True)
    args = p.parse_args()
    from pywinauto import Application

    app = Application(backend="uia").connect(title_re=args.title)
    w = app.window(title_re=args.title)
    w.set_focus()
    target = None
    for c in w.descendants(control_type="Edit"):
        if (c.element_info.automation_id or "") == args.auto_id:
            target = c
            break
    if target is None:
        print("not_found", args.auto_id, file=sys.stderr)
        return 2
    target.iface_value.SetValue(args.value)
    print("set", args.auto_id, (target.get_value() or "")[:200])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
