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
## Tahap tiga: npm publish --ignore-existing tidak berlaku (run 33985298555)
Re-run setelah PR #133 merge masih gagal, tapi di tempat lain:

1. **`npm publish --ignore-existing` tidak ada di npm 11.** `npm publish --help` tidak menampilkan flag tersebut, dan CI mengabaikannya secara silent — publish tetap gagal dengan `You cannot publish over the previously published versions: 0.1.6` (job `Publish to npm`, exit code 1). Karena `create-release` punya `needs: npm-publish`, seluruh release terhenti.
   **Fix:** ganti dengan pengecekan eksplisit: `npm view "zhi@$VERSION" version` → bila sudah ada, skip publish (exit 0); bila tidak, jalankan `npm publish --provenance --access public`.

2. **Windows binary job gagal karena shell default pwsh.** `Build binary (windows-x64)` gagal pada `FILE="zhi-windows-x64.exe"` — runner Windows default ke PowerShell, di mana syntax assignment `VAR="..."` tidak valid (error: `Cannot find type for FILE`).
   **Fix:** tambahkan `shell: bash` eksplisit ke step `Build binary` dan `Compute checksum`. Tiga binary lain (linux-x64, macos-x64, macos-arm64) sudah sukses — bukti bahwa `npm install -D react-devtools-core --no-save` bekerja.

## Verifikasi (update)
- [x] Reproduksi secara lokal: `npm ci` saja meninggalkan `react-devtools-core` kosong; compile gagal.
- [x] `npm install -D react-devtools-core@^4.19.1 --no-save` + `bun build --compile` → binary 81M, `--help` berjalan sukses.
- [x] `--external` ditolak di runtime (DEV branch masih mengimpor devtools.js).
- [x] `npm publish --ignore-existing` TIDAK berlaku di npm 11 (diabaikan secara silent).
- [x] Binary 81M berjalan: `--help` sukses.
- [x] CI hijau pada PR #133 (Gate, arch-guard, build, CodeQL, dependency scan, Devin Review semua SUCCESS).
- [x] PR #133 merged ke main (`05dc992`).
- [x] Run 33985298555: 3/4 binary jobs sukses (linux-x64, macos-x64, macos-arm64); windows-x64 gagal karena pwsh (diperbaiki); npm-publish gagal karena flag tidak valid (diperbaiki).
- [ ] Re-run `release` workflow untuk `v0.1.6` menghasilkan GitHub Release dengan 4 binary + 4 .sha256
