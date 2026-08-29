# AGENTS.Style.md — Doxygen Universal

Satu-satunya standar dokumentasi Zhi. Berlaku untuk komentar kode DAN docstring, di semua bahasa (TS/JS/Zig).

## Prinsip

- **Delimiter tetap native bahasa** (`/** */` TS/JS, `///` Zig, `#` Python). JANGAN ganti delimiter.
- **Isi pakai Doxygen tag**. Tag menjelaskan kontrak, bukan implementasi.
- **Bahasa prose**: Indonesia untuk penjelasan; identifier/error string/path verbatim.
- **Setiap export publik wajib** punya `@brief`. Fungsi dengan argumen/return wajib `@param`/`@return`.

## Tag wajib

| Tag | Arti | Wajib untuk |
|---|---|---|
| `@brief` | satu kalimat ringkas | semua simbol publik |
| `@param {tipe} nama` | argumen + kontrak | fungsi >0 arg |
| `@return {tipe}` | nilai kembali + kontrak | fungsi non-void |
| `@throw {Error}` | kondisi lempar | bila ada |
| `@example` | contoh pemanggilan | API publik penting |
| `@see` | rujukan file/modul terkait | bila relevan |
| `@since` | versi diperkenalkan | simbol stabil |

## Contoh per bahasa

### TypeScript

```ts
/**
 * @brief Kompres payload in-place.
 * @param {string} raw - teks mentah, non-null.
 * @return {string} teks terkompresi.
 * @throw {TypeError} bila raw bukan string.
 * @example compress("halo dunia") // "h5dunia"
 * @see engine/build/context.ts
 * @since 0.1.0
 */
export function compress(raw: string): string { /* ... */ }
```

### JavaScript (glue / self-register)

```js
/**
 * @brief Daftarkan tool via side-effect saat import.
 * @param {string} from - path sumber.
 * @param {string} to - path target.
 * @see engine/tools/index.js
 */
export function register(from, to) { /* ... */ }
```

### Zig

```zig
/// @brief Kompres payload.
/// @param raw - slice input.
/// @return []u8 buffer terkompresi (caller bebas).
pub fn compress(raw: []const u8) ![]u8 { // ... }
```

## Aturan penulisan

- `@brief` ≤1 kalimat. Jangan ulang nama fungsi; jelaskan *apa* + *why* singkat.
- `@param` sebutkan kontrak (null?, range?, efek samping?).
- Jangan dokumentasikan hal sepele (`@brief getter` untuk `getX()` tidak wajib).
- Docstring TIDAK boleh jadi tempat logika atau TODO. TODO → issue, bukan komentar.

## Enforcement

- Pre-commit (lint) menolak simbol publik tanpa `@brief`.
- CI gate `docstyle` jalan di PR.
- Lihat `AGENTS.md` §Doc standard.
