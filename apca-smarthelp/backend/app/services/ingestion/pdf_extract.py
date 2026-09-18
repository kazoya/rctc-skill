from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from typing import Any, Optional

import fitz  # PyMuPDF

from backend.app.core.config import load_settings


HEADING_NUM_RE = re.compile(
    r"^(\d+(\.\d+)*|[IVXLC]+\.|[أ-ي]\))\s+\S+",
    re.UNICODE,
)


def canonicalize_pdf_text(text: str) -> str:
    """Convert compatibility glyphs (notably Arabic presentation forms) to text."""
    return unicodedata.normalize("NFKC", text or "")


@dataclass
class TextBlock:
    page_number: int
    block_index: int
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    font_size: float
    is_bold: bool
    is_heading: bool = False


@dataclass
class PageExtract:
    page_number: int
    blocks: list[TextBlock] = field(default_factory=list)
    char_count: int = 0
    likely_scanned: bool = False


def _block_font_stats(page: fitz.Page, bbox: tuple[float, float, float, float]) -> tuple[float, bool]:
    sizes: list[float] = []
    bold = False
    try:
        d = page.get_text("dict")
        for b in d.get("blocks", []):
            if b.get("type") != 0:
                continue
            for line in b.get("lines", []):
                for span in line.get("spans", []):
                    sx0, sy0, sx1, sy1 = span["bbox"]
                    if sx1 < bbox[0] or sx0 > bbox[2] or sy1 < bbox[1] or sy0 > bbox[3]:
                        continue
                    sizes.append(float(span.get("size", 0)))
                    font = str(span.get("font", "")).lower()
                    flags = int(span.get("flags", 0))
                    if "bold" in font or (flags & 2**4):
                        bold = True
    except Exception:
        pass
    avg = sum(sizes) / len(sizes) if sizes else 11.0
    return avg, bold


def _ocr_settings() -> dict[str, Any]:
    settings = load_settings()
    ocr = settings.get("ocr", {}) or {}
    return {
        "enabled": bool(ocr.get("enabled", False)),
        "min_chars_per_page": int(ocr.get("min_chars_per_page", 40)),
        "image_ocr": bool(ocr.get("image_ocr", True)),
        "table_band_ocr": bool(ocr.get("table_band_ocr", True)),
        "languages": str(ocr.get("languages", "ara+eng")),
        "min_image_area_ratio": float(ocr.get("min_image_area_ratio", 0.012)),
        "max_images_per_page": int(ocr.get("max_images_per_page", 8)),
        "dpi": int(ocr.get("dpi", 200)),
        "table_band_dpi": int(ocr.get("table_band_dpi", 220)),
    }


def _image_regions(page: fitz.Page, min_area_ratio: float) -> list[fitz.Rect]:
    page_area = max(page.rect.width * page.rect.height, 1.0)
    min_area = page_area * min_area_ratio
    regions: list[fitz.Rect] = []
    seen: set[tuple[int, int, int, int]] = set()

    def add_rect(rect: fitz.Rect) -> None:
        if rect.is_empty or rect.width * rect.height < min_area:
            return
        key = (int(rect.x0), int(rect.y0), int(rect.x1), int(rect.y1))
        if key in seen:
            return
        seen.add(key)
        regions.append(rect)

    try:
        for block in page.get_text("dict").get("blocks", []):
            if block.get("type") != 1:
                continue
            add_rect(fitz.Rect(block["bbox"]))
    except Exception:
        pass

    try:
        for info in page.get_images(full=True):
            xref = int(info[0])
            for rect in page.get_image_rects(xref):
                add_rect(rect)
    except Exception:
        pass

    regions.sort(key=lambda r: (r.y0, r.x0))
    return regions


def try_ocr_region(page: fitz.Page, clip: fitz.Rect, *, languages: str, dpi: int) -> Optional[str]:
    text = _try_ocr_region_pymupdf(page, clip, languages=languages, dpi=dpi)
    if text:
        return text
    return _try_ocr_region_rapid(page, clip, dpi=dpi)


def _try_ocr_region_pymupdf(page: fitz.Page, clip: fitz.Rect, *, languages: str, dpi: int) -> Optional[str]:
    try:
        tp = page.get_textpage_ocr(clip=clip, language=languages, dpi=dpi, full=False)  # type: ignore[attr-defined]
        text = (page.get_text(textpage=tp) or "").strip()
        return text or None
    except TypeError:
        try:
            tp = page.get_textpage_ocr(clip=clip, dpi=dpi, full=False)  # type: ignore[attr-defined]
            text = (page.get_text(textpage=tp) or "").strip()
            return text or None
        except Exception:
            return None
    except Exception:
        return None


def _try_ocr_region_rapid(page: fitz.Page, clip: fitz.Rect, *, dpi: int) -> Optional[str]:
    try:
        from rapidocr_onnxruntime import RapidOCR
    except Exception:
        return None
    try:
        scale = max(dpi / 72.0, 1.5)
        matrix = fitz.Matrix(scale, scale)
        pix = page.get_pixmap(matrix=matrix, clip=clip, alpha=False)
        if pix.width < 20 or pix.height < 20:
            return None
        img_bytes = pix.tobytes("png")
        engine = getattr(_try_ocr_region_rapid, "_engine", None)
        if engine is None:
            engine = RapidOCR()
            setattr(_try_ocr_region_rapid, "_engine", engine)
        result, _ = engine(img_bytes)
        if not result:
            return None
        lines = [str(item[1]).strip() for item in result if len(item) > 1 and str(item[1]).strip()]
        text = "\n".join(lines).strip()
        return text or None
    except Exception:
        return None


_PROJECT_PAGE_RE = re.compile(r"اسم العميل|اسم العمیل|تفاصيل المشاريع|تفاصیل المشاریع", re.I)
_CLIENT_LABEL_RE = re.compile(r"اسم العميل|اسم العمیل", re.I)


def _page_needs_table_band_ocr(blocks: list[TextBlock]) -> bool:
    text = "\n".join(b.text for b in blocks)
    if not _PROJECT_PAGE_RE.search(text):
        return False
    if _CLIENT_LABEL_RE.search(text):
        return True
    return "اسم المشروع" in text or "اسم المشروع" in text


def _table_band_clips(page: fitz.Page) -> list[fitz.Rect]:
    r = page.rect
    return [
        fitz.Rect(r.x0 + r.width * 0.52, r.y0 + r.height * 0.10, r.x1 - 6, r.y1 - 6),
        fitz.Rect(r.x0 + 6, r.y0 + r.height * 0.55, r.x1 - 6, r.y1 - 6),
    ]


def _structure_table_band_ocr(ocr_text: str, page_number: int) -> str:
    from backend.app.services.ingestion.client_aliases import CLIENT_ALIASES, DISPLAY_NAMES, detect_client_key

    lines: list[str] = [f"[استخراج جدول المشاريع — صفحة {page_number}]"]
    seen_clients: set[str] = set()
    merged = ocr_text or ""

    for raw in merged.splitlines():
        line = raw.strip()
        if not line or len(line) < 3:
            continue
        key = detect_client_key(line)
        if key and key not in seen_clients:
            seen_clients.add(key)
            ar, en = DISPLAY_NAMES.get(key, (line, line))
            lines.append(f"اسم العميل: {ar} ({en})")
        elif re.search(r"Company|Authority|Ministry|الشركة|الهيئة|وزارة", line, re.I) and len(line) > 8:
            if not line.lower().startswith("ite") and "belt" not in line.lower():
                lines.append(f"اسم العميل: {line}")

    # Whole-band pass — catches logos split across OCR noise (e.g. SDAIA table cells).
    for key, aliases in CLIENT_ALIASES.items():
        if key in seen_clients:
            continue
        if any(re.search(re.escape(a), merged, re.I) for a in aliases):
            seen_clients.add(key)
            ar, en = DISPLAY_NAMES.get(key, (key, key))
            lines.append(f"اسم العميل: {ar} ({en})")

    if len(lines) == 1:
        cleaned = "\n".join(ln.strip() for ln in merged.splitlines() if ln.strip())
        if cleaned:
            lines.append(cleaned)
    return "\n".join(lines)


def extract_table_band_ocr_blocks(
    page: fitz.Page,
    page_number: int,
    start_index: int,
    ocr_cfg: dict[str, Any],
) -> list[TextBlock]:
    if not ocr_cfg.get("enabled") or not ocr_cfg.get("table_band_ocr"):
        return []

    dpi = int(ocr_cfg.get("table_band_dpi", 220))
    languages = str(ocr_cfg.get("languages", "ara+eng"))
    merged_parts: list[str] = []
    for clip in _table_band_clips(page):
        ocr = try_ocr_region(page, clip, languages=languages, dpi=dpi)
        if not ocr:
            ocr = _try_ocr_region_rapid(page, clip, dpi=dpi)
        if ocr:
            merged_parts.append(canonicalize_pdf_text(ocr).strip())

    if not merged_parts:
        return []

    merged = "\n".join(merged_parts)
    structured = _structure_table_band_ocr(merged, page_number)
    if len(structured) < 12:
        return []

    return [
        TextBlock(
            page_number=page_number,
            block_index=start_index,
            text=structured,
            x0=float(page.rect.x0),
            y0=float(page.rect.y0 + page.rect.height * 0.55),
            x1=float(page.rect.x1),
            y1=float(page.rect.y1),
            font_size=11.0,
            is_bold=False,
        )
    ]


def _build_client_summary_block(pages: list[PageExtract]) -> TextBlock | None:
    from backend.app.services.ingestion.client_aliases import CLIENT_ALIASES, DISPLAY_NAMES, detect_client_key

    counts: dict[str, int] = {}
    for page in pages:
        for block in page.blocks:
            for line in (block.text or "").splitlines():
                if "اسم العميل:" not in line:
                    continue
                key = detect_client_key(line)
                if key:
                    counts[key] = counts.get(key, 0) + 1

    if not counts:
        return None

    lines = ["[ملخص عدد المشاريع حسب العميل — مستخرج من جداول المشاريع]"]
    for key, total in sorted(counts.items(), key=lambda x: -x[1]):
        ar, en = DISPLAY_NAMES.get(key, (key, key))
        lines.append(f"عدد مشاريع {ar} ({en}): {total}")
    text = "\n".join(lines)
    last_page = pages[-1].page_number if pages else 1
    return TextBlock(
        page_number=last_page,
        block_index=9999,
        text=text,
        x0=0,
        y0=0,
        x1=0,
        y1=0,
        font_size=12,
        is_bold=True,
        is_heading=True,
    )


def extract_image_ocr_blocks(page: fitz.Page, page_number: int, start_index: int, ocr_cfg: dict[str, Any]) -> list[TextBlock]:
    if not ocr_cfg.get("enabled") or not ocr_cfg.get("image_ocr"):
        return []

    blocks: list[TextBlock] = []
    languages = str(ocr_cfg.get("languages", "ara+eng"))
    dpi = int(ocr_cfg.get("dpi", 200))
    min_ratio = float(ocr_cfg.get("min_image_area_ratio", 0.012))
    max_per_page = int(ocr_cfg.get("max_images_per_page", 5))
    page_area = max(page.rect.width * page.rect.height, 1.0)

    regions = _image_regions(page, min_ratio)
    regions.sort(key=lambda r: r.width * r.height, reverse=True)
    regions = regions[:max_per_page]

    for idx, rect in enumerate(regions):
        if (rect.width * rect.height) / page_area > 0.82:
            # Skip full-page decorative backgrounds on text-heavy slides.
            continue
        ocr_text = try_ocr_region(page, rect, languages=languages, dpi=dpi)
        if not ocr_text:
            continue
        ocr_text = canonicalize_pdf_text(ocr_text).strip()
        if len(ocr_text) < 4:
            continue
        blocks.append(
            TextBlock(
                page_number=page_number,
                block_index=start_index + idx,
                text=ocr_text,
                x0=float(rect.x0),
                y0=float(rect.y0),
                x1=float(rect.x1),
                y1=float(rect.y1),
                font_size=11.0,
                is_bold=False,
            )
        )
    return blocks


def extract_pdf_pages(pdf_path: str) -> tuple[list[PageExtract], dict[str, Any]]:
    ocr_cfg = _ocr_settings()
    min_chars = int(ocr_cfg["min_chars_per_page"])
    doc = fitz.open(pdf_path)
    meta = {
        "title": doc.metadata.get("title") or "",
        "author": doc.metadata.get("author") or "",
        "page_count": doc.page_count,
        "metadata": dict(doc.metadata or {}),
    }
    pages: list[PageExtract] = []
    page_sizes: list[float] = []

    for i in range(doc.page_count):
        page = doc.load_page(i)
        raw_blocks = page.get_text("blocks")
        blocks: list[TextBlock] = []
        char_count = 0
        for bi, b in enumerate(raw_blocks):
            if len(b) < 5:
                continue
            x0, y0, x1, y1 = b[0], b[1], b[2], b[3]
            text = canonicalize_pdf_text(b[4] or "").strip()
            if not text:
                continue
            font_size, is_bold = _block_font_stats(page, (x0, y0, x1, y1))
            page_sizes.append(font_size)
            blocks.append(
                TextBlock(
                    page_number=i + 1,
                    block_index=bi,
                    text=text,
                    x0=x0,
                    y0=y0,
                    x1=x1,
                    y1=y1,
                    font_size=font_size,
                    is_bold=is_bold,
                )
            )
            char_count += len(text)

        likely_scanned = char_count < min_chars
        if likely_scanned and ocr_cfg.get("enabled"):
            ocr_text = try_ocr_page(page, languages=str(ocr_cfg.get("languages", "ara+eng")), dpi=int(ocr_cfg.get("dpi", 200)))
            if ocr_text:
                ocr_text = canonicalize_pdf_text(ocr_text)
                blocks.append(
                    TextBlock(
                        page_number=i + 1,
                        block_index=len(blocks),
                        text=ocr_text,
                        x0=0,
                        y0=0,
                        x1=page.rect.width,
                        y1=page.rect.height,
                        font_size=12,
                        is_bold=False,
                    )
                )
                char_count = len(ocr_text)
                likely_scanned = False
        elif ocr_cfg.get("enabled"):
            image_blocks = extract_image_ocr_blocks(page, i + 1, len(blocks), ocr_cfg)
            for ib in image_blocks:
                if not _text_mostly_present(blocks, ib.text):
                    blocks.append(ib)
                    char_count += len(ib.text)
            if _page_needs_table_band_ocr(blocks):
                for tb in extract_table_band_ocr_blocks(page, i + 1, len(blocks), ocr_cfg):
                    if not _text_mostly_present(blocks, tb.text):
                        blocks.append(tb)
                        char_count += len(tb.text)

        pages.append(PageExtract(page_number=i + 1, blocks=blocks, char_count=char_count, likely_scanned=likely_scanned))

    if pages and _PROJECT_PAGE_RE.search("\n".join(b.text for p in pages for b in p.blocks)):
        summary = _build_client_summary_block(pages)
        if summary:
            pages[-1].blocks.append(summary)

    median_size = sorted(page_sizes)[len(page_sizes) // 2] if page_sizes else 11.0
    for page in pages:
        for block in page.blocks:
            block.is_heading = detect_heading(block, median_size)
    doc.close()
    return pages, meta


def _text_mostly_present(existing: list[TextBlock], new_text: str, min_len: int = 24) -> bool:
    probe = re.sub(r"\s+", " ", new_text.strip().lower())
    if len(probe) < min_len:
        return False
    snippet = probe[: min(80, len(probe))]
    for block in existing:
        hay = re.sub(r"\s+", " ", block.text.strip().lower())
        if snippet in hay:
            return True
    return False


def try_ocr_page(page: fitz.Page, *, languages: str = "ara+eng", dpi: int = 200) -> Optional[str]:
    """Optional OCR adapter — fails gracefully if unavailable."""
    try:
        tp = page.get_textpage_ocr(language=languages, dpi=dpi, full=True)  # type: ignore[attr-defined]
        text = page.get_text(textpage=tp)
        return (text or "").strip() or None
    except Exception:
        return None


def detect_heading(block: TextBlock, median_size: float) -> bool:
    text = block.text.strip()
    if not text or len(text) > 180:
        return False
    if HEADING_NUM_RE.match(text):
        return True
    if block.font_size >= median_size * 1.25:
        return True
    if block.is_bold and block.font_size >= median_size * 1.05 and "\n" not in text:
        return True
    return False
