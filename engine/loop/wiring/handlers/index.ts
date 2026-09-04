/**
 * @brief Re-export handler builder + types untuk konsumer.
 * Konsumer: `import { buildHandlers, type LoopDeps } from '../wiring/handlers'`.
 * @since 0.1.2
 */
export { buildHandlers } from './builder';
export type { LoopDeps } from './types';
export { MAX_RECOVER, GENERATE_RETRY } from './types';
