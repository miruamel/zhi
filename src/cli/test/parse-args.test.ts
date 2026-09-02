/**
 * @brief Unit: parseArgs() — argv parsing. @since 0.1.0
 */
import { describe, expect, it } from 'bun:test';
import { parseArgs } from '../parse-args';

describe('parseArgs', () => {
  it('parses goal and threshold', () => {
    expect(parseArgs(['build auth', '--threshold=0.9'])).toEqual({
      goal: 'build auth',
      threshold: 0.9,
    });
    expect(parseArgs(['  '])).toEqual({ goal: '  ', threshold: 0.8 });
  });

  it('falls back to default threshold when flag malformed', () => {
    expect(parseArgs(['goal', '--threshold=NaN'])).toEqual({ goal: 'goal', threshold: 0.8 });
  });

  it('handles empty argv', () => {
    expect(parseArgs([])).toEqual({ goal: '', threshold: 0.8 });
  });
});
