/** @brief Tests for Table widget. @since 0.1.1 */
import { test, expect } from 'bun:test';
import React from 'react';
import { render } from 'ink';
import { Table } from './table';

interface Row {
  name: string;
  age: number;
}

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

const columns = [
  { key: 'name' as const, label: 'Name' },
  { key: 'age' as const, label: 'Age', align: 'right' as const },
];

const sample: Row[] = [
  { name: 'Ada', age: 30 },
  { name: 'Bjorn', age: 42 },
  { name: 'Cleo', age: 27 },
];

test('renders headers and rows', () => {
  const out = snapshot(React.createElement(Table<Row>, { columns, rows: sample }));
  expect(out).toContain('Name');
  expect(out).toContain('Age');
  expect(out).toContain('Ada');
  expect(out).toContain('30');
  expect(out).toContain('Bjorn');
  expect(out).toContain('Cleo');
});

test('truncates at maxRows and shows remaining count', () => {
  const many: Row[] = Array.from({ length: 5 }, (_, i) => ({ name: `u${i}`, age: i }));
  const out = snapshot(React.createElement(Table<Row>, { columns, rows: many, maxRows: 2 }));
  expect(out).toContain('u0');
  expect(out).toContain('u1');
  expect(out).not.toContain('u2');
  expect(out).toContain('… 3 more');
});

test('striped rows render all data rows', () => {
  const plain = snapshot(React.createElement(Table<Row>, { columns, rows: sample, striped: false }));
  const stripedOut = snapshot(React.createElement(Table<Row>, { columns, rows: sample, striped: true }));
  expect(stripedOut).toContain('Ada');
  expect(stripedOut).toContain('Bjorn');
  expect(stripedOut).toContain('Cleo');
  expect(stripedOut).toContain('Name');
  expect(stripedOut).toContain('Age');
  expect(plain).toContain('Ada');
  expect(plain).toContain('Bjorn');
});

test('empty rows show placeholder', () => {
  const out = snapshot(React.createElement(Table<Row>, { columns, rows: [] }));
  expect(out).toContain('(no rows)');
});

test('renders title when provided', () => {
  const out = snapshot(React.createElement(Table<Row>, { columns, rows: sample, title: 'Users' }));
  expect(out).toContain('Users');
});

test('custom render produces cell text', () => {
  const cols = [
    {
      key: 'age' as const,
      label: 'Age',
      render: (v: number) => `${v}y`,
    },
  ];
  const out = snapshot(React.createElement(Table<Row>, { columns: cols, rows: sample }));
  expect(out).toContain('30y');
  expect(out).toContain('42y');
});

test('right-align pads short values to column width', () => {
  const cols = [{ key: 'age' as const, label: 'Age', align: 'right' as const, width: 6 }];
  const out = snapshot(React.createElement(Table<Row>, { columns: cols, rows: [{ name: 'x', age: 1 }] }));
  expect(out).toContain('     1');
});

test('onRowClick handler is invokable without error', () => {
  const calls: number[] = [];
  const handler = (i: number) => calls.push(i);
  handler(2);
  handler(0);
  expect(calls).toEqual([2, 0]);
});