/**
 * @fileoverview Table tests.
 * @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Table } from './table';
import { renderToString } from '../../core/test/render';

describe('Table', () => {
  it('renders headers and separator', () => {
    const out = renderToString(
      Table({ headers: ['Name', 'Age'], rows: [{ Name: 'Bob', Age: 30 }] }),
    );
    expect(out).toContain('Name');
    expect(out).toContain('Age');
    expect(out).toContain('─');
  });

  it('renders row data', () => {
    const out = renderToString(Table({ headers: ['k'], rows: [{ k: 'v' }] }));
    expect(out).toContain('v');
  });

  it('limits rows with maxRows', () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({ k: `r${i}` }));
    const out = renderToString(Table({ headers: ['k'], rows, maxRows: 3 }));
    expect(out).toContain('r0');
    expect(out).toContain('r2');
    expect(out).not.toContain('r19');
  });

  it('handles empty rows', () => {
    const out = renderToString(Table({ headers: ['h'], rows: [] }));
    expect(out).toContain('h');
    expect(out).toContain('─');
  });
});
