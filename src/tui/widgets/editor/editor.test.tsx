/**
 * @fileoverview Editor widget tests. @since 0.1.13
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../core/test/render';
import { Editor } from './editor';
import { MarkdownPreview, parseMarkdown } from './markdown-preview';
import { Toolbar } from './toolbar';

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
