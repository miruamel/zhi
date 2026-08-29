import { describe, it, expect } from 'bun:test';
import { nextAction } from './conductor';

describe('orch conductor', () => {
  it('drives the cycle idle→generate→critique→eval→done', () => {
    expect(nextAction('idle')).toBe('generate');
    expect(nextAction('generated')).toBe('critique');
    expect(nextAction('critiqued')).toBe('eval');
    expect(nextAction('evaluated')).toBe('done');
  });
  it('stays done at terminal state', () => {
    expect(nextAction('done')).toBe('done');
  });
});
