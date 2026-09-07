/**
 * @fileoverview Eval gate — quality gates that block or allow operations based on eval results.
 * @since 0.2.6
 * @package zhi
 */
import type { EvalResult } from './engine';

/** @brief Eval input. @since 0.1.1 */
export interface EvalInput {
  score: number;
  criteria: string[];
  blockers: string[];
}

/** @brief Eval output. @since 0.1.1 */
export interface EvalOutput {
  passed: boolean;
  score: number;
  reasons: string[];
}

/** @brief Gate evaluasi: lulus bila tidak ada blocker DAN score >= threshold.
 * @param {EvalInput} input - hasil evaluasi.
 * @param {number} threshold - ambang lulus (default 0.7).
 * @return {EvalOutput} keputusan gate.
 * @since 0.1.1 */
export function gate(input: EvalInput, threshold = 0.7): EvalOutput {
  const reasons: string[] = [];
  if (input.blockers.length > 0) {
    reasons.push(`blocked: ${input.blockers.join(', ')}`);
    return { passed: false, score: input.score, reasons };
  }
  const passed = input.score >= threshold;
  reasons.push(
    passed ? `score ${input.score} >= ${threshold}` : `score ${input.score} < ${threshold}`,
  );
  if (input.criteria.length > 0) reasons.push(`criteria met: ${input.criteria.length}`);
  return { passed, score: input.score, reasons };
}

/** @brief Gate result. @since 0.2.6 */
export interface GateResult {
  name: string;
  passed: boolean;
  score: number;
  threshold: number;
  message: string;
  details?: Record<string, unknown>;
}

/** @brief Gate options. @since 0.2.6 */
export interface GateOptions {
  threshold?: number;
  strict?: boolean;
  message?: string;
}

export class Gate {
  constructor(options: GateOptions = {}) {
    this.threshold = options.threshold ?? 0.7;
  }
  private readonly threshold: number;
  check(result: EvalResult, options: GateOptions = {}): GateResult {
    const threshold = options.threshold ?? this.threshold;
    const passed = result.score >= threshold;
    return {
      name: result.passed ? 'eval' : 'eval-fail',
      passed,
      score: result.score,
      threshold,
      message: passed
        ? (options.message ?? 'gate passed')
        : `gate failed: score ${result.score} < ${threshold}`,
    };
  }

  /** @brief Check multiple results. @since 0.2.6 */
  checkAll(results: EvalResult[], options: GateOptions = {}): GateResult[] {
    return results.map((r) => this.check(r, options));
  }

  /** @brief All gates must pass. @since 0.2.6 */
  allPass(results: EvalResult[], options: GateOptions = {}): boolean {
    return this.checkAll(results, options).every((g) => g.passed);
  }

  /** @brief Any gate must pass. @since 0.2.6 */
  anyPass(results: EvalResult[], options: GateOptions = {}): boolean {
    return this.checkAll(results, options).some((g) => g.passed);
  }
}

/** @brief Create a gate. @since 0.2.6 */
export function createGate(options?: GateOptions): Gate {
  return new Gate(options);
}

/** @brief Run gates and return summary. @since 0.2.6 */
export function runGates(
  results: EvalResult[],
  threshold = 0.7,
): { passed: boolean; gates: GateResult[]; summary: string } {
  const g = new Gate({ threshold });
  const gates = g.checkAll(results, { threshold });
  const passed = gates.every((x) => x.passed);
  const summary = gates
    .map(
      (x) => `${x.passed ? '✓' : '✗'} ${x.name}: ${x.score} ${x.passed ? '' : '< ' + x.threshold}`,
    )
    .join('\n');
  return { passed, gates, summary };
}

/** @brief Run gate options. @since 0.2.6 */
export interface RunGateOptions {
  checks: string[];
}

/** @brief Run gate result. @since 0.2.6 */
export interface RunGateResult {
  checks: string[];
  pass: boolean;
  durationMs: number;
}

/** @brief Run a gate with the given checks. @since 0.2.6 */
export function runGate(options: RunGateOptions): RunGateResult {
  const start = Date.now();
  const checks = options.checks;
  const pass = checks.length > 0;
  const durationMs = Date.now() - start;
  return { checks, pass, durationMs };
}
