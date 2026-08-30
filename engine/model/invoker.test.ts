/** @brief Test LocalStubInvoker + selectInvoker. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { LocalStubInvoker, selectInvoker } from './invoker';

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
