from backend.app.services.qa.grounded import ask, _is_company_narrative_question
from backend.app.services.qa.grounded import _COMPANY_IDENTITY_Q


def test_company_name_english():
    resp = ask("ما اسم الشركة بالانجليزية", tone="formal", verbosity="short")
    assert "Information Belt" in resp.answer
    assert resp.evidence
    assert resp.evidence[0].explanation == "company_identity"


def test_company_name_english_direct():
    resp = ask("what is the company name in english", tone="formal", verbosity="short")
    assert "Information Belt" in resp.answer


def test_identity_intent():
    assert _COMPANY_IDENTITY_Q.search("ما اسم الشركة بالانجليزية")
    assert _COMPANY_IDENTITY_Q.search("company name in english")
