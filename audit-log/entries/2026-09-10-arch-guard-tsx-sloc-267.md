# 2026-09-10-arch-guard-tsx-sloc-267.md

**@brief** Perbaikan `architecture-guard.sh`: SLOC check tidak mendeteksi file `.tsx`, sehingga `app-provider.tsx` (161 baris) lolos tanpa terdeteksi. Dilakukan split ke `use-app-input.ts`.

**@param** none

**@return** none

**@throw** none

**@since** 2026-09-10

**@see** https://github.com/miruamel/zhi/issues/266
**@see** https://github.com/miruamel/zhi/pull/267

---

## Context

`architecture-guard.sh` SLOC check menggunakan `find ... -name '*.ts' -o -name '*.js' -o -name '*.zig'`. File `.tsx` tidak termasuk, sehingga `src/tui/core/app/app-provider.tsx` dengan 150+ baris lolos tanpa terdeteksi. Ini melanggar mandate §6.2 (SLOC ≤150 hard cap).

## What happened

| Step | Result |
| --- | --- |
| Issue #266 dibuat | `fix(arch): guard SLOC check missed .tsx files; split app-provider` |
| Branch `fix/tsx-sloc-guard-266` | commit `2454a12` — perbaikan find pattern + split komponen |
| PR #267 dibuat | base `main`, head `fix/tsx-sloc-guard-266` |
| CI berjalan | architecture-guard, ci, security — semua `success` |
| Merge | `gh pr merge 267 --merge --delete-branch` → fast-forward ke `2aa8c57` |
| CHANGES.md | Entry `[Unreleased]` ditambahkan, commit `0dcb639` |

## Changes

- `.github/workflows/architecture-guard.sh`: find pattern ditambah `*.tsx`, exemption ditambah `*.test.tsx`
- `src/tui/core/app/app-provider.tsx`: 161 → 57 baris, `useInput` wiring diextract ke hook terpisah
- `src/tui/core/app/use-app-input.ts`: file baru 136 baris, berisi `useAppInput()` hook

## Verification

- `bash .github/workflows/architecture-guard.sh .` → all checks passed
- `bun run scripts/gate.ts` → lint + format + typecheck + 768 tests pass
- `npx dependency-cruiser --output-type json src engine` → 0 violations across 387 modules
- CI: architecture-guard (28s), ci (52s), security (1m7s) — semua success

## Security

Tidak ada secret, tidak ada perubahan keamanan. Hanya perbaikan quality gate + refactor struktur file.