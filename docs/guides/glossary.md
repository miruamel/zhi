# glossary.md — Terms

Istilah Zhi. Pakai konsisten di seluruh docs & kode.

| Istilah               | Makna                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------- |
| **Zhi (志)**          | Nama project: terminal coding agent dengan autonomous-loop engine + multi-critic plant. |
| **Conductor**         | `engine/loop/` — state machine yang menjahit semua modul menjadi satu siklus otonom.    |
| **Loop**              | Satu eksekusi penuh `LoopDriver.run(goal)` dari `INTAKE` sampai `DONE`.                 |
| **Goal**              | Input berbahasa alami dari user (`Goal` di `data-model.md`).                            |
| **Intent**            | Hasil `parseGoal`: action + targets + constraints terstruktur.                          |
| **DAG**               | Directed Acyclic Graph dari `Step`; direncanakan `orch`, dijalankan `loop`.             |
| **Step**              | Satu unit kerja dalam DAG (`generate`/`verify`/`critique`/`eval`/`commit`/`pr`).        |
| **Critic plant**      | `engine/critic/` — 12 kritikus + semantic cache + meta-aggregator Pareto.               |
| **Critic**            | Satu penilai kode (Security/Perf/...). Mengembalikan `CriticScore`.                     |
| **Pareto (weighted)** | Agregasi 12 skor berbobot → keputusan layak-commit (`aggregate`).                       |
| **Floor**             | Skor minimal per kritikus; di bawah → auto-fail (Security floor 0.5).                   |
| **Eval toolchain**    | `engine/eval/` — build/test/SAST/secret/perf/compliance/quality-gate.                   |
| **Gate**              | Keputusan `gatePass`: critic Pareto ∧ eval quality-gate. Penjaga tiap transisi.         |
| **Resilience**        | `engine/resil/` — circuit breaker + retry budget + DLQ + recovery.                      |
| **Bounded retry**     | Maksimal 3 percobaan (`resil/retry.ts`); cegah spin.                                    |
| **DLQ**               | Dead Letter Queue — entry kegagalan final, tercatat + dinotifikasi.                     |
| **Worktree**          | `git worktree` terisolasi; eksekusi terjadi di sini, main repo aman.                    |
| **Ledger**            | `KB/ledger/*.jsonl` append-only; audit trail tiap step.                                 |
| **Semantic cache**    | `critic/cache.ts` — similarity embedding; hindari eksekusi kritikus berulang.           |
| **Tier**              | `heavy                                                                                  | light  | micro`— kelas model; diroute`model/router`.          |
| **Native / WASM**     | `native/*.zig` → `*.wasm` hot path (stream parse, diff, embed).                         |
| **Budget**            | Token total (`Goal.budget`); dialokasikan per step (`orch/budget`).                     |
| **Circuit breaker**   | Buka bila error rate > 50% dalam window; cegah panggilan gagal terus-menerus.           |
| **Abstain**           | Kritikus stub belum diimplementasi; tidak memengaruhi agregasi.                         |
| **DONE(partial)**     | Loop berhenti tanpa goal penuh (budget habis / gagal final) + laporan.                  |
| **Maturity**          | `experimental                                                                           | stable | mature`di`package.json`(lihat`AGENTS.md` §Maturity). |

## Cross-link

`README.md`, `ARCHITECTURE.md`, `design/data-model.md`, `AGENTS.md` §Maturity.
