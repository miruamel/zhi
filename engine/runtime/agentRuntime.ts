/**
 * @fileoverview Agent runtime — lifecycle, dispatch, capability negotiation, sandbox.
 * @since 0.2.7
 * @package zhi
 */

import type { TaskKind } from '../model/router';
/** @brief Agent capability declaration. @since 0.2.7 */
export interface AgentCapability {
  name: string;
  description: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

/** @brief Agent definition (static metadata). @since 0.2.7 */
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

/** @brief Runtime state for an agent instance. @since 0.2.7 */
export type AgentStatus =
  'idle' | 'initializing' | 'running' | 'paused' | 'completed' | 'failed' | 'terminated';

/** @brief A dispatched task. @since 0.2.7 */
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

/** @brief Runtime event. @since 0.2.7 */
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

/** @brief Runtime listener. @since 0.2.7 */
export interface RuntimeListener {
  onEvent(event: RuntimeEvent): void;
}

/** @brief Agent runtime — manages agent lifecycle and task dispatch. @since 0.2.7 */
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

/** @brief Default agent runtime implementation. @since 0.2.7 */
export class DefaultAgentRuntime implements AgentRuntime {
  private agents = new Map<string, AgentDefinition>();
  private tasks = new Map<string, AgentTask>();
  private listeners = new Set<RuntimeListener>();
  private counter = 0;
  private active = true;

  register(definition: AgentDefinition): void {
    this.agents.set(definition.id, { ...definition });
  }

  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  getAgent(agentId: string): AgentDefinition | undefined {
    return this.agents.get(agentId);
  }

  listAgents(): AgentDefinition[] {
    return [...this.agents.values()];
  }

  async dispatch(task: Omit<AgentTask, 'id' | 'createdAt' | 'status'>): Promise<AgentTask> {
    if (!this.active) throw new Error('runtime: shutting down');
    const agent = this.agents.get(task.agentId);
    if (!agent) throw new Error(`runtime: agent ${task.agentId} not registered`);
    const id = `task_${++this.counter}_${Date.now()}`;
    const record: AgentTask = {
      ...task,
      id,
      createdAt: Date.now(),
      status: 'running',
    };
    this.tasks.set(id, record);
    this.emit({
      type: 'task_started',
      agentId: task.agentId,
      taskId: id,
      timestamp: Date.now(),
      payload: { input: task.input },
    });
    this.emit({
      type: 'agent_started',
      agentId: task.agentId,
      taskId: id,
      timestamp: Date.now(),
      payload: {},
    });

    try {
      const started = Date.now();
      const result = await this.executeTask(agent, record);
      record.status = 'completed';
      record.result = result;
      record.durationMs = Date.now() - started;
      this.emit({
        type: 'task_completed',
        agentId: task.agentId,
        taskId: id,
        timestamp: Date.now(),
        payload: { result },
      });
      this.emit({
        type: 'agent_completed',
        agentId: task.agentId,
        taskId: id,
        timestamp: Date.now(),
        payload: {},
      });
    } catch (err) {
      record.status = 'failed';
      record.error = err instanceof Error ? err.message : String(err);
      this.emit({
        type: 'task_failed',
        agentId: task.agentId,
        taskId: id,
        timestamp: Date.now(),
        payload: { error: record.error },
      });
      this.emit({
        type: 'agent_failed',
        agentId: task.agentId,
        taskId: id,
        timestamp: Date.now(),
        payload: { error: record.error },
      });
    }
    return record;
  }

  private async executeTask(
    agent: AgentDefinition,
    task: AgentTask,
  ): Promise<Record<string, unknown>> {
    const cap = agent.capabilities.find((c) => c.name === task.kind);
    if (!cap && agent.systemPrompt) {
      return { output: `[stub] ${agent.id} processed ${task.kind}`, capability: task.kind };
    }
    if (cap) {
      return {
        output: `[stub] ${agent.id} executed ${cap.name}`,
        capability: cap.name,
        input: task.input,
      };
    }
    return { output: `[stub] ${agent.id} default`, agent: agent.id };
  }

  cancel(taskId: string): boolean {
    const t = this.tasks.get(taskId);
    if (!t || t.status !== 'running') return false;
    t.status = 'terminated';
    return true;
  }

  pause(taskId: string): boolean {
    const t = this.tasks.get(taskId);
    if (!t || t.status !== 'running') return false;
    t.status = 'paused';
    return true;
  }

  resume(taskId: string): boolean {
    const t = this.tasks.get(taskId);
    if (!t || t.status !== 'paused') return false;
    t.status = 'running';
    return true;
  }

  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  listTasks(agentId?: string): AgentTask[] {
    const all = [...this.tasks.values()];
    return agentId ? all.filter((t) => t.agentId === agentId) : all;
  }

  subscribe(listener: RuntimeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: RuntimeEvent): void {
    for (const l of this.listeners) l.onEvent(event);
  }

  shutdown(): void {
    this.active = false;
    for (const t of this.tasks.values()) {
      if (t.status === 'running') t.status = 'terminated';
    }
  }
}

/** @brief Create an agent runtime. @since 0.2.7 */
export function createRuntime(): AgentRuntime {
  return new DefaultAgentRuntime();
}

/** @brief Build a standard agent definition. @since 0.2.7 */
export function defineAgent(definition: AgentDefinition): AgentDefinition {
  return { ...definition };
}
