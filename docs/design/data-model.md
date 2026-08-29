# design/data-model.md — Shared Contracts

Tipe bersama yang dipakai lintas modul. Semua modul berkomunikasi lewat kontrak ini (dependency injection di `loop/wiring/handlers.ts`). Field wajib diberi `@brief`.

## Goal & Intent

```ts
/** @brief Input mentah dari user (CLI/API).
 * @since 0.1.0 */
export interface Goal {
  text: string;            // "tambah validasi email di auth.ts, test hijau, buka PR"
  repo: string;            // path atau owner/repo
  base: string;            // base branch (default: main/master)
  budget: number;          // total token budget
  tierPref?: Tier;         // override routing default
  dryRun?: boolean;        // plan saja, tidak eksekusi
}

/** @brief Hasil parseGoal: intent terstruktur + constraints.
 * @since 0.1.0 */
export interface Intent {
  action: 'add' | 'fix' | 'refactor' | 'test' | 'docs' | 'chore';
  targets: string[];       // file/simbol target ("auth.ts", "validateEmail")
  constraints: string[];   // "test hijau", "buka PR", "tanpa breaking"
  scope: 'file' | 'module' | 'repo';
}
```

## DAG & Step

```ts
/** @brief Directed Acyclic Graph dari step eksekusi.
 * @since 0.1.0 */
export interface Dag {
  nodes: Step[];
  edges: Edge[];           // {from: stepId, to: stepId}
  topo: string[];          // node id terurut topologis
}

/** @brief Satu unit kerja dalam loop.
 * @since 0.1.0 */
export interface Step {
  id: string;
  kind: TaskKind;          // 'generate' | 'verify' | 'critique' | 'eval' | 'commit' | 'pr'
  intent: Intent;
  deps: string[];          // step id pra-syarat
  tokenBudget: number;     // alokasi dari orch/allocate
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
}

export type Edge = { from: string; to: string };
export type TaskKind = 'generate' | 'verify' | 'critique' | 'eval' | 'commit' | 'pr' | 'classify';
```

## FileChange & GenReq

```ts
/** @brief Perubahan pada satu file hasil generate.
 * @since 0.1.0 */
export interface FileChange {
  path: string;
  before: string;          // isi sebelum (untuk diff)
  after: string;           // isi sesudah
  op: 'create' | 'edit' | 'delete';
}

/** @brief Request ke build/generate.
 * @since 0.1.0 */
export interface GenReq {
  instruction: string;
  targets: string[];
  depMap: RepoIndex;       // dari knowledge/git
  ctx: Context;            // dari build/context
}
```

## Critic & Aggregate

```ts
/** @brief Skor satu kritikus.
 * @since 0.1.0 */
export interface CriticScore {
  critic: CriticId;        // 'security' | 'perf' | ... (12 id)
  value: number;           // 0..1
  abstain?: boolean;       // stub belum diimplementasi
  reason: string;          // mengapa skor ini
}

export type CriticId =
  | 'security' | 'perf' | 'architecture' | 'testing' | 'doc'
  | 'devops' | 'legal' | 'privacy' | 'style' | 'dx' | 'accessibility' | 'maintainability';

/** @brief Hasil agregasi Pareto.
 * @since 0.1.0 */
export interface Aggregate {
  pass: boolean;
  weightedAvg: number;     // 0..1
  reasons: string[];       // per kritikus
  fallback?: boolean;      // true bila semua abstain -> pakai eval gate
}
```

## Eval

```ts
/** @brief Laporan toolchain evaluasi.
 * @since 0.1.0 */
export interface EvalReport {
  build: StageStatus;
  test: StageStatus;       // unit + integration
  security: StageStatus;   // SAST/DAST + secret
  gate: StageStatus;       // perf + compliance + quality
  gatePass: boolean;
}

export interface StageStatus {
  ok: boolean;
  detail: string;          // error / metrik
  durationMs: number;
}
```

## Loop report & context

```ts
/** @brief Laporan akhir loop.
 * @since 0.1.0 */
export interface LoopReport {
  status: 'done' | 'partial';
  steps: Step[];
  critic?: Aggregate;
  eval?: EvalReport;
  prUrl?: string;
  ciStatus?: 'pass' | 'fail' | 'unknown';
  tokensUsed: number;
  ledgerRef: string;       // path ke KB/ledger
}

/** @brief Konteks loop yang dikompres oleh build/context.
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
/** @brief Index repo dari knowledge/git.
 * @since 0.1.0 */
export interface RepoIndex {
  files: string[];
  imports: Map<string, string[]>;  // file -> imported symbols
  history: CommitMeta[];
}

export interface CommitMeta { sha: string; msg: string; files: string[]; }

/** @brief Entry ledger append-only (KB/ledger).
 * @since 0.1.0 */
export interface LedgerEntry {
  ts: string;              // ISO
  stepId: string;
  action: string;
  detail: string;
  tokens: number;
}

/** @brief Context resilience.
 * @since 0.1.0 */
export interface ResilCtx {
  maxRetry: number;       // default 3
  breakerWindow: number;  // jumlah panggilan
  strategy: 'replan' | 'patch' | 'abort';
}

/** @brief Entry Dead Letter Queue.
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
/** @brief Satu token dari stream model.
 * @since 0.1.0 */
export interface Token { text: string; tool?: ToolCall; }

/** @brief Panggilan tool terstruktur dari model.
 * @since 0.1.0 */
export interface ToolCall { name: string; args: Record<string, unknown>; }

/** @brief Backend terpilih oleh model/router.
 * @since 0.1.0 */
export interface Backend { url: string; model: string; tier: Tier; }

export type Tier = 'heavy' | 'light' | 'micro';
```

## Cross-link

`design/loop.md` (LoopReport, Step), `design/orch.md` (Intent, Dag), `design/build.md` (FileChange, GenReq, Context), `design/critic.md` (CriticScore, Aggregate), `design/eval.md` (EvalReport), `design/knowledge.md` (RepoIndex, LedgerEntry), `design/resil.md` (ResilCtx, DLQEntry), `design/model.md` (Token, Backend).
