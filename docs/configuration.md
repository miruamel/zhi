# configuration.md — Config, Env, CLI

Cara menjalankan dan mengonfigurasi Zhi. Semua config via `zhi.config.ts` + env var; CLI flag override per-invocation.

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

Dep minimal: **hanya `ink`** untuk TUI. Model call = `fetch` ke 9router (tanpa SDK). Zig WASM di-load via `WebAssembly.instantiate` (tidak butuh dep).

## zhi.config.ts

```ts
/** @brief Konfigurasi Zhi (zhi.config.ts).
 * @since 0.1.0 */
export interface ZhiConfig {
  model: {
    backends: Backend[];        // 9router/OMP/local
    defaultTier: Tier;          // 'heavy'
    fallbackTier: Tier;         // 'light' bila heavy down
  };
  budget: {
    defaultTokens: number;      // 200_000
    perStepRatio: number;       // 0.2 (maks 20% budget per step)
  };
  critic: {
    weights: Partial<Record<CriticId, number>>; // override bobot
    securityFloor: number;      // 0.5 -> auto-fail di bawah ini
    passAvg: number;            // 0.7 -> threshold pass
  };
  resil: {
    maxRetry: number;           // 3
    breakerWindow: number;      // 10
    breakerErrorRate: number;   // 0.5
  };
  git: {
    baseBranch: string;         // 'main'
    prDraft: boolean;           // false
  };
  native: {
    wasmDir: string;            // 'native/out'
  };
}
```

## Environment variables

| Var | Pakai di | Wajib | Keterangan |
|---|---|---|---|
| `NINAROUTER_KEY` | model/router | ya (bila pakai 9router) | API key 9router (cookie-auth di proxy, bukan Bearer). |
| `OMP_*` | model/router | opsional | bila routing ke OMP. |
| `GITHUB_TOKEN` | tools/git (gh) | ya (bila buka PR) | token gh dengan scope repo. |
| `ZHI_CONFIG` | cli | opsional | path ke `zhi.config.ts` (default: cwd). |
| `ZHI_LOG` | observability | opsional | `silent|info|debug` (default `info`). |

**Jangan hardcode secret** di `zhi.config.ts` — ambil dari env. Lihat `security.md`.

## CLI

```
zhi run "<goal>" [flags]
zhi plan "<goal>"        # dry-run: hanya PLAN, tampilkan DAG
zhi resume <ledgerRef>   # lanjut dari DONE(partial)
zhi --version
```

Flag `run`:

| Flag | Default | Keterangan |
|---|---|---|
| `--repo <path>` | cwd | target repo. |
| `--base <branch>` | config.git.baseBranch | base branch. |
| `--budget <n>` | config.budget.defaultTokens | token budget. |
| `--tier <heavy|light|micro>` | config.model.defaultTier | override routing. |
| `--dry-run` | false | plan saja, tidak eksekusi/commit/PR. |
| `--no-pr` | false | stop di COMMIT, jangan buka PR. |
| `--config <path>` | `ZHI_CONFIG`/cwd | path config. |

Contoh:

```
zhi run "tambah validasi email di auth.ts, test hijau, buka PR" \
  --repo ./myapp --base main --budget 150000
```

## Cross-link

`design/model.md` (Backend, Tier), `design/critic.md` (weights, floor), `design/resil.md` (maxRetry, breaker), `design/knowledge.md` (ledger, resume), `security.md` (secret handling), `observability.md` (ZHI_LOG).
