import { describe, it, expect } from 'bun:test';
import { CircuitBreaker } from './breaker';
import { retryWithBudget, type DLQEntry } from './retry';
import { classifyError } from './recover';
import { withResilience } from './index';

describe('CircuitBreaker', () => {
  it('stays closed under low error rate', () => {
    const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
    b.record(true); b.record(true); b.record(false); b.record(true);
    expect(b.isOpen()).toBe(false);
  });
  it('opens when error rate exceeds threshold', () => {
    const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
    b.record(false); b.record(false); b.record(false); b.record(true);
    expect(b.isOpen()).toBe(true);
  });
  it('needs full window before opening', () => {
    const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
    b.record(false); b.record(false);
    expect(b.isOpen()).toBe(false);
  });
});

describe('retryWithBudget', () => {
  it('returns value on first success', async () => {
    const r = await retryWithBudget(async () => 42, 3);
    expect(r.ok).toBe(true);
    expect(r.value).toBe(42);
    expect(r.attempts).toBe(1);
  });
  it('retries then succeeds', async () => {
    let n = 0;
    const r = await retryWithBudget(async () => { if (++n < 3) throw new Error('x'); return n; }, 3);
    expect(r.ok).toBe(true);
    expect(r.value).toBe(3);
    expect(r.attempts).toBe(3);
  });
  it('DLQ after max attempts', async () => {
    const r = await retryWithBudget(async () => { throw new Error('boom'); }, 3);
    expect(r.ok).toBe(false);
    expect(r.dlq?.attempts).toBe(3);
    expect(r.dlq?.error).toContain('boom');
  });
});

describe('classifyError', () => {
  it('fatal for budget/timeout', () => {
    expect(classifyError('budget exceeded').strategy).toBe('abort');
    expect(classifyError('budget exceeded').fatal).toBe(true);
  });
  it('replan for cycle/parse', () => {
    expect(classifyError('dag cycle detected').strategy).toBe('replan');
  });
  it('patch default', () => {
    expect(classifyError('syntax error').strategy).toBe('patch');
  });
});

describe('withResilience', () => {
  it('returns value when breaker closed and fn succeeds', async () => {
    const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
    const v = await withResilience(async () => 'ok', { breaker: b });
    expect(v).toBe('ok');
  });
  it('returns DLQ when breaker open', async () => {
    const b = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    b.record(false); b.record(false);
    const r = await withResilience(async () => 'ok', { breaker: b });
    expect((r as DLQEntry).error).toBe('circuit-open');
  });
  it('returns DLQ on fatal error after retries', async () => {
    const r = await withResilience(async () => { throw new Error('fatal quota'); }, { maxAttempts: 2 });
    expect((r as DLQEntry).error).toContain('fatal quota');
  });
});
