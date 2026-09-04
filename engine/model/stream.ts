/**
 * @brief Re-export parser SSE dari native boundary (`engine/stream`).
 * Konsumen eksternal (e.g. `engine/build/generate`) import dari sini.
 * Logic + WASM/TS fallback hidup di `engine/stream/index.ts`.
 * @see engine/stream/index.ts
 * @see native/stream/parse.zig
 * @since 0.1.2
 */
export { parseStream } from '../stream';
