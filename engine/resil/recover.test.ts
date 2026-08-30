/** @brief Test classifyError. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { classifyError } from './recover';

test('fatal keywords -> abort + fatal', () => {
  for (const m of ['budget', 'timeout', 'fatal', 'quota']) {
    const c = classifyError(new Error(m + ' exceeded'));
    expect(c.strategy).toBe('abort');
    expect(c.fatal).toBe(true);
  }
});

test('replan keywords -> replan + non-fatal', () => {
  for (const m of ['cycle', 'ambig', 'parse']) {
    const c = classifyError(m + ' detected');
    expect(c.strategy).toBe('replan');
    expect(c.fatal).toBe(false);
  }
});

test('unknown error -> patch + non-fatal', () => {
  const c = classifyError(new Error('weird'));
  expect(c.strategy).toBe('patch');
  expect(c.fatal).toBe(false);
});

test('null/undefined error -> patch (no crash)', () => {
  expect(classifyError(undefined).strategy).toBe('patch');
  expect(classifyError(null).fatal).toBe(false);
});
