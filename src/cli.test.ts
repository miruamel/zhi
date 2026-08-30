import { describe, it, expect } from 'bun:test';
import { main, parseArgs } from './cli';

describe('cli boot', () => {
  it('parses goal and threshold', () => {
    expect(parseArgs(['build auth', '--threshold=0.9'])).toEqual({ goal: 'build auth', threshold: 0.9 });
    expect(parseArgs(['  '])).toEqual({ goal: '  ', threshold: 0.8 });
  });

  it('runs loop from argv to DONE with populated context', async () => {
    const ctx = await main(['  build auth  ']);
    expect(ctx.goal).toBe('build auth');
    expect(ctx.plan).toBe('build auth');
    expect(ctx.code).toContain('engine/build/handlers/index.ts');
    expect(ctx.code).toContain('verify: ok');
    expect(ctx.aggregate?.score).toBeGreaterThanOrEqual(0.8);
    expect(ctx.aggregate?.passed).toBe(true);
    expect(ctx.critiques).toHaveLength(4);
    expect(ctx.critiques.map((c) => c.name)).toContain('maintainability');
  });

  it('throws on empty goal', async () => {
    await expect(main([])).rejects.toThrow('cli: goal kosong');
  });
});
