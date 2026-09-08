/**
 * @fileoverview Default agent runtime. @since 0.1.9
 * @package zhi
 */
import type {
  AgentDefinition,
  AgentRuntime,
  AgentTask,
  RuntimeEvent,
  RuntimeListener,
} from './types';
import { executeTask } from './executor/executeTask';

/** @brief Default runtime. @since 0.1.9 */
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
    const record: AgentTask = { ...task, id, createdAt: Date.now(), status: 'running' };
    this.tasks.set(id, record);
    const emit = (type: RuntimeEvent['type'], payload: Record<string, unknown>) =>
      this.emit({ type, agentId: task.agentId, taskId: id, timestamp: Date.now(), payload });
    emit('task_started', { input: task.input });
    emit('agent_started', {});
    try {
      const started = Date.now();
      record.result = await executeTask(agent, record);
      record.status = 'completed';
      record.durationMs = Date.now() - started;
      emit('task_completed', { result: record.result });
      emit('agent_completed', {});
    } catch (err) {
      record.status = 'failed';
      record.error = err instanceof Error ? err.message : String(err);
      emit('task_failed', { error: record.error });
      emit('agent_failed', { error: record.error });
    }
    return record;
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

/** @brief Create default runtime. @since 0.1.9 */
export function createRuntime(): AgentRuntime {
  return new DefaultAgentRuntime();
}
