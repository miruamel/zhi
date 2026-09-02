# Audit — 2026-08-29 — CI lint correction (self-review)

## Trigger

Advisory self-review pada CI guard: ekstensi `*.py` tidak sesuai stack zhi (Bun/TS/Zig, no Python). Mandat §6.10 contoh pakai `*.py` tapi itu generik, bukan stack zhi.

## Actions

1. Hapus `*.py` dari SLOC guard di `.github/workflows/architecture.yml`. Ekstensi tetap: `*.ts *.js *.zig`.
2. `bun test` TIDAK ditambahkan sekarang: `bun test` tanpa test file exit 1 (CI merah). Akan masuk ke file yang sama (`architecture.yml`) saat engine code + test dibuat (fase A). Prinsip "satu file CI" dipertahankan.
3. Entri remediation (`2026-08-29-remediation-docs.md`) sudah memuat angka post-commit (flat-dir=1, docs/=4, guides/=4, adr/=5) — poin advisory #1 sudah terpenuhi, tanpa perubahan.

## Verification

- Guard hanya scan ts/js/zig.
- Single workflow file tetap (no fragmentation).

## Status

CI guard dikoreksi. Commit: `fix(ci): drop *.py from SLOC guard`.
