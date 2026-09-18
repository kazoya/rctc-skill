from backend.app.core.arabic import normalize_arabic_for_search
from backend.app.core.security import is_path_traversal, looks_like_pdf, safe_filename


def test_arabic_normalization_preserves_meaning_variants():
    original = "الإِجَازَاتُ ـ ـ ـ"
    norm = normalize_arabic_for_search(original)
    assert "ا" in norm
    assert "\u0640" not in norm
    assert original != norm  # display text untouched by caller


def test_safe_filename_and_traversal():
    assert ".." not in safe_filename("../etc/passwd.pdf")
    assert is_path_traversal("../secret")
    assert is_path_traversal("C:/Windows/x")
    assert not is_path_traversal("topics/a.md")
    assert looks_like_pdf(b"%PDF-1.7....")
    assert not looks_like_pdf(b"PK\x03\x04")
