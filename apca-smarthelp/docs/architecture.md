# APCA SmartHelp — Architecture

© 2026 APCA Systems — Amal Al-Hayat for Systems & Electronic Control.  
Developed by Suhib Asrawi. All rights reserved.  
Rights contact: innervision2016@gmail.com

## Product Goal

APCA SmartHelp converts PDF manuals into a portable, offline help system inspired
by JavaHelp / CHM / JAR HelpSets, enhanced with hybrid lexical + semantic search
and optional grounded Q&A via local Ollama.

## Inspiration from JavaHelp (`BStime_en`)

Classic JavaHelp packages contain:

| Artifact | Role |
|----------|------|
| `*.hs` HelpSet | Entry point: TOC, Index, Search views |
| `*-toc.xml` | Hierarchical table of contents |
| `*-map.jhm` | Topic ID → HTML URL mapping (context-sensitive F1) |
| `*-index.xml` | Keyword / subject index |
| `JavaHelpSearch/` | Prebuilt full-text search index |
| `Documents/` | Topic HTML pages |
| `related-topics` | Sibling / child topic suggestions (“More information”) |

APCA SmartHelp mirrors these concepts:

| JavaHelp | APCA SmartHelp |
|----------|----------------|
| HelpSet | `.apcahelp` package + `manifest.json` |
| TOC | `chapters` / `topics` tree in SQLite |
| Map IDs | `topic_id` + optional context keys |
| Search index | SQLite FTS5 + FAISS/hnswlib vectors |
| Related topics | Sibling topics + semantic neighbors |
| Topic HTML | Generated topic pages from PDF headings |

## Monorepo Layout

```
/backend   FastAPI + ingestion + search + packaging
/frontend  React + TypeScript + Vite (RTL/LTR)
/docs      Architecture and format docs
/scripts   Windows PowerShell DX scripts
/tests     Backend and frontend tests
```

## Runtime Topology

```
Browser (React)  --HTTP-->  FastAPI (127.0.0.1)
                               |
                               +--> SQLite (metadata + FTS5)
                               +--> VectorIndex (FAISS or hnswlib)
                               +--> Local PDF store
                               +--> Optional Ollama (localhost)
```

Default bind address is local-only. No telemetry. No cloud upload of documents.

## Core Pipelines

1. **Ingest** — hash PDF → extract pages/blocks → detect headings → chapters/topics/passages → FTS + embeddings.
2. **Search** — hybrid rank (semantic + lexical + title/heading + phrase boost) → auto-open or top-5.
3. **Ask** — retrieve passages → grounded prompt to Ollama → citations with page numbers.
4. **Package** — ZIP `.apcahelp` with DB, vectors, topics, checksums.

## Related Topics Strategy

When viewing a topic (JavaHelp-style):

1. Prefer **TOC siblings** under the same chapter/parent heading.
2. Prefer **child topics** listed under the current topic (“More information”).
3. Add **semantic neighbors** from vector search excluding the current topic.
4. Show them in the right panel of the Help Viewer.

## Confidence / Auto-Open Policy

Never always open the first hit.

- Strong unique match → auto-open first topic.
- Two close scores → show top 5.
- No reliable match → “لم أجد موضوعاً مطابقاً” / “No matching topic found.”

## Security Posture

Treat all PDF text as untrusted reference data. Never execute PDF JS, macros,
attachments, or instructions found inside documents. Grounded Q&A must isolate
document text from system instructions.
