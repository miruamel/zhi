/**
 * @fileoverview Settings pane tests.
 * @since 0.2.1
 */
import { describe, it, expect } from 'bun:test';
import { SettingsPane } from './settings';
import { renderToString } from '../../../core/test/render';

const entries = [
  {
    key: 'theme',
    value: 'dark',
    type: 'string' as const,
    description: 'Color theme',
  },
  {
    key: 'autoCommit',
    value: 'true',
    type: 'boolean' as const,
    description: 'Auto commit on success',
  },
];

describe('SettingsPane', () => {
  it('renders all entries', () => {
    const out = renderToString(SettingsPane({ entries }));
    expect(out).toContain('SETTINGS');
    expect(out).toContain('theme');
    expect(out).toContain('dark');
    expect(out).toContain('Color theme');
    expect(out).toContain('autoCommit');
  });

  it('renders empty state', () => {
    const out = renderToString(SettingsPane({ entries: [] }));
    expect(out).toContain('No settings.');
  });

  it('shows edit hint when onChange provided', () => {
    const out = renderToString(SettingsPane({ entries, onChange: () => {} }));
    expect(out).toContain('[e] edit');
  });
});
