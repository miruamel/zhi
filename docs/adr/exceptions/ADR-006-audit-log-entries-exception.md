# ADR-006: Pengecualian batas 5-file untuk `audit-log/entries/`

- **Tanggal**: 2026-08-29
- **Status**: Accepted
- **Penulis**: miruamel (autonomous executor)
- **Review-date**: 2026-11-27

## Konteks
`audit-log/entries/` adalah direktori log yang secara alami berisi banyak file kecil sejenis (satu entri per tindakan/audit). Mandat §6.2 mengizinkan pengecualian batas 5-file/direktori untuk "direktori yang secara alami memang berisi banyak file kecil sejenis ... dan HARUS didokumentasikan dalam ADR dengan justifikasi kuat". `docs/design/` sudah dikecualikan via ADR-005; `audit-log/entries/` butuh perlakuan sama agar riwayat audit bisa tumbuh tanpa batas (mandat §2.6: log audit append-only, tidak boleh dihapus riwayatnya).

## Keputusan
`audit-log/entries/` dikecualikan dari batas 5-file/direktori. CI architecture-guard mengizinkan direktori ini (selain `./docs/design` per ADR-005). ADR ini ditempatkan di `docs/adr/exceptions/` (subdirektori) agar `docs/adr/` tetap ≤5 file langsung.

## Alternatif
1. **Nest by month** (`audit-log/entries/2026/08/...`) — memenuhi batas tanpa exception, tetapi butuh migrasi 5 entri existing dan menambah kedalaman; ditunda.
2. **Batas 5 entri lalu rotasi** — melanggar §2.6 (riwayat tidak boleh hilang); ditolak.
3. **Exception (dipilih)** — paling sedikit churn, disetujui oleh §6.2.

## Konsekuensi
- Entri audit bisa tumbuh tanpa batas; tidak ada batasan jumlah file.
- Perlu review 90 hari (2026-11-27): evaluasi apakah nest-by-month lebih baik untuk navigasi jangka panjang.
- CI guard harus allowlist `./audit-log/entries` agar tidak merah.

## Catatan
Jika di masa depan `audit-log/entries/` melebihi ~50 file, migrasi ke nest-by-date direkomendasikan tanpa menunggu review-date.
