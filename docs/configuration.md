# configuration.md — Config, Env, CLI

<p align="center">  <img src="../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

How to run and configure Zhi. All config lives in `zhi.config.ts` plus env vars; CLI flags override per-invocation.

## package.json (minimal)

```json
{
  "name": "zhi",
  "version": "0.1.0",
  "maturity": "experimental",
  "type": "module",
  "scripts": {
    "dev": "bun run src/cli.ts",
    "typecheck": "tsc --noEmit",
    "test": "bun test"
  },
  "dependencies": {
    "ink": "^4"
  }
}
```

Minimal dependency: **only `ink`** for the TUI. Model calls go through `fetch` to 9router (no SDK). Zig WASM is loaded via `WebAssembly.instantiate` (no dep needed).

## zhi.config.ts

```ts
/** @brief Zhi configuration (zhi.config.ts).
 * @since 0.1.0 */
export interface ZhiConfig {
  model: {
    backends: Backend[]; // 9router/OMP/local
    defaultTier: Tier; // 'heavy'
    fallbackTier: Tier; // 'light' when heavy is down
  };
  budget: {
    defaultTokens: number; // 200_000
    perStepRatio: number; // 0.2 (max 20% of budget per step)
  };
  critic: {
    weights: Partial<Record<CriticId, number>>; // override weights
    securityFloor: number; // 0.5 -> auto-fail below this
    passAvg: number; // 0.7 -> pass threshold
  };
  resil: {
    maxRetry: number; // 3
    breakerWindow: number; // 10
    breakerErrorRate: number; // 0.5
  };
  git: {
    baseBranch: string; // 'main'
    prDraft: boolean; // false
  };
  native: {
    wasmDir: string; // 'native/out'
  };
}
```

## Environment variables

| Var              | Used by        | Required                 | Notes                                                   |
| ---------------- | -------------- | ------------------------ | ------------------------------------------------------- |
| `NINAROUTER_KEY` | model/router   | yes (when using 9router) | 9router API key (cookie-auth at the proxy, not Bearer). |
| `OMP_*`          | model/router   | optional                 | when routing to OMP.                                    |
| `GITHUB_TOKEN`   | tools/git (gh) | yes (when opening PRs)   | gh token with repo scope.                               |
| `ZHI_CONFIG`     | cli            | optional                 | path to `zhi.config.ts` (default: cwd).                 |
| `ZHI_LOG`        | observability  | optional                 | `silent                                                 | info | debug`(default`info`). |

**Never hardcode secrets** in `zhi.config.ts` — read them from env. See `security.md`.

## CLI

```
zhi run "<goal>" [flags]
zhi plan "<goal>"        # dry-run: PLAN only, show the DAG
zhi resume <ledgerRef>   # resume from DONE(partial)
zhi --version
```

`run` flags:

| Flag              | Default                     | Notes                            |
| ----------------- | --------------------------- | -------------------------------- |
| `--repo <path>`   | cwd                         | target repo.                     |
| `--base <branch>` | config.git.baseBranch       | base branch.                     |
| `--budget <n>`    | config.budget.defaultTokens | token budget.                    |
| `--tier <heavy    | light                       | micro>`                          | config.model.defaultTier | override routing. |
| `--dry-run`       | false                       | plan only, no execute/commit/PR. |
| `--no-pr`         | false                       | stop at COMMIT, don't open a PR. |
| `--config <path>` | `ZHI_CONFIG`/cwd            | config path.                     |

Example:

```
zhi run "add email validation in auth.ts, tests green, open PR" \
  --repo ./myapp --base main --budget 150000
```

## Cross-link

`design/model.md` (Backend, Tier), `design/critic.md` (weights, floor), `design/resil.md` (maxRetry, breaker), `design/knowledge.md` (ledger, resume), `security.md` (secret handling), `observability.md` (ZHI_LOG).
