import { describe, it, expect } from 'bun:test';
import { render, type ViewerState } from './viewer';

const base: ViewerState = {
  loop: 'critiqued',
  critics: [
    { name: 'security', score: 0.9 },
    { name: 'perf', score: 0.5 },
  ],
  evalScore: 0.7,
  evalPassed: true,
  knowledgeCount: 3,
};

describe('tui viewer', () => {
  it('renders loop state and counts', () => {
    const out = render(base);
    expect(out).toContain('loop: critiqued');
    expect(out).toContain('knowledge: 3 facts');
  });
  it('shows critic scores', () => {
    const out = render(base);
    expect(out).toContain('- security: 0.90');
    expect(out).toContain('- perf: 0.50');
  });
  it('reflects eval pass/fail', () => {
    expect(render(base)).toContain('eval: 0.70 (PASS)');
    expect(render({ ...base, evalPassed: false })).toContain('eval: 0.70 (FAIL)');
  });
  it('handles empty critics', () => {
    expect(render({ ...base, critics: [] })).toContain('(none)');
  });
});
