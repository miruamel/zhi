/**
 * @fileoverview Debug pane tests.
 * @since 0.1.13 @package zhi
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { DebugPane } from './debug';

describe('DebugPane', () => {
  it('renders title', () => {
    const out = renderToString(<DebugPane breakpoints={[]} variables={[]} callStack={[]} />);
    expect(out).toContain('DEBUG');
  });

  it('renders empty state when no breakpoints', () => {
    const out = renderToString(<DebugPane breakpoints={[]} variables={[]} callStack={[]} />);
    expect(out).toContain('No breakpoints set.');
  });

  it('renders empty state when no call stack', () => {
    const out = renderToString(<DebugPane breakpoints={[]} variables={[]} callStack={[]} />);
    expect(out).toContain('No active session.');
  });

  it('renders empty state when no variables', () => {
    const out = renderToString(<DebugPane breakpoints={[]} variables={[]} callStack={[]} />);
    expect(out).toContain('No variables in scope.');
  });

  it('renders breakpoints', () => {
    const bps = [
      {
        id: 'bp1',
        label: 'main.zig:42',
        value: 'main.zig:42',
        file: 'main.zig',
        line: 42,
        enabled: true,
        hitCount: 3,
      },
    ];
    const out = renderToString(<DebugPane breakpoints={bps} variables={[]} callStack={[]} />);
    expect(out).toContain('main.zig:42');
    expect(out).toContain('BREAKPOINTS');
  });

  it('renders call stack frames', () => {
    const frames = [
      { id: 'f1', label: 'main', value: 'main', file: 'main.zig', line: 10 },
      { id: 'f2', label: 'run', value: 'run', file: 'run.zig', line: 5 },
    ];
    const out = renderToString(<DebugPane breakpoints={[]} variables={[]} callStack={frames} />);
    expect(out).toContain('CALL STACK');
    expect(out).toContain('main');
    expect(out).toContain('run');
  });

  it('renders variables', () => {
    const vars = [
      { name: 'count', value: '42', type: 'number' },
      { name: 'name', value: 'hello' },
    ];
    const out = renderToString(<DebugPane breakpoints={[]} variables={vars} callStack={[]} />);
    expect(out).toContain('count');
    expect(out).toContain('42');
    expect(out).toContain('name');
    expect(out).toContain('hello');
  });
});
