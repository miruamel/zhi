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

```
## [0.1.0] - 2026-08-29
### feat
- loop conductor state machine INTAKE→DONE — jahit orch/build/critic/eval/resil (@zhi)
### docs
- ARCHITECTURE.md + design/* + ADR-001..004 — spesifikasi engine (@zhi)
```

## Verifikasi

PR yang tidak update `EXPLAIN-CHANGES.md` untuk perubahan behavior = ditolak di review. Docs-only PR (menambah `docs/design/*` tanpa ubah kode) dikecualikan.
