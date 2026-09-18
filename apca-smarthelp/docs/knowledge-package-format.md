# `.apcahelp` Knowledge Package Format

© 2026 APCA Systems — Developed by Suhib Asrawi. All rights reserved.

## Overview

`.apcahelp` is a ZIP-compatible portable knowledge package.

```
APCA_Product_Manual.apcahelp
├── manifest.json
├── knowledge.sqlite
├── vectors/
│   ├── index.faiss   (or index.hnsw)
│   └── vector-metadata.json
├── topics/
├── assets/
├── documents/          (optional original PDFs)
├── copyright.txt
└── checksums.json
```

## manifest.json (required fields)

- `format_version`
- `product_name` (`APCA SmartHelp`)
- `package_title`
- `created_date`
- `creator`
- `copyright_notice`
- `rights_contact` (`innervision2016@gmail.com`)
- `documents[]`
- `embedding_model`
- `embedding_dimension`
- `chunking`
- `topic_count`
- `passage_count`
- `application_minimum_version`
- `include_original_pdfs`

## checksums.json

SHA-256 hashes for package members. Validated on import.
Checksums are **not** digital signatures.

## copyright.txt

Must include APCA copyright footer and the imported-documents disclaimer.
