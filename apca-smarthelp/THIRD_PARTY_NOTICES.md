# Third-Party Notices

APCA SmartHelp uses third-party libraries. Their licenses remain with their
respective owners. This project does not claim ownership of those libraries.

## Backend (Python)

| Component | Typical License | Purpose |
|-----------|-----------------|---------|
| FastAPI | MIT | HTTP API |
| Uvicorn | BSD-3-Clause | ASGI server |
| Pydantic | MIT | Validation |
| PyMuPDF (fitz) | AGPL-3.0 / commercial dual | PDF text extraction |
| sentence-transformers | Apache-2.0 | Embeddings |
| faiss-cpu | MIT | Vector similarity index |
| hnswlib | Apache-2.0 | Optional FAISS fallback |
| NumPy | BSD | Numeric arrays |
| httpx | BSD | Ollama HTTP client |
| pytest | MIT | Tests |

## Frontend (TypeScript / React)

| Component | Typical License | Purpose |
|-----------|-----------------|---------|
| React | MIT | UI |
| Vite | MIT | Build tooling |
| TypeScript | Apache-2.0 | Typing |
| React Router | MIT | Routing |
| Vitest | MIT | Tests |

## Optional Runtime Models

Embedding models (for example `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`)
and optional Ollama models are downloaded separately by the user and remain under
their upstream licenses. APCA SmartHelp does not bundle model weights in this
repository.

## PDF Engine Note

PyMuPDF is dual-licensed. Review [PyMuPDF licensing](https://pymupdf.readthedocs.io/en/latest/about.html#license-and-copyright)
before commercial redistribution of a packaged binary that includes it.
