from backend.app.conversation.query_rewriter import focus_retrieval_query, rewrite_query
from backend.app.conversation.router import route_message


def test_focus_query_removes_polite_and_dialect_request_filler() -> None:
    focused = focus_retrieval_query(
        "مرحبا المعذرة لو سمحت أغلبك بدي أعرف شو رقم العضوية للشركة؟"
    )
    assert focused == "رقم العضوية للشركة؟"


def test_focus_query_preserves_entities_numbers_and_latin_terms() -> None:
    focused = focus_retrieval_query(
        "ممكن بدي شو مشروع وزارة العدل 2024 مع ERP؟"
    )
    assert focused == "مشروع وزارة العدل 2024 مع ERP؟"


def test_focus_query_preserves_negative_constraint() -> None:
    focused = focus_retrieval_query("لا أريد معلومات عن ERP")
    assert focused == "لا أريد معلومات عن ERP"


def test_known_intent_rewrite_remains_authoritative() -> None:
    focused = rewrite_query(
        "مرحبا لو سمحت شو مشاريعكم الحكومية؟",
        intent="government_projects",
        dialect="levantine",
    )
    assert focused == "هل نفذت الشركة مشاريع مع وزارات او جهات حكومية؟"


def test_possessive_government_projects_form_is_recognized() -> None:
    route = route_message("هلا لو سمحت أبغى أعرف شو مشاريعكم الحكومية؟")
    assert route.intent == "government_projects"


def test_specific_client_project_outranks_mentioned_technology() -> None:
    route = route_message("ممكن بدي شو مشروع وزارة العدل 2024 مع ERP؟")
    assert route.intent == "project_lookup"
    assert route.entities["client_key"] == "moj"
    assert "وزارة العدل" in route.normalized_query
    assert "2024" in route.normalized_query
    assert "ERP" in route.normalized_query
