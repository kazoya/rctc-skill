from backend.app.services.qa.grounded import (
    INSUFFICIENT_AR,
    _is_company_narrative_question,
    ask,
)


def test_company_narrative_intent_detection():
    assert _is_company_narrative_question("how is your opinion about that company")
    assert _is_company_narrative_question("ما رأيك في الشركة؟")
    assert _is_company_narrative_question("tell me about the company")
    assert not _is_company_narrative_question("كم مشروع لسدايا؟")


def test_opinion_question_returns_company_narrative_not_insufficient():
    resp = ask("how is your opinion about that company", tone="formal", verbosity="short")
    assert resp.answer not in (INSUFFICIENT_AR,)
    assert "could not find" not in resp.answer.lower()
    assert "ITB" in resp.answer or "Information Belt" in resp.answer
    assert resp.evidence
    assert resp.evidence[0].explanation == "company_narrative"


def test_arabic_opinion_question_returns_narrative():
    resp = ask("ما رأيك في الشركة؟", tone="formal", verbosity="short")
    assert "لم أجد" not in resp.answer
    assert "ITB" in resp.answer or "حزام" in resp.answer
