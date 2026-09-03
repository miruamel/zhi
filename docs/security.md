# security.md — Trust Boundaries & Hardening

<p align="center">  <img src="../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

Zhi executes model-generated code and calls external APIs. Security is not an add-on — it is part of the gate.

## Trust boundaries

| Boundary                  | Trust             | Treatment                                                    |
| ------------------------- | ----------------- | ------------------------------------------------------------ |
| Goal from CLI / user      | trusted           | light sanitisation (whitespace, length). Not untrusted web. |
| Model output (tool call)  | **untrusted**     | schema validation; paths constrained to repo; args validated. |
| Generated code            | semi-trusted      | runs in a worktree; `eval/security` scan before commit.      |
| 9router / OMP API         | trusted-but-limited | rate limit via `orch/budget`; fallback via `resil/breaker`. |
| `gh` (PR / CI)            | trusted           | scoped token; only operates on target repo.                  |

## Secret handling

- `NINAROUTER_KEY`, `GITHUB_TOKEN` come **only** from env. Never hardcode or write them into `zhi.config.ts` / repo.
- `eval/security.ts` runs **secret detection** (regex + detector) on `FileChange.after`. When a hit is found → `gatePass=false` + hard auto-fail (mirrors the Security critic floor).
- The ledger (`knowledge/store.ts`) **never** records secrets; `detail` is redacted.
- `.env` is in `.gitignore`; `zhi.config.ts` must not contain secret values.

## Prompt injection

- Tool calls from the model are validated against a closed schema (`ToolCall.name` must be in an allowlist, `args` typed).
- File paths are constrained to inside the target repo (no `../`, `/etc`, `~`). `build/generate` rejects paths outside the worktree.
- No unrestricted exec; shell commands (when required) come from a narrow allowlist (`build`, `test`, `lint`). Not `rm -rf`, not uncontrolled network egress.

## Sandbox

- **v1**: execution happens in an isolated **local git worktree**. The main repo stays safe (separate worktree).
- **Later**: `eval/sandbox.ts` container (read-only FS + seccomp + network egress deny) to run untrusted code (when Zhi eventually takes web / untrusted input).

## Supply chain

- Minimal deps: **only `ink`**. No model SDK (`fetch` is used). Zig WASM is built locally (`native/build.zig`), not downloaded.
- `bun audit` + `npm audit` in the CI gate.

## Failure mode

- Secret detected → loop goes to `RECOVER` (patch) or `abort` if persistent; never commits with secrets.
- Model tries a path outside the repo → `build` rejects + logs to DLQ (category: injection attempt).

## Cross-link

`design/eval.md` (security stage), `design/critic.md` (Security critic), `design/build.md` (path constraint), `design/resil.md` (DLQ), `configuration.md` (env vars), `AGENTS.md` §Security (ECC rule).
