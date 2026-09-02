/**
 * @brief Unit: retryWithBudget — bounded retry + DLQ. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import { retryWithBudget } from '../retry';

describe('retryWithBudget', () => {
  it('returns value on first success', async () => {
    const r = await retryWithBudget(async () => 42, 3);
    expect(r.ok).toBe(true);
    expect(r.value).toBe(42);
    expect(r.attempts).toBe(1);
  });

  it('retries then succeeds', async () => {
    let n = 0;
    const r = await retryWithBudget(async () => {
      if (++n < 3) throw new Error('x');
      return n;
    }, 3);
    expect(r.ok).toBe(true);
    expect(r.value).toBe(3);
    expect(r.attempts).toBe(3);
  });

  it('DLQ after max attempts', async () => {
    const r = await retryWithBudget(async () => {
      throw new Error('boom');
    }, 3);
    expect(r.ok).toBe(false);
    expect(r.dlq?.attempts).toBe(3);
    expect(r.dlq?.error).toContain('boom');
  });

  it('respects custom maxAttempts', async () => {
    let n = 0;
    const r = await retryWithBudget(async () => {
      n++;
      throw new Error('x');
    }, 1);
    expect(r.attempts).toBe(1);
    expect(n).toBe(1);
  });

  it('DLQ carries attempts + timestamp', async () => {
    const r = await retryWithBudget(async () => {
      throw new Error('always');
    }, 3);
    expect(r.dlq?.attempts).toBe(3);
    expect(typeof r.dlq?.at).toBe('number');
  });
});
