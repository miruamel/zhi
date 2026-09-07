/**
 * @fileoverview Terminal pane tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { TerminalPane } from './terminal';
import { renderToString } from '../../../core/test/render';

describe('TerminalPane', () => {
  it('renders terminal lines', () => {
    const out = renderToString(TerminalPane({ lines: ['echo hello'] }));
    expect(out).toContain('TERMINAL');
    expect(out).toContain('echo');
  });
});
