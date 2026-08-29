import { describe, it, expect } from 'bun:test';
import { route, type TaskKind } from './router';

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
