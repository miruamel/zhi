/**
 * @fileoverview Eval engine — public API surface.
 * @since 0.1.10
 * @package zhi
 */
export { EvalEngine, createEvalEngine } from './engine';
export {
  type EvalInput,
  type EvalResult,
  type SecurityReport,
  type SecurityFinding,
} from './engine';
export { Gate, createGate, runGates } from './gate';
export { type GateResult, type GateOptions } from './gate';

/** @brief Evaluate function. @since 0.1.1 */
export { evaluate, scanSecurity, scanSecrets } from './eval';
export { type EvalOutput, type EvalStageResult, gate } from './gate';
