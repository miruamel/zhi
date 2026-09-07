/**
 * @fileoverview Loop reporter — produces structured execution reports. @since 0.2.6
 * @package zhi
 */
import { type Span } from './tracer';

/** @brief Loop report. @since 0.2.6 */
export interface LoopReport {
  phase: string;
  steps: number;
  tokens: number;
  durationMs: number;
  spans: Span[];
  summary: string;
}

/** @brief Generate a loop report. @since 0.2.6 */
export function report(phase: string, steps: number, tokens: number, spans: Span[]): LoopReport {
  const durationMs =
    spans.length > 0 ? Math.max(...spans.map((s) => (s.endedAt ?? s.startedAt) - s.startedAt)) : 0;
  return {
    phase,
    steps,
    tokens,
    durationMs,
    spans,
    summary: `${phase}: ${steps} steps, ${tokens} tokens, ${durationMs}ms`,
  };
}
