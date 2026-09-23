#!/usr/bin/env python3
"""Compile a small W3C-style SSML subset into provider-neutral JSON segments.

No network calls. Standard library only.
Supported intent: speak/p/s, break, prosody, emphasis, say-as, sub, voice.
"""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from copy import deepcopy


def local_name(tag: str) -> str:
    return tag.split("}", 1)[-1]


def break_ms(value: str | None) -> int | None:
    if not value:
        return None
    value = value.strip().lower()
    m = re.fullmatch(r"(\d+(?:\.\d+)?)(ms|s)", value)
    if not m:
        return None
    n = float(m.group(1))
    return round(n if m.group(2) == "ms" else n * 1000)


def emit_text(out: list[dict], text: str | None, state: dict) -> None:
    if not text or not text.strip():
        return
    out.append({"type": "speech", "text": " ".join(text.split()), **deepcopy(state)})


def walk(node: ET.Element, state: dict, out: list[dict]) -> None:
    tag = local_name(node.tag)
    next_state = deepcopy(state)

    if tag == "voice" and node.get("name"):
        next_state["voice"] = node.get("name")
    elif tag == "prosody":
        for key in ("rate", "pitch", "volume"):
            if node.get(key):
                next_state[key] = node.get(key)
    elif tag == "emphasis":
        next_state["emphasis"] = node.get("level", "moderate")
    elif tag == "say-as":
        next_state["interpret_as"] = node.get("interpret-as")
        if node.get("format"):
            next_state["format"] = node.get("format")
    elif tag == "sub" and node.get("alias"):
        emit_text(out, node.get("alias"), next_state)
        if node.tail:
            emit_text(out, node.tail, state)
        return
    elif tag == "break":
        out.append({
            "type": "break",
            "duration_ms": break_ms(node.get("time")),
            "strength": node.get("strength")
        })
        if node.tail:
            emit_text(out, node.tail, state)
        return

    emit_text(out, node.text, next_state)

    for child in node:
        walk(child, next_state, out)

    if node.tail:
        emit_text(out, node.tail, state)


def compile_ssml(path: str) -> list[dict]:
    root = ET.parse(path).getroot()
    if local_name(root.tag) != "speak":
        raise ValueError("root element must be <speak>")
    lang = root.get("{http://www.w3.org/XML/1998/namespace}lang")
    state = {"lang": lang} if lang else {}
    out: list[dict] = []
    walk(root, state, out)
    return out


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: ssml_compiler.py <file.ssml>", file=sys.stderr)
        return 2
    try:
        plan = compile_ssml(sys.argv[1])
        json.dump(plan, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
