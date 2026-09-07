/**
 * @fileoverview Critic plant — types + orchestrator. @since 0.1.9
 * @package zhi
 */
import type { CriticResult } from '../aggregate';
import { runCritic } from './run-critic';

/** @brief Severity levels for critic findings. @since 0.1.10 */
export type CriticSeverity = 'info' | 'warn' | 'error';

/** @brief A single critic finding. @since 0.1.10 */
export interface CriticFinding {
  file: string;
  line: number;
  message: string;
  severity: CriticSeverity;
  rule?: string;
}

/** @brief Input to a critic. @since 0.1.10 */
export interface CriticInput {
  path: string;
  content: string;
  config?: Record<string, unknown>;
}

/** @brief Output from a critic. @since 0.1.10 */
export interface CriticOutput {
  findings: CriticFinding[];
  score: number;
  durationMs: number;
}

/** @brief Cruiser report (architecture dependency graph). @since 0.1.8 */
export interface CruiserReport {
  modules: Array<{ source: string; dependencies: string[]; orphan: boolean; valid: boolean }>;
  errors?: string[];
}

/** @brief Plant options. @since 0.1.10 */
export interface PlantOptions {
  files: Array<{ path: string; content: string }>;
  cruiser: CruiserReport | (() => CruiserReport);
}

/** @brief Plant result. @since 0.1.10 */
export interface CriticReport {
  results: CriticResult[];
  score: number;
}

/** @brief Run all critics against input files. @since 0.1.8 */
export function plantCritics(options: PlantOptions): CriticReport {
  const results = composeCritiques(options.files, options.cruiser);
  const score = results.reduce((s, r) => s + r.score, 0) / results.length;
  return { results, score };
}

/** @brief Run all critics against input files. @since 0.1.8 */
export function composeCritiques(
  files: Array<{ path: string; content: string }>,
  cruiser: CruiserReport | (() => CruiserReport),
): CriticResult[] {
  const report = typeof cruiser === 'function' ? cruiser() : cruiser;
  const results: CriticResult[] = [];
  const allNames = [
    'accessibility',
    'architecture',
    'doc',
    'imports',
    'maintainability',
    'perf',
    'privacy',
    'security',
    'sloc',
    'style',
    'todo',
  ];
  for (const name of allNames) {
    const { score, findings } = runCritic(name, files, report);
    results.push({ name, score, weight: 1, findings });
  }
  return results;
}

export { runCritic };
