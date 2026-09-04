# ADR-013: ADR Numbering Gap (012 → 014)

- **Status**: Accepted
- **Date**: 2026-09-04
- **Author**: miruamel-autonomous
- **Review-date**: 2026-12-04 (quarterly)

## Konteks

Sekuen ADR di `docs/adr/` adalah `ADR-001` s/d `ADR-014`, tapi **tidak ada file ADR-013**. Audit 2026-09-04 (monitor cycle 1) menemukan:

- `git log --all --oneline -- 'docs/adr/ADR-013*'` → kosong (file tidak pernah dibuat, tidak pernah didelete).
- `grep -rn "ADR-013" /root/xs/zhi/docs/ /root/xs/zhi/CHANGES.md /root/xs/zhi/AGENTS.md` → kosong (tidak ada referensi).
- File yang ada: `ADR-001` … `ADR-012`, lompat ke `ADR-014-tui-tsc-debt-series-superseded.md`.

Artinya: slot ADR-013 pernah direncanakan (nomor dialokasikan) tapi keputusan tidak pernah ditulis atau dibatalkan secara formal. Tidak ada keputusan arsitektur yang hilang — ADR-014 tidak merujuk 013, dan tidak ada dokumen lain yang mengandalkan keberadaannya.

## Keputusan

**Buat ADR-013 sebagai rekor celah penomoran.** Status `Accepted`, isi dokumen ini sendiri. Tindakan ini:

1. Menutup celah penomoran agar future reader tidak mengira ADR-013 hilang karena di-delete (yang melanggar aturan "jangan hapus ADR yang dibatalkan").
2. Memberikan jejak audit yang jelas: slot 013 tidak pernah diisi, bukan pernah diisi lalu dihapus.
3. Tidak mengubah keputusan arsitektur apa pun.

## Alternatif

1. **Biarkan celah (no-op)** — ditolak: melanggar prinsip transparansi radikal (Mandate §1). Reader melihat 012 → 014 dan bertanya-tanya apa yang terjadi.
2. **Rename ADR-014 jadi ADR-013** — ditolak: ADR-014 sudah di-commit, di-push, dan dirujuk dalam CHANGES.md `[Unreleased]` ("`docs/adr/ADR-014-tui-tsc-debt-series-superseded.md` documents the decision"). Rename would create drift.
3. **Create ADR-013 gap record (dipilih)** — paling sedikit churn, transparan, tidak mengubah riwayat.

## Konsekuensi

- `docs/adr/` sekarang punya 14 file (001–014), tanpa celah.
- Tidak ada keputusan arsitektur yang diubah atau ditambahkan.
- Review-date 2026-12-04: verifikasi bahwa tidak ada ADR baru yang butuh nomor 013 (reuse nomor yang sudah ada tidak perlu).

## Referensi

- Audit-log: `audit-log/entries/2026-09-04-monitor-cycle-1.md` ( temuan celah )
- ADR-014: `docs/adr/ADR-014-tui-tsc-debt-series-superseded.md`
- ADR-012: `docs/adr/ADR-012-atomic-refactor-and-changelog-rename.md`
