/**
 * @fileoverview Agent runtime types. @since 0.1.11
 * @package zhi
 */
import type { TaskKind } from '../../model/router';

/** @brief Agent capability declaration. @since 0.1.11 */
export interface AgentCapability {
  name: string;
  description: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

/** @brief Agent definition (static metadata). @since 0.1.11 */
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  model?: string;
  systemPrompt?: string;
  maxTokens?: number;
  timeoutMs?: number;
  sandbox?: 'none' | 'docker' | 'isolated';
}

/** @brief Runtime state for an agent instance. @since 0.1.11 */
export type AgentStatus =
  'idle' | 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'terminated';

/** @brief A dispatched task. @since 0.1.11 */
export interface AgentTask {
  id: string;
  agentId: string;
  kind: TaskKind;
  input: Record<string, unknown>;
  context?: Record<string, unknown>;
  priority: number;
  createdAt: number;
  status: AgentStatus;
  result?: Record<string, unknown>;
  error?: string;
  durationMs?: number;
  tokensUsed?: number;
}

/** @brief Runtime event. @since 0.1.11 */
export interface RuntimeEvent {
  type:
    | 'agent_started'
    | 'agent_completed'
    | 'agent_failed'
    | 'task_started'
    | 'task_completed'
    | 'task_failed'
    | 'message';
  agentId?: string;
  taskId?: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

/** @brief Runtime listener. @since 0.1.11 */
export interface RuntimeListener {
  onEvent(event: RuntimeEvent): void;
}

/** @brief Agent runtime interface. @since 0.1.11 */
export interface AgentRuntime {
  register(definition: AgentDefinition): void;
  unregister(agentId: string): boolean;
  getAgent(agentId: string): AgentDefinition | undefined;
  listAgents(): AgentDefinition[];
  dispatch(task: Omit<AgentTask, 'id' | 'createdAt' | 'status'>): Promise<AgentTask>;
  cancel(taskId: string): boolean;
  pause(taskId: string): boolean;
  resume(taskId: string): boolean;
  getTask(taskId: string): AgentTask | undefined;
  listTasks(agentId?: string): AgentTask[];
  subscribe(listener: RuntimeListener): () => void;
  emit(event: RuntimeEvent): void;
  shutdown(): void;
}
