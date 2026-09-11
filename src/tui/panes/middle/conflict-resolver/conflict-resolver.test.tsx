/**
 * @fileoverview Conflict resolver tests.
 * @since 0.1.12
 */
import { describe, it, expect } from 'bun:test';
import { ConflictResolver } from './conflict-resolver';
import { renderToString } from '../../../core/test/render/render';

describe('ConflictResolver', () => {
  it('renders empty state when no conflicts', () => {
    const out = renderToString(ConflictResolver({ open: true, conflicts: [], onClose: () => {} }));
    expect(out).toContain('_CONFLICTS');
    expect(out).toContain('No conflicts detected.');
  });

  it('renders conflict entries as tree', () => {
    const out = renderToString(
      ConflictResolver({
        open: true,
        conflicts: [
          {
            id: 'c1',
            cycle: ['s0', 's1', 's0'],
            steps: ['s0', 's1'],
            resolved: false,
          },
        ],
        onClose: () => {},
      }),
    );
    expect(out).toContain('_CONFLICTS');
    expect(out).toContain('s0');
    expect(out).toContain('s1');
    expect(out).toContain('1 · 1 open');
  });

  it('shows resolved count when all resolved', () => {
    const out = renderToString(
      ConflictResolver({
        open: true,
        conflicts: [
          {
            id: 'c1',
            cycle: ['s0', 's1'],
            steps: ['s0'],
            resolved: true,
          },
        ],
        onClose: () => {},
      }),
    );
    expect(out).toContain('0 open');
  });
});
