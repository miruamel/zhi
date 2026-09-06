/**
 * @fileoverview Memory pane tests.
 * @since 0.2.1
 */
import { describe, it, expect } from 'bun:test';
import { MemoryPane } from './memory';
import { renderToString } from '../../../core/test/render';

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

  it('renders add hint when onAdd provided', () => {
    const out = renderToString(MemoryPane({ facts, onAdd: () => {} }));
    expect(out).toContain('[a] add');
  });
});
