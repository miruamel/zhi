/**
 * @fileoverview TracePane tests. @since 0.2.4
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { TracePane } from './trace';

const entries = [
  {
    ts: 1000,
    from: 'INTAKE',
    to: 'GENERATE',
    event: 'transition',
    kind: 'transition' as const,
    msg: 'step started',
  },
  { ts: 2000, kind: 'info' as const, msg: 'loaded config' },
  { ts: 3000, kind: 'warn' as const, msg: 'retrying' },
  { ts: 4000, kind: 'error' as const, msg: 'failed' },
];

describe('TracePane', () => {
  it('renders entry count and messages', () => {
    const f = renderToString(<TracePane entries={entries} />);
    expect(f).toContain('_TRACE (4/4)');
    expect(f).toContain('step started');
    expect(f).toContain('loaded config');
  });

  it('filters by query', () => {
    const f = renderToString(<TracePane entries={entries} filter="fail" />);
    expect(f).toContain('failed');
    expect(f).not.toContain('step started');
  });

  it('shows no entries message when empty', () => {
    const f = renderToString(<TracePane entries={[]} />);
    expect(f).toContain('No trace entries.');
  });
});
