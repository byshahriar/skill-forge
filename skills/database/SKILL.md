---
name: database
description: Designs schemas, ships zero-downtime migrations, runs safe backfills, and fixes slow queries. Use when adding or changing tables and columns, when a migration touches a table with real data, when queries are slow or the database is the bottleneck, or when data integrity rules need to be decided.
license: MIT
---

# Database

## Overview

The database is the one component where mistakes are not rollback-able. Code deploys can be reverted in seconds; a migration that dropped a column, a backfill that wrote wrong values, or a schema that lost a constraint leaves damage that outlives the deploy. This skill covers the three moments that matter: **designing the schema**, **changing it without downtime**, and **making it fast**.

**The governing asymmetry:** schema changes are cheap before there is data and expensive after. Spend the design effort up front, and treat every migration against a populated table as a production operation, not a code change.

## When to Use

- Adding or altering tables, columns, indexes, or constraints
- Any migration that will run against a table containing real data
- Backfilling or transforming existing rows
- Queries are slow, the DB is the bottleneck, or an N+1 was found
- Deciding where an invariant lives (database constraint vs application code)

**When NOT to use:** Deprecating a whole system or API surface — that's `modernization` (which uses this skill for its data steps). General profiling of non-DB hot paths — that's `perf`. Designing the API over the data — that's `api-design`.

## Schema Design

**Model the domain, then adapt for access patterns** — in that order. A schema derived only from today's queries fossilizes today's product.

- **Name honestly and consistently.** Pick one convention (`snake_case`, singular vs plural tables) and never mix. `user_id` everywhere beats `userId` in one table and `uid` in another — join code inherits every inconsistency forever.
- **Types are the cheapest constraint.** `TIMESTAMPTZ` not `TIMESTAMP` (naive timestamps become a bug the first time someone's server moves timezone), `NUMERIC` not `FLOAT` for money, native enums or check constraints over free-text status columns, `TEXT` over arbitrary `VARCHAR(n)` limits that only cause migrations later.
- **NOT NULL by default.** Nullable should be a decision, not a leftover. Every nullable column becomes a branch in every consumer.
- **Put invariants in the database when they must always hold.** Foreign keys, unique constraints, and check constraints hold under concurrency, bad deploys, manual fixes, and second consumers. Application-level validation is a good error message, not a guarantee — you usually want both, and the DB one is the one that's true.
- **Model soft-delete deliberately or not at all.** A `deleted_at` column that half the queries forget is worse than a real delete plus an audit table.
- **Denormalize with a written reason.** Duplicate data is a synchronization obligation; if you take one, note what keeps the copies consistent and where that would break.

## Zero-Downtime Migrations

The core technique is **expand → migrate → contract**, because old and new code run simultaneously during any real deploy:

```
1. EXPAND    Add the new thing, nullable/optional, no behavior change.
             Old code ignores it; new code can use it. Deploy.
2. MIGRATE   Backfill data; start dual-writing (both old and new).
             Read from old, verify new matches. Deploy.
3. SWITCH    Read from new. Old column still written. Deploy.
4. CONTRACT  Stop writing old, then drop it — only after the switch has
             survived long enough that a rollback won't need it.
```

Each arrow is a separate deploy. Rename a column in one step and every in-flight request against the old code fails.

**Rules that hold regardless of engine:**

- **Never combine a schema change and a data change in one migration.** They fail differently and need different rollback plans.
- **Additive changes are safe; destructive ones are one-way doors.** Adding a nullable column is safe. Dropping, renaming, retyping, or narrowing is not — those get the expand/contract dance.
- **Know which operations lock.** Adding a `NOT NULL` column with a default, adding an index non-concurrently, or adding a foreign key that validates immediately can lock a large table for minutes. Use the engine's concurrent/online variants; add constraints as `NOT VALID`, then validate separately.
- **Set a lock timeout on every migration.** A migration that waits behind a long transaction and then holds the queue takes the site down more reliably than the schema change would have.
- **Every migration has a tested down path** — or an explicit, written statement that it is irreversible and why. "We'll write the rollback if we need it" is how outages get extended.
- **Test on production-shaped data.** A migration that takes 40 ms on 100 rows can take 40 minutes on 100 million. Time it against a realistic copy and state the expected duration before running it.

## Backfills

Backfills are long-running writes against live data — treat them as their own operation, never as part of a deploy:

- **Batch with bounded size and a pause** (e.g. 1–5k rows per batch, brief sleep between) so replication lag and lock contention stay flat. One giant `UPDATE` is the classic self-inflicted outage.
- **Make it resumable and idempotent.** Track progress (last processed id, or a state column); a rerun after a crash must not double-apply.
- **Watch while it runs**: replication lag, error rate, DB CPU, queue depth. Stop the backfill if any of them move — it is always safe to pause a well-batched backfill.
- **Verify before contracting**: count mismatches between old and new, spot-check a sample, and confirm the dual-write path caught rows created *during* the backfill.

## Query Performance

Measure before optimizing (see `perf` for the general discipline). For the database specifically:

- **Read the query plan, don't guess.** `EXPLAIN ANALYZE` (or the engine's equivalent) shows the actual path and row counts. A sequential scan on a large table, a nested loop over many rows, or an estimate wildly off from the actual is the finding.
- **Index for the query shape you actually run.** Composite index column order matters: equality columns first, then range, then sort. An index that doesn't match the predicate order is dead weight that still costs writes.
- **Every index is a write tax.** They slow inserts/updates and consume space; unused indexes are pure cost — check usage stats and drop the ones nothing reads.
- **N+1 is a code pattern, not a DB problem.** One query per row in a loop — usually invisible in code review and obvious in the query log. Fix by eager loading or a single set-based query.
- **Keep transactions short and never hold one across a network call.** A transaction awaiting an HTTP response holds locks for the remote system's latency, and its failure modes.
- **Paginate by keyset, not offset, on large tables.** `OFFSET 100000` reads and discards 100k rows every time.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "It's a small table, the migration will be instant" | It's small in dev. Check the production row count before every migration — that number is the whole risk model. |
| "I'll add the constraint later once the data is clean" | The data never gets clean without the constraint. Add it `NOT VALID`, fix the violations, then validate. |
| "Validation is in the application layer already" | Until a second service, a script, or a manual fix writes directly. DB constraints are the ones that hold under everything. |
| "Rename it in one migration, the deploy is fast" | Old and new code overlap during every deploy. One-step renames break every in-flight request. |
| "The backfill is simple, one UPDATE is fine" | One unbounded UPDATE on a big table takes locks and replication down with it. Batch it. |
| "Add an index, it'll be faster" | Indexes tax every write and only help matching query shapes. Read the plan first; verify the index is used after. |
| "We can roll back the deploy if the migration is wrong" | Code rolls back. Data doesn't. Destructive migrations need a tested down path *before* they run. |

## Red Flags

- A migration file that both alters schema and updates rows
- `DROP`, `RENAME`, or type change against a populated table in a single step
- No production row count or timing estimate stated before running
- Migration without a down path and without a written reason it's irreversible
- An unbounded `UPDATE`/`DELETE` in a backfill script
- Index added "just in case" with no query plan showing it used
- Nullable columns whose meaning nobody can articulate
- A transaction that spans an external API call

## Verification

- [ ] Production row count and expected duration known before running any migration
- [ ] Destructive changes staged as expand → migrate → switch → contract, one deploy each
- [ ] Locking behavior checked; lock timeout set; concurrent variants used where available
- [ ] Down path tested, or irreversibility stated explicitly with the reason
- [ ] Backfills batched, resumable, idempotent, and monitored while running
- [ ] Data verified (counts + sample) before any contract step
- [ ] Query changes justified by a plan read before and after
- [ ] Invariants that must always hold live in the database, not only in application code
