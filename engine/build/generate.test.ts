import { describe, it, expect } from 'bun:test';
import { generate } from './generate';
import { LocalStubInvoker } from '../model/invoker';

describe('build generate', () => {
  it('scaffolds fractal domain module (handlers/services/utils/constants + barrel)', () => {
    const paths = generate({ domain: 'auth' }).map((f) => f.path);
    expect(paths).toContain('engine/auth/handlers/index.ts');
    expect(paths).toContain('engine/auth/services/index.ts');
    expect(paths).toContain('engine/auth/utils/index.ts');
    expect(paths).toContain('engine/auth/constants/index.ts');
    expect(paths).toContain('engine/auth/index.ts');
  });

  it('emits Doxygen header in every file', () => {
    for (const f of generate({ domain: 'auth' })) {
      expect(f.content).toContain('@brief');
    }
  });

  it('produces exactly 5 files (<=5 per-dir guard)', () => {
    expect(generate({ domain: 'x' })).toHaveLength(5);
  });
  it('uses ModelInvoker when provided (model-pluggable seam)', () => {
    const invoker = new LocalStubInvoker();
    for (const f of generate({ domain: 'auth' }, invoker)) {
      expect(f.content).toContain('[local-stub]');
    }
  });
});
