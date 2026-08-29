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
    expect(ctx.plan).toBe('plan(build auth)');
    expect(ctx.code).toBe('code(plan(build auth))');
    expect(ctx.aggregate?.score).toBe(0.9);
  });

  it('throws on empty goal', async () => {
    await expect(main([])).rejects.toThrow('cli: goal kosong');
  });
});
