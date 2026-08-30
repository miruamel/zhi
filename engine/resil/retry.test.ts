/** @brief Test retryWithBudget. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { retryWithBudget } from './retry';

test('succeeds first attempt', async () => {
  const r = await retryWithBudget(async () => 42);
  expect(r.ok).toBe(true);
  expect(r.value).toBe(42);
  expect(r.attempts).toBe(1);
});

test('retries then succeeds', async () => {
  let n = 0;
  const r = await retryWithBudget(async () => {
    if (++n < 3) throw new Error('boom');
    return 'ok';
  }, 3);
  expect(r.ok).toBe(true);
  expect(r.value).toBe('ok');
  expect(r.attempts).toBe(3);
});

test('fails all attempts -> DLQ', async () => {
  const r = await retryWithBudget(async () => {
    throw new Error('always');
  }, 3);
  expect(r.ok).toBe(false);
  expect(r.attempts).toBe(3);
  expect(r.dlq?.error).toContain('always');
  expect(r.dlq?.attempts).toBe(3);
  expect(typeof r.dlq?.at).toBe('number');
});

test('respects custom maxAttempts', async () => {
  let n = 0;
  const r = await retryWithBudget(async () => {
    n++;
    throw new Error('x');
  }, 1);
  expect(r.attempts).toBe(1);
  expect(n).toBe(1);
});
