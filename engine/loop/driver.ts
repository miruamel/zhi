/** @brief Driver state-machine loop Zhi. Murni, 0 dependensi eksternal. @since 0.1.0 */
import { LoopState, LoopEvent, transition } from './states';

/** @brief Handler tiap state: kerjakan state, kembalikan event pemicu. @since 0.1.0 */
export type StateHandler = (state: LoopState) => LoopEvent | Promise<LoopEvent>;

/** @brief Opsi driver. @since 0.1.0 */
export interface LoopDriverOptions {
  /** @brief State awal. Default INTAKE. */
  start?: LoopState;
  /** @brief Callback tiap transisi sukses (from, event, to). */
  onTransition?: (from: LoopState, ev: LoopEvent, to: LoopState) => void;
}

/** @brief Driver loop otonom: pegang state, validasi transisi, jalankan siklus. @since 0.1.0 */
export class LoopDriver {
  private state: LoopState;
  private readonly onTransition?: LoopDriverOptions['onTransition'];

  constructor(opts: LoopDriverOptions = {}) {
    this.state = opts.start ?? LoopState.INTAKE;
    this.onTransition = opts.onTransition;
  }

  /** @brief State saat ini. */
  get current(): LoopState {
    return this.state;
  }

  /** @brief True bila di DONE. */
  get finished(): boolean {
    return this.state === LoopState.DONE;
  }

  /** @brief Kirim event; transisi bila valid.
   * @param {LoopEvent} ev - event pemicu.
   * @return {boolean} true bila berpindah state.
   */
  send(ev: LoopEvent): boolean {
    const next = transition(this.state, ev);
    if (next === null) return false;
    const from = this.state;
    this.state = next;
    this.onTransition?.(from, ev, next);
    return true;
  }

  /** @brief Jalankan siklus hingga DONE.
   * @param {Partial<Record<LoopState, StateHandler>>} handlers - handler per state aktif.
   * @throws {Error} bila state tak punya handler atau transisi ilegal.
   */
  async run(handlers: Partial<Record<LoopState, StateHandler>>): Promise<void> {
    while (!this.finished) {
      const h = handlers[this.state];
      if (!h) throw new Error(`loop: no handler for state ${this.state}`);
      const ev = await h(this.state);
      if (!this.send(ev)) throw new Error(`loop: illegal transition ${this.state} --${ev}`);
    }
  }
}
