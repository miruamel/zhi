/**
 * @fileoverview Task execution stub for DefaultAgentRuntime. @since 0.1.9
 * @package zhi
 */
import type { AgentDefinition, AgentTask } from '../types';

/** @brief Execute a single agent task — returns stub result. @since 0.1.9 */
export async function executeTask(
  agent: AgentDefinition,
  task: AgentTask,
): Promise<Record<string, unknown>> {
  const cap = agent.capabilities.find((c) => c.name === task.kind);
  if (cap) {
    return {
      output: `[stub] ${agent.id} executed ${cap.name}`,
      capability: cap.name,
      input: task.input,
    };
  }
  if (agent.systemPrompt) {
    return { output: `[stub] ${agent.id} processed ${task.kind}`, capability: task.kind };
  }
  return { output: `[stub] ${agent.id} default`, agent: agent.id };
}
