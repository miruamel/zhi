# design/data-model.md — Shared Contracts

Shared types used across modules. Every module communicates through these contracts (dependency injection in `loop/wiring/handlers.ts`). Required fields carry `@brief`.

## Goal & Intent

```ts
/** @brief Raw input from the user (CLI / API).
 * @since 0.1.0 */
export interface Goal {
  text: string; // "add email validation in auth.ts, tests green, open PR"
  repo: string; // path or owner/repo
  base: string; // base branch (default: main/master)
  budget: number; // total token budget
  tierPref?: Tier; // override default routing
  dryRun?: boolean; // plan only, no execution
}

/** @brief Output of parseGoal: structured intent + constraints.
 * @since 0.1.0 */
export interface Intent {
  action: 'add' | 'fix' | 'refactor' | 'test' | 'docs' | 'chore';
  targets: string[]; // target file/symbol ("auth.ts", "validateEmail")
  constraints: string[]; // "tests green", "open PR", "no breaking"
  scope: 'file' | 'module' | 'repo';
}
```

## DAG & Step

```ts
/** @brief Directed Acyclic Graph of execution steps.
 * @since 0.1.0 */
export interface Dag {
  nodes: Step[];
  edges: Edge[]; // {from: stepId, to: stepId}
  topo: string[]; // topologically ordered node ids
}

/** @brief One unit of work in the loop.
 * @since 0.1.0 */
export interface Step {
  id: string;
  kind: TaskKind; // 'generate' | 'verify' | 'critique' | 'eval' | 'commit' | 'pr'
  intent: Intent;
  deps: string[]; // prerequisite step ids
  tokenBudget: number; // allocation from orch/allocate
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
}

export type Edge = { from: string; to: string };
export type TaskKind = 'generate' | 'verify' | 'critique' | 'eval' | 'commit' | 'pr' | 'classify';
```

## FileChange & GenReq

```ts
/** @brief One file change produced by generate.
 * @since 0.1.0 */
export interface FileChange {
  path: string;
  before: string; // content before (for diff)
  after: string; // content after
  op: 'create' | 'edit' | 'delete';
}

/** @brief Request to build/generate.
 * @since 0.1.0 */
export interface GenReq {
  instruction: string;
  targets: string[];
  depMap: RepoIndex; // from knowledge/git
  ctx: Context; // from build/context
}
```

## Critic & Aggregate

```ts
/** @brief Score from a single critic.
 * @since 0.1.0 */
export interface CriticScore {
  critic: CriticId; // 'security' | 'perf' | ... (12 ids)
  value: number; // 0..1
  abstain?: boolean; // stub, not implemented yet
  reason: string; // why this score
}

export type CriticId =
  | 'security'
  | 'perf'
  | 'architecture'
  | 'testing'
  | 'doc'
  | 'devops'
  | 'legal'
  | 'privacy'
  | 'style'
  | 'dx'
  | 'accessibility'
  | 'maintainability';

/** @brief Weighted Pareto aggregation result.
 * @since 0.1.0 */
export interface Aggregate {
  pass: boolean;
  weightedAvg: number; // 0..1
  reasons: string[]; // per critic
  fallback?: boolean; // true when all abstain -> use eval gate
}
```

## Eval

```ts
/** @brief Report from the evaluation toolchain.
 * @since 0.1.0 */
export interface EvalReport {
  build: StageStatus;
  test: StageStatus; // unit + integration
  security: StageStatus; // SAST/DAST + secret
  gate: StageStatus; // perf + compliance + quality
  gatePass: boolean;
}

export interface StageStatus {
  ok: boolean;
  detail: string; // error / metric
  durationMs: number;
}
```

## Loop report & context

```ts
/** @brief Final loop report.
 * @since 0.1.0 */
export interface LoopReport {
  status: 'done' | 'partial';
  steps: Step[];
  critic?: Aggregate;
  eval?: EvalReport;
  prUrl?: string;
  ciStatus?: 'pass' | 'fail' | 'unknown';
  tokensUsed: number;
  ledgerRef: string; // path to KB/ledger
}

/** @brief Loop context, compressed by build/context.
 * @since 0.1.0 */
export interface Context {
  goal: Goal;
  history: Step[];
  repoIndex: RepoIndex;
  compressed: boolean;
}
```

## Knowledge & resilience

```ts
/** @brief Repo index from knowledge/git.
 * @since 0.1.0 */
export interface RepoIndex {
  files: string[];
  imports: Map<string, string[]>; // file -> imported symbols
  history: CommitMeta[];
}

export interface CommitMeta {
  sha: string;
  msg: string;
  files: string[];
}

/** @brief Append-only ledger entry (KB/ledger).
 * @since 0.1.0 */
export interface LedgerEntry {
  ts: string; // ISO
  stepId: string;
  action: string;
  detail: string;
  tokens: number;
}

/** @brief Resilience context.
 * @since 0.1.0 */
export interface ResilCtx {
  maxRetry: number; // default 3
  breakerWindow: number; // number of calls
  strategy: 'replan' | 'patch' | 'abort';
}

/** @brief Dead Letter Queue entry.
 * @since 0.1.0 */
export interface DLQEntry {
  ts: string;
  op: string;
  error: string;
  attempts: number;
}
```

## Model

```ts
/** @brief One token from the model stream.
 * @since 0.1.0 */
export interface Token {
  text: string;
  tool?: ToolCall;
}

/** @brief Structured tool call from the model.
 * @since 0.1.0 */
export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

/** @brief Backend selected by model/router.
 * @since 0.1.0 */
export interface Backend {
  url: string;
  model: string;
  tier: Tier;
}

export type Tier = 'heavy' | 'light' | 'micro';
```

## Cross-link

`design/loop.md` (LoopReport, Step), `design/orch.md` (Intent, Dag), `design/build.md` (FileChange, GenReq, Context), `design/critic.md` (CriticScore, Aggregate), `design/eval.md` (EvalReport), `design/knowledge.md` (RepoIndex, LedgerEntry), `design/resil.md` (ResilCtx, DLQEntry), `design/model.md` (Token, Backend).
