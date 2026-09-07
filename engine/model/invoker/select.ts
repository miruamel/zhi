/**
 * @brief Select invoker based on environment.
 * Micro tasks (classify/tag) always use local stub for cost control.
 * @since 0.1.1
 */
import { CloudModelInvoker } from './cloud';
import { LocalStubInvoker } from './local-stub';
import type { ModelInvoker } from './types';

/** @brief Task kind for invoker selection. @since 0.2.6 */
export type TaskKind = 'generate' | 'critique' | 'review' | 'embed' | 'classify' | 'tag';

/** @brief Micro task kinds that always use local stub. @since 0.2.6 */
const MICRO_TASKS: TaskKind[] = ['classify', 'tag'];

/**
 * @brief Pilih invoker berdasarkan env MODEL_API_KEY.
 * @param {TaskKind} kind - task kind (default 'generate').
 * @return {ModelInvoker} cloud bila MODEL_API_KEY ada, else local stub.
 * @since 0.1.1
 */
export function selectInvoker(kind: TaskKind = 'generate'): ModelInvoker {
  if (MICRO_TASKS.includes(kind)) {
    return new LocalStubInvoker();
  }
  if (process.env.MODEL_API_KEY) {
    return new CloudModelInvoker({ apiKey: process.env.MODEL_API_KEY });
  }
  return new LocalStubInvoker();
}
