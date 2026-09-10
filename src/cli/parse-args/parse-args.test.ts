/**
 * @brief Unit: parseArgs() — argv parsing. @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import { parseArgs } from './parse-args';

describe('parseArgs', () => {
  it('parses goal and threshold', () => {
    expect(parseArgs(['build auth', '--threshold=0.9'])).toEqual({
      goal: 'build auth',
      threshold: 0.9,
    });
  });

  it('throws on whitespace-only goal', () => {
    expect(() => parseArgs(['  '])).toThrow('cli: goal kosong');
  });

  it('falls back to default threshold when flag malformed', () => {
    expect(parseArgs(['goal', '--threshold=NaN'])).toEqual({ goal: 'goal', threshold: 0.8 });
  });

  it('throws on empty argv', () => {
    expect(() => parseArgs([])).toThrow('cli: goal kosong');
  });
});
