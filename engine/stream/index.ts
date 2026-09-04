/**
 * @brief Dispatcher parser SSE: coba WASM (zigBridge), fallback ke TS bila write barrier gagal.
 * Konsumer (`engine/model/stream`) import `parseStream` dari sini.
 * @since 0.1.1
 */
import { parseSseTs } from './parseSseTs';
import { disableWasm, isWasmAvailable, parseSseWasm } from './zigBridge';

/**
 * @brief Parse chunk SSE → array payload `data:`.
 * Coba WASM lebih dulu (native boundary); bila write barrier terdeteksi
 * (output selalu kosong = 0 byte ditulis), otomatis disable WASM dan
 * fallback ke parser TS untuk request ini dan selanjutnya.
 * @param {string} chunk - chunk SSE (UTF-8).
 * @return {Promise<string[]>} payload data per event.
 * @since 0.1.1
 */
export async function parseStream(chunk: string): Promise<string[]> {
  if (!isWasmAvailable()) return parseSseTs(chunk);
  try {
    const result = await parseSseWasm(chunk);
    if (result.length === 0 && chunk.length > 0 && chunk.includes('data:')) {
      // Deteksi write barrier: input non-kosong tapi output kosong.
      // Disable WASM permanen, fallback.
      disableWasm();
      return parseSseTs(chunk);
    }
    return result;
  } catch {
    disableWasm();
    return parseSseTs(chunk);
  }
}

export { isWasmAvailable } from './zigBridge';
