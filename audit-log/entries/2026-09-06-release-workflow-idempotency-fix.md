# 2026-09-06-release-workflow-idempotency-fix.md

## Deskripsi
Perbaikan dua kerugian pada `release` workflow (run 33981982020, 2026-09-05T17:46Z) yang mencegah GitHub Release `v0.1.6` dibuat. Issue #130, PR #131.

## Kerugian 1: npm publish non-idempotent
`npm publish` gagal dengan `You cannot publish over the previously published versions: 0.1.6` pada re-run. Karena `create-release` punya `needs: [gate, build-binary, npm-publish]`, kegagalan `npm-publish` menghalangi seluruh rilis — meski package sudah live di npm (323 file, termasuk `dist/native/out/stream.wasm`).

**Fix:** `npm publish --provenance --access public --ignore-existing` (idempotent; melewati versi yang sudah diterbitkan).

## Kerugian 2: binary build jobs tidak punya node_modules
`bun build --compile ./dist/src/cli/index.js` membutuhkan `node_modules` (ink -> `react-devtools-core`, peer opsional yang di-load oleh `reconciler.js` hanya bila `process.env['DEV'] === 'true'`, tapi `bun build --compile` statis meresolve grafik import). Matrix `build-binary` hanya lakukan `checkout` + `download-artifact dist/` — tanpa `npm ci`.

**Bukti lokal:**
```
$ bun build --compile ./dist/src/cli/index.js --outfile /tmp/zhi-test
error: Could not resolve: "react-devtools-core". Maybe you need to "bun install"?
```
Setelah `npm install -D react-devtools-core@^4.19.1 --no-save`, command sama menghasilkan binary 84 MB. Akar masalah terkonfirmasi.

**Fix awal (PR #131):** tambahkan `actions/setup-node@v6` + `npm ci` ke tiap `build-binary` matrix job. Juga perbaiki `List dist contents` dari `ls -la` (tidak valid di PowerShell Windows) menjadi `ls -R dist/ | head -40`.

**Fix kedua (re-run 33984549405, 2026-09-05T18:35Z):** `npm ci` saja TIDAK cukup — `react-devtools-core` adalah optional peer ink yang TIDAK ada di `package-lock.json`/`bun.lock` (hanya `node_modules` lokal kita yang punya, 17M). `npm ci` mengikuti lockfile, jadi package tetap tidak terpasang dan `bun build --compile` gagal lagi dengan `Could not resolve: "react-devtools-core"`.

Dipertimbangkan dan ditolak:
- `--external react-devtools-core` → binary 80M tapi runtime error `Cannot find package 'react-devtools-core'` (devtools.js tetap di-load di DEV branch).
- Menambahkan `react-devtools-core` ke `package.json` zhi → membebani setiap `npm install` untuk fitur dev-only.

**Fix akhir:** tambahkan `npm install -D react-devtools-core@^4.19.1 --no-save` ke tiap `build-binary` matrix job (setelah `npm ci`). `--no-save` menghindari lockfile pollution — ini tetap peer milik ink, bukan zhi. Terverifikasi lokal: binary 81M, `--help` berjalan.

## Keputusan
- Tidak menambahkan `react-devtools-core` sebagai devDependency zhi — ini peer opsional milik ink, menambahkannya ke `package.json` zhi akan membebani setiap install untuk fitur dev-only.
- Tidak menggunakan flag `--target`/external untuk `bun build --compile` — tidak ada.

## Verifikasi
- [x] Kedua kerugian direproduksi secara lokal
- [x] `npm install -D react-devtools-core` + `bun build --compile` -> binary 81 MB (akar masalah terkonfirmasi)
- [x] `--external` ditolak: runtime error di DEV branch
- [x] `npm publish --ignore-existing --dry-run` menerima flag (npm 10.9.8)
- [x] Binary 81M berjalan: `--help` sukses
- [ ] CI hijau pada PR #131 (re-run)
- [ ] Re-run `release` workflow untuk `v0.1.6` menghasilkan GitHub Release dengan 4 binary + 4 .sha256

## Catatan
- Commit awal `d7e13d1` di branch `fix/release-workflow-idempotency`, PR #131, closes #130.
- npm package `0.1.6` sudah benar (323 file, WASM ada). Yang hilang: GitHub Release artifacts (binary + checksum).
- Re-run 33984549405 mengungkapkan bahwa `npm ci` tidak mencukupi; fix kedua di atas menyelesaikannya.