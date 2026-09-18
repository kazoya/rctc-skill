import sqlite3
import re
import sys

sys.path.insert(0, r"C:\Belt\APCA-SmartHelp")
from backend.app.services.ingestion.client_aliases import detect_client_key, DISPLAY_NAMES
from backend.app.services.qa.grounded import _split_portfolio_blocks, _norm_portfolio

db = r"C:\Belt\APCA-SmartHelp\backend\data\knowledge.sqlite"
c = sqlite3.connect(db)
c.row_factory = sqlite3.Row

PROC = re.compile(r"مشتريات|purchasing|procurement", re.I)

rows = c.execute(
    """
    SELECT p.id, p.page_from, p.text_original, d.title
    FROM passages p JOIN documents d ON d.id = p.document_id
    WHERE lower(d.title) LIKE '%مشاريع%' OR lower(d.original_filename) LIKE '%مشاريع%'
    """
).fetchall()

for row in rows:
    text = row["text_original"] or ""
    for block in _split_portfolio_blocks(text):
        if not PROC.search(block):
            continue
        key = detect_client_key(block)
        ar = DISPLAY_NAMES.get(key, (None, None))[0] if key else None
        print(f"page {row['page_from']} client={ar or key or '?'}")
        for line in block.splitlines()[:15]:
            if PROC.search(line) or (ar and ar[:4] in line) or 'وزار' in line or 'عدل' in line:
                print(" ", line[:100])
