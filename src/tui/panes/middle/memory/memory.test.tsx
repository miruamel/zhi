/**
 * @fileoverview Memory pane tests.
 * @since 0.1.11
 */
import { describe, it, expect } from 'bun:test';
import { MemoryPane } from './memory';
import { renderToString } from '../../../core/test/render/render';

const facts = [
  { key: 'stack.zig', value: 'Zig 0.13', tags: ['zig', 'stack'] },
  { key: 'stack.ts', value: 'TypeScript 5', tags: ['ts', 'stack'] },
];

describe('MemoryPane', () => {
  it('renders all facts when no query', () => {
    const out = renderToString(MemoryPane({ facts }));
    expect(out).toContain('MEMORY');
    expect(out).toContain('stack.zig');
    expect(out).toContain('Zig 0.13');
    expect(out).toContain('stack.ts');
  });

  it('filters by query', () => {
    const out = renderToString(MemoryPane({ facts, query: 'zig' }));
    expect(out).toContain('stack.zig');
    expect(out).not.toContain('stack.ts');
  });

  it('shows empty state when no match', () => {
    const out = renderToString(MemoryPane({ facts, query: 'zzz' }));
    expect(out).toContain('No facts match.');
  });
  it('renders tag filter chips', () => {
    const out = renderToString(MemoryPane({ facts }));
    expect(out).toContain('stack');
    expect(out).toContain('zig');
  });

  it('renders active tag filter badge', () => {
    const out = renderToString(MemoryPane({ facts, activeTag: 'stack' }));
    expect(out).toContain('stack');
  });

  it('shows empty state with tag filter hint', () => {
    const out = renderToString(MemoryPane({ facts, activeTag: 'nonexistent' }));
    expect(out).toContain('No facts match.');
    expect(out).toContain('Try clearing the tag filter');
  });
});
