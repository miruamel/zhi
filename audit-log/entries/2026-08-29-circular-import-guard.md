# 2026-08-29 — Circular + Deep-Relative Import Guard (mandate §6.10, §6.11, §6.14)

## Problem / Opportunity

Metrics report `2026-08-29-architecture-metrics.md` deferred two mandated metrics:

- Circular dependency count (target 0, §6.14).
- Skipped-layer / deep-relative import count (target 0, §6.11).

§6.10 requires a CI check for circular dependencies. The architecture-guard
workflow only enforced file-count (≤5) and SLOC (≤200). Gap = P2 (audit
completeness, not a live defect).

## Evidence (before)

- `scripts/ci/architecture/check-circular.ts` run locally: `0 circular dependency`,
  `0 deep relative import`, exit 0.
- Import style across engine/src: relative only (`./`, `../`, `../../`); max depth
  `../../` (2 naik) in `engine/loop/wiring/*`. No `engine/` alias imports in code.
- No `madge`/`import-linter` dependency added (lazy-dev: no new dep for a ~80-SLOC walker).

## Decision

Add a zero-dependency Bun script that:

1. Walks `engine/`, `src/`, `native/` for `*.ts *.js *.zig`.
2. Parses `import/export ... from`, dynamic `import()`, and Zig `@import()`.
3. Resolves relative + `engine/`/`src/` specifiers to repo-absolute paths.
4. DFS-detects cycles (color-marked); flags relative imports going up >3 levels.
5. Exits 1 on any violation.

Wire as a CI step in `.github/workflows/architecture.yml` after `Setup Bun`.

Skipped-layer (architectural direction outer→inner) deferred: needs an explicit
layer taxonomy for this engine (no Clean/Hexagonal layer split yet). Not a
checkable invariant without that map — noted, not silently dropped.

## Impact

- Architecture-guard now covers: file-count, SLOC, circular dep, deep-relative.
- `bun test` unaffected: 59 pass / 0 fail / 13 files.
- New file `scripts/ci/architecture/check-circular.ts` at depth 5 (root/scripts/ci/architecture/) — compliant §6.4 (≥4).

## Rollback

`git revert <sha>` of this commit; removes CI step + script. No downstream impact.

## Status

Resolved (local). Push deferred per §2.11 network stall.
