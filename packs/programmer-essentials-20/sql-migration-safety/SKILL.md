---
name: sql-migration-safety
description: "Write expandable database migrations that can deploy before the new code reads them. Use when changing schema, indexes, or backfills on PostgreSQL or MySQL."
---

# sql-migration-safety

1. Expand first: add nullable columns or new tables. Do not rename or drop in the same release as the code switch.
2. Backfill in batches. Avoid a single transaction that locks a large table.
3. Index with the engine's non-blocking option when the table is large (`CREATE INDEX CONCURRENTLY` on PostgreSQL).
4. Deploy code that writes both old and new shapes, then switch reads, then contract (drop) in a later migration.
5. Include a down strategy or an explicit "forward-only" note.

Run the migration against a scratch database before calling it done.
