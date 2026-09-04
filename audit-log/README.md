# audit-log

Audit trail otonom untuk proyek miruamel (lokal: `/root/zhi`, remote: `miruamel/zhi` public). Dipelihara per mandat v6.0 §13.

## Entri

- `2026-08-29-discovery-zhi.md` — Discovery awal: metrik struktur, pelanggaran arsitektur, pemindaian secret.
- `2026-08-29-remediation-docs.md` — Remediasi docs: nest guides, ADR-005 untuk `docs/design/`.
- `2026-08-29-governance-ci.md` — CI architecture guard; rekomendasi LICENSE (P3).
- `2026-08-29-ci-lint-fix.md` — Self-review: hapus `*.py` dari guard; `bun test` ditunda.
- `2026-08-29-ci-fix-git-exclusion.md` — CI merah karena `.git` di-scan; perbaiki prune.
- `2026-08-29-license-mit.md` — LICENSE MIT + ADR-006 exception untuk `audit-log/entries/`.
- `2026-08-29-ci-fix-sloc-total.md` — CI SLOC guard false-positive pada baris `total` wc; filter `$2 != "total"`.
- `2026-08-29-native-stream-wasm.md` — native/stream Zig→WASM: parse.zig, build.sh, stream.ts wrapper, test; deviasi build.zig (zig build hang).
- `2026-09-04-atomic-split-and-roadmap.md` — Atomic file split: `orch.test.ts` (157 SLOC) → 5 tests, `resil.test.ts` (172 SLOC) → 4 tests. Roadmap critic count corrected (8→15).
- `2026-09-04-branch-guard-failure.md` — CI architecture guard failed on `src/cli/test/` (7 files > 5 cap). Exemption added for `test/` dirs; later removed when flat `test/` dirs eliminated.
- `2026-09-04-branch-hygiene-vitest-false-positive.md` — Dependabot alert #1 (vitest CVE-2026-47429) confirmed false positive: zero vitest references in package.json, bun.lock, src/, or engine/. Alert already `fixed`; API returns 409 on further state changes.
- `2026-09-04-convergence-and-changelog.md` — CHANGES.md `[Unreleased]` written; README test count + badge status updated.
- `2026-09-04-convergence-verification.md` — Full convergence sweep: all gates green, working tree clean, no stale artifacts.
- `2026-09-04-critic-count-fix.md` — Roadmap critic count corrected from "8 stubs" to 15 concrete. v0.2.0 bullet struck through with DONE marker.
- `2026-09-04-critic-count-fix-2.md` — Follow-up: `docs/design/critic.md` roadmap section reworded; `compose`/`hygiene` removed from critic list.
- `2026-09-04-cycle-reflection.md` — Reflection: PR #46 merge/rebase failures, dependabot alert dismissal blocked (409), NO_TEST audit methodology corrected.
- `2026-09-04-docs-stale-facts-sweep.md` — Docs stale-facts sweep: CHANGES.md critic count 13→15 corrected; `docs/design/critic.md` roadmap reworded.
- `2026-09-04-final-convergence.md` — End-of-session sweep; superseded by `2026-09-04-state-sync.md`.
- `2026-09-04-keymap-state-tests.md` — 2 new test files (18 tests, 36 expect) for `src/tui/core/keymap.ts` + `state.ts`.
- `2026-09-04-pipeline-verification.md` — End-to-end SSE pipeline verified: `zigBridge.ts` (119 SLOC), `parseStream` dispatcher, `cloud.ts` consumer. 5 assertions pass.
- `2026-09-04-pr46-superseded.md` — PR #46 (`feat/tui-ink`) closed as superseded; branch deleted locally + remotely.
- `2026-09-04-pr47-closure.md` — PR #47 (`fix/tui-tsc-debt`) closed as superseded; branch deleted.
- `2026-09-04-pr48-closure.md` — PR #48 (`fix/tui-tsc-debt-2-widgets`) closed as superseded; branch deleted. Third in the divergent-TUI-lineage series.
- `2026-09-04-state-sync.md` — Consolidated entry reconciling audit log with actual repo state; supersedes stale claims in `final-convergence.md` and `pr47-closure.md`.
- `2026-09-04-stream-test-determinism.md` — `parseSseWasm` fail-closed guard added; stream tests rewritten to be env-independent.
- `2026-09-04-topatch-coverage.md` — Test coverage audit: 155 source files scanned against 76 test files; 19 files without direct tests, all resolved.
- `2026-09-04-zig-0.16.0-fix.md` — Zig 0.16.0 build fix for `native/stream/parse.zig`.

## Invarian yang dilacak

Rata-rata SLOC/file, SLOC maks, file/dir (≤5), kedalaman nesting (≥4), jumlah god-file, jumlah flat-dir, circular dependency, kebocoran secret.

## Catatan

Direktori ini adalah analog lokal dari `miruamel/audit-log`. Bila remote dikonfigurasi, promosikan menjadi repositori sendiri dan audit serupa. Riwayat di sini append-only; jangan hapus entri.
