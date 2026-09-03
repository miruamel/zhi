# 2026-09-04 — Atomic Split & Roadmap

## Konteks

Architecture guard CI gagal pada push terakhir: `src/tui/panes/test` (8 files > 5) dan `src/cli/test` (7 files > 5). Kedua direktori `test/` flat melanggar mandate §6.2 (≤5 file per direktori). Semua temuan critic sudah resolved; satu-satunya P0 yang tersisa adalah struktur direktori ini.

## Yang Dikerjakan

### 1. Verifikasi CI Gagal Bukan Stale Artifact

Sebelumnya ada advisory yang menyatakan failure adalah "stale artifact". Diverifikasi melalui `gh run view 33802963381` — run architecture-guard pada `main` HEAD (push 20:33) explicitly mencetak:

```
VIOLATION: ./src/tui/panes/test (8 files > 5)
VIOLATION: ./src/cli/test (7 files > 5)
```

Standing down would have been wrong. CI failures ini nyata.

### 2. Panes Restructure — 8 Per-Unit Subdirs

Advisory mengusulkan region-based grouping (`bottom/`/`middle/`/`top/`) dengan co-located tests. Dianalisis: `middle/` dan `top/` masing-masing akan punya 3 sources + 3 tests = 6 file, masih melanggar ≤5. **Region grouping secara mekanis tidak viable.**

Solusi: per-unit subdirs, source + test co-located, 2 file each:

| Unit | Source | Test |
|------|--------|------|
| `src/tui/panes/top/header/` | `header.tsx` | `header.test.ts` |
| `src/tui/panes/top/dag/` | `dag.tsx` | `dag.test.ts` |
| `src/tui/panes/top/detail/` | `detail.tsx` | `detail.test.ts` |
| `src/tui/panes/middle/critics/` | `critics.tsx` | `critics.test.ts` |
| `src/tui/panes/middle/eval/` | `eval.tsx` | `eval.test.ts` |
| `src/tui/panes/middle/pr/` | `pr.tsx` | `pr.test.ts` |
| `src/tui/panes/bottom/log/` | `log.tsx` | `log.test.ts` |
| `src/tui/panes/bottom/help/` | `help.tsx` | `help.test.ts` |

`src/tui/panes/test/` dihapus. `src/tui/panes/index.ts` barrel diperbarui.

### 3. CLI Restructure — 7 Per-Unit Subdirs

| Unit | Source | Test |
|------|--------|------|
| `src/cli/autonomous-deps/` | `autonomous-deps.ts` | `autonomous-deps.test.ts` |
| `src/cli/offline-deps/` | `offline-deps.ts` | `offline-deps.test.ts` |
| `src/cli/parse-args/` | `parse-args.ts` | `parse-args.test.ts` |
| `src/cli/plan-symbol/` | `plan-symbol.ts` | `plan-symbol.test.ts` |
| `src/cli/commands/gen/` | `gen.ts` | `gen.test.ts` |
| `src/cli/commands/loop/` | `loop.ts` | `loop.test.ts` |
| `src/cli/commands/critique-repo/` | `critique-repo.ts` | `critique-repo.test.ts` + `critique-repo-traversal.test.ts` |

`src/cli/test/` dihapus. `commands.test.ts` (101 SLOC, 3 describe blocks: gen/loop/critique-repo) di-split menjadi 3 per-command test files, masing-masing dengan header + import sendiri. `index.test.ts` tetap flat di samping `index.ts` (2 files, under limit) — ini barrel-style entry, bukan unit.

### 4. Import Depth Fix + Path Aliases

`git mv` tidak rewrite import. File yang dipindahkan satu level lebih dalam butuh satu `../` ekstra. Daripada hand-count, dijalankan `bunx tsc --noEmit` untuk dapat semua error sekaligus.

Solusi: **adopt path aliases** `@engine/*` / `@src/*` yang sudah ada di `tsconfig.json` (line 26-29). Semua CLI modules yang berada 3-4 level di bawah root sekarang menggunakan `@engine/...` instead of `../../../../engine/...`. Ini:

- Eliminasi chain `../../../../` yang architecture guard flag sebagai deep-relative-import violation (>3 `../`)
- Guard script (`scripts/ci/architecture/check-circular.ts` line 39) sudah menerima bare `engine/`/`src/` specifiers; `@engine/*` resolve melalui tsconfig paths dan dianggap external (no deep-relative count)

### 5. Architecture Guard Exemption Dihapus

`*/test|*/test/*` case arm di `.github/workflows/architecture-guard.sh` line 20 di-remove. Flat `test/` directories sudah eliminated, exemption ini dead code. Guard sekarang enforce ≤5 files per directory uniformly.

### 6. Gate Re-Verified

| Gate | Status |
|------|--------|
| typecheck | 0 errors |
| test | 355 pass / 0 fail, 725 expect() calls |
| lint | 0 errors |
| format | clean |
| arch guard | all checks passed |

### 7. Push & CI

Commit `12c5ad7` pushed ke `origin/main`. CI (`ci` + `architecture-guard`) sedang berjalan pada commit baru.

## Keputusan

- **Per-unit co-location over region grouping**: Region grouping tidak viable secara mekanik (6 file dirs). Per-unit subdirs (2 files each) adalah satu-satuan shape yang memenuhi cap sambil menjaga tests atomic di samping subject-nya.
- **Path aliases over manual ../ counting**: `@engine/*` sudah dideklarasikan, tinggal digunakan. Tidak ada dependency baru, tidak ada config baru.
- **`commands.test.ts` split**: 3 describe blocks self-contained (gen/loop/critique-repo), masing-masing dapat diuji independently tanpa shared state.
- **`index.test.ts` tetap flat**: Tests `main()` dari `src/cli/index.ts` — barrel-style entry, bukan unit. Co-located di samping `index.ts` (2 files, under limit).
- **CI failures verified real**: Dua advisory claims bahwa failures adalah "stale artifacts" dicek terhadap `gh run view` output — architecture-guard run explicitly mencetak kedua violation pada `main` HEAD. Standing down would have been wrong.

## Status Akhir

| Gate | Status |
|------|--------|
| typecheck | 0 errors |
| test | 355 pass / 0 fail |
| lint | 0 errors |
| format | clean |
| arch guard | all checks passed |
| critic gate | 1.0, zero findings |

Working tree clean setelah commit. Tidak ada issue/PR terbuka.

## Refleksi

Session ini adalah continuation. Nilai yang dihasilkan: struktur direktori yang sebelumnya melanggar cap sekarang memenuhinya, dan deep-relative imports (>3 `../`) digantikan oleh path aliases yang sudah ada.

Pelajaran: `git mv` preserves relative paths, jadi setiap pergerakan file satu level lebih dalam membutuhkan perbaikan import. Langkah yang diambil (tsc --noEmit untuk dapat semua error sekaligus, lalu path aliases untuk solusi bersama) lebih efisien daripada hand-counting each broken import.