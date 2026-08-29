# EXPLAIN-CHANGES.md

Standar changelog Zhi. Setiap perubahan signifikan (PR yang mengubah behavior, API, atau arsitektur) WAJIB mencatat di sini, di bagian atas, sebelum merge.

## Format

```
## [<version>] - <YYYY-MM-DD>
### <tipe>
- <apa yang berubah> — <why / dampak> (@<author>)
```

Tipe: `feat` | `fix` | `refactor` | `docs` | `test` | `perf` | `ci` | `chore`.

## Aturan

- **Top-first**: entri terbaru di atas. Jangan append di bawah.
- **Behavior change wajib**: bila PR mengubah kontrak (signature, gate predicate, loop transition), catat explicitly + rujuk ADR bila ada.
- **Link ke ADR**: perubahan arsitektural yang butuh konteks → `@see docs/adr/ADR-XXX-*.md`.
- **No silent fallback**: bila menghapus behavior lama, sebutkan migrasi bagi konsumen.
- **Version**: ikuti `AGENTS.md` §Maturity. Experimental `0.y.z`: breaking = minor.

## Template PR

## [0.1.0] - 2026-08-29
### feat
- src/cli: LoopDeps.generate sekarang memanggil engine/build/generate via adapter planSymbol — EXECUTE route ke modul nyata (generate itu sendiri masih stub) (@zhi)
### test
- src/cli.test: perbarui kontrak code ke stub fungsi + assert gate-pass (score>=0.8, passed) (@zhi)

## [0.1.0] - 2026-08-29
### feat
- engine/orch: planner (parseGoal, buildDag, topoSort+CycleError, allocate, schedule) — tutup gap PLAN state, hasilkan DAG rencana nyata (@zhi)
- src/cli: LoopDeps.plan sekarang memanggil orch (parseGoal→buildDag→allocate→schedule) (@zhi)
### test
- engine/orch/orch.test.ts: parse/constraint, buildDag chain, topoSort cycle, allocate proporsional, schedule order (@zhi)
- src/cli.test: perbarui kontrak plan/code ke output DAG nyata (@zhi)
### docs
- README Status: koreksi "Docs-only" -> prototype terimplementasi (@zhi)

## Verifikasi

PR yang tidak update `EXPLAIN-CHANGES.md` untuk perubahan behavior = ditolak di review. Docs-only PR (menambah `docs/design/*` tanpa ubah kode) dikecualikan.
