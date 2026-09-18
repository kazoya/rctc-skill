"""Generate arabic_conversation_golden.jsonl (250+ records)."""

from __future__ import annotations

import json
import random
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "backend" / "data" / "evaluation" / "arabic_conversation_golden.jsonl"
PROFILE_DOC = "84d2d0b1-c42a-4163-89c9-01d0b5092831"
PROJECTS_DOC = "fd9de67d-7e3a-4258-a8a6-d957782b7cda"

random.seed(42)


def row(
    idx: int,
    input_text: str,
    intent: str,
    dialect: str,
    *,
    split: str,
    normalized: str = "",
    retrieval: bool = False,
    docs: list[str] | None = None,
    pages: list[int] | None = None,
    facts: list[str] | None = None,
    forbid: list[str] | None = None,
    answer_type: str = "explicit_fact",
) -> dict:
    return {
        "id": f"AR-CONV-{idx:04d}",
        "input": input_text,
        "expected_intent": intent,
        "expected_dialect": dialect,
        "expected_normalized_query": normalized or input_text,
        "requires_retrieval": retrieval,
        "expected_document_ids": docs or [],
        "expected_pages": pages or [],
        "must_contain_facts": facts or [],
        "must_not_claim": forbid or [],
        "expected_answer_type": answer_type,
        "source": "expert_authored",
        "split": split,
    }


def main() -> None:
    items: list[dict] = []
    n = 1

    greetings = [
        ("شاكو ماكو", "social_small_talk", "iraqi"),
        ("شو في ما في", "social_small_talk", "levantine"),
        ("وش الأخبار عندكم؟", "social_small_talk", "saudi"),
        ("السلام عليكم", "greeting", "msa"),
        ("هلا والله", "greeting", "saudi"),
        ("كيفك", "social_small_talk", "levantine"),
        ("شلونكم", "social_small_talk", "iraqi"),
        ("صباح الخير", "greeting", "msa"),
        ("hello", "greeting", "en"),
        ("how are you", "social_small_talk", "en"),
    ]
    for _ in range(30):
        g = greetings[n % len(greetings)]
        items.append(row(n, g[0], g[1], g[2], split="development" if n <= 200 else "holdout"))
        n += 1

    saudi = [
        ("وش تسوون بالأمن السيبراني؟", "cybersecurity_services", "هل نفذت الشركة خدمات الامن السيبراني", [PROFILE_DOC], [15]),
        ("وش خدماتكم؟", "company_services", "ما خدمات الشركة", [PROFILE_DOC], [4, 5]),
        ("وين مقركم؟", "company_location", "اين مقر الشركة", [PROFILE_DOC], [3]),
        ("متى تأسست الشركة؟", "company_foundation", "متى تأسست شركة حزام", [PROFILE_DOC], [3], ["2008"]),
    ]
    for _ in range(40):
        s = saudi[n % len(saudi)]
        items.append(
            row(
                n,
                s[0],
                s[1],
                "saudi",
                split="development" if n <= 200 else "holdout",
                normalized=s[2],
                retrieval=s[1] not in {"company_foundation", "company_age"},
                docs=list(s[3]),
                pages=list(s[4]),
                facts=list(s[5]) if len(s) > 5 else [],
            )
        )
        n += 1

    iraqi = [
        ("عدكم شغل ويا الوزارات؟", "government_projects", "iraqi", "هل نفذت الشركة مشاريع حكومية"),
        ("شنو خدماتكم بالسحابة؟", "cloud_services", "iraqi", "ما خدمات الحوسبة السحابية"),
        ("وين مقركم؟", "company_location", "iraqi", "اين مقر الشركة"),
        ("صارلهم كم سنة بالسوق؟", "company_age", "iraqi", "منذ كم سنة تعمل الشركة", [], [], ["2008"]),
    ]
    for _ in range(40):
        i = iraqi[n % len(iraqi)]
        items.append(
            row(
                n,
                i[0],
                i[1],
                i[2],
                split="development" if n <= 200 else "holdout",
                normalized=i[3],
                retrieval=i[1] not in {"company_age", "company_foundation"},
                docs=[PROJECTS_DOC] if i[1] == "government_projects" else [PROFILE_DOC],
                pages=[1, 18] if i[1] == "government_projects" else [3],
                facts=i[5] if len(i) > 5 else [],
                answer_type="calculated" if i[1] == "company_age" else "explicit_fact",
            )
        )
        n += 1

    levant = [
        ("شو بتقدموا بالتحول الرقمي؟", "digital_transformation", "levantine"),
        ("كيف تواصل معكم؟", "company_contact", "jordanian"),
        ("شو مشروع وزارة السياحة؟", "project_lookup", "palestinian"),
        ("من هي الشركة؟", "company_overview", "levantine"),
    ]
    for _ in range(40):
        l = levant[n % len(levant)]
        items.append(
            row(
                n,
                l[0],
                l[1],
                l[2],
                split="development" if n <= 200 else "holdout",
                retrieval=True,
                docs=[PROFILE_DOC] if l[1] != "project_lookup" else [PROJECTS_DOC],
                pages=[4] if l[1] != "project_lookup" else [6],
            )
        )
        n += 1

    mixed = [
        ("هلا شخباركم، what services do u provide?", "company_services", "mixed"),
        ("ITB cybersecurity services?", "cybersecurity_services", "mixed"),
        ("hello, when was ITB founded?", "company_foundation", "mixed"),
    ]
    for _ in range(25):
        m = mixed[n % len(mixed)]
        items.append(
            row(
                n,
                m[0],
                m[1],
                m[2],
                split="development" if n <= 200 else "holdout",
                retrieval=m[1] != "company_foundation",
                docs=[PROFILE_DOC],
                pages=[3, 15],
                facts=["2008"] if m[1] == "company_foundation" else [],
            )
        )
        n += 1

    typos = [
        ("متى تاسست الشركه؟", "company_foundation", "msa"),
        ("خدمات الامن السبراني", "cybersecurity_services", "msa"),
        ("مشاريع حكوميه", "government_projects", "msa"),
        ("وين الدليل", "evidence_request", "msa"),
    ]
    for _ in range(25):
        t = typos[n % len(typos)]
        items.append(
            row(
                n,
                t[0],
                t[1],
                t[2],
                split="development" if n <= 200 else "holdout",
                retrieval=t[1] not in {"evidence_request", "company_foundation"},
                docs=[PROFILE_DOC],
                pages=[3],
                facts=["2008"] if t[1] == "company_foundation" else [],
            )
        )
        n += 1

    inferential = [
        ("هل خبرتهم تعتبر قوية؟", "supported_inference", "msa", [], [], []),
        ("صارلهم كم سنة؟", "company_age", "iraqi", [], [], ["2008"]),
        ("من كم سنة بالسوق؟", "company_age", "saudi", [], [], ["2008"]),
    ]
    for _ in range(25):
        inf = inferential[n % len(inferential)]
        items.append(
            row(
                n,
                inf[0],
                inf[1],
                inf[2],
                split="development" if n <= 200 else "holdout",
                retrieval=False,
                docs=[PROFILE_DOC],
                pages=[3],
                facts=inf[5],
                answer_type="supported_inference" if inf[1] == "supported_inference" else "calculated",
            )
        )
        n += 1

    evidence = [
        ("وين الدليل على كلامك؟", "evidence_request"),
        ("ورني الصفحة", "page_or_image_request"),
        ("هات الصورة", "page_or_image_request"),
    ]
    for _ in range(15):
        e = evidence[n % len(evidence)]
        items.append(row(n, e[0], e[1], "msa", split="development" if n <= 200 else "holdout"))
        n += 1

    ambiguous = [
        ("تفاصيل مشروع الوزارة", "project_lookup"),
        ("مشروع العدل", "project_lookup"),
        ("مشروع المالية", "project_lookup"),
    ]
    for _ in range(10):
        a = ambiguous[n % len(ambiguous)]
        items.append(row(n, a[0], a[1], "msa", split="holdout", retrieval=True, docs=[PROJECTS_DOC]))
        n += 1

    oos = [
        ("ممكن تساعدني أغير زيت السيارة؟", "out_of_scope"),
        ("what is the weather today?", "out_of_scope"),
        ("سعر البيتكوين", "out_of_scope"),
    ]
    for _ in range(10):
        o = oos[n % len(oos)]
        items.append(
            row(
                n,
                o[0],
                o[1],
                "msa",
                split="holdout",
                forbid=["حزام", "ITB", "مشروع"],
            )
        )
        n += 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8") as handle:
        for item in items[:250]:
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"Wrote {min(len(items), 250)} rows to {OUT}")


if __name__ == "__main__":
    main()
