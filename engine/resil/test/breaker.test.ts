/**
 * @brief Unit: CircuitBreaker — windowed error-rate breaker. @since 0.1.0
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
});
