"""Timeout behavior when Ollama is unreachable."""

from __future__ import annotations

import json
import time
import unittest
from unittest.mock import patch

from backend.app.services.qa.grounded import ask


class TimeoutBehaviorTest(unittest.TestCase):
    def test_unknown_question_returns_without_universal_ollama_hang(self) -> None:
        question = "ما المذكور عن كاميرات PTZ المتحركة في ملف المشاريع التفصيلي؟"
        started = time.perf_counter()
        with patch("backend.app.services.qa.grounded.ollama_reachable", return_value=False):
            with patch("backend.app.services.qa.openai_brain.openai_available", return_value=False):
                response = ask(question, verbosity="short")
        elapsed = time.perf_counter() - started
        payload = json.loads(response.model_dump_json())
        self.assertLess(elapsed, 25.0, f"ask() took {elapsed:.1f}s")
        self.assertTrue(payload.get("answer"))
        self.assertNotIn("أعد إرسال السؤال بصياغة أوضح", payload.get("answer", ""))


if __name__ == "__main__":
    unittest.main()
