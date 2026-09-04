/**
 * @brief Unit: withResilience — orchestrates breaker + retry + DLQ. @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import { CircuitBreaker } from '../breaker';
import type { DLQEntry } from '../retry';
import { withResilience } from '../index';

describe('withResilience', () => {
  it('returns value when breaker closed and fn succeeds', async () => {
    const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
    const v = await withResilience(async () => 'ok', { breaker: b });
    expect(v).toBe('ok');
  });

  it('returns DLQ when breaker open', async () => {
    const b = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    b.record(false);
    b.record(false);
    const r = await withResilience(async () => 'ok', { breaker: b });
    expect((r as DLQEntry).error).toBe('circuit-open');
  });

  it('returns DLQ on fatal error after retries', async () => {
    const r = await withResilience(
      async () => {
        throw new Error('fatal quota');
      },
      { maxAttempts: 2 },
    );
    expect((r as DLQEntry).error).toContain('fatal quota');
  });

  it('records true on success', async () => {
    const b = new CircuitBreaker({ windowSize: 3, openThreshold: 0.9 });
    const r = await withResilience(async () => 7, { breaker: b });
    expect(r).toBe(7);
    expect(b.isOpen()).toBe(false);
  });

  it('records false on failure', async () => {
    const b = new CircuitBreaker({ windowSize: 3, openThreshold: 0.9 });
    const r = await withResilience(
      async () => {
        throw new Error('boom');
      },
      { breaker: b },
    );
    expect((r as DLQEntry).error).toContain('boom');
    expect(b.isOpen()).toBe(false);
  });

  it('returns DLQ without breaker', async () => {
    const r = await withResilience(async () => {
      throw new Error('fatal');
    });
    expect((r as DLQEntry).error).toContain('fatal');
  });
});
