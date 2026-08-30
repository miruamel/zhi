/** @brief Test CircuitBreaker. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { CircuitBreaker } from './breaker';

test('isOpen false before window filled even with all failures', () => {
  const b = new CircuitBreaker({ windowSize: 3, openThreshold: 0.5 });
  b.record(false);
  b.record(false);
  expect(b.isOpen()).toBe(false);
});

test('isOpen true at window with error rate > threshold', () => {
  const b = new CircuitBreaker({ windowSize: 3, openThreshold: 0.5 });
  b.record(false);
  b.record(false);
  b.record(false);
  expect(b.isOpen()).toBe(true);
});

test('isOpen false at window with error rate <= threshold', () => {
  const b = new CircuitBreaker({ windowSize: 4, openThreshold: 0.5 });
  b.record(true);
  b.record(false);
  b.record(false);
  b.record(true);
  expect(b.isOpen()).toBe(false); // 2/4 = 0.5, not > 0.5
});

test('window trims oldest call', () => {
  const b = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
  b.record(false); // [false]
  b.record(true); // [false, true] -> 1/2
  b.record(true); // [true, true] -> oldest false shifted, 0/2
  expect(b.isOpen()).toBe(false);
});

test('reset clears calls', () => {
  const b = new CircuitBreaker({ windowSize: 2, openThreshold: 0.5 });
  b.record(false);
  b.record(false);
  expect(b.isOpen()).toBe(true);
  b.reset();
  expect(b.isOpen()).toBe(false);
});
