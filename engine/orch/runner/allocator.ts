/**
 * @fileoverview Orchestrator allocator — resource allocation and load balancing. @since 0.1.10
 * @package zhi
 */
import type { Dag, DagStep, OrchConfig } from '../types';

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
  const sum = dag.nodes.reduce((s, n) => s + (n.estimate ?? 0), 0);
  const out = new Map<string, number>();
  if (dag.nodes.length === 0) return out;
  if (sum === 0) {
    const even = Math.floor(budget / dag.nodes.length);
    for (const n of dag.nodes) out.set(n.id, even);
    return out;
  }
  for (const n of dag.nodes) out.set(n.id, Math.round((budget * (n.estimate ?? 0)) / sum));
  return out;
}

/** @brief Hitung depth (jarak dari root) tiap step via topo order. @since 0.1.1 */
function depthOf(dag: Dag): Map<string, number> {
  const depth = new Map<string, number>();
  for (const id of dag.order) {
    const node = dag.nodes.find((n) => n.id === id)!;
    const deps = node.deps ?? [];
    const d = deps.length === 0 ? 0 : Math.max(...deps.map((dep) => (depth.get(dep) ?? 0) + 1));
    depth.set(id, d);
  }
  return depth;
}

/** @brief Urutkan eksekusi (serial v1): topo, lalu by depth + token weight.
 * @param {Dag} dag - DAG rencana.
 * @param {Map<string, number>} alloc - hasil allocate.
 * @return {Step[]} urutan eksekusi.
 * @since 0.1.1 */
export function schedule(dag: Dag, alloc: Map<string, number>): DagStep[] {
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
