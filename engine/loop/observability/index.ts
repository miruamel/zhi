/**
 * @fileoverview Loop observability — structured logging, metrics, and tracing. @since 0.2.6
 * @package zhi
 */

/** @brief Log level. @since 0.2.6 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** @brief Log entry. @since 0.2.6 */
export interface LogEntry {
  ts: number;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

/** @brief Metric sample. @since 0.2.6 */
export interface MetricSample {
  ts: number;
  name: string;
  value: number;
  tags?: Record<string, string>;
}

/** @brief Trace span. @since 0.2.6 */
export interface TraceSpan {
  id: string;
  parent?: string;
  name: string;
  start: number;
  end?: number;
  status: 'running' | 'completed' | 'failed';
}

/** @brief Observability options. @since 0.2.6 */
export interface ObservabilityOptions {
  maxLogEntries?: number;
  maxMetrics?: number;
  onLog?: (entry: LogEntry) => void;
}

/** @brief Loop observability hub. @since 0.2.6 */
export class Observability {
  private logs: LogEntry[] = [];
  private metrics: MetricSample[] = [];
  private spans: Map<string, TraceSpan> = new Map();
  private readonly maxLogEntries: number;
  private readonly maxMetrics: number;
  private readonly onLog?: (entry: LogEntry) => void;

  constructor(options: ObservabilityOptions = {}) {
    this.maxLogEntries = options.maxLogEntries ?? 1000;
    this.maxMetrics = options.maxMetrics ?? 10_000;
    this.onLog = options.onLog;
  }

  /** @brief Log a message. @since 0.2.6 */
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = { ts: Date.now(), level, message, context };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogEntries) this.logs.shift();
    this.onLog?.(entry);
  }

  /** @brief Convenience log methods. @since 0.2.6 */
  debug(msg: string, ctx?: Record<string, unknown>): void {
    this.log('debug', msg, ctx);
  }
  info(msg: string, ctx?: Record<string, unknown>): void {
    this.log('info', msg, ctx);
  }
  warn(msg: string, ctx?: Record<string, unknown>): void {
    this.log('warn', msg, ctx);
  }
  error(msg: string, ctx?: Record<string, unknown>): void {
    this.log('error', msg, ctx);
  }

  /** @brief Record a metric. @since 0.2.6 */
  metric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({ ts: Date.now(), name, value, tags });
    if (this.metrics.length > this.maxMetrics) this.metrics.shift();
  }

  /** @brief Start a trace span. @since 0.2.6 */
  startSpan(name: string, parent?: string): string {
    const id = `span-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.spans.set(id, { id, parent, name, start: Date.now(), status: 'running' });
    return id;
  }

  /** @brief End a trace span. @since 0.2.6 */
  endSpan(id: string, status: 'completed' | 'failed' = 'completed'): void {
    const span = this.spans.get(id);
    if (span) {
      span.end = Date.now();
      span.status = status;
    }
  }

  /** @brief Get recent logs. @since 0.2.6 */
  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let result = this.logs;
    if (level) result = result.filter((l) => l.level === level);
    return result.slice(-limit);
  }

  /** @brief Get metrics by name. @since 0.2.6 */
  getMetrics(name: string): MetricSample[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /** @brief Get active spans. @since 0.2.6 */
  getActiveSpans(): TraceSpan[] {
    return [...this.spans.values()].filter((s) => s.status === 'running');
  }

  /** @brief Clear all data. @since 0.2.6 */
  clear(): void {
    this.logs = [];
    this.metrics = [];
    this.spans.clear();
  }
}

/** @brief Create observability instance. @since 0.2.6 */
export function createObservability(options?: ObservabilityOptions): Observability {
  return new Observability(options);
}
