import { describe, it, expect } from 'bun:test';
import { KnowledgeStore } from './store';

describe('knowledge store', () => {
  it('adds and gets a fact', () => {
    const s = new KnowledgeStore();
    s.add({ key: 'k1', value: 'v1', tags: ['t'] });
    expect(s.get('k1')?.value).toBe('v1');
  });
  it('overwrites by key', () => {
    const s = new KnowledgeStore();
    s.add({ key: 'k', value: 'a', tags: [] });
    s.add({ key: 'k', value: 'b', tags: [] });
    expect(s.get('k')?.value).toBe('b');
  });
  it('queries by tag', () => {
    const s = new KnowledgeStore();
    s.add({ key: 'a', value: '1', tags: ['x'] });
    s.add({ key: 'b', value: '2', tags: ['x', 'y'] });
    s.add({ key: 'c', value: '3', tags: ['z'] });
    expect(
      s
        .byTag('x')
        .map((f) => f.key)
        .sort(),
    ).toEqual(['a', 'b']);
  });
  it('returns undefined for missing key', () => {
    expect(new KnowledgeStore().get('nope')).toBeUndefined();
  });
});
