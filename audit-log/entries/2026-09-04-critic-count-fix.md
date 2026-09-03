# 2026-09-04 — Stale Critic Count Fix + Repo Clean Sweep

## Konteks

Session lanjutan setelah stale-facts sweep (`fc94e3b`). Repo bersih: 0 open issues, 0 open PRs, CI hijau. Tugas berikutnya: sweep dokumen untuk fakta usang yang tersisa.

## Yang Dikerjakan

1. **Sweep dokumen untuk fakta usang.** Cari semua referensi ke angka kritikus di `docs/`. Temuan: `docs/guides/roadmap.md` baris 25 menyatakan "all 13 critics" padahal yang benar adalah 15. Juga baris 14 v0.1.0 scope menyatakan "13 concrete critics" dengan daftar yang tidak mencakup hygiene/testing. Baris 34 v0.2.0 notes menyatakan "4 repo-wide hygiene (devops/legal/dx/testing)" — urutan tidak konsisten dengan baris lain.

2. **Perbaiki roadmap.md.**
   - Baris 14: "13 concrete critics" → "15 concrete critics", daftar diperbarui ke 15 kritikus yang benar (accessibility, architecture, doc, hygiene/devops, hygiene/dx, hygiene/legal, hygiene/testing, imports, maintainability, perf, privacy, security, sloc, style, todo).
   - Baris 25: "all 13 critics" → "all 15 critics".
   - Baris 34: urutan diurutkan konsisten (devops/dx/legal/testing).

3. **Perbaiki design/critic.md.** Baris 72 (Roadmap section) mengatakan "Additional critics (Doc, DevOps, ...) were promoted from stub → concrete" tanpa menyatakan bahwa semua sudah selesai. Diubah jadi "All 15 critics are concrete. Additional critics ..." untuk konsistensi dengan angka yang benar.

4. **Verifikasi konsistensi.** Semua referensi di 6 file dokumen (ARCHITECTURE.md, critic.md, roadmap.md, glossary.md, landing-copy.md, repo-metadata.md) kini konsisten pada angka 15. Prettier check clean pada kedua file yang diubah.

5. **Commit `f009713`** dan push. CI sedang berjalan.

## Keputusan

- **Roadmap.md baris 14:** 13 → 15, daftar diperbarui. Ini adalah fakta yang benar (15 file `critic.ts` di `engine/critic/plant/`).
- **Roadmap.md baris 25:** 13 → 15. Ini adalah fakta yang benar.
- **Roadmap.md baris 34:** Hanya urutan alphabetical, tidak ada perubahan fakta.
- **design/critic.md baris 72:** Tambahkan "All 15 critics are concrete" untuk konsistensi.
- **YAGNI skip:** Tidak ada file yang perlu dipecah. Semua file dokumen sudah ≤200 baris.

## Status Akhir

- CI pada `f009713`: sedang berjalan (setelah push).
- Working tree bersih.
- 0 open issues, 0 open PRs.
- Dependabot: 1 alert (vitest CVE-2026-47429, fixed). No active threats.
- Semua referensi kritikus konsisten pada 15 di seluruh docs/.

## Refleksi

Stale-facts sweep kedua menemukan 1 fakta usang: angka kritikus di roadmap.md (13 vs 15). Perbaikan ini tidak memengaruhi pengguna (dokumen internal), tapi penting untuk konsistensi dokumentasi. Semua file dokumen kini konsisten pada angka 15. Tidak ada fakta usang lain yang ditemukan di docs/ — ARCHITECTURE.md, configuration.md, security.md, design/_.md, guides/_.md, marketing/*.md semua sudah akurat.
