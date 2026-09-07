/**
 * @fileoverview ReviewPane tests. @since 0.2.4
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { ReviewPane } from './review';

const hunks = [
  {
    file: 'src/a.ts',
    lines: [
      { prefix: '+' as const, content: 'const x = 1' },
      { prefix: '-' as const, content: 'const x = 0' },
      { prefix: ' ' as const, content: 'const y = 2' },
    ],
  },
];
const comments = [
  { id: 'c1', file: 'src/a.ts', line: 1, author: 'alice', body: 'looks good', resolved: false },
];

describe('ReviewPane', () => {
  it('renders hunks and comments count', () => {
    const f = renderToString(<ReviewPane hunks={hunks} comments={comments} />);
    expect(f).toContain('_REVIEW (1');
    expect(f).toContain('src/a.ts');
    expect(f).toContain('const x = 1');
  });

  it('shows no diff message when empty', () => {
    const f = renderToString(<ReviewPane hunks={[]} comments={[]} />);
    expect(f).toContain('No diff to review.');
  });

  it('shows approve/reject actions when handlers provided', () => {
    const f = renderToString(
      <ReviewPane hunks={hunks} comments={comments} onApprove={() => {}} onReject={() => {}} />,
    );
    expect(f).toContain('approve');
    expect(f).toContain('reject');
  });
});
