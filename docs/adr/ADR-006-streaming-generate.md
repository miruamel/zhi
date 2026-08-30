# ADR-006: Streaming Generate (token-by-token)

## Status

Proposed — 2026-08-30

## Context

`generate(spec, invoker?)` mengembalikan `Promise<ScaffoldFile[]>` (batch): `CloudModelInvoker.invoke` menunggu `response.json()` penuh, lalu `generate` mem-parse plan jadi file. Untuk engine code-gen, user tidak melihat progres sampai seluruh plan selesai — buruk untuk UX (§9.3: loading states bermakna) dan menunda deteksi error.

`model/stream` (`native/stream/parse.zig` → `out/stream.wasm`) SUDAH real & teruji (4 pass): `parseStream(chunk)` ekstrak payload `data:` dari SSE. ABI `parse_sse(ptr_in, len_in, ptr_out, cap_out) -> usize` cocok bridge. Jadi parser siap dipakai; yang kurang hanya jalur streaming dari `CloudModelInvoker` ke `generate`.

Tanpa streaming, UX code-gen diam di tengah generate panjang; melanggar §9.3 (loading state) dan membuang parser WASM yang sudah jadi (dead asset).

## Decision

1. **Tambah method opsional ke `ModelInvoker`**: `stream?(prompt: string): AsyncGenerator<string>`.
   - Opsional → `LocalStubInvoker` tak wajib implement (stub lokal tak stream).
   - `CloudModelInvoker.stream` fetch dengan `stream: true`, baca `response.body.getReader()`, decode UTF-8 per chunk, akumulasi SSE, panggil `parseStream` per event, `yield` tiap payload `data:` sebagai token. Henti pada `[DONE]` atau stream kosong.
2. **Tambah `generateStream(spec, invoker?): AsyncGenerator<string>`** di `engine/build/generate.ts` — thin wrapper: bangun prompt scaffold, `yield*` dari `invoker.stream(prompt)`. Mengalirkan token plan (bukan file).
3. **Consumer: CLI flag `--stream`** di `src/cli.ts` — cetak token live saat tiba (preview plan). Jalur batch `generate` tetap utuh (non-breaking; loop tetap pakai batch).
4. **Verifikasi tanpa `MODEL_API_KEY`**: mock `globalThis.fetch` mengembalikan `Response` dengan `body` `ReadableStream` berisi chunk SSE (`data: ...\n\n` + `[DONE]`). Assert token ter-rekonstruksi == respons penuh. `parseStream` sudah teruji via WASM nyata.

## Consequences

- **+** UX streaming nyata (token live) untuk code-gen; pakai `model/stream` WASM (aset tak idle).
- **+** Non-breaking: `invoke`/`generate` batch tetap; loop tak berubah.
- **-** Surface tambah (`stream` + `generateStream` + flag CLI) — dibenarkan karena punya consumer (CLI `--stream`).
- **-** Butuh egress ke model API saat runtime; bila down, CLI fallback ke batch (LocalStubInvoker tak stream → CLI pakai `generate`).

## Risks & Mitigations

- **SSE multi-line `data:`**: `parseStream` sudah pecah per `\n` dan ambil tiap `data:` → aman.
- **Chunk SSE terpotong di tengah event**: akumulasi buffer antar chunk di `CloudModelInvoker.stream` sebelum `parseStream`.
- **`[DONE]` / stream kosong**: henti generator, jangan yield.
- **Verifikasi**: mocked fetch stream (tanpa key); WASM parser via test nyata.

## References

- MANDAT OPERASIONAL 7.0 §2.2 (risiko menengah), §9.3 (UX loading)
- `engine/model/stream.ts` (bridge WASM, teruji)
- `native/stream/parse.zig` (ABI `parse_sse`)
- `engine/model/invoker.ts` (`ModelInvoker`, `CloudModelInvoker`, `selectInvoker`)
- `engine/build/generate.ts` (`generate` batch)
- `src/cli.ts` (entry CLI)
