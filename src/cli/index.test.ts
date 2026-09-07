/**
 * @brief Integration: cli boot main() — full loop run dari argv. @since 0.1.1
 */
import { describe, expect, it } from 'bun:test';
import { main } from './index';
import type { CriticResult } from '../../engine/critic/aggregate';

describe('cli boot', () => {
  it('runs loop from argv to DONE with populated context', async () => {
    const ctx = await main(['  build auth  ']);
    expect(ctx.aggregate?.score).toBeGreaterThanOrEqual(0.8);
    expect(ctx.aggregate?.passed).toBe(true);
    expect(ctx.critiques).toHaveLength(11);
    expect(ctx.critiques?.map((c: CriticResult) => c.name)).toContain('maintainability');
  });

  it('dispatches gen subcommand', async () => {
    // gen butuh domain; expect throw bila kosong
    await expect(main(['gen'])).rejects.toThrow('cli: gen butuh <domain>');
  });

  it('dispatches critique:repo subcommand', async () => {
    // Use fake handler — routing-only test; real command is tested in critique-repo-traversal.test.ts.
    const ctx = await main(['critique:repo'], {
      critique: () => Promise.resolve({ goal: 'critique:repo' }),
    });
    expect(ctx.goal).toBe('critique:repo');
  });
});
