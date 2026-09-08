/**
 * @fileoverview Model invoker types — request/response contracts.
 * @since 0.1.10
 * @package zhi
 */

/** @brief Model request. @since 0.1.10 */
export interface ModelRequest {
  prompt: string;
  context?: string;
  taskKind?: 'code' | 'review' | 'plan' | 'chat' | 'embed' | 'classify';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/** @brief Model response. @since 0.1.10 */
export interface ModelResponse {
  text: string;
  tokens: number;
  cost: number;
  model: string;
  finishReason: 'stop' | 'length' | 'error';
  usage?: { prompt: number; completion: number; total: number };
}

/** @brief Model invoker — pluggable seam for code generation. @since 0.1.1 */
export interface ModelInvoker {
  name: string;
  invoke(prompt: string): Promise<string>;
  stream?(prompt: string): AsyncGenerator<string>;
}

/** @brief Cloud invoker options. @since 0.1.10 */
export interface CloudInvokerOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

/** @brief Create a model invoker. @since 0.1.10 */
const ALLOWED_BASE_URLS = ['https://api.openai.com', 'https://api.anthropic.com'];

function validateBaseUrl(url: string): string {
  const base = url.split('/v1')[0];
  if (!ALLOWED_BASE_URLS.includes(base)) {
    throw new Error(`cloud invoker: baseUrl not allowed: ${base}`);
  }
  return url;
}

export function createModelInvoker(options?: CloudInvokerOptions): ModelInvoker {
  return {
    name: options?.model ? `cloud:${options.model}` : 'cloud',
    invoke: async (prompt: string) => {
      if (!options?.apiKey) throw new Error('cloud invoker: no API key');
      const url = validateBaseUrl(options.baseUrl ?? 'https://api.openai.com/v1');
      const res = await fetch(
        `${url}/chat/completions`,
        {
          signal: AbortSignal.timeout(options?.timeoutMs ?? 30000),

          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${options.apiKey}`,
          },
          body: JSON.stringify({
            model: options.model ?? 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
          }),
        },
      );
      if (!res.ok) throw new Error(`cloud invoker: HTTP ${res.status}`);
      const data = (await res.json()) as any;
      return data.choices?.[0]?.message?.content ?? '';
    },
  };
}
