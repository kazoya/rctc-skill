from backend.app.conversation.orchestrator import try_conversation_answer
from backend.app.conversation.router import route_message
from backend.app.services.qa.grounded import ask


def test_levantine_question_word_does_not_become_greeting() -> None:
    route = route_message("شو بتقدموا بالتحول الرقمي؟")
    assert route.intent == "digital_transformation"
    assert route.requires_retrieval is True


def test_pure_dialect_greeting_still_works() -> None:
    route = route_message("شو في ما في")
    assert route.intent == "social_small_talk"


def test_digital_transformation_gets_grounded_direct_answer() -> None:
    response = try_conversation_answer("شو بتقدموا بالتحول الرقمي؟", verbosity="short")
    assert response is not None
    assert response.conversation is not None
    assert response.conversation.intent == "digital_transformation"
    assert "إدارة الخدمات" in response.answer
    assert "ERP" in response.answer
    assert "ZATCA" in response.answer


def test_erp_question_outranks_dialect_small_talk() -> None:
    route = route_message("شو عندك معلومات عن ERP")
    assert route.intent == "erp_services"
    assert route.requires_retrieval is False

    response = try_conversation_answer("شو عندك معلومات عن ERP", verbosity="short")
    assert response is not None
    assert response.conversation is not None
    assert response.conversation.intent == "erp_services"
    assert "تخطيط موارد المؤسسات" in response.answer
    assert "ZATCA" in response.answer


def test_membership_question_never_becomes_small_talk() -> None:
    question = "طيب شو رقم العضوية للشركة؟"
    route = route_message(question)
    assert route.intent not in {"greeting", "social_small_talk"}

    response = ask(question, verbosity="short")
    assert response.conversation is not None
    assert response.conversation.intent not in {"greeting", "social_small_talk"}
    assert "306329" in response.answer
    assert response.conversation.request_page_image is False


def test_membership_spelling_variants_return_structured_fact() -> None:
    for question in (
        "شو رقم العضوية للشركة؟",
        "ما هو رقم العضويه؟",
        "لو سمحت بدي رقم عضوية الغرفة التجارية",
    ):
        response = ask(question, verbosity="short")
        assert response.conversation is not None
        assert response.conversation.intent == "company_registration"
        assert response.conversation.request_page_image is False
        assert "306329" in response.answer
        assert "توريد رخص" not in response.answer


def test_commercial_registration_returns_structured_fact() -> None:
    response = ask("ما رقم السجل التجاري للشركة؟", verbosity="short")
    assert "1010257711" in response.answer
    assert "306329" not in response.answer


def test_national_address_footer_facts_are_structured() -> None:
    response = ask("ما هو العنوان الوطني ورقم المبنى والرمز البريدي؟", verbosity="short")
    assert "4110" in response.answer
    assert "12572" in response.answer
    assert "8807" in response.answer
    assert "توريد رخص" not in response.answer


def test_compound_greeting_government_question_answers_the_topic() -> None:
    response = ask(
        "مرحبا ما هي المشاريع الحكومية التي عملتم بها؟",
        verbosity="short",
    )
    assert response.conversation is not None
    assert response.conversation.intent == "government_projects"
    assert response.conversation.request_page_image is False
    assert "وزارة العدل" in response.answer
    assert "أهلين وسهلين" not in response.answer
