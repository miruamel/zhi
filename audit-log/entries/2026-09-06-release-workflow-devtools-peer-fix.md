# 2026-09-06-release-workflow-devtools-peer-fix.md

## Deskripsi
Fix tahap dua untuk release workflow `v0.1.6`. Fix sebelumnya (PR #131, `npm ci`) terbukti tidak mencukupi. Issue #130, PR #133.

## Kerugian: npm ci tidak menginstall react-devtools-core
Re-run `release` workflow (run `33984549405`, 2026-09-05T18:35Z) masih gagal di `Build binary`:

```
error: Could not resolve: "react-devtools-core". Maybe you need to "bun install"?
    at /home/runner/work/zhi/zhi/node_modules/ink/build/devtools.js:6:22
```

**Akar masalah:** `react-devtools-core` adalah optional peer milik `ink@4.4.1` (`optionalPeers: ["@types/react", "react-devtools-core"]`). Ia statis dirresolve oleh `bun build --compile` meski `ink/build/reconciler.js` hanya meng-load `./devtools.js` di runtime bila `process.env['DEV'] === 'true'`.

Yang lebih penting: `react-devtools-core` **tidak ada** di `package-lock.json`/`bun.lock` — hanya ada di `node_modules` lokal kita (17M). `npm ci` mengikuti lockfile, jadi package ini tidak terpasang di runner CI yang bersih, dan compile gagal.

## Solusi
 tambahkan `npm install -D react-devtools-core@^4.19.1 --no-save` ke tiap `build-binary` matrix job, setelah `npm ci`. Flag `--no-save` menjaga agar tidak masuk ke lockfile — ini tetap peer milik ink, bukan zhi.

## Alternatif yang dipertimbangkan dan ditolak
- `bun build --compile --external react-devtools-core` → binary 80M tapi runtime error `Cannot find package 'react-devtools-core'` (devtools.js tetap di-load di DEV branch).
- Menambahkan `react-devtools-core` ke `package.json` zhi sebagai devDependency → membebani setiap `npm install` untuk fitur dev-only.

## Verifikasi
- [x] Reproduksi secara lokal: `npm ci` saja meninggalkan `react-devtools-core` kosong; compile gagal.
- [x] `npm install -D react-devtools-core@^4.19.1 --no-save` + `bun build --compile` → binary 81M, `--help` berjalan sukses.
- [x] `--external` ditolak di runtime (DEV branch masih mengimpor devtools.js).
- [ ] CI hijau pada PR #133
- [ ] Re-run `release` workflow untuk `v0.1.6` menghasilkan GitHub Release dengan 4 binary + 4 .sha256

## Catatan
- Commit `51d77e5` di branch `fix/release-workflow-devtools-peer`, PR #133, closes #130.
- Supersedes PR #131 (`npm ci` tidak mencukupi).
- npm package `0.1.6` sudah benar (323 file, WASM ada). Yang hilang: GitHub Release artifacts (binary + checksum).