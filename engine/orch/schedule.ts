/** @brief Budget allocator + serial scheduler. @since 0.1.0 */
import type { Dag, Step } from './types';

/** @brief Alokasikan token per step dari budget total, proporsional pada estimate.
 * @param {Dag} dag - DAG rencana.
 * @param {number} budget - total token tersedia.
 * @return {Map<string, number>} alokasi per stepId.
 * @since 0.1.0 */
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

/** @brief Hitung depth (jarak dari root) tiap step via topo order. @since 0.1.0 */
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
 * @since 0.1.0 */
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
