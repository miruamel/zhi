import { describe, it, expect } from 'bun:test';
import { generate } from './generate';

describe('build generate', () => {
  it('generates a function stub', () => {
    expect(generate({ name: 'run', kind: 'function' })).toContain('export function run(): void');
  });
  it('generates a class stub', () => {
    expect(generate({ name: 'Agent', kind: 'class' })).toContain('export class Agent');
  });
});
