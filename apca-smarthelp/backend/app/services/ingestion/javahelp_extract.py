from __future__ import annotations

import hashlib
import re
from html.parser import HTMLParser
from pathlib import Path

from backend.app.services.ingestion.pdf_extract import PageExtract, TextBlock


class _TextExtractor(HTMLParser):
  def __init__(self) -> None:
    super().__init__(convert_charrefs=True)
    self._skip = False
    self._skip_depth = 0
    self._pieces: list[str] = []
    self._title = ""
    self._in_title = False
    self._headings: list[str] = []

  @property
  def title(self) -> str:
    return self._title.strip()

  @property
  def text(self) -> str:
    raw = " ".join(self._pieces)
    return re.sub(r"\s+", " ", raw).strip()

  @property
  def breadcrumbs(self) -> str:
    return " > ".join(self._headings)

  def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
    t = tag.lower()
    if t in ("script", "style"):
      self._skip = True
      self._skip_depth += 1
      return
    if t == "title":
      self._in_title = True
    if t in ("h1", "h2", "h3", "h4", "h5", "h6"):
      self._headings.append("")

  def handle_endtag(self, tag: str) -> None:
    t = tag.lower()
    if t in ("script", "style") and self._skip_depth:
      self._skip_depth -= 1
      if self._skip_depth == 0:
        self._skip = False
    if t == "title":
      self._in_title = False
    if t in ("h1", "h2", "h3", "h4", "h5", "h6") and self._headings:
      self._headings.pop()

  def handle_data(self, data: str) -> None:
    if self._skip:
      return
    chunk = (data or "").strip()
    if not chunk:
      return
    if self._in_title:
      self._title += chunk
      return
    if self._headings:
      self._headings[-1] = (self._headings[-1] + " " + chunk).strip()
    self._pieces.append(chunk)


def _read_html(path: Path) -> str:
  raw = path.read_bytes()
  text = raw.decode("utf-8", errors="ignore")
  m = re.search(r'charset\s*=\s*["\']?([\w-]+)', text, re.I)
  enc = (m.group(1) if m else "windows-1252").lower().replace("windows-1252", "cp1252")
  try:
    return raw.decode(enc)
  except LookupError:
    return raw.decode("cp1252", errors="replace")


def _folder_hash(root: Path, files: list[Path]) -> str:
  h = hashlib.sha256()
  h.update(str(root.resolve()).encode("utf-8"))
  for path in files:
    h.update(path.name.encode("utf-8"))
    h.update(str(path.stat().st_size).encode("ascii"))
    h.update(str(int(path.stat().st_mtime)).encode("ascii"))
  return h.hexdigest()


def extract_javahelp_pages(help_root: Path) -> tuple[list[PageExtract], dict]:
  docs = help_root / "Documents"
  if not docs.is_dir():
    raise FileNotFoundError(f"JavaHelp Documents folder not found: {docs}")

  files = sorted(docs.glob("*.htm")) + sorted(docs.glob("*.html"))
  if not files:
    raise FileNotFoundError(f"No .htm topics under {docs}")

  pages: list[PageExtract] = []
  for index, path in enumerate(files, start=1):
    html = _read_html(path)
    parser = _TextExtractor()
    parser.feed(html)
    title = parser.title or path.stem.replace("_", " ")
    body = parser.text
    if not body:
      continue
    crumb = parser.breadcrumbs
    heading_path = crumb if crumb else title
    blocks: list[TextBlock] = []
    if crumb:
      blocks.append(
        TextBlock(
          page_number=index,
          block_index=0,
          text=crumb,
          x0=0,
          y0=0,
          x1=0,
          y1=0,
          font_size=14,
          is_bold=True,
          is_heading=True,
        )
      )
    blocks.append(
      TextBlock(
        page_number=index,
        block_index=len(blocks),
        text=f"{title}\n\n{body}",
        x0=0,
        y0=0,
        x1=0,
        y1=0,
        font_size=11,
        is_bold=False,
        is_heading=False,
      )
    )
    pages.append(
      PageExtract(
        page_number=index,
        blocks=blocks,
        char_count=sum(len(b.text) for b in blocks),
        likely_scanned=False,
      )
    )

  meta = {
    "title": help_root.name,
    "author": "BStime JavaHelp",
    "page_count": len(pages),
    "metadata": {
      "source": "javahelp",
      "help_root": str(help_root.resolve()),
      "topic_files": len(files),
    },
  }
  meta["file_hash_sha256"] = _folder_hash(help_root, files)
  return pages, meta
