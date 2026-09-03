/**
 * @brief Unit: loopCommand — happy path + error.
 * Capture console.log agar tidak bocor ke test runner.
 * @since 0.5.0
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { loopCommand } from './loop';

describe('loopCommand', () => {
  let logLines: string[];
  let origLog: typeof console.log;
  beforeEach(() => {
    logLines = [];
    origLog = console.log;
    console.log = (...args: unknown[]) => {
      logLines.push(args.map(String).join(' '));
    };
  });
  afterEach(() => {
    console.log = origLog;
  });

  it('throws when goal kosong', async () => {
    await expect(loopCommand([])).rejects.toThrow('cli: goal kosong');
  });

  it('runs loop and prints metrics summary', async () => {
    const ctx = await loopCommand(['build auth', '--threshold=0.9']);
    expect(ctx.goal).toBe('build auth');
    expect(logLines.some((l) => l.startsWith('[metrics]'))).toBe(true);
  });
});
