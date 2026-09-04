/**
 * @brief Parser chunk SSE → array payload `data:` (TypeScript murni).
 * Implementasi fallback saat WASM write barrier gagal di proot env.
 * Logika identik dengan `native/stream/parse.zig`.
 * @param {string} chunk - chunk SSE (UTF-8).
 * @return {Promise<string[]>} payload data per event (tanpa prefix `data:`).
 * @see native/stream/parse.zig
 * @since 0.1.2
 */
export async function parseSseTs(chunk: string): Promise<string[]> {
  const out: string[] = [];
  const lines = chunk.split('\n');
  for (const line of lines) {
    if (line.length < 5) continue;
    if (
      line[0] !== 'd' ||
      line[1] !== 'a' ||
      line[2] !== 't' ||
      line[3] !== 'a' ||
      line[4] !== ':'
    ) {
      continue;
    }
    let payload = line.slice(5);
    // Strip semua leading space (Zig strip satu; OpenAI spec strip semua).
    while (payload.startsWith(' ')) payload = payload.slice(1);
    if (payload.length > 0) out.push(payload);
  }
  return out;
}
