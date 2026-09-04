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
  // Regex ^data: (multiline) — match only lines starting with data:,
  // avoiding the char-by-char comparison loop.
  const re = /^data:(.*)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(chunk)) !== null) {
    let payload = m[1];
    // Strip semua leading space (Zig strip satu; OpenAI spec strip semua).
    while (payload.startsWith(' ')) payload = payload.slice(1);
    if (payload.length > 0) out.push(payload);
  }
  return out;
}
