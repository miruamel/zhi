/** @brief DAG builder + cycle detector + topological sort. @since 0.1.0 */
import type { Dag, Edge, Intent, Step } from './types';
import { CycleError } from './types';
import { STOPWORDS } from './parse';


/** @brief Urutkan node topologis; lempar CycleError bila ada siklus.
 * @param {Step[]} nodes - step DAG.
 * @param {Edge[]} edges - edge dependensi.
 * @return {string[]} urutan topologis ID step.
 * @throw {CycleError} bila siklus tak terpecahkan.
 * @since 0.1.0 */
export function topoSort(nodes: Step[], edges: Edge[]): string[] {
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const n of nodes) {
    adj.set(n.id, []);
    indeg.set(n.id, 0);
  }
  for (const e of edges) {
    if (!adj.has(e.from) || !indeg.has(e.to)) continue;
    adj.get(e.from)!.push(e.to);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  }
  const queue: string[] = [];
  for (const [id, d] of indeg) if (d === 0) queue.push(id);
  const order: string[] = [];
  const seen = new Set<string>();
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    order.push(id);
    for (const nxt of adj.get(id) ?? []) {
      indeg.set(nxt, (indeg.get(nxt) ?? 0) - 1);
      if (indeg.get(nxt) === 0) queue.push(nxt);
    }
  }
  if (order.length !== nodes.length) {
    const cycle = nodes.map((n) => n.id).filter((id) => !seen.has(id));
    throw new CycleError(cycle);
  }
  return order;
}

/** @brief Bangun DAG step dari intent; cek siklus.
 * @param {Intent} intent - hasil parseGoal.
 * @return {Dag} node + edge, terurut topologis.
 * @throw {CycleError} bila siklus tak terpecahkan.
 * @see docs/design/orch.md
 * @since 0.1.0 */
export function buildDag(intent: Intent): Dag {
  const clauses = intent.raw
    .split(/[,\n;]/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const labels = clauses.length > 0 ? clauses : [intent.raw];
  const last = labels.length - 1;

  const nodes: Step[] = labels.map((label, i) => ({
    id: `s${i}`,
    label,
    deps: i > 0 ? [`s${i - 1}`] : [],
    estimate: Math.max(1, label.split(/\s+/).filter((w) => w && !STOPWORDS.has(w.toLowerCase())).length),
    priority: 0.5 + (i === 0 ? 0.1 : 0) + (i === last ? 0.1 : 0),
  }));
  const edges: Edge[] = [];
  for (const n of nodes) for (const d of n.deps) edges.push({ from: d, to: n.id });

  const order = topoSort(nodes, edges);
  return { nodes, edges, order };
}
