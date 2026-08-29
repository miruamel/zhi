/** @brief Wrapper Zig→WASM untuk parsing stream SSE. @since 0.1.0 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const WASM_PATH = join(import.meta.dir, '..', '..', 'native', 'out', 'stream.wasm');
const PAGE = 65536;
const MEMORY_BASE = 1024;

type Loaded = {
  instance: WebAssembly.Instance;
  memory: WebAssembly.Memory;
  stack: WebAssembly.Global;
};

let cached: Loaded | null = null;

/** @brief Muat instance wasm (singleton) dengan ABI import Zig. @return {Promise<Loaded>} */
async function load(): Promise<Loaded> {
  if (cached) return cached;
  const bytes = readFileSync(WASM_PATH);
  const memory = new WebAssembly.Memory({ initial: 4 });
  const table = new WebAssembly.Table({ initial: 1, element: 'funcref' });
  const stack = new WebAssembly.Global({ value: 'i32', mutable: true }, memory.buffer.byteLength - 16);
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
  return cached;
}

/** @brief Parse chunk SSE → array payload `data:`.
 * @param {string} chunk - chunk SSE (UTF-8).
 * @return {Promise<string[]>} payload data per event.
 * @see native/stream/parse.zig
 * @since 0.1.0 */
export async function parseStream(chunk: string): Promise<string[]> {
  const { instance, memory, stack } = await load();
  const parse = (instance.exports as Record<string, unknown>).parse_sse as (
    i: number, il: number, o: number, oc: number,
  ) => number;

  const enc = new TextEncoder();
  const input = enc.encode(chunk);
  const inOff = MEMORY_BASE + 4096;
  const outOff = inOff + input.length + 4096;
  const needed = outOff + input.length * 4 + 4096;
  const needPages = Math.ceil(needed / PAGE);
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
