# ADR-011 — v0.3.0 Knowledge: VectorStore slice dulu, native embed ditunda

- **Tanggal**: 2026-08-30
- **Status**: Accepted
- **Penulis**: miruamel-autonomous
- **Review-date**: 2026-09-30

## Konteks

v0.3.0 merencanakan `knowledge/vectors.ts` + `native/embed/embed.wasm` → Vector DB +
semantic cache `critic/cache`, plus `knowledge/docs.ts` / `knowledge/versions.ts` dan
cross-session learning. `vectors.ts` selama ini stub (butuh `native/embed`).

`native/embed` membutuhkan model embedding (Zig → WASM) yang belum ada di env ini; tanpa
itu semantic cache tidak dapat meng-embed query. `docs`/`versions` butuh sumber input
(OpenAPI spec / doc corpus) yang belum tersedia.

## Keputusan

Luluskan `knowledge/vectors.ts` sebagai **primitif in-memory nyata** sekarang:
`VectorStore` (add + cosine top-k search, invariant dimensi konsisten). Tidak bergantung
`native/embed`. `native/embed`, `critic/cache`, `docs.ts`, `versions.ts` ditunda ke slice
berikutnya dalam v0.3.0 setelah dependensi (model / sumber input) tersedia.

## Alternatif

1. Bangun semua v0.3.0 sekaligus — ditolak: `native/embed` butuh model (bukan sekadar
   kode), `docs`/`versions` butuh sumber eksternal; memaksa = dead code / stub kosong.
2. Biarkan `vectors.ts` stub sampai embed ada — ditolak: store vektor adalah kontrak
   mandiri yang teruji; menundanya menghambat progres incremental.

## Konsekuensi

- `VectorStore` teruji (`vectors.test.ts`), siap dikonsumsi `critic/cache` bila embed ada.
- `docs/design/knowledge.md` + `roadmap.md` v0.3.0 diperbarui: vectors graduated, embed/docs/versions deferred.
- Slice berikutnya v0.3.0: `native/embed` (model) → `critic/cache` semantic; lalu `docs`/`versions`.

## Cross-link

`engine/knowledge/vectors.ts`, `docs/design/knowledge.md`, `docs/guides/roadmap.md`.
