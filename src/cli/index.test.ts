/**
 * @brief Integration: cli boot main() — full loop run dari argv. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import type { Critique } from '../../engine/critic/aggregate';
import { main } from './index';

describe('cli boot', () => {
  it('runs loop from argv to DONE with populated context', async () => {
    const ctx = await main(['  build auth  ']);
    expect(ctx.goal).toBe('build auth');
    expect(ctx.plan).toBe('build auth');
    expect(ctx.code).toContain('engine/build/handlers/index.ts');
    expect(ctx.code).toContain('verify: ok');
    expect(ctx.aggregate?.score).toBeGreaterThanOrEqual(0.8);
    expect(ctx.aggregate?.passed).toBe(true);
    expect(ctx.critiques).toHaveLength(11);
    expect(ctx.critiques?.map((c: Critique) => c.name)).toContain('maintainability');
  });

  it('throws on empty goal', async () => {
    await expect(main([])).rejects.toThrow('cli: goal kosong');
  });

  it('dispatches gen subcommand', async () => {
    // gen butuh domain; expect throw bila kosong
    await expect(main(['gen'])).rejects.toThrow('cli: gen butuh <domain>');
  });

  it('dispatches critique:repo subcommand', async () => {
    const ctx = await main(['critique:repo']);
    expect(ctx.goal).toBe('critique:repo');
  });
});
