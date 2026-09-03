# Use Cases — Zhi (non-technical)

<p align="center">  <img src="../../assets/doc-header.svg" alt="Zhi (志) — autonomous coding agent" width="100%"></p>
<p align="center">  <img src="../../assets/glyphs.svg" alt="PLAN · BUILD · CRITIQUE · EVAL · COMMIT · DONE" width="80%"></p>

> Concrete, story-shaped use cases. For blog posts, README examples, sales conversations, and onboarding.

---

## 1. The "Add email validation" demo (the canonical 10-minute task)

**Persona:** Sarah, backend engineer at a 3-person startup. She has a 4-week-old auth file that doesn't validate email format. It's on her backlog. Always has been.

**Before Zhi:** She opens VS Code, writes the regex, writes 2 tests, runs them, makes a commit, opens a PR, waits for CI, reviews the diff, merges. 30 minutes of context switches.

**With Zhi:**
```
$ zhi run "add email validation in auth.ts, tests green, open PR"
[INTAKE] goal: add email validation in auth.ts, tests green, open PR
[PLAN] 3 steps: generate → test → commit+pr
[ISOLATE] worktree ./.zhi/wt-a1b2c3/
[EXECUTE] generated auth.ts (24 lines), auth.test.ts (12 cases)
[CRITIQUE] security 0.92 · perf 0.80 · testing 0.85 · avg 0.84 → PASS
[EVALUATE] build 320ms · test 1.2s · security 0 find · gate 0.84 → PASS
[COMMIT] feat/email-validation @ 8c3a2f1
[PR_OPEN] github.com/sarah/myapp/pull/42
[CI_WATCH] running... ✓
[DONE] 71,400 tokens · 8m 12s
```

Sarah is back from coffee. The PR is in her inbox.

---

## 2. The "Bump all dev deps" chore

**Persona:** Alex, platform engineer. Dependabot opened 14 PRs last week; he's been ignoring them. Some are 2 majors behind.

**Before Zhi:** He bumps them one at a time, runs tests, fixes the type errors, repeats. 2 hours, lots of context switches, ends up reverting 3.

**With Zhi:**
```
$ zhi run "bump all dev deps to latest, fix type errors, tests green, single PR"
```

Zhi's loop:
- Bumps each dep in turn
- Runs `bun test` after each bump
- If a type error appears, generates a patch (bounded retry max 3)
- Aggregates into one PR with a clean changelog-style commit message

If something genuinely can't be fixed in 3 attempts → DLQ entry → Alex gets a clear report of which dep + which error. He decides whether to bump manually or roll back.

---

## 3. The "Migrate this folder" mechanical refactor

**Persona:** Mei, full-stack dev. The team decided to rename `engine/foo/` to `engine/bar/`. 47 files import from it. Nobody wants to do it.

**Before Zhi:** Rename the folder, fix 47 imports, miss 3, ship a broken build at 6pm Friday, roll back.

**With Zhi:**
```
$ zhi run "rename engine/foo to engine/bar, update all imports, tests green, no circular dep"
```

Zhi's **architecture critic** (weight 1.5) blocks the PR if any illegal layer edge appears. The result is a single PR with the rename + a clean dependency graph.

---

## 4. The "Write the changelog" task

**Persona:** Jordan, maintainer of an open-source library. Releases every Friday. Hates writing CHANGES.md.

**Before Zhi:** Scrolls through `git log`, writes 4 bullets, forgets a breaking change, gets an issue filed.

**With Zhi:**
```
$ zhi run "summarize the last 10 commits into CHANGES.md [Unreleased] section, Keep a Changelog format"
```

Zhi reads the ledger, finds the breaking changes, drafts the entry, opens a PR. Jordan reviews the diff and merges.

---

## 5. The "Audit before the v-bump" check

**Persona:** Priya, tech lead. She's about to tag v1.0.0. Wants to know if LICENSE is present, CI is configured, README is complete, every source has a test.

**Before Zhi:** 30 minutes of `ls` + `cat` + `grep` + mental checklist.

**With Zhi:**
```
$ bun run cli critique:repo
[devops] 1.0 — CI config + .gitignore present
[legal]  1.0 — LICENSE + README.md present
[dx]     0.8 — AGENTS.md + test script present
[testing] 0.6 — 3 source files without test sibling
avg 0.85 → PASS
```

She fixes the 3 missing tests, then tags v1.0.0 with confidence.

---

## 6. The "Run while I sleep" pattern

**Persona:** Carlos, indie hacker. He has 12 boring PRs queued: add `alt` to 47 images, fix 9 console.logs, write 12 missing tests, bump 4 deps.

**Before Zhi:** He does them over 3 weekends, gets bored, ships 4.

**With Zhi:**
```
$ for task in "fix images without alt" "remove console.log from src/" "add tests for engine/foo" ...; do
    zhi run "$task" --base main
  done
```

He wakes up to 12 PRs. Some passed the gate, some are in DLQ. He reviews the DLQ list (a one-line summary per failed task) and decides which to retry.

---

## 7. The "Onboard a new dev" pattern

**Persona:** Lin, senior engineer. New hire starts Monday. Wants them shipping small PRs by Wednesday.

**Before Zhi:** Pair for 2 days, then hand them a backlog of "easy" tickets. Tickets aren't actually easy.

**With Zhi:**
- Day 1: New hire runs `zhi run "add a hello-world CLI subcommand"`. Sees the full loop. Reads the critic output. Asks "why did security score 0.92 here?"
- Day 2: New hire runs `zhi run critique:repo`. Sees the gaps. Asks "why is testing at 0.6?"
- Day 3: New hire is patching real code, with Zhi as a safety net.

The loop is the documentation.

---

## 8. The "Cost cap" pattern

**Persona:** Dana, eng manager. She needs to give 5 devs access to a coding agent but has a $200/month model budget.

**Before Zhi:** Trust + pray. Hope nobody runs Claude Code on a 500k-token task.

**With Zhi:**
```bash
# Per-invocation cap
zhi run "fix the lint errors" --budget 50000 --tier light

# In CI: assert budget
if [ "$tokens_used" -gt 100000 ]; then
  echo "Budget exceeded, escalating to human"
  exit 1
fi
```

Zhi's `model/router` enforces the budget mid-loop. If a step would exceed the remaining budget, the loop **stops** with `DONE(partial) + report`. No surprise $50 invoice.

---

## How to talk about these (sales / blog patterns)

- **"Goal in, PR out"** — the one-liner for the 10-minute task.
- **"Bounded by design"** — the safety net story.
- **"Code-grounded gate"** — the differentiator from vibes-based agents.
- **"Trunk-based, worktree-isolated"** — the safety story for skeptical eng managers.
- **"Audit trail in the ledger"** — the compliance story.
- **"Cost cap per task"** — the budget story.
