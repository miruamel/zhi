/** @brief Performance mark tracker with nested spans and summaries. @since 0.1.1 */

/** @brief A single timed span; nested marks are stored on `children`. */
export interface PerfMark {
  /** @brief span name */
  name: string;
  /** @brief monotonic start time in milliseconds */
  start: number;
  /** @brief monotonic end time in milliseconds; undefined while open */
  end?: number;
  /** @brief cached `end - start`; undefined while open */
  duration?: number;
  /** @brief child spans started while this span was open */
  children?: PerfMark[];
}

/** @brief Summary of a marker's lifetime. */
interface Summary {
  /** @brief cumulative duration of all closed spans in ms */
  total: number;
  /** @brief slowest closed span across all roots, by duration */
  slowest: PerfMark | undefined;
  /** @brief number of closed spans tracked */
  count: number;
}

/** @brief Tracks nested performance marks and exposes aggregate summaries. */
export class PerfTracker {
  private marks: PerfMark[] = [];
  private stack: PerfMark[] = [];

  /** @brief Open a named mark. Pushes onto the active parent when one exists. */
  start(name: string): PerfMark {
    const mark: PerfMark = { name, start: now() };
    const parent = this.stack[this.stack.length - 1];
    if (parent) {
      if (!parent.children) parent.children = [];
      parent.children.push(mark);
    } else {
      this.marks.push(mark);
    }
    this.stack.push(mark);
    return mark;
  }

  /** @brief Close the most recently opened matching mark. */
  end(name: string): PerfMark | undefined {
    // Walk stack top-down to find the most recent open mark with this name.
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const mark = this.stack[i];
      if (mark.name === name && mark.end === undefined) {
        mark.end = now();
        mark.duration = mark.end - mark.start;
        this.stack.splice(i, 1);
        return mark;
      }
    }
    return undefined;
  }

  /** @brief All root marks in start order (closed or open). */
  getMarks(): PerfMark[] {
    return this.marks;
  }

  /** @brief All closed marks (root + nested) in start order. */
  getRoot(): PerfMark[] {
    const out: PerfMark[] = [];
    const visit = (m: PerfMark): void => {
      if (m.end !== undefined) out.push(m);
      if (m.children) for (const c of m.children) visit(c);
    };
    for (const m of this.marks) visit(m);
    return out;
  }

  /** @brief Aggregate stats across all closed marks (root + nested). */
  summary(): Summary {
    let total = 0;
    let count = 0;
    let slowest: PerfMark | undefined;
    const visit = (m: PerfMark): void => {
      if (m.end !== undefined && m.duration !== undefined) {
        total += m.duration;
        count++;
        if (!slowest || m.duration > (slowest.duration ?? -1)) slowest = m;
      }
      if (m.children) for (const c of m.children) visit(c);
    };
    for (const m of this.marks) visit(m);
    return { total, slowest, count };
  }

  /** @brief Drop every mark and reset the open stack. */
  clear(): void {
    this.marks = [];
    this.stack = [];
  }
}

/** @brief Construct a fresh tracker; convenience for `new PerfTracker()`. */
export function createPerfTracker(): PerfTracker {
  return new PerfTracker();
}

/** @brief Time `fn` under the named mark; closes it on return or throw. */
export function measure<T>(tracker: PerfTracker, name: string, fn: () => T): T {
  tracker.start(name);
  try {
    return fn();
  } finally {
    tracker.end(name);
  }
}

/** @brief Render a millisecond duration as a short, human-readable string. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0ms";
  if (ms < 1) return `${Math.floor(ms * 1000)}µs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${minutes}m${seconds}s`;
}

/** @brief Monotonic clock in milliseconds; isolated for testability. */
function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}