# ADR-004: Native Boundary (Zig → WASM First)

## Status

Accepted — 2026-08-29

## Context

Beberapa jalur di Zhi CPU-bound dan harus deterministik: parse stream SSE→token+tool-call, compute unified diff, dan embed kode untuk Vector DB. TS di Bun cukup untuk sebagian besar, tapi hot path ini layak di-Zig untuk kecepatan + isolasi memori.

## Decision

1. **Zig → WASM first** untuk tiga hot path: `native/stream/parse.zig`, `native/diff/diff.zig`, `native/embed/embed.zig`.
2. Tiap `native/<area>/build.zig` emit `native/out/<name>.wasm` (gitignored).
3. **Thin TS wrapper** (`engine/<area>/zigBridge.ts`) panggil `WebAssembly.instantiate`, ekspos typed API. Konsumer import wrapper, BUKAN `.wasm` mentah.
4. **N-API hanya bila perlu**: pindah dari WASM ke N-API hanya bila profiler membuktikan FFI overhead WASM berarti untuk kasus nyata.
5. `embed` menunggu Vector DB (`knowledge/vectors.ts`); di v1 `vectors` stub → `embed` belum dibangun.

## Consequences

- **+** Hot path cepat + isolasi memori (WASM sandbox).
- **+** Konsumen tidak tahu WASM; swap implementasi tanpa ubah caller.
- **+** Build terisolasi per area (`build.zig` masing-masing).
- **-** Butuh toolchain Zig di dev env; CI harus install Zig.
- **-** WASM memiliki overhead instantiate; untuk panggilan sangat kecil bisa malah lebih lambat (makanya N-API sebagai escape hatch).

## References

- `AGENTS.md` §Native boundary
- `docs/ARCHITECTURE.md` §5
- `docs/design/model.md` (stream), `docs/design/knowledge.md` (embed), `docs/design/eval.md` (diff)
