# BUSINESS.md — Zhi (志)

<p align="center">
  <img src="assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%">
</p>

<p align="center">
  <img src="assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%">
</p>

> Marketing, positioning, and product strategy for Zhi. Source-of-truth for one-liners, value prop, and go-to-market. Bilingual: English primary, Indonesian secondary.

---

## TL;DR (one-liners)

**EN — pitch (Twitter / GitHub social preview):**

> Zhi is the autonomous terminal coding agent that actually closes the dev loop. 15-critic plant, weighted Pareto gate, bounded retry, real PRs — without you babysitting every step.

**EN — long (README hero):**

> Zhi takes a goal in plain English, plans it as a DAG, executes in an isolated git worktree, scores the result through 15 critics + a real toolchain (build, test, secret-scan), then commits, opens a PR, and watches CI — standing on its own until the goal is met.

**ID — ringkas (untuk komunitas ID):**

> Zhi: agent coding terminal otonom. Goal bahasa alami → plan → eksekusi di worktree → 15 kritikus + toolchain nyata → commit → PR → CI hijau. Tanpa intervensi tiap langkah.

**EN — 12-word elevator:**

> Autonomous terminal coding agent. Goal in, PR out. Gate-based, not vibe-based.

---

## What Zhi is (positioning)

Zhi sits in the **terminal coding agent** category alongside Claude Code, OMP, OpenCode, Aider, KiloCode, and Hermes — but it picks a different sharp angle.

| Competitor      | Default model         | Loop style                 | PR/CI integration         | Differentiator                                    |
| --------------- | --------------------- | -------------------------- | ------------------------- | ------------------------------------------------- |
| **Claude Code** | Anthropic             | Interactive + agentic      | Optional                  | Anthropic quality, chat-first                     |
| **OMP**         | OpenAI / Anthropic    | Interactive + agentic      | Optional                  | Multi-model, cost-aware                           |
| **OpenCode**    | Open source models    | Interactive                | Optional                  | OSS, BYO model                                    |
| **Aider**       | OpenAI / Anthropic    | Pair-programming           | Optional                  | Repo map, git-native                              |
| **KiloCode**    | Any                   | Interactive                | Optional                  | VS Code integration                               |
| **Hermes**      | Any                   | Open agent                 | Optional                  | Configurable agents                               |
| **Zhi**         | 9router / OMP / local | **Autonomous loop + gate** | **Built-in, trunk-based** | **Code-grounded gate, 15 critics, bounded retry** |

**Positioning statement:**

> For software teams that want a coding agent to actually finish the job, Zhi is the terminal coding agent with a code-grounded gate (15-critic weighted Pareto + real toolchain) — unlike Claude Code/OMP/Aider which are chat-first and rely on vibes to decide commit-readiness.

---

## Ideal Customer Profile (ICP)

### Primary ICP — Solo developer or small team (1–5 engineers)

- Building/maintaining a **TypeScript or JavaScript** codebase (Zhi is Bun-native, TS-first).
- Already uses `git` + PRs + CI on GitHub.
- Has a **backlog of small, well-defined tasks** (add validation, write tests, fix lint, migrate imports, bump deps).
- **Does not want** to manually run a 12-step agentic loop 5 times a day.
- Cost-sensitive — wants to **cap token spend per task** and **route cheap models to cheap work**.

### Secondary ICP — Platform/infra team (5–20 engineers)

- Wants a **local CI helper** that runs against a worktree and never touches `main` until the gate passes.
- Cares about **audit trails** (KB/ledger/*.jsonl), **secret scanning**, and **reviewable PRs**.
- Can integrate via the `bun run cli` exit code + JSON report.

### Anti-ICP (when NOT to use Zhi)

- You need a **GUI / IDE plugin** — Zhi is terminal-only (ink TUI is read-only, no inline editor).
- You're working in **languages other than TS/JS** (Zhi's generate + critic are TS-shaped; other languages are not yet supported).
- You need **unbounded autonomy** (Zhi enforces a retry max-3 + circuit breaker on purpose — it will stop and ask, not spin).

---

## Use cases (concrete, non-technical)

These are stories you'd tell a friend, not an engineer.

### 1. "Add email validation to my auth file" (the canonical demo)

You say: `zhi run "add email validation in auth.ts, tests green, open PR"`.

Zhi does:

1. Parses the goal, plans a 3-step DAG (generate → test → PR).
2. Makes a git worktree at `.zhi/wt-abc123/`.
3. Generates `auth.ts` + `auth.test.ts`, runs `bun test`, scans for secrets.
4. Scores with 15 critics (security 0.92, perf 0.80, style 0.85, …).
5. Commits to `feat/email-validation`, opens PR #42, watches CI.
6. Tells you: "PR #42 opened, CI green, 71k tokens used."

You walked away 10 minutes ago.

### 2. "Migrate this imports folder to the new path"

A boring, mechanical refactor. The kind of thing you keep postponing.

You say: `zhi run "migrate engine/foo to engine/bar, all tests pass, no circular dep"`.

Zhi: DAG plans the rename across all call sites → executes in worktree → arch critic (weight 1.5) blocks if any illegal layer edge appears → opens the PR with the diff.

### 3. "Bump all the dev deps and fix the breakage"

`zhi run "bump all dev deps to latest, fix type errors, tests green"`.

Zhi: bounded retry means if a bump cascades into 5 type errors, it patches one at a time, re-evaluates, and stops at max-3 attempts with a DLQ entry you can review.

### 4. "Write a CHANGES entry for this release"

`zhi run "summarize the last 10 commits into CHANGES.md [Unreleased] section, Keep a Changelog format"`.

Zhi: reads the ledger, drafts the entry, opens a PR with the changelog-only change.

### 5. "Audit this repo for hygiene"

`zhi run cli critique:repo` → runs DevOps / Legal / DX / Testing critics on the repo root → prints a scored report → you fix the gaps before tagging a release.

---

## Pricing model (proposed, not yet enforced)

Zhi is currently **MIT-licensed, free, single-binary**. There is no pricing yet.

| Tier   | What you get                                   | Who it's for                                | Cost |
| ------ | ---------------------------------------------- | ------------------------------------------- | ---- |
| Local  | Full source, all features, run on your machine | Solo / hobbyist                             | Free |
| Team   | (planned) shared ledger, worktree pool, queue  | Small teams (5–20)                          | TBD  |
| Hosted | (planned) zero-setup SaaS, per-token billing   | Anyone who doesn't want to set up Bun + Zig | TBD  |

**Why free for now:** the loop, the gate, and the critic plant are the differentiator. Distribution > monetization until v1.0.0 stable.

---

## Value Proposition Canvas

| Pains (today)                                                                  | Gains (with Zhi)                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| "I started an agentic loop 20 min ago, it went sideways, I lost $4 of tokens." | Bounded retry (max 3) + circuit breaker. You can't bleed.           |
| "The agent made a change but I'm not sure it's safe to merge."                 | 15-critic weighted Pareto + real toolchain (test, secret-scan).     |
| "I want the agent to do boring PRs while I sleep."                             | Trunk-based: worktree → PR → CI watch → done. Truly hands-off.      |
| "I can't audit what the agent did."                                            | Append-only ledger (`KB/ledger/*.jsonl`) per step.                  |
| "Every agent wants a different model and I want to A/B."                       | `model/router` with 9router / OMP / local + tier heavy/light/micro. |

---

## Channels (where to find / talk about Zhi)

- GitHub: `github.com/miruamel/zhi` (primary — code, issues, releases, discussions)
- npm: `@miruamel/zhi` (install + provenance)
- Discussions / RFCs: GitHub Discussions (planned — currently issues only)

**Not on (yet):** Twitter/X, LinkedIn, Discord, blog. The project is **experimental** (`maturity: experimental` in `package.json`) and we don't have a content pipeline.

---

## Competitive moat (what's hard to copy)

1. **The 15-critic plant as one cohesive unit** — most agents have 1-2 critics (security, perf). Zhi bundles 15 + a weighted Pareto aggregator with floors + abstain semantics.
2. **The autonomous loop with bounded retry** — easy to build a chat loop, hard to build one that _stops_ correctly. Zhi's `resil/` is the most-tested module.
3. **Bun-native + Zig WASM** — the SSE parser is in Zig, called via a thin TS bridge. Cheaper + more deterministic than pure-TS competitors.
4. **Atomic refactor discipline** — ≤4 files/folder, ≤200 SLOC/file, vertical nesting. The codebase stays readable as it grows. Competitors that don't enforce this end up with god files.

---

## Roadmap to v1.0.0 (stable) — business lens

| Milestone | What unlocks                                       | User-visible delta                     |
| --------- | -------------------------------------------------- | -------------------------------------- |
| v0.2.0    | All 15 critics concrete (currently 15/15 done)     | Honest PRs, no `// FIXME: critic stub` |
| v0.3.0    | Knowledge: VectorStore (graduated), semantic cache | Critic "learns" from prior runs        |
| v1.0.0    | Multi-PR orchestration                             | Queue N goals, parallel TUI pane       |

The honest pitch: **v0.1.x is for people who like to live on the edge of the agent space.** v1.0.0 is for teams who want a stable tool to delegate to.

---

## Open questions (ask the user / community)

- [ ] Should Zhi ship a hosted SaaS? (currently no.)
- [ ] Should the multi-PR pane be in v1.0.0 or v1.1? (currently v1.0.0.)
- [ ] Should Zhi support languages other than TS/JS? (currently no — generate/critic are TS-shaped.)
- [ ] Is the 80% coverage gate too strict? (currently enforced.)
- [ ] Is the Security floor 0.5 the right number? (currently 0.5, tunable.)
