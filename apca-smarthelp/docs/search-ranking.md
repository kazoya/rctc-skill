# Hybrid Search Ranking

© 2026 APCA Systems — Developed by Suhib Asrawi. All rights reserved.

## Channels

1. **Lexical / BM25** — SQLite FTS5 on normalized search text.
2. **Semantic** — cosine similarity via FAISS or hnswlib.
3. **Exact title / heading match** — boost when query matches topic title or heading path.
4. **Phrase / metadata boost** — quoted phrases, error codes, identifiers, document filters.

## Default Weights (`backend/config/settings.json`)

| Signal | Weight |
|--------|--------|
| Semantic similarity | 0.55 |
| Lexical / BM25 | 0.30 |
| Exact title/heading | 0.10 |
| Phrase / metadata | 0.05 |

Scores are min-max normalized within the candidate set before weighted fusion.

## Auto-Open Rules

```
auto_open_threshold = 0.72
min_first_second_gap = 0.05
```

| Condition | UI Behavior |
|-----------|-------------|
| top1 >= threshold AND (top1 - top2) >= gap | Auto-open topic |
| Otherwise with candidates | Show top 5 |
| No useful candidates | No-match message |

## Why Hybrid Matters

- `ORA-04036`, method names, class names → need exact / lexical match.
- “لماذا لا تنعكس الإجازات؟” → needs semantic retrieval.
- Never rely on embeddings alone.

## Related Topics Ranking

For a selected topic:

1. Same-chapter siblings (JavaHelp “More information” pattern).
2. Child topics.
3. Semantic neighbors (exclude self), capped and de-duplicated.
