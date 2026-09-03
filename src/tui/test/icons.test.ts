import { describe, it, expect } from 'bun:test';
import { glyphs, type GlyphKey } from '../core/icons';

describe('tui icons', () => {
  it('has all expected glyphs', () => {
    const keys = Object.keys(glyphs) as GlyphKey[];
    expect(keys).toContain('running');
    expect(keys).toContain('done');
    expect(keys).toContain('failed');
    expect(keys).toContain('pending');
    expect(keys).toContain('warn');
    expect(keys).toContain('info');
  });

  it('uses correct unicode symbols', () => {
    expect(glyphs.running).toBe('●');
    expect(glyphs.done).toBe('✓');
    expect(glyphs.pending).toBe('○');
    expect(glyphs.failed).toBe('✗');
    expect(glyphs.warn).toBe('⚠');
  });

  it('has status labels', () => {
    expect(glyphs.plan).toBe('PLAN');
    expect(glyphs.build).toBe('BUILD');
    expect(glyphs.critique).toBe('CRITIQUE');
    expect(glyphs.eval).toBe('EVAL');
    expect(glyphs.commit).toBe('COMMIT');
    expect(glyphs.done2).toBe('DONE');
  });

  it('has 18 glyphs', () => {
    expect(Object.keys(glyphs)).toHaveLength(18);
  });
});
