/** @brief Test withResilience. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { withResilience } from './index';
import { CircuitBreaker } from './breaker';
import type { DLQEntry } from './retry';

test('open breaker short-circuits', async () => {
  const b = new CircuitBreaker({ windowSize: 1, openThreshold: 0 });
  b.record(false); // 1/1 err > 0 -> open
  const r = await withResilience(async () => 'x', { breaker: b });
  expect((r as DLQEntry).error).toBe('circuit-open');
  expect((r as DLQEntry).attempts).toBe(0);
});

test('success returns value + records true', async () => {
  const b = new CircuitBreaker({ windowSize: 3, openThreshold: 0.9 });
  const r = await withResilience(async () => 7, { breaker: b });
  expect(r).toBe(7);
  expect(b.isOpen()).toBe(false);
});

test('failure returns DLQ + records false', async () => {
  const b = new CircuitBreaker({ windowSize: 3, openThreshold: 0.9 });
  const r = await withResilience(async () => {
    throw new Error('boom');
  }, { breaker: b });
  expect((r as DLQEntry).error).toContain('boom');
  expect(b.isOpen()).toBe(false); // 1 failure < window, not open yet
});

test('no breaker: failure returns DLQ', async () => {
  const r = await withResilience(async () => {
    throw new Error('fatal');
  });
  expect((r as DLQEntry).error).toContain('fatal');
});
