/** @brief Test parseGoal + extractConstraints. @since 0.2.0 */
import { test, expect } from 'bun:test';
import { parseGoal, extractConstraints, STOPWORDS } from './parse';

test('parseGoal tokenizes + drops stopwords + extracts language', () => {
  const intent = parseGoal('Build a CLI using bun');
  expect(intent.raw).toBe('Build a CLI using bun');
  expect(intent.tokens).toEqual(['cli', 'bun']); // 'build','a','using' are stopwords
  expect(intent.constraints).toContainEqual({ kind: 'language', value: 'bun' });
});

test('parseGoal empty throws', () => {
  expect(() => parseGoal('')).toThrow('orch: goal kosong');
});

test('parseGoal whitespace-only throws', () => {
  expect(() => parseGoal('   ')).toThrow('orch: goal kosong');
});

test('extractConstraints budget + language', () => {
  const c = extractConstraints('make api budget=50 in python');
  expect(c).toContainEqual({ kind: 'language', value: 'python' });
  expect(c).toContainEqual({ kind: 'budget', value: '50' });
});

test('STOPWORDS has common articles', () => {
  expect(STOPWORDS.has('the')).toBe(true);
  expect(STOPWORDS.has('dan')).toBe(true);
});
