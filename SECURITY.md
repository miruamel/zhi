# Security Policy

<p align="center">
  <img src="assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%">
</p>

<p align="center">
  <img src="assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%">
</p>


## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅ active          |
| < 0.1   | ❌ end-of-life      |

## Reporting a Vulnerability

**Please do not file a public issue.**

Report privately via one of:

- **GitHub Security Advisory**: <https://github.com/miruamel/zhi/security/advisories/new> (preferred)
- **Email**: security@zhi.dev (when the domain is live)

We aim to:

- **Acknowledge** within 48 hours.
- **Triage** within 7 days.
- **Patch critical CVEs** within 30 days.
- **Credit** the reporter in the release notes (unless you prefer to stay anonymous).

## Scope

The following are in scope:

- Code execution outside the sandbox (e.g. generated code escaping the git worktree).
- Secret leakage into the ledger or the commit history.
- Prompt-injection vectors in the tool-call path.
- Vulnerabilities in `engine/eval/security.ts` (secret detection bypass).
- Vulnerabilities in `native/stream/parse.zig` (memory safety in the WASM hot path).
- Supply chain: typosquatted deps, compromised npm tokens, build-tool RCE.

Out of scope:

- Bugs in third-party model providers (9router, OMP).
- Issues requiring physical access to the user's machine.
- Social-engineering attacks on the user.

## Past advisories

| Date       | CVE / GHSA          | Severity | Description                                                                 | Fixed in |
| ---------- | ------------------- | -------- | --------------------------------------------------------------------------- | -------- |
| 2026-09-02 | CVE-2026-47429      | 9.8 crit | vitest UI server arbitrary file read + write + execute via path traversal  | v0.1.1   |
| 2026-09-02 | (internal)          | high     | npm `NPM_TOKEN` long-lived secret in GitHub repo (compromised in session)   | v0.1.1   |

## Best practices for users

- Never commit a `zhi.config.ts` that contains a secret. Use env vars (`NINAROUTER_KEY`, `GITHUB_TOKEN`).
- Run Zhi only against a repo you trust — generated code can execute in the worktree.
- Cap your budget per task with `--budget <n>` to prevent runaway model spend.
- Review the PR before merging, even when the critic Pareto is green. The gate is necessary, not sufficient.
- Enable `ZHI_AUTO_PR=1` only when you have a scoped `GITHUB_TOKEN`.

## Security-conscious defaults

Zhi ships with the following defaults:

- Worktree isolation: no direct edits to `main`.
- Secret scanning: every `FileChange.after` is grepped for high-confidence secret patterns.
- Closed-schema tool calls: `ToolCall.name` must be in the allowlist, `args` typed.
- Path constraint: `build/generate` rejects `../`, `/etc`, `~`.
- Bounded retry: max 3 attempts, then DLQ.
- Audit trail: every step appended to `KB/ledger/<runId>.jsonl` (secrets redacted).
