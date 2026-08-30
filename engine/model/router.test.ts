import { describe, it, expect, afterEach } from 'bun:test';
import { route, type TaskKind } from './router';
import { selectInvoker, CloudModelInvoker, LocalStubInvoker } from './invoker';

describe('model router', () => {
  it('routes generate/critique to heavy', () => {
    expect(route('generate').tier).toBe('heavy');
    expect(route('critique').tier).toBe('heavy');
  });
  it('routes verify/format to light', () => {
    expect(route('verify').tier).toBe('light');
    expect(route('format').tier).toBe('light');
  });
  it('routes classify/tag to micro/local', () => {
    expect(route('classify').tier).toBe('micro');
    expect(route('classify').endpoint).toBe('local');
    expect(route('tag').tier).toBe('micro');
  });
  it('all task kinds resolve to a backend', () => {
    const kinds: TaskKind[] = ['generate', 'critique', 'verify', 'format', 'classify', 'tag'];
    for (const k of kinds) {
      const b = route(k);
      expect(b.model.length).toBeGreaterThan(0);
      expect(b.endpoint.length).toBeGreaterThan(0);
    }
  });
});

describe('selectInvoker (router-driven)', () => {
  const saved = process.env.MODEL_API_KEY;
  afterEach(() => {
    if (saved === undefined) delete process.env.MODEL_API_KEY;
    else process.env.MODEL_API_KEY = saved;
  });
  it('routes micro task to local stub even with key (cost control)', () => {
    process.env.MODEL_API_KEY = 'sk-test';
    expect(selectInvoker('classify')).toBeInstanceOf(LocalStubInvoker);
    expect(selectInvoker('tag')).toBeInstanceOf(LocalStubInvoker);
  });
  it('routes heavy task to cloud when key set', () => {
    process.env.MODEL_API_KEY = 'sk-test';
    expect(selectInvoker('generate')).toBeInstanceOf(CloudModelInvoker);
    expect(selectInvoker('critique')).toBeInstanceOf(CloudModelInvoker);
  });
  it('falls back to stub without key regardless of task', () => {
    delete process.env.MODEL_API_KEY;
    expect(selectInvoker('generate')).toBeInstanceOf(LocalStubInvoker);
    expect(selectInvoker('critique')).toBeInstanceOf(LocalStubInvoker);
  });
});
