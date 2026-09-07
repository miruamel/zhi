/**
 * @fileoverview Test runner tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { createTestRunner, type TestCase } from '../test';

describe('TestRunner', () => {
  it('runs passing tests', async () => {
    const runner = createTestRunner();
    const cases: TestCase[] = [
      { name: 'ok', run: () => true },
      { name: 'also ok', run: () => 1 + 1 === 2 },
    ];
    const results = await runner.run(cases);
    expect(results.length).toBe(2);
    expect(results.every((r) => r.passed)).toBe(true);
  });

  it('detects failures', async () => {
    const runner = createTestRunner();
    const cases: TestCase[] = [{ name: 'fail', run: () => false }];
    const results = await runner.run(cases);
    expect(results[0].passed).toBe(false);
  });

  it('handles async tests', async () => {
    const runner = createTestRunner();
    const cases: TestCase[] = [
      {
        name: 'async ok',
        run: async () => {
          await new Promise((r) => setTimeout(r, 5));
          return true;
        },
      },
    ];
    const results = await runner.run(cases);
    expect(results[0].passed).toBe(true);
  });

  it('reports timeout', async () => {
    const runner = createTestRunner({ timeout: 10 });
    const cases: TestCase[] = [
      {
        name: 'slow',
        run: async () => {
          await new Promise((r) => setTimeout(r, 100));
          return true;
        },
      },
    ];
    const results = await runner.run(cases);
    expect(results[0].passed).toBe(false);
    expect(results[0].error).toContain('timeout');
  });

  it('allPassed checks all', () => {
    const runner = createTestRunner();
    expect(runner.allPassed([{ name: 'a', passed: true, durationMs: 0 }])).toBe(true);
    expect(
      runner.allPassed([
        { name: 'a', passed: true, durationMs: 0 },
        { name: 'b', passed: false, durationMs: 0 },
      ]),
    ).toBe(false);
  });
});
