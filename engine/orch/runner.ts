/**
 * @fileoverview Orchestrator runner — executes DAG steps with scheduling. @since 0.2.6
 * @package zhi
 */
import { STOPWORDS } from './parse';
import { CycleError } from './types';
import type { Step, Edge, Dag, TopoResult, DagStep, OrchConfig } from './types';

export interface RunResult {
  success: boolean;
  state: OrchState;
  error?: string;
  durationMs: number;
  stepsExecuted: number;
}

export interface OrchestratorRunner {
  run(graph: Dag, config: OrchConfig): Promise<RunResult>;
  pause(): void;
  resume(): void;
  abort(): void;
  getState(): OrchState;
}

export class DefaultOrchestratorRunner implements OrchestratorRunner {
  private state: OrchState = 'idle';
  private aborted = false;
  private paused = false;

  async run(graph: Dag, config: OrchConfig): Promise<RunResult> {
    const startedAt = Date.now();
    this.state = 'running';
    this.aborted = false;
    this.paused = false;
    let stepsExecuted = 0;
    const order = topologicalSort(graph).order;

    for (const step of order) {
      while (this.paused && !this.aborted) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.aborted) {
        this.state = 'aborted';
        return {
          success: false,
          state: this.state,
          error: 'aborted',
          durationMs: Date.now() - startedAt,
          stepsExecuted,
        };
      }
      try {
        await this.executeStep(step, graph, config);
        stepsExecuted++;
      } catch (err) {
        this.state = 'failed';
        return {
          success: false,
          state: this.state,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - startedAt,
          stepsExecuted,
        };
      }
    }
    this.state = 'completed';
    return { success: true, state: this.state, durationMs: Date.now() - startedAt, stepsExecuted };
  }

  private async executeStep(stepId: string, graph: Dag, config: OrchConfig): Promise<void> {
    const step = graph.nodes.find((n) => n.id === stepId) as unknown as DagStep;
    if (!step) throw new Error(`orch: step ${stepId} not found`);
    step.status = 'running';
    step.startTime = Date.now();
    const delay = Math.min(config.maxConcurrency, 1) * 10;
    await new Promise((r) => setTimeout(r, delay));
    step.status = 'completed';
    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    step.tokens = Math.floor(Math.random() * 1000);
    step.cost = step.tokens * 0.00002;
  }

  pause(): void {
    this.paused = true;
  }
  resume(): void {
    this.paused = false;
  }
  abort(): void {
    this.aborted = true;
  }
  getState(): OrchState {
    return this.state;
  }
}

export function createRunner(): OrchestratorRunner {
  return new DefaultOrchestratorRunner();
} /**
 * @fileoverview Orchestrator allocator — resource allocation and load balancing. @since 0.2.6
 * @package zhi
 */

export interface Allocation {
  stepId: string;
  agentId: string;
  tokens: number;
  priority: number;
  estimatedDurationMs: number;
}

export interface Allocator {
  allocate(steps: DagStep[], config: OrchConfig): Allocation[];
  rebalance(current: Allocation[], changed: string[]): Allocation[];
}

export class DefaultAllocator implements Allocator {
  allocate(steps: DagStep[], config: OrchConfig): Allocation[] {
    const allocations: Allocation[] = [];
    const sorted = [...steps].sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));
    let agentIndex = 0;
    const agents = config.agents;
    for (const step of sorted) {
      const agent = agents[agentIndex % agents.length] ?? 'default';
      allocations.push({
        stepId: step.id,
        agentId: agent,
        tokens: step.tokens ?? 500,
        priority: step.priority ?? 5,
        estimatedDurationMs: (step.tokens ?? 500) * 2,
      });
      agentIndex++;
    }
    return allocations;
  }

  rebalance(current: Allocation[], changed: string[]): Allocation[] {
    return current.map((a) => {
      if (changed.includes(a.stepId)) {
        return { ...a, tokens: Math.floor(a.tokens * 1.2) };
      }
      return a;
    });
  }
}

export function createAllocator(): Allocator {
  return new DefaultAllocator();
}

/** @brief Budget allocator + serial scheduler. @since 0.1.1 */
export function allocate(dag: Dag, budget: number): Map<string, number> {
  const sum = dag.nodes.reduce((s, n) => s + n.estimate, 0);
  const out = new Map<string, number>();
  if (dag.nodes.length === 0) return out;
  if (sum === 0) {
    const even = Math.floor(budget / dag.nodes.length);
    for (const n of dag.nodes) out.set(n.id, even);
    return out;
  }
  for (const n of dag.nodes) out.set(n.id, Math.round((budget * n.estimate) / sum));
  return out;
}

/** @brief Hitung depth (jarak dari root) tiap step via topo order. @since 0.1.1 */
function depthOf(dag: Dag): Map<string, number> {
  const depth = new Map<string, number>();
  for (const id of dag.order) {
    const node = dag.nodes.find((n) => n.id === id)!;
    const d =
      node.deps.length === 0 ? 0 : Math.max(...node.deps.map((d) => (depth.get(d) ?? 0) + 1));
    depth.set(id, d);
  }
  return depth;
}

/** @brief Urutkan eksekusi (serial v1): topo, lalu by depth + token weight.
 * @param {Dag} dag - DAG rencana.
 * @param {Map<string, number>} alloc - hasil allocate.
 * @return {Step[]} urutan eksekusi.
 * @since 0.1.1 */
export function schedule(dag: Dag, alloc: Map<string, number>): Step[] {
  const depth = depthOf(dag);
  return [...dag.order]
    .map((id) => dag.nodes.find((n) => n.id === id)!)
    .sort((a, b) => {
      const da = depth.get(a.id) ?? 0;
      const db = depth.get(b.id) ?? 0;
      if (da !== db) return da - db;
      return (alloc.get(b.id) ?? 0) - (alloc.get(a.id) ?? 0);
    });
}
/**
 * @fileoverview Orchestrator state machine. @since 0.2.6
 * @package zhi
 */
/** @brief Orchestrator state. @since 0.2.6 */
export type OrchState =
  | 'idle'
  | 'planning'
  | 'running'
  | 'pausing'
  | 'paused'
  | 'resuming'
  | 'finishing'
  | 'finished'
  | 'aborted'
  | 'error'
  | 'failed'
  | 'completed';

/** @brief Valid state transitions. @since 0.2.6 */
const TRANSITIONS: Record<OrchState, OrchState[]> = {
  idle: ['planning', 'aborted', 'error'],
  planning: ['running', 'aborted'],
  running: ['pausing', 'finishing', 'aborted', 'error', 'failed'],
  pausing: ['paused', 'error'],
  paused: ['resuming', 'aborted', 'finishing'],
  resuming: ['running', 'error'],
  finishing: ['finished', 'error'],
  finished: ['completed'],
  aborted: [],
  error: [],
  failed: ['completed'],
  completed: [],
};

/** @brief State machine. @since 0.2.6 */
export interface StateMachine {
  current(): OrchState;
  transition(to: OrchState): boolean;
  toString(): string;
}

/** @brief Create a state machine. @since 0.2.6 */
export function createOrchState(initial: OrchState = 'planning'): StateMachine {
  let state = initial;
  return {
    current(): OrchState {
      return state;
    },
    transition(to: OrchState): boolean {
      if (TRANSITIONS[state].includes(to)) {
        state = to;
        return true;
      }
      return false;
    },
    toString(): string {
      return state;
    },
  };
}
/** @brief Topological sort over a DAG (interface shape). @since 0.2.6 */
export function topologicalSort(dag: Dag): TopoResult {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const order: string[] = [];
  const cycles: string[][] = [];

  const deps = new Map<string, string[]>();
  for (const e of dag.edges) {
    if (!deps.has(e.to)) deps.set(e.to, []);
    deps.get(e.to)!.push(e.from);
  }

  const visit = (id: string, path: string[]): void => {
    if (visited.has(id)) return;
    if (temp.has(id)) {
      const cycleStart = path.indexOf(id);
      cycles.push(path.slice(cycleStart));
      return;
    }
    temp.add(id);
    for (const dep of deps.get(id) ?? []) {
      visit(dep, [...path, id]);
    }
    temp.delete(id);
    visited.add(id);
    order.push(id);
  };

  for (const n of dag.nodes) visit(n.id, []);

  return { order, cycles, hasCycles: cycles.length > 0 };
}

/**
 * @brief Build a DAG from parsed intent. @since 0.1.2
 */
export function buildDag(intent: { raw: string; tokens: string[]; constraints: unknown[] }): Dag {
  const clauses = intent.raw
    .split(/[,;]/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const nodes: Step[] = [];
  const edges: Edge[] = [];
  let prevId: string | undefined;
  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i]!;
    const id = `s${i}`;
    const tokens = clause
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/i)
      .filter((t) => t.length > 0 && !STOPWORDS.has(t));
    const estimate = tokens.length;
    const isFirst = i === 0;
    const isLast = i === clauses.length - 1;
    const priority = isFirst || isLast ? 0.75 : 0.5;
    nodes.push({
      id,
      label: clause,
      deps: prevId ? [prevId] : [],
      estimate: Math.max(1, estimate),
      priority,
    });
    if (prevId) edges.push({ from: prevId, to: id });
    prevId = id;
  }
  const order = nodes.map((n) => n.id);
  return { nodes, edges, order };
}

/** @brief Topological sort of steps. @since 0.1.2 */
export function topoSort(nodes: Step[], edges: Edge[]): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const deps = new Map<string, string[]>();
  for (const n of nodes) deps.set(n.id, []);
  for (const e of edges) {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) continue;
    deps.get(e.to)!.push(e.from);
  }

  const visited = new Set<string>();
  const temp = new Set<string>();
  const order: string[] = [];
  const cycle: string[] = [];

  const visit = (id: string, path: string[]): boolean => {
    if (visited.has(id)) return true;
    if (temp.has(id)) {
      const start = path.indexOf(id);
      cycle.push(...path.slice(start));
      return false;
    }
    temp.add(id);
    for (const dep of deps.get(id) ?? []) {
      if (!visit(dep, [...path, id])) return false;
    }
    temp.delete(id);
    visited.add(id);
    order.push(id);
    return true;
  };

  for (const id of nodeIds) {
    if (!visit(id, [])) {
      throw new CycleError(cycle);
    }
  }
  return order;
}
