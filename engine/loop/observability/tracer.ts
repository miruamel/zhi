/**
 * @fileoverview Loop tracer for span tracking. @since 0.2.6
 * @package zhi
 */
export interface SpanEvent {
  name: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface Span {
  id: string;
  name: string;
  startedAt: number;
  endedAt?: number;
  events: SpanEvent[];
}

export interface Tracer {
  startSpan(name: string): Span;
  addEvent(span: Span, name: string, data?: Record<string, unknown>): void;
  endSpan(span: Span): Span;
  getSpans(): Span[];
}

export function createTracer(): Tracer {
  const spans: Span[] = [];
  return {
    startSpan(name: string): Span {
      const span: Span = { id: `span-${spans.length}`, name, startedAt: Date.now(), events: [] };
      spans.push(span);
      return span;
    },
    addEvent(span: Span, name: string, data?: Record<string, unknown>): void {
      span.events.push({ name, timestamp: Date.now(), data });
    },
    endSpan(span: Span): Span {
      span.endedAt = Date.now();
      return span;
    },
    getSpans(): Span[] {
      return spans;
    },
  };
}
