/** @brief Logger terstruktur loop dengan correlation ID (runId). @since 0.6.0 */
export class LoopLogger {
  /** @brief ID korelasi per siklus (trace lintas transisi). */
  readonly runId: string;
  private readonly sink: (line: string) => void;

  /** @brief Buat logger.
   * @param {string} [runId] - ID korelasi; bila absen, generate dari epoch ms.
   * @param {(line:string)=>void} [sink] - tujuan log (default console.log).
   */
  constructor(runId?: string, sink: (line: string) => void = console.log) {
    this.runId = runId ?? `run-${Date.now()}`;
    this.sink = sink;
  }

  /** @brief Catat satu transisi state sebagai JSON terstruktur.
   * @param {string} from - state asal.
   * @param {string} event - event pemicu.
   * @param {string} to - state tujuan.
   */
  transition(from: string, event: string, to: string): void {
    this.sink(
      JSON.stringify({ ts: Date.now(), runId: this.runId, from, event, to, kind: 'transition' }),
    );
  }
}
