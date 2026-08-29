import { describe, it, expect } from 'bun:test';
import { verify } from './verify';
import type { ScaffoldFile } from './generate';

/** @brief Scaffold valid: 2 file, masing-masing punya @brief. @since 0.1.0 */
function good(): ScaffoldFile[] {
  return [
    { path: 'engine/x/handlers/index.ts', content: '/** @brief h. @since 0.1.0 */\n' },
    { path: 'engine/x/services/index.ts', content: '/** @brief s. @since 0.1.0 */\n' },
  ];
}

describe('verify', () => {
  it('passes a well-formed scaffold', () => {
    const r = verify(good());
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it('flags missing @brief', () => {
    const r = verify([{ path: 'engine/x/a.ts', content: 'export const a = 1;\n' }]);
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.includes('@brief'))).toBe(true);
  });

  it('flags >5 files per dir', () => {
    const files = Array.from({ length: 6 }, (_, i) => ({
      path: `engine/x/d/f${i}.ts`,
      content: '/** @brief. @since 0.1.0 */\n',
    }));
    const r = verify(files);
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.includes('exceeds'))).toBe(true);
  });

  it('flags deep relative import', () => {
    const r = verify([
      { path: 'engine/x/a.ts', content: '/** @brief. @since 0.1.0 */\nimport { b } from "../../../b";\n' },
    ]);
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.includes('deep'))).toBe(true);
  });
});
