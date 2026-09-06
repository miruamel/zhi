/**
 * @fileoverview Sessions pane tests.
 * @since 0.2.1
 */
import { describe, it, expect } from 'bun:test';
import { SessionsPane } from './sessions';
import { renderToString } from '../../../core/test/render';

describe('SessionsPane', () => {
  it('renders empty state', () => {
    const out = renderToString(SessionsPane({ sessions: [] }));
    expect(out).toContain('SESSIONS');
    expect(out).toContain('No sessions yet.');
  });

  it('renders session list', () => {
    const out = renderToString(
      SessionsPane({
        sessions: [
          {
            id: 's1',
            label: 'build-auth',
            createdAt: 0,
            lastActive: 0,
            steps: 3,
            tokensUsed: 1200,
            finished: true,
          },
          {
            id: 's2',
            label: 'refactor-tui',
            createdAt: 0,
            lastActive: 0,
            steps: 5,
            tokensUsed: 3400,
            finished: false,
          },
        ],
        activeId: 's2',
      }),
    );
    expect(out).toContain('SESSIONS');
    expect(out).toContain('build-auth');
    expect(out).toContain('refactor-tui');
    expect(out).toContain('3 steps');
    expect(out).toContain('5 steps');
  });

  it('renders create hint when onCreate provided', () => {
    const out = renderToString(SessionsPane({ sessions: [], onCreate: () => {} }));
    expect(out).toContain('[n] new');
  });
});
