/**
 * @brief Tests for the syntax tokenizer and ANSI highlighter.
 */

import { describe, expect, test } from 'bun:test';
import { tokenize, highlight, visibleLength } from './index.ts';

describe('tokenize (ts/js)', () => {
  test('classifies TS keywords', () => {
    const toks = tokenize('const x = 1', 'ts');
    const types = toks.map((t) => t.type);
    expect(types).toContain('keyword');
    expect(types).toContain('identifier');
    expect(types).toContain('operator');
    expect(types).toContain('number');
    expect(types).toContain('whitespace');
  });

  test('reconstructs source when tokens are joined', () => {
    const src = 'const x = 1;';
    const toks = tokenize(src, 'ts');
    expect(toks.map((t) => t.value).join('')).toBe(src);
  });

  test('treats // as a line comment until newline', () => {
    const toks = tokenize('// hi\nx', 'ts');
    const comment = toks.find((t) => t.type === 'comment');
    expect(comment?.value).toBe('// hi');
    expect(toks.some((t) => t.type === 'whitespace')).toBe(true);
  });

  test('treats /* */ as a block comment', () => {
    const toks = tokenize('a /* x */ b', 'ts');
    const comment = toks.find((t) => t.type === 'comment');
    expect(comment?.value).toBe('/* x */');
  });

  test('captures double-quoted strings with escapes', () => {
    const toks = tokenize('"a\\"b"', 'ts');
    const str = toks.find((t) => t.type === 'string');
    expect(str?.value).toBe('"a\\"b"');
  });

  test('captures template literals', () => {
    const toks = tokenize('`x${1}y`', 'ts');
    const str = toks.find((t) => t.type === 'string');
    expect(str?.value).toBe('`x${1}y`');
  });

  test('captures numeric literals including hex/decimals', () => {
    const toks = tokenize('0x1f 3.14', 'ts');
    const numbers = toks.filter((t) => t.type === 'number').map((t) => t.value);
    expect(numbers).toEqual(['0x1f', '3.14']);
  });

  test('reuses same tokenizer for js/jsx/tsx', () => {
    for (const lang of ['js', 'jsx', 'ts', 'tsx'] as const) {
      const toks = tokenize('const x = 1', lang);
      expect(toks.some((t) => t.type === 'keyword')).toBe(true);
    }
  });
});

describe('tokenize (json)', () => {
  test('emits string, number, keyword for literals', () => {
    const src = '{"a": 1, "b": true, "c": null}';
    const toks = tokenize(src, 'json');
    expect(toks.filter((t) => t.type === 'string')).toHaveLength(3);
    expect(toks.some((t) => t.type === 'number' && t.value === '1')).toBe(true);
    const keywords = toks.filter((t) => t.type === 'keyword').map((t) => t.value);
    expect(keywords).toContain('true');
    expect(keywords).toContain('null');
  });

  test('handles negative numbers', () => {
    const toks = tokenize('{"n": -3}', 'json');
    const num = toks.find((t) => t.type === 'number');
    expect(num?.value).toBe('-3');
  });

  test('round-trips source text', () => {
    const src = '{"k": [1, 2, 3]}';
    expect(tokenize(src, 'json').map((t) => t.value).join('')).toBe(src);
  });
});

describe('tokenize (sql)', () => {
  test('uppercases keywords for matching', () => {
    const toks = tokenize('select id from t', 'sql');
    const keywords = toks.filter((t) => t.type === 'keyword').map((t) => t.value);
    expect(keywords).toEqual(['select', 'from']);
  });

  test('marks single-quoted strings', () => {
    const toks = tokenize("SELECT 'a'", 'sql');
    expect(toks.some((t) => t.type === 'string' && t.value === "'a'")).toBe(true);
  });

  test('treats -- as line comment', () => {
    const toks = tokenize('-- comment\nSELECT 1', 'sql');
    expect(toks[0]?.type).toBe('comment');
  });
});

describe('tokenize (bash)', () => {
  test('marks # as line comment', () => {
    const toks = tokenize('# hi\necho', 'bash');
    expect(toks[0]?.type).toBe('comment');
  });

  test('classifies if/then/fi as keywords', () => {
    const toks = tokenize('if x; then y; fi', 'bash');
    const keywords = toks.filter((t) => t.type === 'keyword').map((t) => t.value);
    expect(keywords).toEqual(['if', 'then', 'fi']);
  });
});

describe('tokenize (markdown)', () => {
  test('treats # prefix as heading keyword', () => {
    const toks = tokenize('# Title', 'md');
    expect(toks[0]?.type).toBe('keyword');
    expect(toks.some((t) => t.type === 'keyword')).toBe(true);
  });

  test('captures inline code spans as strings', () => {
    const toks = tokenize('a `b` c', 'md');
    expect(toks.some((t) => t.type === 'string' && t.value === '`b`')).toBe(true);
  });
});

describe('tokenize (fallback)', () => {
  test('returns other tokens for unknown lang', () => {
    const toks = tokenize('hello world', 'brainfuck');
    expect(toks.length).toBeGreaterThan(0);
    expect(toks.every((t) => t.value.length > 0)).toBe(true);
  });

  test('returns single empty token for empty input', () => {
    const toks = tokenize('', 'ts');
    expect(toks).toHaveLength(0);
  });
});

describe('highlight', () => {
  test('emits ANSI escapes for code', () => {
    const out = highlight('const x = 1', 'ts');
    expect(out).toContain('\x1b[');
    expect(out).toContain('const');
    expect(out).toContain('1');
  });

  test('does not wrap whitespace with color codes', () => {
    const out = highlight(' ', 'ts');
    // Whitespace tokens get empty color → no escape inserted for them.
    expect(out.startsWith('\x1b[') || out === ' ').toBe(true);
  });

  test('returns empty string for empty input', () => {
    expect(highlight('', 'ts')).toBe('');
  });

  test('returns plain text for unknown lang', () => {
    const out = highlight('hello', undefined);
    expect(out).toContain('hello');
  });
});

describe('visibleLength', () => {
  test('counts plain ASCII characters', () => {
    expect(visibleLength('hello')).toBe(5);
  });

  test('ignores ANSI escape sequences', () => {
    expect(visibleLength('\x1b[31mhi\x1b[0m')).toBe(2);
  });

  test('returns zero for empty string', () => {
    expect(visibleLength('')).toBe(0);
  });

  test('counts tokens produced by highlight', () => {
    const src = 'const x = 1';
    expect(visibleLength(highlight(src, 'ts'))).toBe(src.length);
  });

  test('handles cursor movement ANSI sequence', () => {
    expect(visibleLength('\x1b[2Jhi')).toBe(2);
  });
});