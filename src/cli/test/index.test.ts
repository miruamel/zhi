/**
 * @brief Unit: cli/index main() dispatch logic.
 * Tests argv routing to subcommands via dependency injection (no mock.module).
 * @since 0.1.4
 */
import { describe, expect, it } from 'bun:test';
import type { LoopContext } from '@engine/loop/wiring/context';
import { main } from '../index';

const fakeCtx = (goal: string): LoopContext => ({ goal });

describe('main() dispatch', () => {
  it('routes `gen` subcommand', async () => {
    const ctx = await main(['gen', 'myapp'], {
      gen: () => Promise.resolve(fakeCtx('myapp')),
      critique: () => Promise.resolve(fakeCtx('')),
      loop: () => Promise.resolve(fakeCtx('')),
      loopTui: () => Promise.resolve(fakeCtx('')),
    });
    expect(ctx.goal).toBe('myapp');
  });

  it('routes `critique:repo` subcommand', async () => {
    const ctx = await main(['critique:repo'], {
      gen: () => Promise.resolve(fakeCtx('')),
      critique: () => Promise.resolve(fakeCtx('critique:repo')),
      loop: () => Promise.resolve(fakeCtx('')),
      loopTui: () => Promise.resolve(fakeCtx('')),
    });
    expect(ctx.goal).toBe('critique:repo');
  });

  it('routes default to loopCommand (non-TTY)', async () => {
    const original = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
    try {
      const ctx = await main(['build', 'something'], {
        gen: () => Promise.resolve(fakeCtx('')),
        critique: () => Promise.resolve(fakeCtx('')),
        loop: () => Promise.resolve(fakeCtx('build something')),
        loopTui: () => Promise.resolve(fakeCtx('')),
      });
      expect(ctx.goal).toBe('build something');
    } finally {
      Object.defineProperty(process.stdout, 'isTTY', { value: original, configurable: true });
    }
  });

  it('routes default to loopCommandTui (TTY)', async () => {
    const original = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    try {
      const ctx = await main(['build', 'something'], {
        gen: () => Promise.resolve(fakeCtx('')),
        critique: () => Promise.resolve(fakeCtx('')),
        loop: () => Promise.resolve(fakeCtx('')),
        loopTui: () => Promise.resolve(fakeCtx('build something')),
      });
      expect(ctx.goal).toBe('build something');
    } finally {
      Object.defineProperty(process.stdout, 'isTTY', { value: original, configurable: true });
    }
  });

  it('throws on unknown subcommand (falls through to loop with empty goal)', async () => {
    const original = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });
    try {
      await expect(
        main(['--unknown-flag'], {
          gen: () => Promise.resolve(fakeCtx('')),
          critique: () => Promise.resolve(fakeCtx('')),
          loop: () => {
            throw new Error('cli: goal kosong');
          },
          loopTui: () => Promise.resolve(fakeCtx('')),
        }),
      ).rejects.toThrow(/goal kosong/);
    } finally {
      Object.defineProperty(process.stdout, 'isTTY', { value: original, configurable: true });
    }
  });
});
