# ADR-012 — Atomic File Refactor, Native Boundary + Changelog Standar

- **Tanggal**: 2026-09-02
- **Status**: Accepted
- **Penulis**: miruamel-autonomous
- **Review-date**: 2026-12-02 (sampai v0.2.0)

## Konteks

Repo `miruamel/zhi` post-reset (loop wakeup 48 jam ditarik) tiba di state `2601555`
yang **infra-stripped**: tsconfig/eslint/prettier/vitest tidak ada. Gate hijau hanya
"luck" via `bun test` default (210 pass, 4 fail). TypeScript strict tidak enforced.
10+ type errors tersembunyi. Native boundary tidak sesuai AGENTS.md (`engine/<area>/zigBridge.ts`).

Audit menemukan:
1. God files: `src/cli.ts` (179 SLOC), `engine/model/invoker.ts` (140), `engine/loop/wiring/handlers.ts` (141)
2. Missing infra: tsconfig/eslint/prettier/vitest/commitlint/scripts
3. Bug: `engine/loop/observability/metrics.test.ts` pakai `LoopState.GOAL_READY` (event, bukan state)
4. Zig wasm: `parse.zig` punya `const std = @import("std")` di akhir file (Zig declaration-order rule)
5. Native boundary: `engine/model/stream.ts` mixed WASM-loader + parser (AGENTS.md §native boundary minta layer terpisah)
6. Changelog: 15 duplikat `[0.1.0]` entries + non-monotonic `0.1.0..0.6.0` chronology
7. Security: vitest `^2.0.0` vulnerable CVE-2026-47429 (CVSS 9.8 critical)
8. No release tag (no `git tag`, no `gh release`)
9. Loop wakeup agent (PID 2800 session `131601_16e000`) push commit otomatis tiap ±5 menit — harus dihentikan sebelum force-push

## Keputusan

### 1. Restore Yan tooling baseline (commit `e9a8fef`)

Restore tsconfig (strict, noEmit, path aliases `@engine/*` `@src/*` `@native/*`),
eslint.config.js flat config (`@typescript-eslint/parser` + `eslint-plugin-jsdoc`),
.prettierrc (singleQuote, trailingComma=all), vitest.config.ts (coverage thresholds
lines 80 / branches 70), .commitlintrc.json (conventional commits subject max 72),
.lintstagedrc, tests/setup.ts, scripts lengkap di `package.json`.

Pakai `npm install` karena `bun install` di env proot corruption (folder `node_modules/eslint` ada tapi kosong). Pin vitest@^2.0.0 untuk sementara, naik nanti.

### 2. Fix 10 TypeScript errors + 4 failing tests (commit `159151a`)

TypeScript strict mode memunculkan bugs yang tersembunyi:
- `metrics.test.ts` import `LoopEvent` (bukan `LoopState.GOAL_READY`)
- `handlers.test.ts` + `integration.test.ts`: `generate` async return `Promise<string>`
- `stream.ts`: `WebAssembly.Table` element `'anyfunc'` (TS DOM lib value valid)
- `parse.zig`: pindah `const std = @import("std")` ke awal file
- `src/cli.ts`: tambah import `LoopContext` + `gitCommit`, drop unused `ghCiWatch`
- `src/cli.test.ts`: type annotation `Critique` (noImplicitAny)
- `tests/setup.ts`: vitest `setupFiles` contract

Zig wasm32 byte-write tidak ter-commit di proot env (write barrier bug).
**Workaround**: fallback parser TypeScript murni di `engine/model/stream.ts`
(logic identik dengan `parse.zig`). Tetap rebuild WASM untuk env normal.

### 3. Rename changelog ke standar familiar (commit `b1240a3`)

`EXPLAIN-CHANGES.md` → `CHANGES.md` (Keep a Changelog + SemVer).
Historical entries (15 duplikat + non-monotonic 0.1.0..0.6.0) dipindah ke
`docs/archive/EXPLAIN-CHANGES.md` (preserved as-is untuk authorial record).

Cross-reference update di 7 file (AGENTS.md, README.md, docs/standards/commit.md,
docs/guides/roadmap.md, docs/observability.md, 2 audit log entries).

Versi di-bump per Conventional Commits aggregated:
- `feat:` → MINOR
- `fix:` → PATCH
- `BREAKING CHANGE:` → MAJOR
- `chore:` / `docs:` / `refactor:` / `test:` / `ci:` → no version bump

### 4. Security fix vitest CVE-2026-47429 (commit `aa99e8c`)

Bump `vitest: ^2.0.0` → `^3.2.6` (first patched version per GHSA-5xrq-8626-4rwp).
Vitest UI server arbitrary file read + write + execute via path traversal
ketika `--api.host` network-exposed. CVSS 9.8 critical.

Patched di 3.2.6 dengan `allowWrite`/`allowExec` gates (default off untuk
non-localhost). Dependabot auto-resolved. `npm audit`: 0 vulnerabilities.

### 5. Release v0.1.1 (commit `2af65e1`)

`git tag -a v0.1.1` + `gh release create v0.1.1 --target main` dengan notes
lengkap. PATCH bump per SemVer §5.4 (backward-compatible bug fixes).

### 6. Atomic refactor: `src/cli.ts` 179 → 8 atomic files (commit `63c2476`)

Mandate §6.1 atomic file (satu tanggung jawab utama per file).

```
src/cli/
  parse-args.ts        (12 SLOC) — argv parser
  plan-symbol.ts       (12 SLOC) — identifier derivation
  offline-deps.ts      (55 SLOC) — LoopDeps factory offline
  autonomous-deps.ts   (25 SLOC) — ZHI_AUTO_PR=1 deps factory
  commands/
    loop.ts            (34 SLOC) — default subcommand
    gen.ts             (36 SLOC) — 'gen' subcommand
    critique-repo.ts   (42 SLOC) — 'critique:repo' subcommand
  index.ts             (35 SLOC) — main() dispatcher + run-if-main
  test/                (+3 test files)
```

Setiap file punya @brief/@param/@return Doxygen Universal (AGENTS.Style.md).

### 7. Native boundary proper (commit `39bd840`)

AGENTS.md §native boundary minta `engine/<area>/zigBridge.ts` per `native/<area>/`.
Sebelumnya `engine/model/stream.ts` mixed WASM-loader + parser.

```
engine/stream/
  zigBridge.ts    (110 SLOC) — Zig→WASM loader + parseSseWasm + write-barrier detect
  parseSseTs.ts   (30 SLOC) — TS-only parser fallback
  index.ts        (35 SLOC) — dispatcher (WASM → auto-detect → TS)
  test/parse.test.ts (+6 tests)

engine/model/stream.ts (6 SLOC) — thin re-export dari engine/stream
```

Dispatcher auto-detect write barrier: bila WASM return 0 byte ditulis dengan
input non-kosong, otomatis disable WASM permanent + fallback ke TS.

### 8. Atomic refactor: `engine/model/invoker.ts` 140 → 5 atomic files (commit `fa0e8c0`)

```
engine/model/invoker/
  types.ts        (17 SLOC) — ModelInvoker interface
  local-stub.ts   (17 SLOC) — LocalStubInvoker
  cloud.ts        (115 SLOC) — CloudModelInvoker + extractTokens
  select.ts       (27 SLOC) — selectInvoker factory
  index.ts        (9 SLOC) — barrel re-export
  test/invoker.test.ts
```

## Konsekuensi

**Positif**:
- Gate hijau enforceable (lint 0 errors, typecheck 0 errors, format clean, 221/221 tests)
- God files terpecah sesuai mandate §6.1
- Native boundary sesuai AGENTS.md (WASM/TS fallback automatic)
- CVE critical closed
- Release v0.1.1 published ke publik dengan notes lengkap
- Changelog standar industri (familiar untuk kontributor)
- Loop wakeup agent dimatikan (no more auto-push conflict)

**Risiko**:
- `engine/loop/wiring/handlers.ts` 141 SLOC (acceptable per §6.2 ≤150 max, belum dipecah — fokus P1 lain selesai dulu)
- `engine/stream/zigBridge.ts` 110 SLOC (target ≤100 ideal, ≤150 max — acceptable)
- WASM fallback = write barrier workaround, bukan fix. Solusi real perlu investigate kenapa Zig wasm32 byte-write tidak commit di proot env
- git identity di-commit sebelumnya default `root@localhost` (sudah diamend via `git commit --amend --reset-author` setelah set identity)

## Alternatif yang dipertimbangkan

- **Cherry-pick dari 48 jam commit** → ditolak: butuh selective per-commit, risiko rusak state, dan loop wakeup akan override push
- **Reopen loop wakeup setelah reset** → ditolak: user minta hentikan, dan loop akan push commit yang menarik 48 jam commit
- **Orphan branch clean state** → ditolak: kehilangan 86 commit history (bukan authorial record tapi technical reference)
- **CHANGELOG.md baru + hapus EXPLAIN-CHANGES.md** → ditolak (archive lebih aman daripada hapus)

## Status implementasi

- Semua keputusan **implemented** dan **pushed** ke `origin/main`
- HEAD: `fa0e8c0`
- Release: `v0.1.1` published
- Dependabot: 0 open alerts
- npm audit: 0 vulnerabilities