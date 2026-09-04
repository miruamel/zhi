/** @brief Tests for JsonView widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import React from 'react';
import { render } from 'ink';
import { JsonView } from './json-view';

/** @brief Render an ink element to a string using a synchronous writable stdout. */
function snapshot(el: React.ReactElement): string {
  const chunks: string[] = [];
  const stdout = {
    write: (s: string) => { chunks.push(s); return true; },
    columns: 80,
    rows: 24,
    on: () => {},
    off: () => {},
  };
  const inst = render(el, { stdout: stdout as unknown as NodeJS.WriteStream, debug: true });
  inst.unmount();
  return chunks.join('');
}

test('renders primitive string inline', () => {
  const out = snapshot(React.createElement(JsonView, { data: 'hello' }));
  expect(out).toContain('"hello"');
});

test('renders primitive number inline', () => {
  const out = snapshot(React.createElement(JsonView, { data: 42 }));
  expect(out).toContain('42');
});

test('renders primitive boolean inline', () => {
  const out = snapshot(React.createElement(JsonView, { data: true }));
  expect(out).toContain('true');
});

test('renders null inline', () => {
  const out = snapshot(React.createElement(JsonView, { data: null }));
  expect(out).toContain('null');
});

test('renders each primitive type with a distinct color', () => {
  const out = snapshot(
    React.createElement(JsonView, {
      data: { s: 'a', n: 1, b: true, z: null },
    }),
  );
  expect(out).toContain('"a"');
  expect(out).toContain('1');
  expect(out).toContain('true');
  expect(out).toContain('null');
});

test('expands top-level object by default', () => {
  const out = snapshot(
    React.createElement(JsonView, { data: { name: 'alice', age: 30 } }),
  );
  expect(out).toContain('"name"');
  expect(out).toContain('"alice"');
  expect(out).toContain('"age"');
  expect(out).toContain('30');
});

test('collapses object when collapsed=true', () => {
  const out = snapshot(
    React.createElement(JsonView, {
      data: { name: 'alice', age: 30, email: 'a@x.com' },
      collapsed: true,
    }),
  );
  expect(out).toContain('{3}');
  expect(out).not.toContain('"name"');
  expect(out).not.toContain('"alice"');
});

test('shows array count when collapsed', () => {
  const out = snapshot(
    React.createElement(JsonView, { data: [1, 2, 3, 4, 5], collapsed: true }),
  );
  expect(out).toContain('[');
  expect(out).toContain('5');
  expect(out).toContain(']');
  expect(out).not.toContain('1');
  expect(out).not.toContain('2');
});

test('expands array by default and renders each item', () => {
  const out = snapshot(React.createElement(JsonView, { data: [10, 20, 30] }));
  expect(out).toContain('10');
  expect(out).toContain('20');
  expect(out).toContain('30');
});

test('renders nested objects with indentation', () => {
  const out = snapshot(
    React.createElement(JsonView, {
      data: { user: { name: 'bob', role: 'admin' } },
    }),
  );
  expect(out).toContain('"user"');
  expect(out).toContain('"name"');
  expect(out).toContain('"bob"');
  expect(out).toContain('"role"');
  expect(out).toContain('"admin"');
});

test('maxDepth truncates nested objects', () => {
  const out = snapshot(
    React.createElement(JsonView, {
      data: { a: { b: { c: { d: 'deep' } } } },
      maxDepth: 1,
    }),
  );
  expect(out).toContain('{1}');
  expect(out).not.toContain('"d"');
  expect(out).not.toContain('"deep"');
});

test('maxDepth truncates nested arrays', () => {
  const out = snapshot(
    React.createElement(JsonView, {
      data: { items: [{ id: 1 }, { id: 2 }] },
      maxDepth: 1,
    }),
  );
  expect(out).toContain('[2]');
  expect(out).not.toContain('"id"');
});

test('onPathClick fires for primitive leaves', () => {
  const calls: { path: string; type: string }[] = [];
  const out = snapshot(
    React.createElement(JsonView, {
      data: { name: 'alice', age: 30 },
      onPathClick: (node) => calls.push({ path: node.path, type: node.type }),
    }),
  );
  expect(calls.length).toBeGreaterThan(0);
  expect(calls.some((c) => c.path === 'name' && c.type === 'string')).toBe(true);
  expect(calls.some((c) => c.path === 'age' && c.type === 'number')).toBe(true);
  expect(out).toContain('"alice"');
});

test('renders empty object as {0}', () => {
  const out = snapshot(React.createElement(JsonView, { data: {}, collapsed: true }));
  expect(out).toContain('{0}');
});

test('renders empty array as [0]', () => {
  const out = snapshot(React.createElement(JsonView, { data: [], collapsed: true }));
  expect(out).toContain('[0]');
});

test('mixed nested structure renders all branches', () => {
  const data = {
    id: 1,
    tags: ['red', 'green', 'blue'],
    meta: { active: true, score: 0.95 },
  };
  const out = snapshot(React.createElement(JsonView, { data }));
  expect(out).toContain('"id"');
  expect(out).toContain('"tags"');
  expect(out).toContain('"red"');
  expect(out).toContain('"green"');
  expect(out).toContain('"blue"');
  expect(out).toContain('"meta"');
  expect(out).toContain('true');
  expect(out).toContain('0.95');
});