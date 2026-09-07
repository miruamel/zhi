/**
 * @fileoverview Model stream — token streaming for LLM responses. @since 0.2.6
 * @package zhi
 */
export type Token = { value: string; index?: number };
export type StreamChunk =
  | { type: 'text'; text: string }
  | { type: 'token'; token: Token }
  | { type: 'tool_call'; call: { id: string; name: string; args: unknown } }
  | { type: 'event'; name: string; data?: unknown }
  | { type: 'ping' }
  | { type: 'done' }
  | { type: 'raw'; data: string };

/** @brief Stream accumulator. @since 0.2.6 */
export interface StreamAccumulator {
  text: string;
  tokens: Token[];
  toolCalls: Array<{ id: string; name: string; args: string }>;
}

/** @brief Accumulate stream chunks into final response. @since 0.2.6 */
export class StreamAccumulatorImpl implements StreamAccumulator {
  text = '';
  tokens: Token[] = [];
  toolCalls: Array<{ id: string; name: string; args: string }> = [];

  /** @brief Add a chunk. @since 0.2.6 */
  add(chunk: StreamChunk): void {
    switch (chunk.type) {
      case 'text':
        this.text += chunk.text;
        break;
      case 'token':
        this.tokens.push(chunk.token);
        this.text += chunk.token.value;
        break;
      case 'tool_call':
        this.toolCalls.push({
          id: chunk.call.id,
          name: chunk.call.name,
          args: JSON.stringify(chunk.call.args),
        });
        break;
      case 'event':
      case 'ping':
      case 'done':
      case 'raw':
        break;
    }
  }

  /** @brief Final accumulated text. @since 0.2.6 */
  getText(): string {
    return this.text;
  }

  /** @brief Reset accumulator. @since 0.2.6 */
  reset(): void {
    this.text = '';
    this.tokens = [];
    this.toolCalls = [];
  }
}

/** @brief Create a stream accumulator. @since 0.2.6 */
export function createAccumulator(): StreamAccumulatorImpl {
  return new StreamAccumulatorImpl();
}

/**
 * @brief Parse SSE event block into payload lines.
 * @param {string} event - raw SSE event text.
 * @return {string[]} payload lines (data: content).
 * @since 0.1.2
 */
export function parseStream(event: string): string[] {
  const payloads: string[] = [];
  for (const line of event.split('\n')) {
    if (line.startsWith('data:')) {
      payloads.push(line.slice(5).trimStart());
    }
  }
  return payloads;
}
