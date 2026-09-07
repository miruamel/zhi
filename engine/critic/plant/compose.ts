/**
 * @fileoverview Critic plant — orchestrates all registered critics, returns CriticResult[].
 * @since 0.2.6
 * @package zhi
 */
import type { CriticResult } from '../aggregate';

/** @brief Cruiser report (architecture dependency graph). @since 0.1.8 */
export interface CruiserReport {
  modules: Array<{
    source: string;
    dependencies: string[];
    orphan: boolean;
    valid: boolean;
  }>;
  errors?: string[];
}

/** @brief Input file for critics. @since 0.1.8 */
export interface CriticInput {
  path: string;
  content: string;
}

/** @brief Plant options. @since 0.2.6 */
export interface PlantOptions {
  files: CriticInput[];
  cruiser: CruiserReport | (() => CruiserReport);
}

/** @brief Plant result. @since 0.2.6 */
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
  files: CriticInput[],
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

/** @brief Run a single critic by name. @since 0.2.6 */
function runCritic(
  name: string,
  files: CriticInput[],
  cruiser: CruiserReport,
): { score: number; findings: string[] } {
  const findings: string[] = [];
  let violations = 0;

  for (const f of files) {
    const lines = f.content.split('\n');
    const loc = lines.length;

    switch (name) {
      case 'sloc': {
        if (loc > 150) {
          violations++;
          findings.push(`${f.path}: ${loc} SLOC > 150`);
        }
        break;
      }
      case 'todo': {
        for (const l of lines) {
          if (/\b(TODO|FIXME|XXX)\b/.test(l)) {
            violations++;
            findings.push(`${f.path}: ${l.trim().slice(0, 40)}`);
          }
        }
        break;
      }
      case 'imports': {
        for (const l of lines) {
          const depth = (l.match(/\.\.\//g) || []).length;
          if (depth >= 4) {
            violations++;
            findings.push(`${f.path}: deep relative import (${depth} levels)`);
          }
        }
        break;
      }
      case 'security': {
        for (const l of lines) {
          if (/\beval\s*\(|\.innerHTML\s*=|password\s*[:=]\s*["']/.test(l)) {
            violations++;
            findings.push(`${f.path}: security risk in ${l.trim().slice(0, 40)}`);
          }
        }
        break;
      }
      case 'privacy': {
        for (const l of lines) {
          if (/\b(password|secret|token|api[_-]?key)\b\s*[:=]\s*["'][^"']{8,}/i.test(l)) {
            violations++;
            findings.push(`${f.path}: potential secret exposure`);
          }
        }
        break;
      }
      case 'style': {
        for (const l of lines) {
          if (l.length > 120) {
            violations++;
            findings.push(`${f.path}: line >120 chars`);
          }
        }
        break;
      }
      case 'doc': {
        if (!f.content.trim().startsWith('/**') && !f.content.trim().startsWith('//')) {
          violations++;
          findings.push(`${f.path}: missing doc comment`);
        }
        break;
      }
      case 'maintainability': {
        if (loc > 300) {
          violations++;
          findings.push(`${f.path}: ${loc} SLOC > 300 (hard to maintain)`);
        }
        break;
      }
      case 'perf': {
        for (const l of lines) {
          if (/\b(for|while)\s*\(.*\)\s*\{[^}]*\b(find|filter|forEach|map)\b/.test(l)) {
            violations++;
            findings.push(`${f.path}: nested loop + search (O(n²))`);
          }
        }
        break;
      }
      case 'accessibility': {
        for (const l of lines) {
          if (/<(img|input|button)[^>]*(?!.*aria-)[^>]*>/i.test(l) && !/alt\s*=/.test(l)) {
            violations++;
            findings.push(`${f.path}: missing alt/aria attribute`);
          }
        }
        break;
      }
      case 'architecture': {
        for (const m of cruiser.modules ?? []) {
          if (m.orphan) {
            violations++;
            findings.push(`${m.source}: orphan module`);
          }
          if (!m.valid) {
            violations++;
            findings.push(`${m.source}: invalid dependency`);
          }
        }
        break;
      }
      default:
        break;
    }
  }

  const score = Math.pow(0.5, violations);
  return { score, findings };
}
