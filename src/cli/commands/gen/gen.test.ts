/**
 * @brief Unit: genCommand — happy path + error.
 * Capture stdout agar tidak bocor ke test runner.
 * @since 0.5.0
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { genCommand } from './gen';

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

  it('streams token output when --stream flag present', async () => {
    const ctx = await genCommand(['auth', '--stream']);
    expect(ctx.goal).toBe('auth');
    const text = out.join('');
    expect(text).toContain('engine/auth/handlers/index.ts');
    expect(text).toContain('engine/auth/index.ts');
  });
});
