"""Generate itb_retrieval_golden.jsonl (50 RAG-focused questions)."""

from __future__ import annotations

import json
from pathlib import Path

PROFILE_AR = "84d2d0b1-c42a-4163-89c9-01d0b5092831"
PROFILE_EN = "1a4f204d-d9f3-4c02-91ea-44b9f6afc40d"
PROJECTS = "fd9de67d-7e3a-4258-a8a6-d957782b7cda"
WEBSITE = "5c31ba30-b254-4f5f-89ef-f1a6ab18c5bc"

ROWS = [
    # dev 1-30 — document/page-specific, not handler shortcuts
    ("ITB-RAG-0001", "dev", "project", "ما المذكور عن SDAIA في الملف التعريفي العربي؟", [PROFILE_AR], [8], [], "profile clients page"),
    ("ITB-RAG-0002", "dev", "project", "اذكر الرؤية المذكورة في الملف التعريفي", [PROFILE_AR], [6], [], "vision"),
    ("ITB-RAG-0003", "dev", "service", "ما الخدمات المذكورة تحت الأمن السيبراني في الملف التعريفي؟", [PROFILE_AR], [15], [], "cyber services"),
    ("ITB-RAG-0004", "dev", "service", "ما المذكور عن الطب الشرعي الرقمي؟", [PROFILE_AR], [17], [], "digital forensics"),
    ("ITB-RAG-0005", "dev", "project", "ما تفاصيل مشروع Ministry of Tourism في ملف المشاريع؟", [PROJECTS], [6], [], "tourism project"),
    ("ITB-RAG-0006", "dev", "project", "ما نطاق عمل مشروع وزارة العدل في ملف المشاريع؟", [PROJECTS], [8], [PROJECTS], "moj scope"),
    ("ITB-RAG-0007", "dev", "project", "اذكر مشروعاً يتعلق برئاسة أمن الدولة في ملف المشاريع", [PROJECTS], [1], [], "presidency security"),
    ("ITB-RAG-0008", "dev", "project", "ما المشروع المرتبط بالحمض النووي لدى الجهات المستفيدة؟", [PROJECTS], [1], [], "dna project"),
    ("ITB-RAG-0009", "dev", "project", "ما المذكور عن كاميرات المراقبة في ملف المشاريع؟", [PROJECTS], [26], [], "cctv"),
    ("ITB-RAG-0010", "dev", "project", "ما تفاصيل مشروع تجديد تراخيص البنية التحتية؟", [PROJECTS], [8], [], "license renewal"),
    ("ITB-RAG-0011", "dev", "comparison", "قارن بين مشروعين حكوميين مذكورين في ملف المشاريع", [PROJECTS], [6, 8], [], "two projects"),
    ("ITB-RAG-0012", "dev", "typo", "شو مذكور عن الشهاادات في الملف التعريفي؟", [PROFILE_AR], [10], [], "certs typo"),
    ("ITB-RAG-0013", "dev", "typo", "وين مذكور انتشار الموظفين بالملف التعريفي؟", [PROFILE_AR], [2], [], "employee spread"),
    ("ITB-RAG-0014", "dev", "ambiguous", "مشروع الوزارة", [PROJECTS], [6, 8], [], "ambiguous ministry"),
    ("ITB-RAG-0015", "dev", "project", "ما اسم العميل في مشروع السياحة؟", [PROJECTS], [6], [], "tourism client name"),
    ("ITB-RAG-0016", "dev", "project", "ما المذكور عن User Protection في ملف المشاريع؟", [PROJECTS], [14], [], "user protection"),
    ("ITB-RAG-0017", "dev", "project", "ما المذكور عن Endpoint Protection في المشاريع؟", [PROJECTS], [14], [], "endpoint"),
    ("ITB-RAG-0018", "dev", "service", "ما الخدمات والحلول المذكورة في صفحة الشهادات؟", [PROFILE_AR], [10], [], "certs page"),
    ("ITB-RAG-0019", "dev", "project", "اذكر مشروعاً يتضمن SEIM أو SIEM في ملف المشاريع", [PROJECTS], [14], [], "seim"),
    ("ITB-RAG-0020", "dev", "project", "ما المذكور عن الحوسبة السحابية في الملف التعريفي؟", [PROFILE_AR], [15], [], "cloud profile"),
    ("ITB-RAG-0021", "dev", "contact", "ما رابط موقع الشركة في ملف الموقع المعرفي؟", [WEBSITE], [1], [], "website url"),
    ("ITB-RAG-0022", "dev", "project", "ما المشاريع المرتبطة بالكهرباء في ملف المشاريع؟", [PROJECTS], [11], [], "electricity"),
    ("ITB-RAG-0023", "dev", "project", "ما المذكور عن Capital Market Authority في الملف الإنجليزي؟", [PROFILE_EN], [8], [], "cma english"),
    ("ITB-RAG-0024", "dev", "project", "ما تفاصيل مشروع وزارة الصحة في ملف المشاريع إن وُجد؟", [PROJECTS], [11], [], "health ministry"),
    ("ITB-RAG-0025", "dev", "typo", "شو مكتوب عن الدفاع والامن بالملف التعريفي؟", [PROFILE_AR], [8], [], "defense typo"),
    ("ITB-RAG-0026", "dev", "project", "ما المذكور عن البنية التحتية IT infrastructure في المشاريع؟", [PROJECTS], [8], [], "infra"),
    ("ITB-RAG-0027", "dev", "comparison", "ما الفرق بين مشروع السياحة ومشروع العدل في الملف؟", [PROJECTS], [6, 8], [], "tourism vs moj"),
    ("ITB-RAG-0028", "dev", "project", "ما المذكور عن الدعم الفني لمدة 3 سنوات في المشاريع؟", [PROJECTS], [26], [], "3 year support"),
    ("ITB-RAG-0029", "dev", "service", "ما الحلول المذكورة تحت التحول الرقمي؟", [PROFILE_AR], [15], [], "digital transform"),
    ("ITB-RAG-0030", "dev", "project", "ما المذكور عن الأعمال المدنية في مشروع المباني؟", [PROJECTS], [26], [], "civil works"),
    # holdout 31-50
    ("ITB-RAG-0031", "holdout", "project", "اذكر نصاً عن توفير حلول تكنولوجيا المعلومات الحديثة", [PROFILE_AR], [6], [], "vision quote"),
    ("ITB-RAG-0032", "holdout", "project", "ما المذكور عن IBM أو مايكروسوفت في الملف التعريفي؟", [PROFILE_AR], [8], [], "vendors profile"),
    ("ITB-RAG-0033", "holdout", "typo", "تفاصيل مشروع وزارة السياحه", [PROJECTS], [6], [], "tourism typo"),
    ("ITB-RAG-0034", "holdout", "project", "ما المشروع الذي يذكر تجديد التراخيص والدعم الفني؟", [PROJECTS], [8], [], "renewal holdout"),
    ("ITB-RAG-0035", "holdout", "ambiguous", "مشروع الامن السيبراني", [PROJECTS], [14], [], "ambiguous cyber"),
    ("ITB-RAG-0036", "holdout", "project", "ما المذكور عن كاميرات متحركة PTZ في المشاريع؟", [PROJECTS], [26], [], "ptz"),
    ("ITB-RAG-0037", "holdout", "service", "ما الفقرة التي تتحدث عن خدمات و حلول في الملف العربي؟", [PROFILE_AR], [15], [], "services heading"),
    ("ITB-RAG-0038", "holdout", "project", "ما اسم المشروع المرتبط بـ Ministry of Justice؟", [PROJECTS], [8], [], "moj english name"),
    ("ITB-RAG-0039", "holdout", "typo", "وين مذكوره الشهادات ISO؟", [PROFILE_AR], [10], [], "iso typo"),
    ("ITB-RAG-0040", "holdout", "project", "ما المذكور عن نقل المعرفة من الشركة الأم في المشاريع؟", [PROJECTS], [11], [], "knowledge transfer"),
    ("ITB-RAG-0041", "holdout", "comparison", "هل يوجد أكثر من مشروع لجهة حكومية واحدة في الملف؟", [PROJECTS], [6], [], "multi govt"),
    ("ITB-RAG-0042", "holdout", "project", "ما المذكور عن الأمن السيبراني للبنية التحتية؟", [PROJECTS], [14], [], "cyber infra"),
    ("ITB-RAG-0043", "holdout", "contact", "ما البريد الإلكتروني في ملف الموقع؟", [WEBSITE], [1], [], "email website"),
    ("ITB-RAG-0044", "holdout", "project", "ما المذكور عن توريد وتركيب وتشغيل أنظمة المراقبة؟", [PROJECTS], [26], [], "cctv install"),
    ("ITB-RAG-0045", "holdout", "typo", "شو في صفحة 17 بالملف التعريفي؟", [PROFILE_AR], [17], [], "page 17"),
    ("ITB-RAG-0046", "holdout", "project", "ما المذكور عن الحل المقترح والتعلم الآلي في المشاريع؟", [PROJECTS], [14], [], "ml proposal"),
    ("ITB-RAG-0047", "holdout", "ambiguous", "مشروع الوزارة المالية", [PROJECTS], [14], [], "finance ambiguous"),
    ("ITB-RAG-0048", "holdout", "out_of_scope", "ما سعر سهم أرامكو اليوم؟", [], [], [], "oos stock"),
    ("ITB-RAG-0049", "holdout", "out_of_scope", "من فاز بكأس العالم 2022؟", [], [], [], "oos football"),
    ("ITB-RAG-0050", "holdout", "out_of_scope", "ما هو أفضل مطعم في عمان؟", [], [], [], "oos restaurant"),
]


def main() -> None:
    out = (
        Path(__file__).resolve().parents[1]
        / "backend"
        / "data"
        / "evaluation"
        / "itb_retrieval_golden.jsonl"
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as handle:
        for row in ROWS:
            item = {
                "id": row[0],
                "split": row[1],
                "question_type": row[2],
                "question_ar": row[3],
                "expected_document_ids": row[4],
                "expected_pages": row[5],
                "forbidden_document_ids": row[6],
                "expected_topic_keywords": [],
                "notes": row[7],
                "source": "expert_authored",
            }
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")
    print(f"Wrote {len(ROWS)} rows to {out}")


if __name__ == "__main__":
    main()
