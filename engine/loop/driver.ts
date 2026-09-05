/** @brief Driver state-machine loop Zhi. Murni, 0 dependensi eksternal. @since 0.1.1 */
import { LoopState, LoopEvent, transition } from './states';

/** @brief Handler tiap state: kerjakan state, kembalikan event pemicu. @since 0.1.1 */
export type StateHandler = (state: LoopState) => LoopEvent | Promise<LoopEvent>;

/** @brief Opsi driver. @since 0.1.1 */
export interface LoopDriverOptions {
  /** @brief State awal. Default INTAKE. */
  start?: LoopState;
  /** @brief Callback tiap transisi sukses (from, event, to). */
  onTransition?: (from: LoopState, ev: LoopEvent, to: LoopState) => void;
  /** @brief Per-step timeout dalam ms (default 30000). 0 = dinonaktifkan. */
  stepTimeoutMs?: number;
}

/** @brief Driver loop otonom: pegang state, validasi transisi, jalankan siklus. @since 0.1.1 */
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
  /** @brief Force-stop: set state DONE tanpa transisi. @since 0.1.2 */
  abort(): void {
    this.state = LoopState.DONE;
  }

  /**
   * @brief Jalankan siklus hingga DONE dengan per-step timeout.
   * @param {Partial<Record<LoopState, StateHandler>>} handlers - handler per state aktif.
   * @param {number} maxSteps - batas iterasi (cegah loop tak berhingga). Default 64.
   * @param {number} stepTimeoutMs - batas waktu per step dalam ms. Default 30000. 0 = dinonaktifkan.
   * @throws {Error} bila state tak punya handler, transisi ilegal, budget habis, atau step timeout.
   * @since 0.1.1 */
  async run(
    handlers: Partial<Record<LoopState, StateHandler>>,
    maxSteps = 64,
    stepTimeoutMs = 30000,
  ): Promise<void> {
    let steps = 0;
    while (!this.finished) {
      if (++steps > maxSteps) throw new Error('loop: budget exceeded');
      const h = handlers[this.state];
      if (!h) throw new Error(`loop: no handler for state ${this.state}`);
      const ev = await this.withTimeout(Promise.resolve(h(this.state)), stepTimeoutMs, this.state);
      if (!this.send(ev)) throw new Error(`loop: illegal transition ${this.state} --${ev}`);
    }
  }

  /**
   * @brief Wrap promise dengan timeout. Losing promise rejection ditahan agar tidak jadi unhandled.
   * @param {Promise<T>} p - promise yang di-race.
   * @param {number} ms - timeout dalam ms (0 = dinonaktifkan).
   * @param {LoopState} state - nama state untuk pesan error.
   * @return {Promise<T>} hasil atau reject dengan timeout error.
   * @since 0.1.2 */
  private async withTimeout<T>(p: Promise<T>, ms: number, state: LoopState): Promise<T> {
    if (ms <= 0) return p;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error(`loop: step timeout (${ms}ms) in state ${state}`)),
        ms,
      );
    });
    try {
      return await Promise.race([p, timeout]);
    } finally {
      clearTimeout(timer);
      // Hambat unhandled rejection dari losing promise (bila timeout menang).
      p.catch(() => {});
    }
  }
}
