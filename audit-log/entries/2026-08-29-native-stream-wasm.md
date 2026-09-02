# Audit — 2026-08-29 — native/stream Zig→WASM bridge

## Trigger

Mandat v6.0 + ADR-004: hot path stream (SSE/token) di Zig→WASM. Item terakhir fase Native WASM.

## Tindakan

1. `native/stream/parse.zig` — `parse_sse(input, len, out, cap)` ekstraktor field `data:` SSE; strip semua spasi leading; tulis payload dipisah `\n`.
2. `native/stream/build.sh` — `zig build-lib ... -dynamic -rdynamic -fPIC -femit-bin=../out/stream.wasm` (out gitignored).
3. `engine/model/stream.ts` — wrapper `parseStream(chunk)`; muat wasm singleton, sediakan ABI import Zig, alokasi buffer, panggil `parse_sse`.
4. `engine/model/stream.test.ts` — 4 test (extract, strip-space, ignore-non-data, multi-data).
5. CI: `architecture.yml` + step Setup Zig (`mlugg/setup-zig@v1`, 0.16.0) + Build native wasm sebelum `bun test`.

## Temuan lingkungan (deviasi)

- `zig build` (build runner) **hang** di environment ini — bahkan trivial build.zig (exit 124). `zig build-lib` one-shot bekerja. → `build.zig` di-drop; pakai `build.sh` (direct command). Deviasi dari ADR-004 (entry point build.zig), dijustifikasi environment.
- wasm dinamis Zig **mengimpor** `env:memory` + `env:__indirect_function_table` + `env:__stack_pointer` + `env:__memory_base` + `env:__table_base`. Wrapper menyediakan kelimanya; `__stack_pointer` diinit ke top memory (tumbuh ke bawah).
- `--export-memory` tidak diterima `zig build-lib`; memory tetap diimpor.

## Verifikasi

- Lokal: `bash build.sh` → `native/out/stream.wasm` (ok); `bun test` → 25 pass / 0 fail (4 file).
- CI: run berikutnya harus hijau (Zig 0.16.0 di-setup, wasm dibuild, bun test jalan).

## Status

native/stream selesai; engine + native v1 concrete terbangun (loop, resil, model/router, model/stream). Sisa: orch, build, critic/aggregate, eval/gate, knowledge/store, src/tui.
