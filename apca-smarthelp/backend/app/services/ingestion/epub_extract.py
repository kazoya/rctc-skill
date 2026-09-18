from __future__ import annotations

import html
import re
import zipfile
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from typing import Any
from xml.etree import ElementTree as ET

from backend.app.services.ingestion.pdf_extract import PageExtract, TextBlock


class _TextExtractor(HTMLParser):
    BLOCK_TAGS = {"p", "div", "li", "blockquote", "dt", "dd", "pre", "br"}
    HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6", "title"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._parts: list[str] = []
        self._current: list[str] = []
        self._heading_depth = 0
        self._current_heading = False

    def handle_starttag(self, tag: str, attrs) -> None:
        tag = tag.lower()
        if tag in self.HEADING_TAGS:
            self._flush()
            self._heading_depth += 1
            self._current_heading = True
        elif tag in self.BLOCK_TAGS:
            self._flush()

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in self.HEADING_TAGS:
            self._flush()
            self._heading_depth = max(0, self._heading_depth - 1)
            self._current_heading = False
        elif tag in self.BLOCK_TAGS:
            self._flush()

    def handle_data(self, data: str) -> None:
        cleaned = re.sub(r"\s+", " ", html.unescape(data or "")).strip()
        if cleaned:
            self._current.append(cleaned)

    def _flush(self) -> None:
        text = " ".join(self._current).strip()
        if text:
            prefix = "\u0001" if self._current_heading else "\u0000"
            self._parts.append(prefix + text)
        self._current = []

    def finish(self) -> list[tuple[str, bool]]:
        self._flush()
        return [(part[1:], part[0] == "\u0001") for part in self._parts if len(part) > 1]


def _local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def extract_epub_pages(epub_path: str) -> tuple[list[PageExtract], dict[str, Any]]:
    path = Path(epub_path)
    if not zipfile.is_zipfile(path):
        raise ValueError("Invalid EPUB container / حاوية EPUB غير صالحة")

    with zipfile.ZipFile(path) as book:
        if len(book.infolist()) > 20_000:
            raise ValueError("EPUB contains too many entries")
        total_size = sum(item.file_size for item in book.infolist())
        if total_size > 500 * 1024 * 1024:
            raise ValueError("EPUB uncompressed content is too large")

        container = ET.fromstring(book.read("META-INF/container.xml"))
        rootfile = next(
            (node.attrib.get("full-path") for node in container.iter() if _local_name(node.tag) == "rootfile"),
            None,
        )
        if not rootfile:
            raise ValueError("EPUB package document is missing")
        rootfile = str(PurePosixPath(rootfile))
        package = ET.fromstring(book.read(rootfile))
        base = PurePosixPath(rootfile).parent

        metadata: dict[str, str] = {}
        for node in package.iter():
            name = _local_name(node.tag)
            if name in {"title", "creator", "language"} and (node.text or "").strip():
                metadata.setdefault(name, (node.text or "").strip())

        manifest: dict[str, str] = {}
        spine: list[str] = []
        for node in package.iter():
            name = _local_name(node.tag)
            if name == "item" and node.attrib.get("id") and node.attrib.get("href"):
                manifest[node.attrib["id"]] = node.attrib["href"]
            elif name == "itemref" and node.attrib.get("idref"):
                spine.append(node.attrib["idref"])

        pages: list[PageExtract] = []
        for page_number, item_id in enumerate(spine, start=1):
            href = manifest.get(item_id)
            if not href:
                continue
            member = str(base.joinpath(PurePosixPath(href.split("#", 1)[0])))
            try:
                raw = book.read(member)
            except KeyError:
                continue
            parser = _TextExtractor()
            parser.feed(raw.decode("utf-8", errors="replace"))
            blocks: list[TextBlock] = []
            for block_index, (text, is_heading) in enumerate(parser.finish()):
                blocks.append(
                    TextBlock(
                        page_number=page_number,
                        block_index=block_index,
                        text=text,
                        x0=0,
                        y0=float(block_index),
                        x1=100,
                        y1=float(block_index + 1),
                        font_size=18.0 if is_heading else 11.0,
                        is_bold=is_heading,
                        is_heading=is_heading,
                    )
                )
            if blocks:
                pages.append(
                    PageExtract(
                        page_number=page_number,
                        blocks=blocks,
                        char_count=sum(len(block.text) for block in blocks),
                        likely_scanned=False,
                    )
                )

    if not pages:
        raise ValueError("EPUB contains no readable text / لا يحتوي EPUB على نص قابل للقراءة")
    return pages, {
        "title": metadata.get("title", path.stem),
        "author": metadata.get("creator", ""),
        "page_count": len(pages),
        "metadata": {"format": "EPUB", **metadata},
    }
