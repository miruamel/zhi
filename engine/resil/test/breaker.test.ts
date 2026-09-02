/**
 * @brief Unit: CircuitBreaker — sliding-window error rate. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import { CircuitBreaker } from '../breaker';

describe('CircuitBreaker', () => {
  it('stays closed under low error rate', () => {
    const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
    b.record(true);
    b.record(true);
    b.record(false);
    b.record(true);
    expect(b.isOpen()).toBe(false);
  });

  it('opens when error rate exceeds threshold', () => {
    const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
    b.record(false);
    b.record(false);
    b.record(false);
    b.record(true);
    expect(b.isOpen()).toBe(true);
  });

  it('needs full window before opening', () => {
    const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
    b.record(false);
    b.record(false);
    expect(b.isOpen()).toBe(false);
  });

  it('trims oldest call from window', () => {
    const b = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    b.record(false); // [false]
    b.record(true); // [false, true] -> 1/2
    b.record(true); // [true, true] -> oldest shifted, 0/2
    expect(b.isOpen()).toBe(false);
  });

  it('reset clears calls', () => {
    const b = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
    b.record(false);
    b.record(false);
    expect(b.isOpen()).toBe(true);
    b.reset();
    expect(b.isOpen()).toBe(false);
  });
});
