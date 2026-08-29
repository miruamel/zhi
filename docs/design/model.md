# design/model.md — Model (LLM)

## Tujuan

Abstraksi tunggal ke LLM: routing antar backend (9router/OMP/local), tier heavy/light/micro, dan streaming token via Zig WASM parse. Dipakai `build` (generate) dan `critic` (kritikus model-based).

## Komponen

- `index.ts` (Orchestrator): `chat()` entry.
- `router.ts` (Model Router): pilih backend + tier (heavy/light/micro) per task.
- `stream.ts` (Stream Zig WASM parse): SSE chunk → token + tool-call extract, via `native/stream/parse.wasm`.
- `context.ts` — **tidak di sini**; context compression ada di `build/context.ts`.

## Interface

```ts
/** @brief Chat streaming ke backend terpilih.
 * @param {ChatReq} req - messages + tier + maxTokens.
 * @return {AsyncIterable<Token>} stream token.
 * @see engine/native/stream/parse.wasm
 * @since 0.1.0 */
export async function* chat(req: ChatReq): AsyncIterable<Token>

/** @brief Pilih backend+tier untuk task.
 * @param {TaskKind} kind
 * @return {Backend} endpoint + model.
 * @since 0.1.0 */
export function route(kind: TaskKind): Backend
```

## Routing (v1)

- `heavy` (generate kompleks, critic agregat) → 9router GPT-4/Claude class.
- `light` (verify, format) → model kecil/cepat.
- `micro` (classify, tag) → Phi-3 class / lokal.
- Fallback antar-backend via `resil/breaker`.

## Edge cases

- Backend down → `resil` fallback ke backend lain / tier bawah.
- Stream terputus → `stream.ts` deteksi EOF tak-normal → `resil` retry.
- Token habis → `orch/budget` potong step.

## v1

Konkret: `router` + `stream` (Zig WASM). Context compression di `build/context.ts` (bukan sini).

## Cross-link

`ARCHITECTURE.md` §3, §5; `design/build.md`; `design/critic.md`; `design/resil.md`; `native/stream/parse.zig`.
