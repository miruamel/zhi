/**
 * @fileoverview Critics pane tests — Pareto bars, findings, filter, fix toggle, empty state.
 * @since 0.1.15
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render/render';
import { Critics } from './critics';
import type { CriticLine } from '../../../core/state';
import type { CriticItem } from '../../../core/store/types/entities/dag';

const baseLine: CriticLine = { name: 'security', score: 0.5, abstain: false, reason: 'x' };

const items: CriticItem[] = [
  {
    id: '1',
    category: 'security',
    severity: 'high',
    title: 'Hardcoded secret',
    description: 'API key found in src/config.ts:42',
    file: 'src/config.ts',
    line: 42,
    suggestion: 'Move to env var',
    autoFix: false,
    fixed: false,
  },
  {
    id: '2',
    category: 'doc',
    severity: 'low',
    title: 'Missing JSDoc',
    description: 'exported function lacks @brief',
    file: 'src/util.ts',
    line: 7,
    suggestion: 'Add @brief',
    autoFix: true,
    fixed: true,
  },
];

function renderPane(overrides: Partial<Parameters<typeof Critics>[0]> = {}) {
  const props = {
    critics: [baseLine],
    weightedAvg: 0.5,
    threshold: 0.7,
    ...overrides,
  };
  return renderToString(<Critics {...props} />);
}

describe('Critics pane', () => {
  it('renders Pareto bars from critics', () => {
    const out = renderPane();
    expect(out).toContain('CRITICS');
    expect(out).toContain('security');
  });

  it('renders findings when items provided', () => {
    const out = renderPane({ items });
    expect(out).toContain('FINDINGS');
    expect(out).toContain('Hardcoded secret');
    expect(out).toContain('src/config.ts:42');
    expect(out).toContain('Move to env var');
  });

  it('shows empty state when no items', () => {
    const out = renderPane({ items: [] });
    expect(out).not.toContain('FINDINGS');
  });

  it('hides fixed items by default', () => {
    const out = renderPane({ items, onToggleFixed: () => {} });
    expect(out).not.toContain('Missing JSDoc');
    expect(out).toContain('Hiding fixed');
  });

  it('shows fixed items when toggle enabled', () => {
    const out = renderPane({ items, showFixedCritics: true, onToggleFixed: () => {} });
    expect(out).toContain('Missing JSDoc');
    expect(out).toContain('Showing fixed');
  });

  it('filters items by query', () => {
    const out = renderPane({ items, criticsFilter: 'secret', onFilter: () => {} });
    expect(out).toContain('Hardcoded secret');
    expect(out).not.toContain('Missing JSDoc');
  });

  it('shows fix hint for unfixed items when onFix provided', () => {
    const out = renderPane({ items, onFix: () => {} });
    expect(out).toContain('[f] fix');
  });

  it('shows fixed badge for fixed items', () => {
    const out = renderPane({ items, showFixedCritics: true, onToggleFixed: () => {} });
    expect(out).toContain('fixed');
  });
});
