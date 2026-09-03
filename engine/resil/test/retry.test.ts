/**
 * @brief Unit: retryWithBudget — bounded retry + DLQ. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import { retryWithBudget } from '../retry';

describe('retryWithBudget', () => {
  it('succeeds on first attempt', async () => {
    const r = await retryWithBudget(async () => 'ok');
    expect(r.ok).toBe(true);
    expect(r.value).toBe('ok');
    expect(r.attempts).toBe(1);
    expect(r.dlq).toBeUndefined();
  });

  it('retries then succeeds', async () => {
    let calls = 0;
    const r = await retryWithBudget(async () => {
      calls++;
      if (calls < 3) throw new Error('boom');
      return 'recovered';
    });
    expect(r.ok).toBe(true);
    expect(r.value).toBe('recovered');
    expect(r.attempts).toBe(3);
  });

  it('exhausts budget and returns DLQ', async () => {
    const r = await retryWithBudget(async () => {
      throw new Error('always fails');
    }, 3);
    expect(r.ok).toBe(false);
    expect(r.attempts).toBe(3);
    expect(r.dlq).toBeDefined();
    expect(r.dlq!.error).toContain('always fails');
    expect(r.dlq!.attempts).toBe(3);
    expect(r.dlq!.at).toBeGreaterThan(0);
  });

  it('uses default maxAttempts=3', async () => {
    let calls = 0;
    const r = await retryWithBudget(async () => {
      calls++;
      throw new Error('nope');
    });
    expect(r.ok).toBe(false);
    expect(r.attempts).toBe(3);
    expect(calls).toBe(3);
  });

  it('DLQ error is stringified', async () => {
    const r = await retryWithBudget(async () => {
      throw new Error('object error');
    }, 2);
    expect(r.dlq!.error).toContain('object error');
  });
});
