/** @brief Test orch types (CycleError). @since 0.2.0 */
import { test, expect } from 'bun:test';
import { CycleError } from './types';

test('CycleError carries cycle + message', () => {
  const e = new CycleError(['s1', 's2', 's3']);
  expect(e.name).toBe('CycleError');
  expect(e.cycle).toEqual(['s1', 's2', 's3']);
  expect(e.message).toContain('s1 -> s2 -> s3');
});
