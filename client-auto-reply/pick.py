"""اختيار الرد الآلي النشط وطباعته. لا يرسل بريدًا."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "replies.json"
LOG = ROOT / "route-log.jsonl"


def load() -> dict:
    return json.loads(DATA.read_text(encoding="utf-8"))


def save(data: dict) -> None:
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def active(data: dict) -> dict:
    chosen = [r for r in data["replies"] if r.get("active")]
    if len(chosen) != 1:
        raise SystemExit("يجب أن يكون رد واحد فقط نشطًا")
    return chosen[0]


def route_lines(data: dict, lang: str) -> str:
    lines = []
    for route in data.get("routes", []):
        email = (route.get("email") or "").strip()
        if not email:
            continue
        label = route["label_ar"] if lang == "ar" else route["label_en"]
        lines.append(f"{label}: {email}")
    return "\n".join(lines)


def signature(data: dict, lang: str) -> str:
    org = data.get("org") or {}
    name = org.get("name_ar") if lang == "ar" else org.get("name_en")
    parts = [p for p in (name, org.get("email"), org.get("website"), org.get("postal_ar") if lang == "ar" else "") if p]
    return "\n".join(parts)


def render(data: dict) -> str:
    reply = active(data)
    body_ar = reply["body_ar"].format(
        routes_ar=route_lines(data, "ar"),
        signature_ar=signature(data, "ar"),
    )
    body_en = reply["body_en"].format(
        routes_en=route_lines(data, "en"),
        signature_en=signature(data, "en"),
    )
    text = f"id: {reply['id']}\nsubject: {reply['subject']}\n\n{body_ar.strip()}\n\n---\n\n{body_en.strip()}\n"
    return re.sub(r"\n{3,}", "\n\n", text)


def list_replies(data: dict) -> None:
    for reply in data["replies"]:
        mark = "نشط" if reply.get("active") else "متوقف"
        print(f"{reply['id']}\t{mark}\t{reply['title']}")


def activate(data: dict, reply_id: str) -> None:
    ids = [r["id"] for r in data["replies"]]
    if reply_id not in ids:
        raise SystemExit(f"لا يوجد رد بهذا المعرّف: {reply_id}")
    for reply in data["replies"]:
        reply["active"] = reply["id"] == reply_id
    save(data)
    print(f"النشط الآن: {reply_id}")


def intent_for(data: dict, mailboxes: list[str]) -> str:
    wanted = {m.strip().lower() for m in mailboxes if m.strip()}
    for route in data.get("routes", []):
        email = (route.get("email") or "").strip().lower()
        if email and email in wanted:
            return route["intent"]
    return ""


def sentence(sender: str, at: str, mailboxes: list[str], intent: str) -> str:
    boxes = " و ".join(mailboxes)
    line = f"وصلنا من {sender} في {at} وظهر في {boxes}"
    if intent:
        line += f"، فالغرض تصنيف {intent}"
    return line


def write_log(data: dict, sender: str, at: str, mailboxes: list[str]) -> dict:
    intent = intent_for(data, mailboxes)
    entry = {
        "at": at,
        "from": sender,
        "seen_in": mailboxes,
        "intent": intent or None,
        "sentence": sentence(sender, at, mailboxes, intent),
    }
    with LOG.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return entry


def main(argv: list[str]) -> int:
    data = load()
    cmd = argv[1] if len(argv) > 1 else "render"
    if cmd == "list":
        list_replies(data)
    elif cmd == "activate" and len(argv) == 3:
        activate(data, argv[2])
    elif cmd == "log" and len(argv) >= 5:
        entry = write_log(data, argv[2], argv[3], argv[4:])
        print(entry["sentence"])
    elif cmd == "render":
        print(render(data), end="")
    else:
        print(
            "الاستعمال: python pick.py [list|render|activate <id>|log <من> <وقت> <صندوق> [صندوق...]]",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
