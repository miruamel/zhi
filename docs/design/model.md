# design/model.md — Model (LLM)

## Purpose

A single abstraction over the LLM: routing between backends (9router/OMP/local), tiers heavy/light/micro, and token streaming through the Zig WASM parser. Used by `build` (generate) and `critic` (model-based critics).

## Components

- `index.ts` (Orchestrator): `chat()` entry.
- `router.ts` (Model Router): choose backend + tier (heavy/light/micro) per task.
- `stream.ts` (Stream Zig WASM parse): SSE chunk → token + tool-call extract, via `native/stream/parse.wasm`.
- `context.ts` — **not here**; context compression lives in `build/context.ts`.

## Interface

```ts
/** @brief Stream chat to the selected backend.
 * @param {ChatReq} req - messages + tier + maxTokens.
 * @return {AsyncIterable<Token>} token stream.
 * @see engine/native/stream/parse.wasm
 * @since 0.1.0 */
export async function* chat(req: ChatReq): AsyncIterable<Token>

/** @brief Choose backend + tier for a task.
 * @param {TaskKind} kind
 * @return {Backend} endpoint + model.
 * @since 0.1.0 */
export function route(kind: TaskKind): Backend
```

## Routing (v1)

- `heavy` (complex generation, critic aggregate) → 9router GPT-4 / Claude class.
- `light` (verify, format) → small / fast model.
- `micro` (classify, tag) → Phi-3 class / local.
- Inter-backend fallback via `resil/breaker`.

## Edge cases

- Backend down → `resil` falls back to another backend / lower tier.
- Stream interrupted → `stream.ts` detects abnormal EOF → `resil` retry.
- Tokens exhausted → `orch/budget` cuts the step.

## v1

Concrete: `router` + `stream` (Zig WASM). Context compression is in `build/context.ts` (not here).

## Cross-link

`ARCHITECTURE.md` §3, §5; `design/build.md`; `design/critic.md`; `design/resil.md`; `native/stream/parse.zig`.
