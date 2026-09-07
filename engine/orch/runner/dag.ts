/**
 * @fileoverview Orchestrator DAG builder and topological sort. @since 0.1.2
 * @package zhi
 */
import { STOPWORDS } from '../parse';
import { CycleError } from '../types';
import type { Step, Edge, Dag, TopoResult } from '../types';

/** @brief Topological sort over a DAG (interface shape). @since 0.1.10 */
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
