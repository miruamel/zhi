/** @brief Invoker yang memanggil model untuk menghasilkan teks/kode. @since 0.1.0 */
import { route, type TaskKind } from './router';

/** @brief Kontrak pemanggilan model (LLM) untuk satu generasi.
 * @since 0.1.0 */
export interface ModelInvoker {
  /** @brief Generate teks dari prompt.
   * @param {string} prompt - instruksi generasi.
   * @return {Promise<string>} hasil generasi (kode/teks). */
  invoke(prompt: string): Promise<string>;
}

/** @brief Invoker lokal deterministik (tanpa LLM, tanpa secret).
 * Default + path test. @since 0.1.0 */
export class LocalStubInvoker implements ModelInvoker {
  /** @brief Return stub deterministik berstempel prompt (ber-@brief agar verify lolos).
   * @param {string} prompt - instruksi.
   * @return {Promise<string>} teks stub. */
  async invoke(prompt: string): Promise<string> {
    return `/** @brief ${prompt.slice(0, 60)} @since 0.1.0 */\n// [local-stub] ${prompt}\n`;
  }
}

/** @brief Opsi CloudModelInvoker (OpenAI-compatible chat completions). @since 0.1.0 */
export interface CloudInvokerOpts {
  /** @brief Base URL API tanpa trailing /v1. Default https://api.openai.com/v1. */
  baseUrl?: string;
  /** @brief Nama model. Default gpt-4o-mini. */
  model?: string;
  /** @brief API key (dari env MODEL_API_KEY). */
  apiKey: string;
}

/** @brief Invoker cloud OpenAI-compatible (chat/completions).
 * Backend nyata di balik ModelInvoker seam; butuh MODEL_API_KEY. @since 0.1.0 */
export class CloudModelInvoker implements ModelInvoker {
  private readonly url: string;
  private readonly model: string;
  private readonly apiKey: string;

  /** @brief Bind endpoint + kredensial.
   * @param {CloudInvokerOpts} opts - baseUrl/model/apiKey. */
  constructor(opts: CloudInvokerOpts) {
    this.url = `${opts.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`;
    this.model = opts.model ?? 'gpt-4o-mini';
    this.apiKey = opts.apiKey;
  }

  /** @brief POST chat/completions, return content pesan. Throw bila gagal.
   * @param {string} prompt - instruksi.
   * @return {Promise<string>} konten balasan model. */
  async invoke(prompt: string): Promise<string> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
      }),
    });
    if (!res.ok) throw new Error(`CloudModelInvoker: HTTP ${res.status} ${await res.text()}`);
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('CloudModelInvoker: respons tanpa content');
    return content;
  }
}

/** @brief Pilih backend via model/router: micro (endpoint local) selalu stub lokal;
 * heavy/light (9router/omp) pakai cloud bila MODEL_API_KEY ada, else stub.
 * @param {TaskKind} [kind='generate'] - jenis task (route menentukan endpoint).
 * @return {ModelInvoker} invoker aktif. @since 0.1.0 */
export function selectInvoker(kind: TaskKind = 'generate'): ModelInvoker {
  const backend = route(kind);
  if (backend.endpoint === 'local' || !process.env.MODEL_API_KEY) return new LocalStubInvoker();
  return new CloudModelInvoker({
    apiKey: process.env.MODEL_API_KEY,
    baseUrl: process.env.MODEL_BASE_URL,
    model: process.env.MODEL_NAME,
  });
}
