/** @brief Invoker yang memanggil model untuk menghasilkan teks/kode. @since 0.1.0 */

/** @brief Kontrak pemanggilan model (LLM) untuk satu generasi.
 * @since 0.1.0 */
export interface ModelInvoker {
  /** @brief Generate teks dari prompt.
   * @param {string} prompt - instruksi generasi.
   * @return {string} hasil generasi (kode/teks). */
  invoke(prompt: string): string;
}

/** @brief Invoker lokal deterministik (tanpa LLM, tanpa secret).
 * Default + path test. Backend cloud/lokal (route() endpoint 9router/omp/local)
 * ditunda di balik seam ini. @since 0.1.0 */
export class LocalStubInvoker implements ModelInvoker {
  /** @brief Return stub deterministik berstempel prompt (ber-@brief agar verify lolos).
   * @param {string} prompt - instruksi.
   * @return {string} teks stub. */
  invoke(prompt: string): string {
    return `/** @brief ${prompt.slice(0, 60)} @since 0.1.0 */\n// [local-stub] ${prompt}\n`;
  }
}
