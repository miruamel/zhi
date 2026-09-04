/**
 * @brief Unit: parseGoal() + STOPWORDS. @since 0.1.2
 */
import { describe, expect, it } from 'bun:test';
import { STOPWORDS, parseGoal } from '../parse';

describe('orch parseGoal', () => {
  it('throws on empty goal', () => {
    expect(() => parseGoal('   ')).toThrow('orch: goal kosong');
  });

  it('drops stopwords from tokens', () => {
    const intent = parseGoal('build auth module');
    expect(intent.tokens).toContain('auth');
    expect(intent.tokens).not.toContain('build');
  });

  it('extracts language and budget constraints', () => {
    const intent = parseGoal('build auth in typescript budget=500');
    expect(intent.constraints).toEqual([
      { kind: 'language', value: 'typescript' },
      { kind: 'budget', value: '500' },
    ]);
  });
});

describe('orch STOPWORDS', () => {
  it('has common articles', () => {
    expect(STOPWORDS.has('the')).toBe(true);
    expect(STOPWORDS.has('dan')).toBe(true);
  });
});
