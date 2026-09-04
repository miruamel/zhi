# 2026-09-04-dependabot-vitest-ignore-removal

## Ringkasan

Hapus `ignore.vitest` dari `.github/dependabot.yml`: nol referensi `vitest` di repo, CVE-2026-47429 adalah false positive.

## Detail

- **Sebelum**: `dependabot.yml` punya `ignore: dependency-type: "all", match-name: "vitest"` untuk menekan alert #1 (CVE-2026-47429).
- **Sesudah**: aturan ignore dihapus. Alasan: `grep -rn "vitest" package.json package-lock.json` mengembalikan 0 match. Repo tidak menggunakan vitest (test runner-nya `bun test`). Tanpa dependency, Dependabot tidak akan pernah menyarankan vitest — ignore-nya tidak perlu.
- **Dampak**: dependabot.yml 26 baris → 21 baris. Tidak ada perilaku Dependabot yang berubah; hanya aturan ignore yang tidak perlu diangkat.
- **Risiko**: Rendah — konfigurasi saja, tanpa perubahan dependensi atau kode.

## Keputusan

- Hapus ignore, bukan biarkan (YAGNI: aturan mati tanpa alasan aktif).
- Jika vitest ditambahkan di masa depan, tambahkan ignore kembali berdasarkan CVE baru.

## Verifikasi

- `grep -rn "vitest" package.json package-lock.json`: 0 match.
- `cat .github/dependabot.yml`: 21 baris, tidak ada `vitest`.
- `git diff --stat`: 1 file, 4 deletions.