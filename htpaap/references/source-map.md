# HTPAAP Layer 1 — source and relationship map

## Reading order

| Rank | Source | Primary lesson | Read first | Leads to |
|---:|---|---|---|---|
| 1 | TigerBeetle | explicit invariants, deterministic simulation, correctness under failure | `docs/TIGER_STYLE.md`, `docs/ARCHITECTURE.md` | SQLite, curl |
| 2 | SQLite | durability, compatibility, boundary testing, small stable interfaces | root README, `src/`, test systems and architecture docs | curl, application data design |
| 3 | curl | protocol robustness, portability, CI breadth, vulnerability handling | `docs/`, `tests/`, disclosure policy | ripgrep, secure network clients |
| 4 | ripgrep | measured performance, respectful issue reasoning, API/CLI ergonomics | `README.md`, `GUIDE.md`, `FAQ.md`, benchmarks and discussions | profiling and search internals |
| 5 | xv6-riscv | minimal systems code and direct mapping between concept and implementation | `README`, xv6 book, kernel entry points | OS, concurrency and security foundations |

## Learning graph

```text
xv6 ──systems model──────────────┐
                                 ▼
TigerBeetle ──invariants──▶ SQLite ──durability──▶ application architecture
      │                          │
      └──simulation/testing──────┴──▶ curl ──portability/security──▶ production operations
                                               │
ripgrep ──measurement/ergonomics────────────────┘
```

The graph is a study order, not a dependency claim between the upstream projects.

## What to map in every repository

1. Product contract and non-goals.
2. Module and directory boundaries.
3. Build, test, benchmark, release, and security paths.
4. Invariants and failure model.
5. Public interface and compatibility promises.
6. One regression: symptom → cause → fix → prevention test.
7. One rejected idea and why it was rejected.

## Layer-1 exercises

### TigerBeetle
Write five invariants from primary docs, locate where two are asserted or tested, and mark any inference.

### SQLite
Trace one SQL statement from parse to execution at a diagram level; do not copy implementation.

### curl
Map one protocol feature across documentation, option parsing, library boundary, tests, and release notes.

### ripgrep
Choose one performance claim, identify corpus/flags/environment, and reproduce or mark it unreproduced.

### xv6
Trace one system call from user stub to kernel handler and back, then draw the trust boundary.

## Exit gate

Layer 1 is complete for a source only when the map contains exact links, a pinned revision, one verified exercise, open questions, and a next-step recommendation.
