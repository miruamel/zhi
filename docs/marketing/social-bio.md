# Social Bios — Zhi

> Ready-to-paste short bios for GitHub, X/Twitter, LinkedIn, npm, dev.to, etc.

---

## GitHub repository "About" (350 char max)

### EN
> Autonomous terminal coding agent with a code-grounded gate. 15-critic weighted Pareto + real toolchain (build, test, secret-scan). Goal in, PR out. Bun-native + Zig WASM. MIT licensed, currently experimental.

### ID
> Agent coding terminal otonom dengan gate berbasis kode. 15-kritikus weighted Pareto + toolchain nyata (build, test, secret-scan). Goal masuk, PR keluar. Bun-native + Zig WASM. Lisensi MIT, saat ini experimental.

---

## GitHub repository "Description" (short, ≤150 char)

### EN
> Autonomous terminal coding agent. 15-critic plant, weighted Pareto gate, bounded retry, trunk-based PRs. Bun-native. MIT.

### ID
> Agent coding terminal otonom. 15-kritikus, gate Pareto terbobot, retry terbatas, PR trunk-based. Bun-native. MIT.

---

## GitHub repository "Website" (if any)

`zhi.dev` (planned; not yet live)

---

## GitHub repository "Topics" (≤20 tags)

```
ai-agent
autonomous-agent
bun
code-review
coding-agent
developer-tools
git-worktree
llm
multi-critic
open-source
pareto
pull-request
terminal
typescript
zig
wasm
agentic-engineering
ai-coding
devtools
ci-cd
```

(`gh repo edit --add-topic` to apply, one at a time.)

---

## npm package "Description" (≤250 char)

### EN
> Autonomous terminal coding agent. Plan → execute → critic (15-critic weighted Pareto) → eval (build/test/secret-scan) → commit → PR → CI. Bun-native + Zig WASM. MIT.

### ID
> Agent coding terminal otonom. Plan → eksekusi → kritik (15-kritikus Pareto terbobot) → eval (build/test/secret-scan) → commit → PR → CI. Bun-native + Zig WASM. MIT.

---

## X/Twitter bio (160 char)

### EN
> Zhi (志) — autonomous terminal coding agent. 15-critic gate, bounded retry, trunk-based PRs. Bun + Zig. MIT. github.com/miruamel/zhi

### ID
> Zhi (志) — agent coding terminal otonom. 15-kritikus, retry terbatas, PR trunk-based. Bun + Zig. MIT. github.com/miruamel/zhi

---

## LinkedIn headline (220 char)

### EN
> Building Zhi (志) — an autonomous terminal coding agent with a 15-critic weighted Pareto gate. Bun-native, Zig-WASM hot path, MIT-licensed. Solo project.

### ID
> Bikin Zhi (志) — agent coding terminal otonom dengan 15-kritikus gate Pareto terbobot. Bun-native, hot path Zig-WASM, MIT. Proyek solo.

---

## LinkedIn "About" (2,600 char max)

### EN

Zhi is an open-source autonomous terminal coding agent I built to close the dev loop without babysitting.

Most agent tools today (Claude Code, OMP, Aider, KiloCode, Hermes) are chat wrappers with tool calls. They're great for interactive work, but they don't *finish* the job. Zhi takes a different angle: a state machine `INTAKE → PLAN → ISOLATE → EXECUTE → CRITIQUE → EVALUATE → COMMIT → PR_OPEN → CI_WATCH → DONE`, with every transition guarded by a machine-decidable gate.

The differentiator is a 15-critic plant + weighted Pareto aggregator. Security, perf, architecture, testing, doc, devops, legal, privacy, style, DX, accessibility, maintainability, SLOC, imports, todo — each scores 0..1 with a `reason`, then the gate decides commit-readiness. Bounded retry (max 3) + circuit breaker means the loop can't bleed tokens.

Built with Bun-native TypeScript + a Zig→WASM hot path for SSE parsing. Trunk-based: every change lands as a PR, watched until CI is green.

MIT-licensed. Currently `experimental` maturity. Roadmap to v1.0.0 stable.

### ID

Zhi adalah agent coding terminal otonom open-source yang gw bikin buat nutup loop dev tanpa dijagain.

Kebanyakan tool agent hari ini (Claude Code, OMP, Aider, KiloCode, Hermes) adalah chat wrapper dengan tool call. Bagus untuk kerja interaktif, tapi nggak *selesaikan* tugas. Zhi ambil sudut beda: state machine `INTAKE → PLAN → ISOLATE → EXECUTE → CRITIQUE → EVALUATE → COMMIT → PR_OPEN → CI_WATCH → DONE`, tiap transisi dijaga gate yang machine-decidable.

Pembeda: 15-kritikus + agregator Pareto terbobot. Security, perf, architecture, testing, doc, devops, legal, privacy, style, DX, accessibility, maintainability, SLOC, imports, todo — tiap kritikus skor 0..1 dengan `reason`, gate putus layak-commit. Bounded retry (max 3) + circuit breaker artinya loop nggak bakar token.

Dibikin dengan TypeScript Bun-native + hot path Zig→WASM untuk parse SSE. Trunk-based: tiap perubahan landing sebagai PR, dipantau sampai CI hijau.

Lisensi MIT. Saat ini maturity `experimental`. Roadmap ke v1.0.0 stable.

---

## dev.to / Hashnode article intro (first 200 chars)

> I built Zhi because every "agent" I tried either went silent for 20 minutes or burned $4 of tokens before admitting it failed. Zhi's loop is bounded by design — circuit breaker, retry max-3, dead-letter queue. The agent either finishes, fails loudly, or hands you a clean report.

---

## Email signature

```
Zhi (志) — autonomous terminal coding agent
github.com/miruamel/zhi | npm: @miruamel/zhi
"Goal in, PR out."
```

---

## One-sentence pitch variations (A/B test fodder)

1. "Zhi is the autonomous terminal coding agent that actually closes the dev loop."
2. "Zhi: a coding agent that decides commit-readiness with a 15-critic gate, not vibes."
3. "Zhi runs your coding task from goal to PR, with a code-grounded gate at every transition."
4. "Zhi is what happens when you give a coding agent a state machine + a critic plant + bounded retry."
5. "Zhi: the coding agent that knows when to stop."
6. (ID) "Zhi: agent coding otonom yang tau kapan harus berhenti."

---

## Hashtags (X / LinkedIn)

```
#AIAgent #CodingAgent #AutonomousAgent #DeveloperTools
#TypeScript #Bun #Zig #OpenSource #AgenticEngineering
#LLM #CodeReview #DevTools
```
