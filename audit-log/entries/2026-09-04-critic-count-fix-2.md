# 2026-09-04 — Stale Critic Count Fix (Round 2) + Final Sweep

## Konteks

Setelah commit `f009713` (roadmap + design/critic.md fix), CI hijau. Lanjutkan sweep dokumen untuk fakta usang yang tersisa. Ditemukan referensi "12 critics" di 4 file lain.

## Yang Dikerjakan

1. **Sweep kedua.** Cari semua referensi ke angka kritikus di `docs/`. Ditemukan 4 file dengan "12 critics":
   - `docs/adr/ADR-002-critic-pareto.md` (2 referensi: Context + Consequences)
   - `docs/design/sequences.md` (1 referensi: diagram sequence #4)
   - `docs/guides/tui.md` (1 referensi: layout diagram)

2. **Perbaiki ADR-002.** Dua referensi "12 kritikus" diubah jadi "15 kritikus". ADR ini berstatus "Accepted — 2026-08-29" dan berisi pernyataan desain, bukan catatan keputusan historis. Angka kritikus adalah fakta arsitektur yang berubah, bukan keputusan yang dibatalkan.

3. **Perbaiki sequences.md.** Diagram sequence #4 (Critic eval cache-aware) mengatakan "run 12 critics" → "run 15 critics".

4. **Perbaiki tui.md.** Layout diagram mengatakan "CRITIQUE 12 critics" → "CRITIQUE 15 critics".

5. **Tidak diperbaiki (catatan):** `docs/adr/ADR-008-architecture-critic.md` baris 9 masih menyatakan "12 critics" dan "7 stubs". ADR ini berstatus "Accepted — 2026-08-30" dan berisi pernyataan keputusan historis: pada saat itu, 12 critics terdaftar dan 7 diantaranya stub. Ini adalah catatan keputusan yang akurat untuk waktu itu, bukan fakta arsitektur yang berubah. Ditinggalkan seperti yang diatur §5.6 (Keputusan yang dibatalkan: ADR baru, jangan hapus yang lama).

6. **Verifikasi konsistensi.** Semua referensi ke angka kritikus di 8 file dokumen kini konsisten pada 15. Prettier check clean pada semua file yang diubah.

7. **Commit `c9917b4`** dan push. CI sedang berjalan.

## Keputusan

- **ADR-002:** Perbaiki (pernyataan desain, bukan catatan keputusan historis).
- **sequences.md, tui.md:** Perbaiki (dokumen arsitektur current-state).
- **ADR-008:** Tidak diperbaiki (catatan keputusan historis, akurat untuk waktu itu).
- **Roadmap.md baris 14 v0.1.0 scope:** Sudah diperbaiki di `f009713` (13→15).
- **Roadmap.md baris 25:** Sudah diperbaiki di `f009713` (13→15).
- **Roadmap.md baris 34:** Sudah diperbaiki di `f009713` (urutan alphabetical).

## Status Akhir

- CI pada `c9917b4`: sedang berjalan (setelah push).
- Working tree bersih.
- 0 open issues, 0 open PRs.
- Dependabot: 1 alert (vitest CVE-2026-47429, fixed). No active threats.
- Semua referensi kritikus konsisten pada 15 di seluruh docs/ (8 file).

## Refleksi

Sweep kedua menemukan 4 referensi "12 critics" yang tersisa. Perbaikan ini tidak memengaruhi pengguna (dokumen internal), tapi penting untuk konsistensi dokumentasi. Keputusan untuk tidak memperbaiki ADR-008 adalah contoh yang baik dari aturan ADR: keputusan historis yang akurat tidak boleh diubah, bahkan jika fakta yang dikutip sudah berubah. Semua dokumen arsitektur current-state kini konsisten pada angka 15. Tidak ada fakta usang lain yang ditemukan di docs/ — sweep ketiga tidak diperlukan.
