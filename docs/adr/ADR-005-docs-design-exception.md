# ADR-005: Pengecualian Struktur docs/design (God Directory)

- Status: Accepted
- Date: 2026-08-29
- Author: miruamel-autonomous
- Review-date: 2026-11-27 (±90 hari)

## Context
Audit Discovery 2026-08-29 menemukan `docs/design/` berisi 10 file langsung (batas invarian: 5 file/dir, mandat §6.2; konvensi repo `AGENTS.md`: 4). `docs/design/` adalah kumpulan spesifikasi desain per-modul engine (`loop`, `orch`, `build`, `critic`, `eval`, `knowledge`, `model`, `resil`, `data-model`, `sequences`) yang saling merujuk sangat padat (~25 tautan silang, konvensi root-relative `docs/design/X.md` / `design/X.md`).

`docs/` root telah dikembalikan ke 4 file (≤5) melalui pemindahan guide ke `docs/guides/`.

## Decision
Terima pengecualian terdokumentasi untuk `docs/design/` tetap berisi ≤10 file desain sejenis hingga review-date. Tidak dilakukan nesting saat ini karena:

1. Tautan silang padat; memecah ke subdir memerlukan ~25 edit tautan dengan risiko putus dan nilai perbaikan rendah.
2. File termasuk kategori "many small similar files" (spesifikasi desain) — masuk pengecualian mandat §6.2 dengan justifikasi kuat.

## Alternatives
1. Nest `design/` ke `runtime/` + `data/` (5+5). Ditolak: risiko tautan putus tinggi, nilai rendah.
2. ADR exception (dipilih).
3. Biarkan tanpa tindakan. Ditolak: melanggar invarian tanpa dokumentasi.

## Consequences
- `docs/design/` tetap 10 file hingga 2026-11-27; wajib review.
- Bila dipindah ke generator dokumen (Docusaurus/VitePress) dengan base path, nesting aman dan pengecualian dicabut.
- Metrik arsitektur: flat-dir count = 1 (`docs/design/`) hingga review.

## Review
Pada 2026-11-27, evaluasi: apakah tautan sudah di-standardisasi (root-relative via doc-tool) sehingga nesting aman, atau perpanjang pengecualian.
