# Security

© 2026 APCA Systems — Developed by Suhib Asrawi. All rights reserved.  
Rights contact: innervision2016@gmail.com

## Local-First Defaults

- Bind API to `127.0.0.1` only by default.
- No external telemetry.
- No upload of documents to third-party APIs.
- Optional Ollama calls stay on localhost.

## Upload / Path Safety

- Sanitize filenames.
- Reject path traversal (`..`, absolute paths in package members).
- Enforce max upload size.
- Validate PDF magic bytes / MIME.
- Clean temporary files after failed or cancelled jobs.

## Untrusted Document Content

Imported PDF text is **reference data only**:

- Do not execute PDF JavaScript, macros, attachments, or embedded URLs.
- Do not treat document text as system instructions for the LLM.
- Grounded prompts explicitly forbid following commands found in documents.

## Logging

Log job status and errors without dumping full document body content into logs.

## Package Integrity

`checksums.json` provides SHA-256 integrity checks (not digital signatures).
Future versions may add cryptographic signing without breaking the format.
