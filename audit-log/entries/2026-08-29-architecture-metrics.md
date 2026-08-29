# 2026-08-29 — Architecture Metrics Report (mandate §6.14, §7, §13)

Periodic architecture metrics capture for `/root/zhi` (engine + src + native code roots).
Scanner: eval JS, SLOC = non-blank non-comment lines; depth = path segments from repo root.

## Metrics

| Metric | Value | Target | Status |
|---|---|---|---|
| Code files scanned | 31 | — | — |
| Avg SLOC/file | 29.5 | <75 | ✅ |
| Max SLOC/file | 72 (`engine/resil/resil.test.ts`) | ≤200 hard | ✅ |
| God files (>200 SLOC) | 0 | 0 | ✅ |
| Min nesting depth | 2 (`src/cli.ts`, `src/cli.test.ts`) | ≥4 hard | ⚠️ ADR-007 |
| Max nesting depth | 6 (`engine/loop/wiring/integration.test.ts`) | 6–10 | ✅ |
| Avg nesting depth | 3.2 | 6–10 | ⚠️ ADR-007 |
| Fat dirs (>5 direct files) | 0 real (root `.`=6 exempt §6.2; docs/design=10, audit-log/entries=10 allowlisted) | 0 | ✅ |
| Circular deps | not measured this pass | 0 | ⏳ |
| Skipped-layer imports | not measured this pass | 0 | ⏳ |

## Violations (real)

- **None.** All flagged items are covered by documented exceptions:
  - Root `.` = 6 config files → exempt per mandate §6.2 (root project dir may exceed 5).
  - `docs/design` (10) → ADR-005 exception (90-day review).
  - `audit-log/entries` (10) → ADR-006 exception (90-day review).
  - Depth min 2–3 → ADR-007 exception (engine/src/native layer-first convention; 90-day review).

## Notes

- `src/cli.ts` + `src/cli.test.ts` at depth 2 are the boot entry defined by repo `AGENTS.md` (`src/cli.ts` = argv→boot loop). Intentional; ADR-007 covers.
- All engine modules at depth 3 (`engine/<layer>/<file>.ts`) follow zhi AGENTS.md layer-first root; ADR-007 permits depth 2–3 for engine/src/native.
- `native/out/*.wasm` gitignored; not scanned.
- Circular-dependency + skipped-layer import checks deferred (need import-graph pass); next audit should add madge/import-linter.

## Action

- No remediation required this pass.
- Schedule: re-run metrics in 30 days (§13); confirm ADR-005/006/007 still valid at 90-day review.
- Next audit: add circular-dependency + skipped-layer import detection.

## Status

Resolved (local). Push deferred per §2.11 network stall.
