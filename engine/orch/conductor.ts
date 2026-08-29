/** @brief Konduktor: tentukan aksi berikutnya dari state loop. @since 0.1.0 */
import { LoopState } from '../loop/states';

/** @brief Aksi berikutnya dalam siklus. @since 0.1.0 */
export type NextAction = 'generate' | 'critique' | 'eval' | 'done';

/** @brief Tentukan aksi berikutnya dari state loop.
 * @param {LoopState} state - state saat ini.
 * @return {NextAction} aksi berikutnya.
 * @see docs/design/orch.md
 * @since 0.1.0 */
export function nextAction(state: LoopState): NextAction {
  switch (state) {
    case LoopState.INTAKE:
    case LoopState.PLAN:
    case LoopState.ISOLATE:
    case LoopState.EXECUTE:
    case LoopState.RECOVER:
      return 'generate';
    case LoopState.CRITIQUE:
      return 'critique';
    case LoopState.EVALUATE:
      return 'eval';
    case LoopState.COMMIT:
    case LoopState.PR_OPEN:
    case LoopState.CI_WATCH:
    case LoopState.DONE:
      return 'done';
  }
}
