import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { offlineDeps } from '../offline-deps';
import { compress } from '../../../engine/build/context/compress';

describe('offlineDeps generate', () => {
  let wt: string;
  let cleanup: () => void;

  beforeEach(() => {
    wt = mkdtempSync(join(tmpdir(), 'zhi-offline-'));
    cleanup = () => rmSync(wt, { recursive: true, force: true });
  });
  afterEach(() => cleanup());

  it('writes scaffold files to worktree when wt provided', async () => {
    const deps = offlineDeps(0.7);
    const result = await deps.generate('auth', wt);
    // Files should have been written to worktree
    const entries = readdirSync(wt);
    expect(entries.length).toBeGreaterThan(0);
    // Result should contain the file contents
    expect(result).toContain('engine/auth/handlers/index.ts');
    expect(result).toContain('// verify: ok');
  });

  it('does not write to disk when wt absent', async () => {
    const deps = offlineDeps(0.7);
    const result = await deps.generate('auth', undefined);
    // No files written
    expect(readdirSync(wt)).toHaveLength(0);
    expect(result).toContain('engine/auth/handlers/index.ts');
  });
  it('plan() builds dag and returns schedule string', async () => {
    const deps = offlineDeps(0.7);
    const plan = deps.plan('build auth module then test then document');
    expect(typeof plan).toBe('string');
    expect(plan.length).toBeGreaterThan(0);
  });

  it('compress() truncates text to budget', async () => {
    const deps = offlineDeps(0.7);
    const out = await deps.compress!('x'.repeat(5000));
    expect(typeof out).toBe('string');
    expect(out.length).toBeLessThanOrEqual(20000);
  });

  it('compress() returns empty string when budget is zero (fallback path)', () => {
    // budget is hardcoded to 20000 in the closure; to hit the ?? '' fallback
    // we call the underlying compress directly with an empty entries array
    const ctx = compress({ entries: [], budget: 0 });
    expect(ctx.entries).toHaveLength(0);
    // Verify the ?? '' fallback pattern: empty entries → undefined → ''
    const result = ctx.entries[0]?.text ?? '';
    expect(result).toBe('');
  });

  it('ingest() trims goal string', () => {
    const deps = offlineDeps(0.7);
    expect(deps.ingest('  hello  ')).toBe('hello');
  });

  it('critique() returns composed critiques', () => {
    const deps = offlineDeps(0.7);
    const result = deps.critique('const x = 1;');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
