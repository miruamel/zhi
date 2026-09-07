/**
 * @fileoverview Stream types — token, tool call, stream chunk. @since 0.2.6
 * @package zhi
 */

/** @brief Token. @since 0.2.6 */
export interface Token {
  value: string;
  index?: number;
}

/** @brief Tool call. @since 0.2.6 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  raw: string;
}

/** @brief Stream chunk. @since 0.2.6 */
export type StreamChunk =
  | { type: 'text'; text: string }
  | { type: 'token'; token: Token }
  | { type: 'tool_call'; call: ToolCall }
  | { type: 'event'; name: string; data?: unknown }
  | { type: 'ping' }
  | { type: 'done' }
  | { type: 'raw'; data: Record<string, unknown> };
