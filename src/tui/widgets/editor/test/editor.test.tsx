/**
 * @fileoverview Editor widget tests. @since 0.1.13
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { Editor } from '../editor';
import { MarkdownPreview, parseMarkdown } from '../markdown-preview';
import { Toolbar } from '../toolbar';
import { deleteAt, insertAt, moveCursor } from '../actions/editor-actions';

describe('editor actions', () => {
  it('inserts text and advances the cursor', () => {
    const [value, cursor] = insertAt('hello', { line: 0, col: 2 }, 'XY');
    expect(value).toBe('heXYllo');
    expect(cursor).toEqual({ line: 0, col: 4 });
  });

  it('inserts multiline text and advances the cursor', () => {
    const [value, cursor] = insertAt('one\ntwo', { line: 0, col: 3 }, '\nthree');
    expect(value).toBe('one\nthree\ntwo');
    expect(cursor).toEqual({ line: 0, col: 9 });
  });

  it('deletes backward within a line', () => {
    const [value, cursor] = deleteAt('hello', { line: 0, col: 5 });
    expect(value).toBe('hell');
    expect(cursor).toEqual({ line: 0, col: 4 });
  });

  it('moves the cursor across lines', () => {
    expect(moveCursor('one\ntwo', { line: 0, col: 3 }, 1, -1)).toEqual({ line: 1, col: 2 });
  });

  it('deletes backward across lines', () => {
    const [value, cursor] = deleteAt('one\ntwo', { line: 1, col: 0 });
    expect(value).toBe('onetwo');
    expect(cursor).toEqual({ line: 0, col: 3 });
  });

  it('keeps deletion at document start unchanged', () => {
    const cursor = { line: 0, col: 0 };
    expect(deleteAt('hello', cursor)).toEqual(['hello', cursor]);
  });

  it('clamps cursor movement to document bounds', () => {
    expect(moveCursor('a\nbcd', { line: 4, col: 9 }, -1, 0)).toEqual({ line: 1, col: 3 });
    expect(moveCursor('a\nbcd', { line: 0, col: 0 }, -1, -1)).toEqual({ line: 0, col: 0 });
  });
});

describe('parseMarkdown', () => {
  it('parses headings', () => {
    const nodes = parseMarkdown('# Title\n## Sub');
    expect(nodes).toHaveLength(2);
    expect(nodes[0].kind).toBe('heading');
    expect(nodes[0].level).toBe(1);
    expect(nodes[0].content).toBe('Title');
    expect(nodes[1].level).toBe(2);
  });

  it('parses code blocks', () => {
    const nodes = parseMarkdown('```js\nconst x = 1\n```');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].kind).toBe('codeblock');
    expect(nodes[0].lang).toBe('js');
    expect(nodes[0].content).toBe('const x = 1');
  });

  it('parses unordered lists', () => {
    const nodes = parseMarkdown('- item one\n- item two');
    expect(nodes).toHaveLength(2);
    expect(nodes[0].kind).toBe('list');
    expect(nodes[0].content).toBe('item one');
  });

  it('parses paragraphs', () => {
    const nodes = parseMarkdown('hello world');
    expect(nodes).toHaveLength(1);
    expect(nodes[0].kind).toBe('paragraph');
    expect(nodes[0].content).toBe('hello world');
  });

  it('handles empty input', () => {
    expect(parseMarkdown('')).toHaveLength(0);
  });

  it('skips blank lines', () => {
    const nodes = parseMarkdown('# H\n\npara');
    expect(nodes).toHaveLength(2);
    expect(nodes[1].content).toBe('para');
  });
});

describe('Editor', () => {
  it('renders editor with initial value', () => {
    const out = renderToString(<Editor initialValue="# Hello" height={10} />);
    expect(out).toContain('Hello');
  });

  it('shows word and character count', () => {
    const out = renderToString(<Editor initialValue="hello world" height={10} />);
    expect(out).toContain('2w');
    expect(out).toContain('11c');
  });

  it('renders toolbar', () => {
    const out = renderToString(<Editor initialValue="x" height={10} />);
    expect(out).toContain('TOOLBAR');
  });

  it('renders preview when enabled', () => {
    const out = renderToString(<Editor initialValue="# Title" preview={true} height={10} />);
    expect(out).toContain('PREVIEW');
  });

  it('hides preview when disabled', () => {
    const out = renderToString(<Editor initialValue="# Title" preview={false} height={10} />);
    expect(out).not.toContain('PREVIEW');
  });
});

describe('MarkdownPreview', () => {
  it('renders headings', () => {
    const out = renderToString(<MarkdownPreview markdown="# Big" />);
    expect(out).toContain('Big');
  });

  it('renders code blocks', () => {
    const out = renderToString(<MarkdownPreview markdown="```js\ncode\n```" />);
    expect(out).toContain('code');
    expect(out).toContain('js');
  });

  it('renders empty', () => {
    const out = renderToString(<MarkdownPreview markdown="" />);
    expect(out).toBeDefined();
  });
});

describe('Toolbar', () => {
  it('renders all buttons', () => {
    const out = renderToString(<Toolbar />);
    expect(out).toContain('TOOLBAR');
    expect(out).toContain('Preview');
  });

  it('calls handlers when set', () => {
    const bold = () => {};
    const out = renderToString(<Toolbar bold={bold} />);
    expect(out).toContain('B');
  });
});
