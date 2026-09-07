/**
 * @fileoverview Eval engine — evaluation, scoring, and metrics collection.
 * @since 0.2.6
 * @package zhi
 */

/** @brief Security finding. @since 0.2.6 */
export interface SecurityFinding {
  file: string;
  line: number;
  rule: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

/** @brief Security report. @since 0.2.6 */
export interface SecurityReport {
  findings: SecurityFinding[];
  score: number;
  durationMs: number;
  leaked: boolean;
}

/** @brief Eval input. @since 0.2.6 */
export interface EvalInput {
  critiques: Array<{ name: string; score: number; weight: number; findings: string[] }>;
  score: number;
  criteria: string[];
  blockers: string[];
  securityReport: SecurityReport;
}

/** @brief Eval result. @since 0.2.6 */
export interface EvalResult {
  passed: boolean;
  score: number;
  criteria: string[];
  blockers: string[];
  securityReport: SecurityReport;
  durationMs: number;
}

/** @brief Eval engine — runs full evaluation pipeline. @since 0.2.6 */
export class EvalEngine {
  /** @brief Evaluate an input against criteria. @since 0.2.6 */
  async evaluate(input: EvalInput): Promise<EvalResult> {
    const startedAt = Date.now();
    const { score, criteria, blockers, securityReport } = input;

    // Security leaked = automatic fail
    if (securityReport.leaked) {
      return {
        passed: false,
        score: 0,
        criteria,
        blockers,
        securityReport,
        durationMs: Date.now() - startedAt,
      };
    }

    // Blockers = automatic fail
    if (blockers.length > 0) {
      return {
        passed: false,
        score: 0,
        criteria,
        blockers,
        securityReport,
        durationMs: Date.now() - startedAt,
      };
    }

    // Score must be > 0
    const passed = score > 0;
    return {
      passed,
      score,
      criteria,
      blockers,
      securityReport,
      durationMs: Date.now() - startedAt,
    };
  }
}

/** @brief Create an eval engine. @since 0.2.6 */
export function createEvalEngine(): EvalEngine {
  return new EvalEngine();
}
