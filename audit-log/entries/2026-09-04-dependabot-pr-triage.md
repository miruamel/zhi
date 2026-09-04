# 2026-09-04-dependabot-pr-triage

## Ringkasan

Tutup 7 Dependabot PR sekaligus + tambahkan ignore rules di `dependabot.yml` untuk mencegah regenerasi.

## Detail

- **PR ditutup**: #51 (setup-node 6→7), #52 (checkout 6→7), #53 (eslint 9→10 + eslint-plugin-jsdoc 50→64), #54 (@commitlint/cli 19→21), #55 (react 18→19 + @types/react), #56 (ink 4→7), #57 (@commitlint/config-conventional 19→21).
- **Alasan**: Semua 9 paket adalah major-version breaking change tanpa security driver. `npm audit`: 0 vulnerabilities across 314 deps. Repo experimental (0.1.4); TIDAK ada ROI pada migrasi sekarang. Assessment sebelumnya di P3 (lihat audit-log entries 2026-09-04-cycle-reflection.md).
- **Ignore rules ditambahkan**: 9 dependency-name di npm ecosystem + 2 di github-actions ecosystem. Dependabot tidak akan mengusulkan update untuk paket-paket ini sampai ignore dihapus atau CVE muncul.
- **Dampak**: Tidak ada perubahan dependensi atau kode. Hanya konfigurasi Dependabot + penutupan PR otomatis.

## Keputusa

- Tutup PR, bukan merge. Jangan bump tanpa alasan aktif (YAGNI).
- Ignore rules bersifat sementara: cabang jika ada CVE atau saat repo mencapai stabil (1.0.0).

## Verifikasi

- `gh pr list --state open`: 0 open PRs (setelah penutupan).
- `npm audit`: 0 vulnerabilities.
- `bun run gate`: exit 0 (365 pass / 0 fail / 726 expect()).
- `git diff --stat`: 1 file (dependabot.yml), 18 insertions.