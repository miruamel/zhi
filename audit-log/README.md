# audit-log

Audit trail otonom untuk proyek miruamel (lokal: `/root/zhi`, remote: `miruamel/zhi` public). Dipelihara per mandat v6.0 §13.

<<<<<<< HEAD
## Entri (56 file, kronologis)
=======
## Entri (54 file, kronologis)

+## Entri (53 file, kronologis)
>>>>>>> 0e52414 (docs: ADR-013 numbering gap + CHANGES 0.1.3 reorder + monitor audit entry)

- `2026-08-29-discovery-zhi.md` — Discovery awal: metrik struktur, pelanggaran arsitektur, pemindaian secret.
- `2026-08-29-remediation-docs.md` — Remediasi docs: nest guides, ADR-005 untuk `docs/design/`.
- `2026-08-29-governance-ci.md` — CI architecture guard; rekomendasi LICENSE (P3).
- `2026-08-29-ci-lint-fix.md` — Self-review: hapus `*.py` dari guard; `bun test` ditunda.
- `2026-08-29-ci-fix-git-exclusion.md` — CI merah karena `.git` di-scan; perbaiki prune.
- `2026-08-29-license-mit.md` — LICENSE MIT + ADR-006 exception untuk `audit-log/entries/`.
- `2026-08-29-ci-fix-sloc-total.md` — CI SLOC guard false-positive pada baris `total` wc; filter `$2 != "total"`.
- `2026-08-29-native-stream-wasm.md` — native/stream Zig→WASM: parse.zig, build.sh, stream.ts wrapper, test; deviasi build.zig (zig build hang).
- `2026-08-29-architecture-metrics.md` — §6.14 metrics scanner: 31 code files, sloc.avg 29.5, sloc.max 72, 0 god, depth 2–6, 0 circular, 0 deep-relative, 0 fat dirs.
- `2026-08-29-audit-log-remote-sync.md` — `miruamel/audit-log` (private) dibuat via `gh repo create`; sync 19 file via REST Contents API (receive-pack stall).
- `2026-08-29-package-manifest.md` — Buat `package.json` (version 0.1.0 experimental, type module, zero deps, scripts `test` + `arch:check`).
- `2026-08-29-circular-import-guard.md` — `scripts/ci/architecture/check-circular.ts` (0-dep Bun walker): DFS cycle detection + deep-relative >3 levels. 0 violations.
- `2026-08-29-layer-edge-guard.md` — Extend `check-circular.ts` dengan `ILLEGAL` layer table (`engine:['src']`, `src:['native']`, `native:['engine','src']`). 0 illegal layer edges.
- `2026-08-29-orch-conductor-contract-drift.md` — `engine/orch/conductor.ts` `nextAction()` meng-switch literal phantom (idle/generated/...) yang tak ada di `LoopState` enum; align ke enum asli.
- `2026-08-29-remove-dead-conductor.md` — `git rm engine/orch/conductor.ts` (+test): modul phantom, tak ada importer produksi; `engine/orch/` jadi kosong.
- `2026-08-29-cli-boot.md` — `src/cli.ts` boot entry: `main(argv)` → `LoopContext` → `LoopDriver.run(buildHandlers)` → DONE. `offlineDeps()` deterministic stub (ponytail: real LLM backend).
- `2026-08-29-critic-plant-build.md` — Multi-critic plant: sloc, todo, imports critics + `compose.ts`. `cli.ts` critique panggil `composeCritiques` (was hardcoded 0.9). 71 pass / 0 fail.
- `2026-08-29-loop-wiring-runnable.md` — `LoopDriver.run(maxSteps=64)` budget guard + `LoopContext`/`buildHandlers` wiring. 56 pass / 0 fail. Driver infinite-loop fixed.
- `2026-08-29-loop-integration-test.md` — `engine/loop/wiring/integration.test.ts`: 4 cases (happy path, recovery, no-handler guard, budget guard). 59 pass / 0 fail.
- `2026-08-29-push-network-stall.md` — Push ke GitHub stall (POST git-receive-pack hang, exit 124, TCP OK). 19 commit tertunda; per §2.11, pause remote write, lanjut read-only.
- `2026-08-30-architecture-critic-promotion.md` — `engine/critic/plant/architecture/critic.ts` (delegasi ke CI guard via `spawnSync`). 124 pass / 0 fail.
- `2026-08-30-architecture-critic-graduated-scoring.md` — `parseGuard`/`countSection` + graduated penalty (0.5/circular, 0.25/deep, 0.5/illegal); `.gitignore` `.ngodingpakeai/` + `.claude/`.
- `2026-08-30-privacy-critic-graduated.md` — `privacyCritic` deteksi private-key block, AWS AKIA, JWT, DB URL dengan kredensial, hardcoded creds. 144 pass / 0 fail.
- `2026-08-30-doc-critic-graduated.md` — `docCritic` deteksi file dengan export publik tanpa `@brief` (AGENTS.Style.md). 149 pass / 0 fail.
- `2026-08-30-accessibility-critic-graduated.md` — `accessibilityCritic` deteksi `<img>` tanpa `alt`, `onClick` tanpa keyboard handler (WCAG 2.1 AA). 154 pass / 0 fail.
- `2026-08-30-critic-arc-complete.md` — Sisa 4 stub (Security/Perf/Testing/Style) → konkret. Total 15 kritikus konkret.
- `2026-08-30-repo-wide-hygiene-critics.md` — `composeHygiene(root)` + 3 repo-wide (devops/legal/dx) + CLI `critique:repo`. ADR-009.
- `2026-08-30-critic-design-doc-alignment.md` — `docs/design/critic.md` rewrite: match implementasi aktual (5 konkret + 8 di Roadmap).
- `2026-08-30-eval-gate-test-added.md` — `engine/eval/gate.test.ts` (7 cases): pass/fail threshold, blocker, custom threshold, empty criteria, reasons count. 136 pass / 0 fail.
- `2026-08-30-testing-critic-maintenance.md` — 5 PR (#23–#27) test baru untuk 14 source tanpa test; PR #28 perbaiki testing critic (exclude shell, accept co-located OR `test/` subdir). 206 pass / 0 fail.
- `2026-09-04-atomic-split-and-roadmap.md` — `orch.test.ts` (157 SLOC) → 5 tests, `resil.test.ts` (172 SLOC) → 4 tests. Roadmap critic count 8→15.
- `2026-09-04-branch-guard-failure.md` — CI guard fail pada `src/cli/test/` (7 files > 5). Exemption untuk `test/`; later removed.
- `2026-09-04-branch-hygiene-vitest-false-positive.md` — Dependabot alert #1 (vitest CVE-2026-47429) false positive: zero vitest refs. API returns 409.
- `2026-09-04-convergence-and-changelog.md` — CHANGES.md `[Unreleased]`; README test count + badge status.
- `2026-09-04-convergence-verification.md` — Full convergence sweep: gates green, working tree clean, no stale artifacts.
- `2026-09-04-critic-count-fix.md` — Roadmap critic count 8 stubs → 15 concrete. v0.2.0 bullet struck through.
- `2026-09-04-critic-count-fix-2.md` — Follow-up: `docs/design/critic.md` roadmap reworded; `compose`/`hygiene` removed dari critic list.
- `2026-09-04-cycle-reflection.md` — Reflection: PR #46 merge/rebase failures, dependabot 409, NO_TEST audit methodology.
- `2026-09-04-docs-stale-facts-sweep.md` — Docs sweep: CHANGES.md critic count 13→15; `docs/design/critic.md` roadmap reworded.
- `2026-09-04-stale-facts-sweep.md` — Second pass sweep: SEC nav table + roadmap counts reconciled; critics 13→15; tests 76→76 (recheck).
- `2026-09-04-final-convergence.md` — End-of-session sweep; superseded by `state-sync.md`.
- `2026-09-04-keymap-state-tests.md` — 2 new test files (18 tests, 36 expect) untuk `src/tui/core/{keymap,state}.ts`.
- `2026-09-04-pipeline-verification.md` — End-to-end SSE pipeline verified: `zigBridge.ts` (119 SLOC), `parseStream` dispatcher, `cloud.ts` consumer.
- `2026-09-04-pr46-superseded.md` — PR #46 (`feat/tui-ink`) closed as superseded; branch deleted.
- `2026-09-04-pr47-closure.md` — PR #47 (`fix/tui-tsc-debt`) closed as superseded; branch deleted.
- `2026-09-04-pr48-closure.md` — PR #48 (`fix/tui-tsc-debt-2-widgets`) closed as superseded; branch deleted.
- `2026-09-04-pr49-closure.md` — PR #49 (`fix/tui-tsc-debt-3-tests`) closed as superseded; branch deleted. Fourth in divergent TUI lineage.
- `2026-09-04-pr50-closure.md` — PR #50 (`fix/tui-tsc-debt-4-app`) closed as superseded; branch deleted. Fifth in divergent TUI lineage.
- `2026-09-04-state-sync.md` — Consolidated entry reconciling audit log with actual repo state.
- `2026-09-04-state-sync-2.md` — Consolidated state sync after fourth MANDAT re-injection: PR #49 closure, docs sweep, index rebuild.
- `2026-09-04-stream-test-determinism.md` — `parseSseWasm` fail-closed guard; stream tests env-independent.
- `2026-09-04-topatch-coverage.md` — Test coverage: 155 source files vs 76 test files; 19 gaps, all resolved.
- `2026-09-04-zig-0.16.0-fix.md` — Zig 0.16.0 build fix untuk `native/stream/parse.zig` (URL valid; transient failure).
<<<<<<< HEAD
- `2026-09-04-git-hooks-install.md` — Husky v9 diagnosed broken; reverted wiring, installed plain git hooks in `.git/hooks/` (pre-commit + commit-msg). `tinyexec` hoisting fix. Verified: bad commit rejected, good commit accepted.
- `2026-09-04-lockfile-switch.md` — `bun.lock` deleted, `package-lock.json` committed, CI switched from `bun install --frozen-lockfile` to `npm ci`. Bun hoisting broken on `ansi-styles` + `@types/node` chains (351/11/11 → 411/0/844).
- `2026-09-04-state-sync-3.md` — Twelfth MANDAT re-injection: restored two audit log entries lost in merge `92a4b74`, stale `bun.lock` reference sweep (publish.yml, runbook, repo-metadata, CHANGES.md), added lockfile switch + git hooks entries to `[Unreleased]`.
=======
- `2026-09-04-monitor-cycle-1.md` — Siklus Pantau autonomous pertama: state repo bersih, CI hijau, 0 issue/PR terbuka, gate local exit 0 (365 pass). Ditemukan: ADR-013 numbering gap (dokumentasi via `docs/adr/ADR-013-numbering-gap.md`), CHANGES.md duplicate `## [Unreleased]` block (digabung ke 0.1.3 + urut ulang subsection), audit-log README count 53→54.
>>>>>>> 0e52414 (docs: ADR-013 numbering gap + CHANGES 0.1.3 reorder + monitor audit entry)
