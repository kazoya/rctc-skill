from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from backend.app.core.arabic import estimate_tokens, normalize_arabic_for_search
from backend.app.core.config import load_settings
from backend.app.services.ingestion.pdf_extract import PageExtract, TextBlock


@dataclass
class BuiltPassage:
    topic_title: str
    heading_path: str
    text_original: str
    text_search_normalized: str
    page_from: int
    page_to: int
    blocks: list[TextBlock] = field(default_factory=list)
    chapter_title: str = "General"
    parent_heading: Optional[str] = None
    extraction_confidence: float = 1.0


@dataclass
class BuiltTopic:
    title: str
    heading_path: str
    chapter_title: str
    parent_title: Optional[str]
    page_from: int
    page_to: int
    body_text: str
    passages: list[BuiltPassage] = field(default_factory=list)
    order_index: int = 0


def build_topics_and_passages(pages: list[PageExtract]) -> list[BuiltTopic]:
    settings = load_settings()
    chunk_cfg = settings["chunking"]
    target_min = int(chunk_cfg["target_tokens_min"])
    target_max = int(chunk_cfg["target_tokens_max"])
    overlap = int((chunk_cfg["overlap_tokens_min"] + chunk_cfg["overlap_tokens_max"]) / 2)

    # Flatten blocks with heading context
    current_chapter = "General"
    current_topic = "Introduction"
    heading_stack: list[str] = [current_topic]
    sections: list[dict] = []
    buffer_blocks: list[TextBlock] = []

    def flush_section() -> None:
        nonlocal buffer_blocks
        if not buffer_blocks:
            return
        text = "\n\n".join(b.text for b in buffer_blocks).strip()
        if not text:
            buffer_blocks = []
            return
        path = " > ".join(heading_stack)
        sections.append(
            {
                "chapter": current_chapter,
                "topic": heading_stack[-1],
                "parent": heading_stack[-2] if len(heading_stack) > 1 else None,
                "heading_path": path,
                "blocks": list(buffer_blocks),
                "text": text,
                "page_from": buffer_blocks[0].page_number,
                "page_to": buffer_blocks[-1].page_number,
            }
        )
        buffer_blocks = []

    for page in pages:
        confidence = 0.55 if page.likely_scanned else 1.0
        for block in page.blocks:
            if block.is_heading:
                flush_section()
                title = block.text.strip().split("\n")[0][:200]
                # Heuristic: larger/numbered headings start chapters
                if block.font_size >= 16 or (title and title[0].isdigit() and "." in title[:4]):
                    current_chapter = title
                    heading_stack = [title]
                else:
                    if len(heading_stack) == 1:
                        heading_stack.append(title)
                    else:
                        heading_stack[-1] = title
                current_topic = title
                buffer_blocks.append(block)
            else:
                buffer_blocks.append(block)
                # attach confidence via attribute on last section later
        # keep confidence on page for later mapping
        for b in page.blocks:
            setattr(b, "_confidence", confidence)

    flush_section()

    if not sections:
        # Fallback single topic from all text
        all_blocks = [b for p in pages for b in p.blocks]
        text = "\n\n".join(b.text for b in all_blocks).strip() or "Empty document"
        sections.append(
            {
                "chapter": "General",
                "topic": "Document",
                "parent": None,
                "heading_path": "Document",
                "blocks": all_blocks,
                "text": text,
                "page_from": 1,
                "page_to": pages[-1].page_number if pages else 1,
            }
        )

    topics: list[BuiltTopic] = []
    for idx, sec in enumerate(sections):
        passages = chunk_text(
            text=sec["text"],
            blocks=sec["blocks"],
            topic_title=sec["topic"],
            heading_path=sec["heading_path"],
            chapter_title=sec["chapter"],
            parent_heading=sec["parent"],
            page_from=sec["page_from"],
            page_to=sec["page_to"],
            target_min=target_min,
            target_max=target_max,
            overlap_tokens=overlap,
        )
        topics.append(
            BuiltTopic(
                title=sec["topic"],
                heading_path=sec["heading_path"],
                chapter_title=sec["chapter"],
                parent_title=sec["parent"],
                page_from=sec["page_from"],
                page_to=sec["page_to"],
                body_text=sec["text"],
                passages=passages,
                order_index=idx,
            )
        )
    return topics


def chunk_text(
    *,
    text: str,
    blocks: list[TextBlock],
    topic_title: str,
    heading_path: str,
    chapter_title: str,
    parent_heading: Optional[str],
    page_from: int,
    page_to: int,
    target_min: int,
    target_max: int,
    overlap_tokens: int,
) -> list[BuiltPassage]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    if not paragraphs:
        paragraphs = [text]

    passages: list[BuiltPassage] = []
    current: list[str] = []
    current_tokens = 0

    def make_passage(parts: list[str]) -> BuiltPassage:
        body = "\n\n".join(parts).strip()
        # Preserve heading context inside every chunk
        if not body.startswith(topic_title):
            body = f"{topic_title}\n\n{body}"
        conf = 1.0
        if blocks:
            confs = [getattr(b, "_confidence", 1.0) for b in blocks]
            conf = sum(confs) / len(confs)
        return BuiltPassage(
            topic_title=topic_title,
            heading_path=heading_path,
            text_original=body,
            text_search_normalized=normalize_arabic_for_search(body),
            page_from=page_from,
            page_to=page_to,
            blocks=blocks,
            chapter_title=chapter_title,
            parent_heading=parent_heading,
            extraction_confidence=conf,
        )

    for para in paragraphs:
        tok = estimate_tokens(para)
        # Never split a short paragraph unnecessarily
        if current and current_tokens + tok > target_max and current_tokens >= target_min:
            passages.append(make_passage(current))
            # overlap
            overlap_parts: list[str] = []
            overlap_count = 0
            for p in reversed(current):
                overlap_parts.insert(0, p)
                overlap_count += estimate_tokens(p)
                if overlap_count >= overlap_tokens:
                    break
            current = overlap_parts
            current_tokens = sum(estimate_tokens(p) for p in current)
        current.append(para)
        current_tokens += tok

    if current:
        passages.append(make_passage(current))
    return passages
