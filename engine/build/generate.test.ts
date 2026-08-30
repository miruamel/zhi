import { describe, it, expect } from 'bun:test';
import { generate } from './generate';
import { LocalStubInvoker, CloudModelInvoker, selectInvoker } from '../model/invoker';

describe('build generate', () => {
  it('scaffolds fractal domain module (handlers/services/utils/constants + barrel)', async () => {
    const paths = (await generate({ domain: 'auth' })).map((f) => f.path);
    expect(paths).toContain('engine/auth/handlers/index.ts');
    expect(paths).toContain('engine/auth/services/index.ts');
    expect(paths).toContain('engine/auth/utils/index.ts');
    expect(paths).toContain('engine/auth/constants/index.ts');
    expect(paths).toContain('engine/auth/index.ts');
  });

  it('emits Doxygen header in every file', async () => {
    for (const f of await generate({ domain: 'auth' })) {
      expect(f.content).toContain('@brief');
    }
  });

  it('produces exactly 5 files (<=5 per-dir guard)', async () => {
    expect(await generate({ domain: 'x' })).toHaveLength(5);
  });

  it('uses ModelInvoker when provided (model-pluggable seam)', async () => {
    const invoker = new LocalStubInvoker();
    for (const f of await generate({ domain: 'auth' }, invoker)) {
      expect(f.content).toContain('[local-stub]');
    }
  });

  it('CloudModelInvoker parses OpenAI-compatible chat/completions', async () => {
    const saved = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: '// generated code' } }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })) as unknown as typeof fetch;
    try {
      expect(await new CloudModelInvoker({ apiKey: 'k' }).invoke('prompt')).toBe('// generated code');
    } finally {
      globalThis.fetch = saved;
    }
  });

  it('CloudModelInvoker throws on non-2xx', async () => {
    const saved = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response('boom', { status: 500 })) as unknown as typeof fetch;
    try {
      await expect(new CloudModelInvoker({ apiKey: 'k' }).invoke('p')).rejects.toThrow('HTTP 500');
    } finally {
      globalThis.fetch = saved;
    }
  });

  it('selectInvoker returns cloud bila MODEL_API_KEY ada, else stub', () => {
    const prev = process.env.MODEL_API_KEY;
    try {
      process.env.MODEL_API_KEY = 'x';
      expect(selectInvoker()).toBeInstanceOf(CloudModelInvoker);
      delete process.env.MODEL_API_KEY;
      expect(selectInvoker()).toBeInstanceOf(LocalStubInvoker);
    } finally {
      if (prev === undefined) delete process.env.MODEL_API_KEY;
      else process.env.MODEL_API_KEY = prev;
    }
  });
});
