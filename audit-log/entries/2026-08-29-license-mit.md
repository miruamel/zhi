# Audit — 2026-08-29 — LICENSE: MIT

## Trigger

Audit ulang pasca-push `miruamel/zhi` (private, 6 commit). Temuan: repositori tanpa LICENSE = risiko legal (mandat §5.6/§8, prioritas P3).

## Keputusan

Pilih **MIT** (permissif, standar OSS riset, reversibel). Author: `miruamel`, tahun 2026. Repositori tetap private; lisensi siap bila suatu saat di-flip ke public.

## Tindakan

1. Tambah `LICENSE` (MIT) di root (root kini 6 file: AGENTS.md, AGENTS.Style.md, README.md, EXPLAIN-CHANGES.md, LICENSE, .gitignore — diizinkan §6.2). [Catatan 2026-09-02: EXPLAIN-CHANGES.md dipindah ke `docs/archive/`, standar aktif pindah ke `CHANGES.md`.]
2. `ADR-006` di `docs/adr/exceptions/` — justifikasi exception batas 5-file untuk `audit-log/entries/` (banyak file kecil sejenis, §6.2). `docs/adr/` tetap 5 file + 1 subdir.
3. Update CI guard mengizinkan `./audit-log/entries` dan root `.` (§6.2: root boleh >5 file config) selain `./docs/design`.
4. Update `README.md` (bagian Lisensi) + index `audit-log/README.md`.
5. Commit + push; verifikasi CI hijau.

## Alternatif

- **Apache-2.0** (patent grant) — overkill untuk CLI lokal single-user.
- **GPL/AGPL** — copyleft, menghambat adopsi komersial; tidak sesuai tujuan proyek.
- **No license** — risiko legal, ditolak (mandat §5.6).

## Dampak

Repositori kini berlisensi eksplisit; menghilangkan gap kepatuhan P3. Tidak ada perubahan kode/arsitektur.

## Status

Done. Commit: `docs(license): add MIT LICENSE + ADR-006 exception`.
