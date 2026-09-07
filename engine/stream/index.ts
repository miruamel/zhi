/**
 * @fileoverview Stream engine — SSE/token stream parsing.
 * @since 0.2.6
 * @package zhi
 */
import type { Token, ToolCall, StreamChunk } from './types';

/** @brief Stream parser options. @since 0.2.6 */
export interface StreamParserOptions {
  maxTokens?: number;
  onToken?: (token: Token) => void;
  onToolCall?: (call: ToolCall) => void;
}

/** @brief Stream parser — converts raw SSE text into structured chunks. @since 0.2.6 */
export class StreamParser {
  private buffer = '';
  private tokenCount = 0;
  private readonly maxTokens: number;
  private readonly onToken?: (token: Token) => void;
  private readonly onToolCall?: (call: ToolCall) => void;

  constructor(options: StreamParserOptions = {}) {
    this.maxTokens = options.maxTokens ?? 100_000;
    this.onToken = options.onToken;
    this.onToolCall = options.onToolCall;
  }

  /** @brief Feed raw text into the parser. @since 0.2.6 */
  feed(text: string): StreamChunk[] {
    this.buffer += text;
    const chunks: StreamChunk[] = [];
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const chunk = this.parseLine(line);
      if (chunk) chunks.push(chunk);
    }
    return chunks;
  }

  /** @brief Parse a single SSE line. @since 0.2.6 */
  private parseLine(line: string): StreamChunk | null {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') return { type: 'done' };
      try {
        const parsed = JSON.parse(data);
        return this.parseSSEData(parsed);
      } catch {
        return { type: 'text', text: data };
      }
    }
    if (line.startsWith('event: ')) {
      return { type: 'event', name: line.slice(7) };
    }
    if (line.startsWith(':')) return { type: 'ping' };
    return null;
  }

  /** @brief Parse parsed SSE JSON data. @since 0.2.6 */
  private parseSSEData(data: Record<string, unknown>): StreamChunk {
    if (data.type === 'token' && typeof data.value === 'string') {
      this.tokenCount++;
      if (this.tokenCount > this.maxTokens) throw new Error('stream: max tokens exceeded');
      const token: Token = { value: data.value, index: this.tokenCount };
      this.onToken?.(token);
      return { type: 'token', token };
    }
    if (data.type === 'tool_call' && data.call) {
      const call = data.call as ToolCall;
      this.onToolCall?.(call);
      return { type: 'tool_call', call };
    }
    if (typeof data.text === 'string') return { type: 'text', text: data.text };
    return { type: 'raw', data };
  }

  /** @brief Current token count. @since 0.2.6 */
  get tokens(): number {
    return this.tokenCount;
  }

  /** @brief Reset parser state. @since 0.2.6 */
  reset(): void {
    this.buffer = '';
    this.tokenCount = 0;
  }
}

/** @brief Create a stream parser. @since 0.2.6 */
export function createParser(options?: StreamParserOptions): StreamParser {
  return new StreamParser(options);
}

import { parseSseTs } from './parseSseTs';
export {
  SseParser,
  createSseParser,
  hashContent,
  type SseEvent,
  type TokenChunk,
  type ToolCall,
  type ParseOptions,
} from './parseSseTs';

import { isWasmAvailable } from './zigBridge';
export { isWasmAvailable };

/** @brief Parse SSE text into data payloads with WASM/TS fallback. @since 0.1.2 */
export async function parseStream(chunk: string): Promise<string[]> {
  const { isWasmAvailable, parseSseWasm, disableWasm } = await import('./zigBridge');
  if (!isWasmAvailable()) {
    return parseSseTs(chunk);
  }
  const hasData = /data:/.test(chunk);
  const result = await parseSseWasm(chunk);
  if (result.length === 0 && hasData) {
    disableWasm();
    return parseSseTs(chunk);
  }
  return result;
}
