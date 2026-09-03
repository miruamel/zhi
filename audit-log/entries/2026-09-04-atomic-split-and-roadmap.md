# 2026-09-04 — Atomic test split + roadmap correction

## Context

Post-merge convergence: PR #45 (ink TUI) merged, test coverage added, gate green. Two items remained — architecture guard SLOC violation and a stale roadmap claim.

## Actions

### 1. Split monolithic pane test (architecture guard §6.2)

- **Problem**: `src/tui/panes/test/panes.test.ts` at 401 SLOC violated the ≤150 hard cap.
- **Action**: Deleted the monolith; wrote 8 atomic test files, one per pane component (`header`, `dag`, `detail`, `critics`, `eval`, `pr`, `log`, `help`). Max 47 SLOC per file. Each file has its own `renderToString` helper (intentional duplication — atomic file principle, no shared test utils barrel).
- **Result**: Architecture guard now passes both checks (files-per-dir + SLOC). 105 tests / 210 expect calls across 14 TUI test files, all passing.
- **Commit**: `44091fc` — `refactor(tui): split monolithic pane test into 8 atomic files`

### 2. Roadmap critic status correction

- **Problem**: `docs/guides/roadmap.md` line 15 claimed `critic/*` had "8 stubs" — all 13 critics are concrete implementations (accessibility, architecture, compose, doc, hygiene, imports, maintainability, perf, privacy, security, sloc, style, todo). Stale doc = technical debt.
- **Action**: Updated v0.1.0 scope to list all 13 concrete critics + aggregate. Struck through the v0.2.0 "remaining 8 critics" bullet with a DONE marker.
- **Result**: Gate green (format check passes after Prettier normalization). Doc now accurate.
- **Commit**: `a70c284` — `docs(roadmap): correct critic status — all 13 concrete, not 8 stubs`

## Verification

- `bun run gate`: lint 0 errors, format PASS, typecheck PASS, 356 tests pass / 0 fail, critic score 1.0 / 0 findings. Exit 0.
- `bash .github/workflows/architecture-guard.sh`: all checks passed. Exit 0.
- Branch state: `main` + `origin/main` only. `origin/main` is ancestor of local main (3 commits ahead). No divergence.
- Open issues: 0. Open PRs: 0. Working tree: clean.

## Debt remaining (P3, not blocking)

- `knowledge/docs.ts` + `knowledge/versions.ts` — waiting for input sources (OpenAPI spec / doc corpus).
- `eval/sandbox.ts` container — needs container runtime; not prioritised in this env.
- `build/sanitize.ts` — conditional on web input; not yet active.
- Parallel scheduler — deferred to v1.0.0 (no independent steps exist in linear DAG).
- `native/embed/embed.wasm` — deferred (needs embedding model).
