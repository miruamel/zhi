/**
 * @brief Kontrak pemanggilan model (LLM) untuk satu generasi.
 * @since 0.1.0
 */
export interface ModelInvoker {
  /**
   * @brief Generate teks dari prompt.
   * @param {string} prompt - instruksi generasi.
   * @return {Promise<string>} hasil generasi (kode/teks).
   */
  invoke(prompt: string): Promise<string>;
  /**
   * @brief Stream token model dari prompt (opsional; stub lokal tak implement).
   * @param {string} prompt - instruksi.
   * @return {AsyncGenerator<string>} token (delta content) per yield.
   */
  stream?(prompt: string): AsyncGenerator<string>;
}
