from backend.app.services.qa.grounded import INSUFFICIENT_AR, INSUFFICIENT_EN, ask


def test_ask_without_ollama_and_no_docs():
    resp = ask("ما هي إعدادات الإجازات؟", tone="formal", verbosity="detailed")
    assert resp.ollama_used is False
    assert resp.answer in (INSUFFICIENT_AR, INSUFFICIENT_EN) or "لم أجد" in resp.answer
