/**
 * @fileoverview Eval test — test runner for evaluation criteria. @since 0.2.6
 * @package zhi
 */

/** @brief Test case. @since 0.2.6 */
export interface TestCase {
  name: string;
  run: () => boolean | Promise<boolean>;
  timeout?: number;
}

/** @brief Test result. @since 0.2.6 */
export interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

/** @brief Test runner options. @since 0.2.6 */
export interface TestRunnerOptions {
  timeout?: number;
  parallel?: boolean;
  onResult?: (result: TestResult) => void;
}

/** @brief Test runner. @since 0.2.6 */
export class TestRunner {
  private readonly defaultTimeout: number;
  private readonly parallel: boolean;
  private readonly onResult?: (result: TestResult) => void;

  constructor(options: TestRunnerOptions = {}) {
    this.defaultTimeout = options.timeout ?? 5000;
    this.parallel = options.parallel ?? false;
    this.onResult = options.onResult;
  }

  /** @brief Run test cases. @since 0.2.6 */
  async run(cases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    if (this.parallel) {
      const promises = cases.map((c) => this.runCase(c));
      const settled = await Promise.allSettled(promises);
      for (const s of settled) {
        if (s.status === 'fulfilled') {
          results.push(s.value);
          this.onResult?.(s.value);
        }
      }
    } else {
      for (const c of cases) {
        const r = await this.runCase(c);
        results.push(r);
        this.onResult?.(r);
      }
    }
    return results;
  }

  /** @brief Run a single test case. @since 0.2.6 */
  private async runCase(c: TestCase): Promise<TestResult> {
    const start = performance.now();
    const timeout = c.timeout ?? this.defaultTimeout;
    try {
      const result = await Promise.race([
        Promise.resolve(c.run()),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error(`test timeout: ${c.name}`)), timeout),
        ),
      ]);
      return {
        name: c.name,
        passed: result,
        durationMs: performance.now() - start,
      };
    } catch (err) {
      return {
        name: c.name,
        passed: false,
        durationMs: performance.now() - start,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /** @brief Check if all tests passed. @since 0.2.6 */
  allPassed(results: TestResult[]): boolean {
    return results.every((r) => r.passed);
  }
}

/** @brief Create a test runner. @since 0.2.6 */
export function createTestRunner(options?: TestRunnerOptions): TestRunner {
  return new TestRunner(options);
}
