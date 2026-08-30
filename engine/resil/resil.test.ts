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

describe('CircuitBreaker (extra)', () => {
  it('trims oldest call from window', () => {
    const b = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    b.record(false); // [false]
    b.record(true); // [false, true] -> 1/2
    b.record(true); // [true, true] -> oldest shifted, 0/2
    expect(b.isOpen()).toBe(false);
  });
  it('reset clears calls', () => {
    const b = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    b.record(false); b.record(false);
    expect(b.isOpen()).toBe(true);
    b.reset();
    expect(b.isOpen()).toBe(false);
  });
});

describe('retryWithBudget (extra)', () => {
  it('respects custom maxAttempts', async () => {
    let n = 0;
    const r = await retryWithBudget(async () => { n++; throw new Error('x'); }, 1);
    expect(r.attempts).toBe(1);
    expect(n).toBe(1);
  });
  it('DLQ carries attempts + timestamp', async () => {
    const r = await retryWithBudget(async () => { throw new Error('always'); }, 3);
    expect(r.dlq?.attempts).toBe(3);
    expect(typeof r.dlq?.at).toBe('number');
  });
});

describe('classifyError (extra)', () => {
  it('fatal for timeout/quota', () => {
    expect(classifyError('timeout exceeded').fatal).toBe(true);
    expect(classifyError('quota exceeded').strategy).toBe('abort');
  });
  it('replan for ambig/parse', () => {
    expect(classifyError('ambig detected').strategy).toBe('replan');
    expect(classifyError('parse detected').fatal).toBe(false);
  });
  it('handles null/undefined without crash', () => {
    expect(classifyError(undefined).strategy).toBe('patch');
    expect(classifyError(null).fatal).toBe(false);
  });
});

describe('withResilience (extra)', () => {
  it('records true on success', async () => {
    const b = new CircuitBreaker({ windowSize: 3, openThreshold: 0.9 });
    const r = await withResilience(async () => 7, { breaker: b });
    expect(r).toBe(7);
    expect(b.isOpen()).toBe(false);
  });
  it('records false on failure', async () => {
    const b = new CircuitBreaker({ windowSize: 3, openThreshold: 0.9 });
    const r = await withResilience(async () => { throw new Error('boom'); }, { breaker: b });
    expect((r as DLQEntry).error).toContain('boom');
    expect(b.isOpen()).toBe(false);
  });
  it('returns DLQ without breaker', async () => {
    const r = await withResilience(async () => { throw new Error('fatal'); });
    expect((r as DLQEntry).error).toContain('fatal');
  });
});
