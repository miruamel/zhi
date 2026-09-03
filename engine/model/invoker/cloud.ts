/**
 * @brief Invoker cloud OpenAI-compatible (chat/completions).
 * Backend nyata di balik ModelInvoker seam; butuh MODEL_API_KEY.
 * @since 0.1.0
 */
import { parseStream } from '../stream';
import type { ModelInvoker } from './types';

/** @brief Opsi inisialisasi CloudModelInvoker. @since 0.1.0 */
export interface CloudInvokerOpts {
  /** @brief Base URL API tanpa trailing /v1. Default https://api.openai.com/v1. */
  baseUrl?: string;
  /** @brief Nama model. Default gpt-4o-mini. */
  model?: string;
  /** @brief API key (dari env MODEL_API_KEY). */
  apiKey: string;
}

/**
 * @brief Ekstrak token content dari payload SSE (JSON chat/completions).
 * @param {string} payload - baris data: (JSON).
 * @return {string[]} token content (kosong bila bukan JSON/delta).
 * @since 0.1.0
 */
export function extractTokens(payload: string): string[] {
  try {
    const json = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    const token = json.choices?.[0]?.delta?.content;
    return token ? [token] : [];
  } catch {
    return [];
  }
}

/** @brief Invoker OpenAI-compatible (chat completions). @since 0.1.0 */
export class CloudModelInvoker implements ModelInvoker {
  private readonly url: string;
  private readonly model: string;
  private readonly apiKey: string;

  /** @brief Bind endpoint + kredensial. @param {CloudInvokerOpts} opts - baseUrl/model/apiKey. */
  constructor(opts: CloudInvokerOpts) {
    this.url = `${opts.baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`;
    this.model = opts.model ?? 'gpt-4o-mini';
    this.apiKey = opts.apiKey;
  }

  /**
   * @brief POST chat/completions, return content pesan. Throw bila gagal.
   * @param {string} prompt - instruksi.
   * @return {Promise<string>} konten balasan model.
   */
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

  /**
   * @brief Stream chat/completions (SSE) → token per yield. Henti pada [DONE].
   * @param {string} prompt - instruksi.
   * @return {AsyncGenerator<string>} token delta content.
   * @since 0.4.0
   */
  async *stream(prompt: string): AsyncGenerator<string> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        stream: true,
      }),
    });
    if (!res.ok) throw new Error(`CloudModelInvoker: HTTP ${res.status} ${await res.text()}`);
    const body = res.body;
    if (!body) throw new Error('CloudModelInvoker: respons tanpa stream body');
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let cut: number;
      while ((cut = buf.indexOf('\n\n')) !== -1) {
        const event = buf.slice(0, cut);
        buf = buf.slice(cut + 2);
        for (const payload of await parseStream(event)) {
          if (payload === '[DONE]') return;
          yield* extractTokens(payload);
        }
      }
    }
    for (const payload of await parseStream(buf)) {
      if (payload === '[DONE]') return;
      yield* extractTokens(payload);
    }
  }
}
