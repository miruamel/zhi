/**
 * @brief Unit: CircuitBreaker — windowed error-rate breaker. @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import { CircuitBreaker } from '../breaker';

describe('CircuitBreaker', () => {
  it('starts closed (not open) with no data', () => {
    const cb = new CircuitBreaker({ windowSize: 5, openThreshold: 0.5 });
    expect(cb.isOpen()).toBe(false);
  });

  it('stays closed when window not full', () => {
    const cb = new CircuitBreaker({ windowSize: 5, openThreshold: 0.5 });
    cb.record(false);
    cb.record(false);
    expect(cb.isOpen()).toBe(false);
  });

  it('opens when error rate exceeds threshold (sliding window)', () => {
    const cb = new CircuitBreaker({ windowSize: 3, openThreshold: 0.5 });
    // 3 errors in window → 3/3 = 1.0 > 0.5 → open
    cb.record(false);
    cb.record(false);
    cb.record(false);
    expect(cb.isOpen()).toBe(true);
    // One success slides in, oldest error falls off → 2/3 > 0.5 → still open
    cb.record(true);
    expect(cb.isOpen()).toBe(true);
    // Another success → 1/3, not > 0.5 → closed
    cb.record(true);
    expect(cb.isOpen()).toBe(false);
  });

  it('stays closed at exactly threshold (not open)', () => {
    const cb = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    cb.record(false);
    cb.record(true);
    // 1/2 = 0.5, not > 0.5
    expect(cb.isOpen()).toBe(false);
  });

  it('reset clears state', () => {
    const cb = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    cb.record(false);
    cb.record(false);
    expect(cb.isOpen()).toBe(true);
    cb.reset();
    expect(cb.isOpen()).toBe(false);
  });

  it('all-success window stays closed', () => {
    const cb = new CircuitBreaker({ windowSize: 3, openThreshold: 0.5 });
    cb.record(true);
    cb.record(true);
    cb.record(true);
    expect(cb.isOpen()).toBe(false);
  });

  it('halfOpen transitions state to allow probe', () => {
    const cb = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    cb.record(false);
    cb.record(false);
    expect(cb.isOpen()).toBe(true);
    expect(cb.allow()).toBe(false);

    cb.halfOpen();
    expect(cb.currentState).toBe('half-open');
    expect(cb.isOpen()).toBe(false);
    expect(cb.allow()).toBe(true);
  });

  it('single probe success in half-open transitions to closed', () => {
    const cb = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    cb.record(false);
    cb.record(false);
    cb.halfOpen();

    cb.record(true);
    expect(cb.currentState).toBe('closed');
    expect(cb.isOpen()).toBe(false);
    expect(cb.allow()).toBe(true);
  });

  it('single probe failure in half-open transitions back to open', () => {
    const cb = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    cb.record(false);
    cb.record(false);
    cb.halfOpen();

    cb.record(false);
    expect(cb.currentState).toBe('open');
    expect(cb.isOpen()).toBe(true);
    expect(cb.allow()).toBe(false);
  });

  it('transitions to half-open automatically after halfOpenTimeout', async () => {
    const cb = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5, halfOpenTimeout: 20 });
    cb.record(false);
    cb.record(false);
    expect(cb.isOpen()).toBe(true);

    await new Promise((r) => setTimeout(r, 30));

    expect(cb.currentState).toBe('half-open');
    expect(cb.allow()).toBe(true);
  });

  it('supports resetTimeout as alias for halfOpenTimeout', async () => {
    const cb = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5, resetTimeout: 20 });
    cb.record(false);
    cb.record(false);
    expect(cb.isOpen()).toBe(true);

    await new Promise((r) => setTimeout(r, 30));

    expect(cb.currentState).toBe('half-open');
  });

  it('wrap recovers when probe succeeds in half-open', async () => {
    const cb = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    cb.record(false);
    cb.record(false);
    cb.halfOpen();

    const res = await cb.wrap(async () => 'probe-ok');
    expect(res).toBe('probe-ok');
    expect(cb.currentState).toBe('closed');
  });

  it('triggers onStateChange across transitions', () => {
    const changes: string[] = [];
    const cb = new CircuitBreaker({
      windowSize: 2,
      openThreshold: 0.5,
      onStateChange: (from, to) => changes.push(`${from}->${to}`),
    });
    cb.record(false);
    cb.record(false);
    cb.halfOpen();
    cb.record(true);
    expect(changes).toEqual(['closed->open', 'open->half-open', 'half-open->closed']);
  });
});
