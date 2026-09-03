# 2026-09-04 — Stream test determinism + zigBridge fail-closed

## Konteks

Setelah refactor per-unit test co-location (`12c5ad7`), CI `architecture-guard` gagal pada test `parseStream write-barrier detection` di `engine/stream/test/index.test.ts:16`. Test ini mengasumsikan WASM write barrier rusak (proot env) — di native CI runner WASM berjalan normal, jadi dispatcher tidak pernah memicu fallback path.

## Yang Dikerjakan

### 1. `parseSseWasm` fail-closed (commit `9460d72`)

`load()` di `engine/stream/zigBridge.ts` bisa throw jika WASM write barrier rusak (proot). Sebelumnya exception ini propagate ke `parseStream` → crash. Diperbaiki dengan:

- Guard `if (!wasmAvailable) return []` sebelum `load()`.
- `try/catch` di sekitar `load()` yang mengembalikan `[]` pada throw.
- `Loaded` type di-export (`export type Loaded`) agar konsumen bisa gunakan tanpa `Awaited<ReturnType<typeof load>>`.

Hasil: `parseSseWasm` punya 3 failure path yang sama-sama mengembalikan `[]`:
1. `!wasmAvailable` → `[]`
2. `load()` throws → `[]`
3. Normal parse → `string[]`

`parseStream` sudah punya logikanya: `result.length === 0 && chunk.length > 0` → `disableWasm()` + fallback ke `parseSseTs`. Jadi `[]` dari `parseSseWasm` memicu fallback dengan benar.

### 2. Test deterministic (commit `fca6718` + `df9b1d4` + `6330d69`)

Test di `engine/stream/test/index.test.ts` dan `engine/stream/test/parse.test.ts` diubah dari "asumsi env rusak" ke "disable WASM secara eksplisit":

- `disableWasm()` dipanggil sebelum `parseStream()` → dispatcher langsung ke `parseSseTs` tanpa bergantung pada env.
- Test redundan di `index.test.ts` dihilangkan (sama dengan test di `parse.test.ts`).
- `isWasmAvailable` di-import tapi tidak dipakai → di-remove (TS6133).
- Prettier formatting diatur.

### 3. CI fix iterations

| Commit | Masalah | Solusi |
|--------|---------|--------|
| `fca6718` | arch-guard pass, ci format:check fail | Prettier `--write` |
| `df9b1d4` | ci typecheck fail: `isWasmAvailable` unused | Hapus import |
| `6330d69` | ci success + arch-guard success | Selesai |

## Keputusan

- **Tidak sentuh `engine/stream/index.ts`**: logika "empty + non-empty input → disable + fallback" sudah benar. Degrading WASM yang masih bekerja ke TS parser adalah regresi sungguhan.
- **Test deterministic tanpa mock**: `disableWasm()`/`resetWasm()` adalah state API publik dari `zigBridge`, tidak perlu `mock.module` (yang leak di Bun 1.4.0).
- **Tidak ada bump versi**: 36 commit sejak `v0.1.2` semuanya `style:`/`fix:`/`test:`/`docs:`/`chore:`/`refactor:`. Tanpa `feat:` atau breaking change.

## Status Akhir

| Gate                  | Status                                              |
| --------------------- | --------------------------------------------------- |
| ci (33807981185)      | success                                             |
| architecture-guard    | success (33807981022)                               |
| Working tree          | clean                                               |
| npm @miruamel/zhi     | 0.1.2 published, no bump needed                     |

## Refleksi

Root cause sebenarnya adalah test-env assumption: test mengasumsikan proot behavior (WASM rusak) tanpa memverifikasi bahwa behavior tersebut adalah satu-satunya cara fallback path terpicu. Perbaikan ini membuat test deterministic di semua env — native CI, proot, atau manapun. Prinsip: test harus deterministic tanpa bergantung pada env-specific breakage.