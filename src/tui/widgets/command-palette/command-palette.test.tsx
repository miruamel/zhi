/**
 * @brief Command palette tests. @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../core/test/render';
import { CommandPalette } from './command-palette';

const cmds = [
  { id: '1', label: 'Open Settings', action: () => {} },
  { id: '2', label: 'Show Log', action: () => {} },
  { id: '3', label: 'Run Test', action: () => {} },
];

describe('CommandPalette', () => {
  it('renders nothing when closed', () => {
    const out = renderToString(
      <CommandPalette open={false} commands={cmds} onClose={() => {}} />
    );
    expect(out.trim()).toBe('');
  });

  it('renders when open', () => {
    const out = renderToString(
      <CommandPalette open={true} commands={cmds} onClose={() => {}} />
    );
    expect(out).toContain('Type to search');
  });

  it('shows all commands when open', () => {
    const out = renderToString(
      <CommandPalette open={true} commands={cmds} onClose={() => {}} />
    );
    expect(out).toContain('Open Settings');
    expect(out).toContain('Show Log');
  });
});