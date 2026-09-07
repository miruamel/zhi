/**
 * @fileoverview Loop reporter tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { report } from '../reporter';

describe('report', () => {
  it('produces a report with spans', () => {
    const r = report('running', 3, 1500, []);
    expect(r.phase).toBe('running');
    expect(r.steps).toBe(3);
    expect(r.tokens).toBe(1500);
    expect(r.summary).toContain('running');
  });

  it('includes spans in report', () => {
    const spans = [{ id: 's1', name: 'test', startedAt: 100, endedAt: 200, events: [] }];
    const r = report('finished', 1, 100, spans);
    expect(r.spans.length).toBe(1);
    expect(r.durationMs).toBe(100);
  });
});
