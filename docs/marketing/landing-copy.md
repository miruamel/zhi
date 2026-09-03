# Landing Page Copy — zhi.dev (planned)

> Bilingual copy for a future marketing site. EN primary, ID secondary. Tone: technical-but-human, no marketing fluff.

---

## Hero

### EN

**Headline**
> Autonomous coding agent. Goal in, PR out.

**Subhead**
> Zhi takes a plain-English goal, plans it as a DAG, executes in an isolated git worktree, scores the result through 15 critics and a real toolchain (build, test, secret-scan), then commits, opens a PR, and watches CI. Standalone. No babysitting.

**Primary CTA**: `bun add -g @miruamel/zhi` then `zhi run "your goal"`.
**Secondary CTA**: `Read the docs →`

### ID

**Headline**
> Agent coding otonom. Goal masuk, PR keluar.

**Subhead**
> Zhi ambil goal bahasa alami, rencana sebagai DAG, eksekusi di git worktree terisolasi, nilai lewat 15 kritikus + toolchain nyata (build, test, secret-scan), commit, buka PR, pantau CI. Mandiri. Tanpa dijagain tiap langkah.

**CTA utama**: `bun add -g @miruamel/zhi` lalu `zhi run "goal lo"`.
**CTA sekunder**: `Baca docs →`

---

## Problem section

### EN

> Most agent loops either go silent for 20 minutes or burn $4 of tokens before they tell you it failed. Zhi's loop is **bounded by design** — circuit breaker, retry max-3, DLQ. The agent either finishes, fails loudly, or hands you a clean report. No spin.

### ID

> Kebanyakan loop agent diam 20 menit atau bakar $4 token sebelum bilang gagal. Loop Zhi **terbatas by design** — circuit breaker, retry max-3, DLQ. Agent selesaikan, gagal keras, atau kasih lo laporan rapi. Tanpa spin.

---

## How it works (3-step)

### EN

1. **Goal in** — `zhi run "add email validation in auth.ts, tests green, open PR"`
2. **Loop runs** — INTAKE → PLAN → ISOLATE → EXECUTE → CRITIQUE → EVALUATE → COMMIT → PR → CI → DONE.
3. **PR out** — TUI shows the green banner, you get the PR link.

Every transition is guarded by a **machine-decidable gate** (15 critics + real toolchain). If a step fails, the loop recovers with bounded retry or stops with a clear report.

### ID

1. **Goal masuk** — `zhi run "tambah validasi email di auth.ts, test hijau, buka PR"`
2. **Loop jalan** — INTAKE → PLAN → ISOLATE → EXECUTE → CRITIQUE → EVALUATE → COMMIT → PR → CI → DONE.
3. **PR keluar** — TUI tampil banner hijau, lo dapat link PR.

Tiap transisi dijaga **gate yang machine-decidable** (15 kritikus + toolchain nyata). Kalau step gagal, loop recover dengan retry terbatas atau berhenti dengan laporan jelas.

---

## Features (6-bullet grid)

| Feature                          | What it does                                                | Why you care                              |
| -------------------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| 15-critic plant                  | Security, perf, architecture, testing, doc, devops, …       | Honest PRs, no vibes-based merge          |
| Weighted Pareto gate             | Aggregates critics, respects floors, abstains when unsure  | Trade-offs without false-negatives        |
| Bounded retry                    | Max 3 attempts, then DLQ                                    | Can't burn $20 in a loop                  |
| Git worktree isolation           | Main repo untouched until gate passes                      | Safe to run on prod code                  |
| Trunk-based PR + CI watch        | `gh pr create` + `gh run watch`                            | Same workflow as a human PR               |
| Bun-native + Zig WASM            | TypeScript end-to-end, Zig for SSE parse                   | Fast + deterministic                      |

---

## FAQ

### Is this just another chat wrapper?

No. Chat wrappers (Claude Code, OMP, Aider in chat mode) respond to your prompts. Zhi runs a **state machine** that takes a goal and runs until done or a hard fail. It does not wait for you between steps.

### Does it run in the cloud?

No. Zhi is a **local CLI**. Your code never leaves your machine. The only network egress is to your model provider (9router, OMP, or local) and `gh` for PR/CI.

### Will it edit my main branch directly?

**No.** Zhi always works in an isolated git worktree (`./.zhi/wt-<runId>/`). Your main branch is only touched when the gate passes and you merge the PR.

### How much does it cost?

Zhi itself is **MIT-licensed and free**. You pay your model provider (9router, OMP, or local). Zhi's `model/router` lets you cap spend per task and route cheap models to cheap work.

### What's the minimum Bun + Git version?

- Bun `>= 1.4.0`
- Git `>= 2.30` (worktree support)
- Node not required (Bun replaces it)

### Can I use it without giving it GitHub access?

Yes. The default mode is **offline** — Zhi runs the loop locally and produces a `LoopReport` JSON. To get real PRs + CI watch, set `ZHI_AUTO_PR=1` and provide a `GITHUB_TOKEN`.

### What languages does it support?

Currently **TypeScript / JavaScript** (Bun-native). Other languages are not on the v1.0.0 roadmap.

### How do I know it's safe to merge a Zhi PR?

Each PR carries:
- The critic Pareto score (`weightedAvg`, per-critic breakdown)
- The eval report (build, test, security, gate)
- The full ledger (`KB/ledger/<runId>.jsonl`)

If any of those look off, you can `git revert` the PR and ask Zhi to retry with more context.

### Does it work on private repos?

Yes. Zhi operates against your local clone, so it works with any repo you can `git clone` — public, private, monorepo, worktree, submodules.

### What's the catch?

It's **experimental** (`maturity: experimental` in `package.json`). Expect rough edges, missing docs, and the occasional bug. v1.0.0 is the stability milestone.

---

## Pricing (planned)

| Tier    | What you get                                     | Cost    |
| ------- | ------------------------------------------------ | ------- |
| Local   | Full source, all features, MIT                   | Free    |
| Team    | (planned) shared ledger, worktree pool, queue    | TBD     |
| Hosted  | (planned) zero-setup SaaS, per-token billing     | TBD     |

---

## Footer CTAs

- ⭐ Star on GitHub → `github.com/miruamel/zhi`
- 📦 Install: `bun add -g @miruamel/zhi`
- 📖 Docs: `github.com/miruamel/zhi/tree/main/docs`
- 🐛 Issues: `github.com/miruamel/zhi/issues`
- 🔒 Security: see `SECURITY.md` (private reporting)
