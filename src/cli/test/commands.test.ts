/**
 * @brief Unit: 3 command subcommands (gen, loop, critique-repo) — happy path + error.
 * Capture stdout/stderr agar tidak bocor ke test runner.
 * @since 0.5.0
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { genCommand } from '../commands/gen';
import { loopCommand } from '../commands/loop';
import { critiqueRepoCommand } from '../commands/critique-repo';

describe('genCommand', () => {
  let out: string[];
  let origWrite: typeof process.stdout.write;
  beforeEach(() => {
    out = [];
    origWrite = process.stdout.write;
    process.stdout.write = ((chunk: string | Uint8Array) => {
      out.push(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk));
      return true;
    }) as typeof process.stdout.write;
  });
  afterEach(() => {
    process.stdout.write = origWrite;
  });

  it('throws when domain missing', async () => {
    await expect(genCommand([])).rejects.toThrow('cli: gen butuh <domain>');
  });

  it('scaffolds domain and prints verify verdict', async () => {
    const ctx = await genCommand(['auth']);
    expect(ctx.goal).toBe('auth');
    const text = out.join('');
    expect(text).toContain('// verify:');
  });
});

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

describe('critiqueRepoCommand', () => {
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

  it('emits JSON with root/score/passed and returns goal', async () => {
    const ctx = await critiqueRepoCommand();
    expect(ctx.goal).toBe('critique:repo');
    const text = logLines.join('\n');
    const parsed = JSON.parse(text) as {
      root: string;
      critiques: unknown;
      score: number;
      passed: boolean;
      findings: unknown;
    };
    expect(typeof parsed.root).toBe('string');
    expect(parsed.root.length).toBeGreaterThan(0);
    expect(typeof parsed.score).toBe('number');
    expect(typeof parsed.passed).toBe('boolean');
  });
});
