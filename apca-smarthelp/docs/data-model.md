# Data Model

© 2026 APCA Systems — Developed by Suhib Asrawi. All rights reserved.

## Hierarchy

```
Document
  └── Chapter
        └── Topic
              └── Passage
                    └── PassageBlock (source PDF blocks)
```

## Tables

### documents
- id (TEXT PK), title, original_filename, author, language
- file_hash_sha256, page_count, copyright_owner, user_notes
- pdf_path, metadata_json, status, imported_at, updated_at

### chapters
- id, document_id FK, title, order_index, page_from, page_to

### topics
- id, document_id FK, chapter_id FK, parent_topic_id NULLABLE
- title, heading_path, summary, page_from, page_to, order_index
- body_text, body_html

### passages
- id, document_id, chapter_id, topic_id
- topic_title, heading_path
- text_original, text_search_normalized
- page_from, page_to, char_count, token_estimate
- embedding_status, extraction_confidence
- embedding_model, embedding_dim

### passage_blocks
- id, passage_id FK, page_number, block_index
- x0,y0,x1,y1, font_size, is_bold, raw_text

### import_jobs / embedding_jobs
- id, document_id, status, progress, message, error, created_at, updated_at, cancelled

### search_history
- id, query, mode, result_count, created_at

### app_settings
- key TEXT PK, value_json

### package_metadata
- id, package_title, format_version, created_at, creator, notes

## FTS5

Virtual table `passages_fts` indexed on:
`text_search_normalized`, `topic_title`, `heading_path`

Original Arabic display text is never overwritten by normalization.
