import type { AgentCapability, AgentDefinition } from '../../runtime/agentRuntime/types/types';
import { BUILTIN_AGENTS } from './definitions';
export {
  ARCHITECT_AGENT,
  CODER_AGENT,
  CRITIC_AGENT,
  RESEARCH_AGENT,
  DEVOPS_AGENT,
  BUILTIN_AGENTS,
  cap,
} from './definitions';

export { type AgentCapability, type AgentDefinition };

/** @brief Look up an agent definition by id. @since 0.1.9 */
export function getAgent(id: string): AgentDefinition | undefined {
  return BUILTIN_AGENTS.find((a) => a.id === id);
}

/** @brief Register all built-in agents into a runtime. @since 0.1.9 */
export function registerBuiltinAgents(runtime: { register(d: AgentDefinition): void }): void {
  for (const a of BUILTIN_AGENTS) runtime.register(a);
}
