/**
 * @fileoverview Stream parser — SSE token stream with tool-call extraction. @since 0.2.6
 * @package zhi
 */
import { createHash } from 'node:crypto';

export interface SseEvent {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

export interface TokenChunk {
  type: 'token' | 'tool_call' | 'error' | 'done';
  token?: string;
  toolCall?: ToolCall;
  error?: string;
  timestamp: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  raw: string;
}

export interface ParseOptions {
  maxTokens?: number;
  extractToolCalls?: boolean;
  onToken?: (token: string) => void;
  onToolCall?: (call: ToolCall) => void;
  onError?: (error: Error) => void;
}

export class SseParser {
  private buffer = '';
  private eventBuffer: Partial<SseEvent> = {};
  private options: ParseOptions;

  constructor(options: ParseOptions = {}) {
    this.options = options;
  }

  feed(chunk: string): TokenChunk[] {
    const results: TokenChunk[] = [];
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.trim() === '') {
        if (Object.keys(this.eventBuffer).length > 0) {
          const event = this.dispatch();
          if (event) results.push(...this.processEvent(event));
          this.eventBuffer = {};
        }
        continue;
      }
      const colonIdx = line.indexOf(':');
      const field = colonIdx >= 0 ? line.slice(0, colonIdx) : line;
      const value = colonIdx >= 0 ? line.slice(colonIdx + 1).replace(/^ /, '') : '';

      switch (field) {
        case 'event':
          this.eventBuffer.event = value;
          break;
        case 'data':
          this.eventBuffer.data = (this.eventBuffer.data ?? '') + value + '\n';
          break;
        case 'id':
          this.eventBuffer.id = value;
          break;
        case 'retry':
          this.eventBuffer.retry = parseInt(value, 10);
          break;
      }
    }
    return results;
  }

  private dispatch(): SseEvent | null {
    const data = this.eventBuffer.data?.trimEnd().replace(/\n$/, '');
    if (data === undefined || data === '') return null;
    return {
      event: this.eventBuffer.event ?? 'message',
      data,
      id: this.eventBuffer.id,
      retry: this.eventBuffer.retry,
    };
  }

  private processEvent(event: SseEvent): TokenChunk[] {
    const results: TokenChunk[] = [];
    if (event.event === 'error') {
      results.push({ type: 'error', error: event.data, timestamp: Date.now() });
      this.options.onError?.(new Error(event.data));
      return results;
    }
    if (event.event === 'done' || event.event === 'end') {
      results.push({ type: 'done', timestamp: Date.now() });
      return results;
    }
    try {
      const parsed = JSON.parse(event.data);
      if (parsed.choices?.[0]?.delta?.content) {
        const token = parsed.choices[0].delta.content;
        results.push({ type: 'token', token, timestamp: Date.now() });
        this.options.onToken?.(token);
      }
      if (this.options.extractToolCalls && parsed.choices?.[0]?.delta?.tool_calls) {
        for (const tc of parsed.choices[0].delta.tool_calls) {
          const toolCall: ToolCall = {
            id: tc.id ?? `call_${Date.now()}`,
            name: tc.function?.name ?? '',
            arguments: JSON.parse(tc.function?.arguments ?? '{}'),
            raw: tc.function?.arguments ?? '',
          };
          results.push({ type: 'tool_call', toolCall, timestamp: Date.now() });
          this.options.onToolCall?.(toolCall);
        }
      }
    } catch {
      results.push({ type: 'token', token: event.data, timestamp: Date.now() });
      this.options.onToken?.(event.data);
    }
    return results;
  }

  reset(): void {
    this.buffer = '';
    this.eventBuffer = {};
  }
}

export function createSseParser(options?: ParseOptions): SseParser {
  return new SseParser(options);
}

export function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

/** @brief Parse a stream of SSE chunks into token chunks. @since 0.2.6 */
export async function* parseStream(
  stream: ReadableStream<string>,
  options?: ParseOptions,
): AsyncGenerator<TokenChunk> {
  const parser = createSseParser(options);
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const chunk of parser.feed(value)) {
        yield chunk;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * @brief Parse SSE text into data payloads (TS fallback).
 * @param {string} sse - raw SSE text.
 * @return {Promise<string[]>} data payloads.
 * @since 0.1.1
 */
export async function parseSseTs(sse: string): Promise<string[]> {
  const results: string[] = [];
  const lines = sse.split('\n');
  let currentData: string[] = [];

  for (const line of lines) {
    if (line === '' || line === '\r') {
      if (currentData.length > 0) {
        results.push(...currentData);
      }
      currentData = [];
    }
    if (line.startsWith('data:')) {
      let data = line.slice(5);
      data = data.replace(/^ +/, '');
      currentData.push(data);
    }
  }
  if (currentData.length > 0) {
    results.push(...currentData);
  }
  return results;
}
