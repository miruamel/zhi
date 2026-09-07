/**
 * @fileoverview Critic engine tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { CriticEngine } from '../engine';
import { createCritique } from '../types';
import {
  aggregateBySeverity,
  aggregateByCategory,
  filterBySeverity,
  sortBySeverity,
  getBlockers,
  hasBlocker,
  summarize,
} from '../aggregate';

describe('CriticEngine', () => {
  it('runs registered critics', () => {
    const engine = new CriticEngine();
    engine.register('test', () => [createCritique('high', 'security', 'leak', 'a.ts', 1)]);
    const result = engine.run({ files: [{ path: 'a.ts', content: 'x' }] });
    expect(result.total).toBe(1);
    expect(result.passed).toBe(false);
    expect(result.blockers).toHaveLength(1);
  });

  it('filters by severity', () => {
    const engine = new CriticEngine();
    engine.register('test', () => [
      createCritique('critical', 'security', 'a', 'a.ts', 1),
      createCritique('info', 'maintainability', 'b', 'a.ts', 2),
    ]);
    const result = engine.run({ files: [] }, { minSeverity: 'high' });
    expect(result.total).toBe(1);
  });

  it('handles critic errors', () => {
    const engine = new CriticEngine();
    engine.register('bad', () => {
      throw new Error('boom');
    });
    const result = engine.run({ files: [] });
    expect(result.total).toBe(1);
    expect(result.critiques[0].category).toBe('consistency');
  });

  it('maxFindings limits results', () => {
    const engine = new CriticEngine();
    engine.register('test', () => [
      createCritique('info', 'maintainability', 'a', 'a.ts', 1),
      createCritique('info', 'maintainability', 'b', 'a.ts', 2),
      createCritique('info', 'maintainability', 'c', 'a.ts', 3),
    ]);
    const result = engine.run({ files: [] }, { maxFindings: 2 });
    expect(result.total).toBe(2);
  });
});

describe('aggregate utilities', () => {
  const critiques = [
    createCritique('critical', 'security', 'a', 'a.ts', 1),
    createCritique('high', 'performance', 'b', 'a.ts', 2),
    createCritique('info', 'maintainability', 'c', 'a.ts', 3),
  ];

  it('aggregates by severity', () => {
    const agg = aggregateBySeverity(critiques);
    expect(agg.critical).toBe(1);
    expect(agg.high).toBe(1);
    expect(agg.info).toBe(1);
  });

  it('aggregates by category', () => {
    const agg = aggregateByCategory(critiques);
    expect(agg.security).toBe(1);
    expect(agg.performance).toBe(1);
    expect(agg.maintainability).toBe(1);
  });

  it('filters by severity', () => {
    const filtered = filterBySeverity(critiques, 'high');
    expect(filtered.length).toBe(2);
  });

  it('sorts by severity', () => {
    const sorted = sortBySeverity(critiques);
    expect(sorted[0].severity).toBe('critical');
    expect(sorted[2].severity).toBe('info');
  });

  it('gets blockers', () => {
    const blockers = getBlockers(critiques);
    expect(blockers.length).toBe(2);
  });

  it('checks for blockers', () => {
    expect(hasBlocker(critiques)).toBe(true);
    expect(hasBlocker([createCritique('info', 'maintainability', 'x', 'a.ts', 1)])).toBe(false);
  });

  it('summarizes', () => {
    const s = summarize(critiques);
    expect(s).toContain('3 findings');
    expect(s).toContain('1 critical');
  });
});
