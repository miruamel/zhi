# audit-log

Audit trail otonom untuk proyek miruamel (lokal: `/root/zhi`). Dipelihara per mandat v6.0 §13.

## Entri
- `2026-08-29-discovery-zhi.md` — Discovery awal: metrik struktur, pelanggaran arsitektur, pemindaian secret.
- `2026-08-29-remediation-docs.md` — Remediasi docs: nest guides, ADR-005 untuk `docs/design/`.
- `2026-08-29-governance-ci.md` — CI architecture guard; rekomendasi LICENSE (P3).

## Invarian yang dilacak
Rata-rata SLOC/file, SLOC maks, file/dir (≤5), kedalaman nesting (≥4), jumlah god-file, jumlah flat-dir, circular dependency, kebocoran secret.

## Catatan
Direktori ini adalah analog lokal dari `miruamel/audit-log`. Bila remote dikonfigurasi, promosikan menjadi repositori sendiri dan audit serupa. Riwayat di sini append-only; jangan hapus entri.
