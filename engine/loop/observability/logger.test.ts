/** @brief Unit: LoopLogger terstruktur + correlation ID. @since 0.6.0 */
import { describe, it, expect } from 'bun:test';
import { LoopLogger } from './logger';

describe('LoopLogger', () => {
  it('emits structured JSON with runId on transition', () => {
    const lines: string[] = [];
    const logger = new LoopLogger('run-1', (l) => lines.push(l));
    logger.transition('INTAKE', 'GOAL_READY', 'PLAN');
    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]);
    expect(parsed.runId).toBe('run-1');
    expect(parsed.from).toBe('INTAKE');
    expect(parsed.event).toBe('GOAL_READY');
    expect(parsed.to).toBe('PLAN');
    expect(parsed.kind).toBe('transition');
    expect(typeof parsed.ts).toBe('number');
  });

  it('generates runId when absent', () => {
    const logger = new LoopLogger();
    expect(logger.runId).toMatch(/^run-\d+$/);
  });
});
