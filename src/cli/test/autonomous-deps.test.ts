/**
 * @brief Unit: autonomousDeps() — env gate + ZHI_AUTO_PR=1 enrichment.
 * Real git/gh/evaluate are never invoked; we verify typeof closures + base passthrough.
 * @since 0.6.0
 */
import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { autonomousDeps } from '../autonomous-deps';
import type { LoopDeps } from '../../../engine/loop/wiring/handlers';

describe('autonomousDeps env-absent', () => {
  const base: LoopDeps = {
    ingest: (g: string) => g,
    plan: (g: string) => g,
    generate: async () => 'code',
    critique: () => [],
    paretoThreshold: 0.7,
  };
  const origEnv = process.env['ZHI_AUTO_PR'];

  beforeEach(() => {
    delete process.env['ZHI_AUTO_PR'];
  });
  afterEach(() => {
    if (origEnv === undefined) delete process.env['ZHI_AUTO_PR'];
    else process.env['ZHI_AUTO_PR'] = origEnv;
  });

  it('returns base unchanged when env absent', () => {
    const out = autonomousDeps(base, 'x');
    expect(out).toBe(base);
  });
});

describe('autonomousDeps ZHI_AUTO_PR=1', () => {
  const base: LoopDeps = {
    ingest: (g: string) => g,
    plan: (g: string) => g,
    generate: async () => 'code',
    critique: () => [],
    paretoThreshold: 0.7,
  };
  const origEnv = process.env['ZHI_AUTO_PR'];

  beforeEach(() => {
    process.env['ZHI_AUTO_PR'] = '1';
  });
  afterEach(() => {
    if (origEnv === undefined) delete process.env['ZHI_AUTO_PR'];
    else process.env['ZHI_AUTO_PR'] = origEnv;
  });

  it('enriches with 4 handler closures (typeof function)', () => {
    const out = autonomousDeps(base, 'goal-x');
    expect(typeof out.isolate).toBe('function');
    expect(typeof out.commit).toBe('function');
    expect(typeof out.prOpen).toBe('function');
    expect(typeof out.eval).toBe('function');
    // Base passthrough
    expect(out.ingest).toBe(base.ingest);
    expect(out.plan).toBe(base.plan);
    expect(out.generate).toBe(base.generate);
    expect(out.critique).toBe(base.critique);
    expect(out.paretoThreshold).toBe(0.7);
  });

  it('isolate closure is defined and is a function', () => {
    const out = autonomousDeps(base, 'build auth');
    expect(out.isolate).toBeDefined();
    expect(typeof out.isolate).toBe('function');
  });

  it('commit closure is defined and is a function', () => {
    const out = autonomousDeps(base, 'build auth');
    expect(out.commit).toBeDefined();
    expect(typeof out.commit).toBe('function');
  });

  it('prOpen closure is defined and is a function', () => {
    const out = autonomousDeps(base, 'build auth');
    expect(out.prOpen).toBeDefined();
    expect(typeof out.prOpen).toBe('function');
  });

  it('eval closure is defined and is a function', () => {
    const out = autonomousDeps(base, 'build auth');
    expect(out.eval).toBeDefined();
    expect(typeof out.eval).toBe('function');
  });
});
