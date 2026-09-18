<!-- rctc-suite-pointer -->

> Packaged in [kazoya/rctc-skill](https://github.com/kazoya/rctc-skill) as `apca-smarthelp/`. Canonical Belt tree: `C:\\Belt\\APCA-SmartHelp`.

# APCA SmartHelp

© 2026 APCA Systems — Amal Al-Hayat for Systems & Electronic Control.  
Developed by Suhib Asrawi. All rights reserved.  
**Rights contact:** innervision2016@gmail.com

Local-first **PDF → semantic help** system inspired by JavaHelp / CHM / JAR HelpSets,
with hybrid keyword + vector search and optional grounded answers via Ollama.

Imported documents remain the intellectual property of their respective copyright owners.
APCA SmartHelp indexes content for authorized internal use and does not transfer ownership
of imported material.

## What it does

1. Import PDF and EPUB books  
2. Extract structure (chapters / topics / passages)  
3. Index with SQLite FTS5 + embeddings (FAISS, with hnswlib fallback)  
4. Search with confidence-aware auto-open (never blindly open the first hit)  
5. Ask grounded questions with citations and page numbers  
6. Export / import portable `.apcahelp` packages  

Related topics follow the JavaHelp pattern seen in `BStime_en`: siblings, children
(“More information”), plus semantic neighbors.

## Prerequisites (Windows 11)

- Python 3.12+
- Node.js 20+
- Optional: [Ollama](https://ollama.com) for grounded LLM answers

## Setup

```powershell
cd C:\Belt\APCA-SmartHelp
.\scripts\setup.ps1
```

First embedding run downloads the Sentence Transformers model configured in
`backend/config/settings.json` (default multilingual MiniLM). Model weights are
**not** bundled in this repo.

## Run

```powershell
.\scripts\run-dev.ps1
```

## Update embeddings from the content folders

Place books in `C:\Belt\embeddings\pdf` or `C:\Belt\embeddings\epub`, then run:

```powershell
cd C:\Belt\APCA-SmartHelp
.\scripts\update-embeddings.ps1
```

### BStime JavaHelp (`jar\BStime_en`) — واتساب / SmartHelp

لأسئلة منتج الحضور (إنشاء موظف، Personal data tab، …) داخل **نفس** فهرس SmartHelp:

```powershell
cd C:\Belt\APCA-SmartHelp
.\.venv\Scripts\python.exe scripts\import_bstime_javahelp.py
```

اختياري: بحث HTML سريع من PHP (`ProjectBrainService`) عبر:

```env
PROJECT_HELP_ROOT=C:\Belt\jar\BStime_en\Documents
```

في `flutter_sms_gateway\backend\.env` — المسار الرئيسي للإجابات الموثقة يبقى SmartHelp بعد الاستيراد أعلاه.

The command is idempotent: already imported files are detected by SHA-256 and are not duplicated.
When the Belt API is already running, the script reuses that process to avoid loading the embedding model twice.

- API: http://127.0.0.1:8787  
- UI: http://127.0.0.1:5173  
- Docs: http://127.0.0.1:8787/docs  

Or separately:

```powershell
$env:PYTHONPATH = (Get-Location)
.\.venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8787 --reload
cd frontend; npm run dev -- --host 127.0.0.1 --port 5173
```

## Tests

```powershell
.\scripts\run-tests.ps1
```

## Ollama (optional)

1. Install Ollama and pull a model, e.g. `ollama pull llama3.2`  
2. In Settings (or `backend/config/settings.json`) set:

```json
"ollama": { "enabled": true, "base_url": "http://127.0.0.1:11434", "model": "llama3.2" }
```

Core search works without Ollama. Ask mode falls back to extractive grounded answers.

## Answer style (Ask / Write a Topic)

- **Tone:** formal / casual  
- **Verbosity:** short / detailed  

Always cite `[Document Title, page N]`.

## Auto-open policy

| Situation | Behavior |
|-----------|----------|
| Strong unique top result | Open topic |
| Close competing scores | Show top 5 |
| No reliable match | «لم أجد موضوعاً مطابقاً» |

## `.apcahelp` package

ZIP package with `manifest.json`, `knowledge.sqlite`, vectors, topics, `checksums.json`,
and `copyright.txt`. Checksums verify integrity — they are **not** digital signatures.

## Troubleshooting

- **FAISS install fails on Windows:** the app falls back to `hnswlib` via `VectorIndex`.  
- **Embeddings unavailable:** keyword FTS search still works.  
- **Scanned PDFs:** enable OCR in settings; OCR fails gracefully if unavailable.  
- **Reset local data:** `.\scripts\reset-local-data.ps1`

## License / ownership

See `LICENSE.md`, `COPYRIGHT.md`, and `THIRD_PARTY_NOTICES.md`.

Unauthorized copying or rebranding of APCA SmartHelp may be reported to
**innervision2016@gmail.com**.
