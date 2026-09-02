/**
 * @brief Invoker lokal deterministik (tanpa LLM, tanpa secret).
 * Default + path test.
 * @since 0.1.0
 */
import type { ModelInvoker } from './types';

/** @brief Stub invoker untuk test + mode offline. @since 0.1.0 */
export class LocalStubInvoker implements ModelInvoker {
  /**
   * @brief Return stub deterministik berstempel prompt (ber-@brief agar verify lolos).
   * @param {string} prompt - instruksi.
   * @return {Promise<string>} teks stub.
   */
  async invoke(prompt: string): Promise<string> {
    return `/** @brief ${prompt.slice(0, 60)} @since 0.1.0 */\n// [local-stub] ${prompt}\n`;
  }
}
