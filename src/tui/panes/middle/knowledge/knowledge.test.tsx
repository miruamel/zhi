/**
 * @fileoverview KnowledgeInspector pane tests.
 * @since 0.1.14
 */
import { describe, it, expect } from 'bun:test';
import { KnowledgeInspector } from './knowledge';
import { renderToString } from '../../../core/test/render/render';

const facts = [
  { key: 'stack.zig', value: 'Zig 0.13', tags: ['zig', 'stack'] },
  { key: 'stack.ts', value: 'TypeScript 5', tags: ['ts', 'stack'] },
  { key: 'runtime', value: 'Bun', tags: ['ts', 'runtime'] },
];

describe('KnowledgeInspector', () => {
  it('renders fact count', () => {
    const out = renderToString(KnowledgeInspector({ facts }));
    expect(out).toContain('KNOWLEDGE');
    expect(out).toContain('facts: 3');
  });

  it('renders embedding dimension', () => {
    const out = renderToString(KnowledgeInspector({ facts, embeddingDims: 64 }));
    expect(out).toContain('dim: 64');
  });

  it('renders top tags by frequency', () => {
    const out = renderToString(KnowledgeInspector({ facts }));
    expect(out).toContain('stack');
    expect(out).toContain('zig');
  });

  it('renders search box', () => {
    const out = renderToString(KnowledgeInspector({ facts, onQuery: () => {} }));
    expect(out).toContain('search');
  });

  it('shows empty state when no facts', () => {
    const out = renderToString(KnowledgeInspector({ facts: [] }));
    expect(out).toContain('No facts match.');
  });

  it('ranks results by similarity', () => {
    const out = renderToString(KnowledgeInspector({ facts, query: 'zig' }));
    expect(out.indexOf('stack.zigZig 0.13')).toBeLessThan(out.indexOf('stack.tsTypeScript 5'));
    expect(out.indexOf('stack.zigZig 0.13')).toBeLessThan(out.indexOf('runtimeBun'));
  });
});
