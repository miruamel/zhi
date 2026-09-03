/**
 * @brief Unit: autonomousDeps() — env gate + enrichment.
 * Tanpa ZHI_AUTO_PR, return base. Saat ZHI_AUTO_PR=1, override 4 handler.
 * @since 0.5.1
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { autonomousDeps } from '../autonomous-deps';
import type { LoopDeps } from '../../../engine/loop/wiring/handlers';

describe('autonomousDeps', () => {
  const base: LoopDeps = {
    ingest: (g) => g,
    plan: (g) => g,
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

  it('enriches with isolate/commit/prOpen/eval when ZHI_AUTO_PR=1', () => {
    process.env['ZHI_AUTO_PR'] = '1';
    const out = autonomousDeps(base, 'goal-x');
    expect(typeof out.isolate).toBe('function');
    expect(typeof out.commit).toBe('function');
    expect(typeof out.prOpen).toBe('function');
    expect(typeof out.eval).toBe('function');
    expect(out.ingest).toBe(base.ingest);
    expect(out.paretoThreshold).toBe(0.7);
  });
});
