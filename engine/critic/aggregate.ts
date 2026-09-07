/**
 * @fileoverview Critic aggregation — weighted scoring, pass/fail, findings collection.
 * @since 0.2.6
 * @package zhi
 */
import type { Critique, CritiqueSeverity, CritiqueCategory } from './types';

export type { Critique };

/** @brief A critic result entry. @since 0.2.6 */
export interface CriticResult {
  name: string;
  score: number;
  weight: number;
  findings: string[];
}

/** @brief Aggregated result. @since 0.2.6 */
export interface AggregateResult {
  score: number;
  byCritic: Record<string, number>;
  passed: boolean;
  findings: string[];
  total: number;
  bySeverity: Record<CritiqueSeverity, number>;
  byCategory: Record<CritiqueCategory, number>;
  blockers: string[];
}

/** @brief Aggregate critic results into a single score. @since 0.2.6 */
export function aggregate(critiques: CriticResult[], threshold = 0.7): AggregateResult {
  let totalWeight = 0;
  let weightedSum = 0;
  const byCritic: Record<string, number> = {};
  const findings: string[] = [];

  for (const c of critiques) {
    totalWeight += c.weight;
    weightedSum += c.score * c.weight;
    byCritic[c.name] = c.score;
    for (const f of c.findings) findings.push(f);
  }

  const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const passed = score >= threshold;

  return {
    score,
    byCritic,
    passed,
    findings,
    total: critiques.length,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
    byCategory: {
      security: 0,
      performance: 0,
      architecture: 0,
      consistency: 0,
      maintainability: 0,
      correctness: 0,
    },
    blockers: [],
  };
}

/** @brief Aggregate critiques by severity. @since 0.2.6 */
export function aggregateBySeverity(critiques: Critique[]): Record<CritiqueSeverity, number> {
  const result: Record<CritiqueSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  for (const c of critiques) result[c.severity]++;
  return result;
}

/** @brief Aggregate critiques by category. @since 0.2.6 */
export function aggregateByCategory(critiques: Critique[]): Record<CritiqueCategory, number> {
  const result: Record<CritiqueCategory, number> = {
    security: 0,
    performance: 0,
    architecture: 0,
    consistency: 0,
    maintainability: 0,
    correctness: 0,
  };
  for (const c of critiques) result[c.category]++;
  return result;
}

/** @brief Filter critiques by minimum severity. @since 0.2.6 */
export function filterBySeverity(critiques: Critique[], minSeverity: CritiqueSeverity): Critique[] {
  const order: CritiqueSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  const minIndex = order.indexOf(minSeverity);
  return critiques.filter((c) => order.indexOf(c.severity) <= minIndex);
}

/** @brief Group critiques by file. @since 0.2.6 */
export function groupByFile(critiques: Critique[]): Map<string, Critique[]> {
  const map = new Map<string, Critique[]>();
  for (const c of critiques) {
    const arr = map.get(c.file) ?? [];
    arr.push(c);
    map.set(c.file, arr);
  }
  return map;
}

/** @brief Group critiques by category. @since 0.2.6 */
export function groupByCategory(critiques: Critique[]): Map<CritiqueCategory, Critique[]> {
  const map = new Map<CritiqueCategory, Critique[]>();
  for (const c of critiques) {
    const arr = map.get(c.category) ?? [];
    arr.push(c);
    map.set(c.category, arr);
  }
  return map;
}

/** @brief Sort critiques by severity (critical first). @since 0.2.6 */
export function sortBySeverity(critiques: Critique[]): Critique[] {
  const order: CritiqueSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];
  return [...critiques].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
}

/** @brief Get blockers (critical + high). @since 0.2.6 */
export function getBlockers(critiques: Critique[]): Critique[] {
  return critiques.filter((c) => c.severity === 'critical' || c.severity === 'high');
}

/** @brief Check if any blocker exists. @since 0.2.6 */
export function hasBlocker(critiques: Critique[]): boolean {
  return critiques.some((c) => c.severity === 'critical' || c.severity === 'high');
}

/** @brief Summarize critiques. @since 0.2.6 */
export function summarize(critiques: Critique[]): string {
  const bySeverity = aggregateBySeverity(critiques);
  return `${critiques.length} findings: ${bySeverity.critical} critical, ${bySeverity.high} high, ${bySeverity.medium} medium, ${bySeverity.low} low, ${bySeverity.info} info`;
}
