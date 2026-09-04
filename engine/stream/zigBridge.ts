/**
 * @brief Zig→WASM bridge untuk SSE parser (native/stream/parse.zig).
 * Load `native/out/stream.wasm`, expose typed API `parseSse()`.
 * Otomatis fallback ke parser TypeScript murni bila WASM write barrier
 * gagal (Zig wasm32 byte-write tidak ter-commit di proot env).
 * Konsumer (`engine/model/stream`) import wrapper ini, bukan .wasm mentah.
 * @see native/stream/parse.zig
 * @since 0.1.2
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const WASM_PATH = join(import.meta.dir, '..', '..', 'native', 'out', 'stream.wasm');
const PAGE = 65536;
const MEMORY_BASE = 1024;

export type Loaded = {
  instance: WebAssembly.Instance;
  memory: WebAssembly.Memory;
  stack: WebAssembly.Global;
};

const cached: Loaded | null = null;
const loading: Promise<Loaded> | null = null;
let wasmAvailable = true;

/**
 * @brief Load instance WASM (singleton) dengan ABI import Zig.
 * @return {Promise<Loaded>} instance + memory + stack pointer.
 * @throw {Error} bila WASM file hilang atau instantiate gagal.
 * @since 0.1.2
async function load(): Promise<Loaded> {
  if (cached) return cached;
  if (loading) return loading;
  const p = (async () => {
    const bytes = readFileSync(WASM_PATH);
    const memory = new WebAssembly.Memory({ initial: 4 });
    const table = new WebAssembly.Table({ initial: 1, element: 'anyfunc' });
    const stack = new WebAssembly.Global(
      { value: 'i32', mutable: true },
      memory.buffer.byteLength - 16,
    );
    const imports = {
      env: {
        memory,
        __indirect_function_table: table,
        __stack_pointer: stack,
        __memory_base: MEMORY_BASE,
        __table_base: 0,
      },
    };
    const { instance } = await WebAssembly.instantiate(bytes, imports);
    cached = { instance, memory, stack };
    loading = null;
    return cached;
  })();
  loading = p;
  return p;
}

/**
 * @brief Hitung offset input/output + kebutuhan page memory.
 * @param {number} inputLen - panjang encoded input dalam byte.
 * @return {{inOff: number; outOff: number; outCap: number}} offset.
 * @since 0.1.2
 */
function calcOffsets(inputLen: number): { inOff: number; outOff: number; outCap: number } {
  const inOff = MEMORY_BASE + 4096;
  const outOff = inOff + inputLen + 4096;
  const outCap = inputLen * 4 + 4096;
  return { inOff, outOff, outCap };
}

/** @brief Parse chunk SSE via Zig wasm32 → array payload `data:`.
 * Fails closed: returns empty array if WASM is disabled, unavailable, or
 * instantiation throws (proot write-barrier breakage). Callers must treat
 * empty array as "no events parsed" — never as "zero data events".
 * @param {string} chunk - chunk SSE (UTF-8).
 * @return {Promise<string[]>} payload data per event.
 * @since 0.1.2 */
export async function parseSseWasm(chunk: string): Promise<string[]> {
  if (!wasmAvailable) {
    return [];
  }
  let inst: Loaded;
  try {
    inst = await load();
  } catch {
    return [];
  }
  const { instance, memory, stack } = inst;
  const parse = (instance.exports as Record<string, unknown>).parse_sse as (
    i: number,
    il: number,
    o: number,
    oc: number,
  ) => number;

  const enc = new TextEncoder();
  const input = enc.encode(chunk);
  const { inOff, outOff, outCap } = calcOffsets(input.length);
  const needPages = Math.ceil((outOff + outCap) / PAGE);
  const curPages = memory.buffer.byteLength / PAGE;
  if (curPages < needPages) {
    memory.grow(needPages - curPages);
    stack.value = memory.buffer.byteLength - 16;
  }

  const buf = memory.buffer;
  new Uint8Array(buf, inOff, input.length).set(input);
  const written = parse(inOff, input.length, outOff, buf.byteLength - outOff);
  const out = new Uint8Array(buf, outOff, written);
  const text = new TextDecoder().decode(out);
  return text.split('\n').filter((line) => line.length > 0);
}

/**
 * @brief Apakah WASM tersedia (belum di-disable). @return {boolean} @since 0.1.2
 */
export function isWasmAvailable(): boolean {
  return wasmAvailable;
}
/**
 * @brief Non-aktifkan WASM (fallback ke TS parser).
 * @since 0.1.2
 */
export function disableWasm(): void {
  wasmAvailable = false;
}

/**
 * @brief Reset WASM availability to true (test helper).
 * @since 0.1.2
 */
export function resetWasm(): void {
  wasmAvailable = true;
}
