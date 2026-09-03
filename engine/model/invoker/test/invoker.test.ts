/** @brief Test LocalStubInvoker + selectInvoker + extractTokens. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { LocalStubInvoker, selectInvoker } from '../index';
import { extractTokens } from '../cloud';

test('LocalStubInvoker.invoke returns deterministic stub with prompt', async () => {
  const out = await new LocalStubInvoker().invoke('make a thing');
  expect(out).toContain('@brief');
  expect(out).toContain('make a thing');
  expect(out).toContain('[local-stub]');
});

test('selectInvoker classify (micro tier) always local stub', async () => {
  const inv = selectInvoker('classify');
  expect(inv).toBeInstanceOf(LocalStubInvoker);
  expect(await inv.invoke('x')).toContain('[local-stub]');
});

test('selectInvoker without API key falls back to stub', async () => {
  delete process.env.MODEL_API_KEY;
  const inv = selectInvoker('generate');
  expect(inv).toBeInstanceOf(LocalStubInvoker);
});

test('extractTokens parses SSE delta content', () => {
  const payload = JSON.stringify({ choices: [{ delta: { content: 'hello' } }] });
  expect(extractTokens(payload)).toEqual(['hello']);
});

test('extractTokens returns empty for non-delta payload', () => {
  const payload = JSON.stringify({ choices: [{ delta: {} }] });
  expect(extractTokens(payload)).toEqual([]);
});

test('extractTokens returns empty for malformed JSON', () => {
  expect(extractTokens('not json')).toEqual([]);
});

test('extractTokens returns empty for missing choices', () => {
  expect(extractTokens('{}')).toEqual([]);
});
