/**
 * @fileoverview Agent runtime barrel. @since 0.1.11
 * @package zhi
 */
export {
  type AgentCapability,
  type AgentDefinition,
  type AgentStatus,
  type AgentTask,
  type RuntimeEvent,
  type RuntimeListener,
} from './types';
export { type AgentRuntime } from './types';
import { DefaultAgentRuntime } from './runtime';
export { DefaultAgentRuntime } from './runtime';
export function createRuntime(): import('./types').AgentRuntime {
  return new DefaultAgentRuntime();
}
export function defineAgent(
  definition: import('./types').AgentDefinition,
): import('./types').AgentDefinition {
  return { ...definition };
}
