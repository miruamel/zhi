# testing.md — Testing Strategy

Zhi sendiri harus teruji sebelum bisa menjalankan loop terpercaya. Strategi: unit (fungsi murni) + integration (loop dengan modul palsu) + e2e (repo dummy).

## Prinsip

- **Gate yang di-enforce harus di-test**: `gatePass`, `aggregate` Pareto, `retry` budget, `cycle` detect — punya test yang gagal pada bug masuk akal.
- **Modul di-injeksi**: `loop/wiring/handlers.ts` menerima `LoopCtx` (semua modul). Integration test pasang **fake** modul untuk isolasi.
- **Deterministik**: test tidak bergantung model nyata (pakai stub `model/router` yang return fixture).
- Target coverage **80%** (sama dengan eval gate yang Zhi enforce).

## Unit (per modul)

| Modul | Yang di-test |
|---|---|
| `loop/states.ts` | `gatePass` benar tolak bila critic/eval gagal; terima bila lolos. |
| `orch/dag.ts` | cycle detect pada DAG siklus; topo sort benar. |
| `orch/budget.ts` | alokasi proporsional; potong bila budget < minimal. |
| `critic/aggregate.ts` | Security floor auto-fail; abstain fallback; avg ≥0.7 pass. |
| `critic/critics.ts` | stub return `abstain`; konkret (Security/Perf/Testing/Style) skor masuk akal. |
| `eval/gate.ts` | `gatePass = build∧test∧secret∧lint∧coverage≥0.8`. |
| `resil/retry.ts` | retry max-3 lalu DLQ; breaker buka bila error rate >0.5. |
| `resil/recover.ts` | klasifikasi error → strategi tepat (replan/patch/abort). |
| `knowledge/git.ts` | worktree terisolasi; commit di worktree bukan main. |
| `model/router.ts` | route tier benar; fallback ke tier bawah bila backend down. |

## Integration (loop)

- `loop/driver.ts` di-test dengan `LoopCtx` berisi **fake** `orch/build/critic/eval/resil/knowledge/model`.
- Skenario: happy path → `LoopReport.status==='done'` + `prUrl`.
- Skenario: test fail → `resil` patch → pass (bounded).
- Skenario: test fail ×3 → DLQ → `DONE(partial)`.
- Skenario: CI fail → EXECUTE ulang → pass.
- Skenario: budget habis → `DONE(partial)`.

## E2E (dummy repo)

- Repo dummy (`fixtures/dummy-app`) dengan test yang bisa dibuat merah/hijau.
- `zhi run "tambah validasi email, test hijau, buka PR" --dry-run=false` di fixture → assert PR terbuka + CI hijau.
- Di-jalankan di CI (butuh `GITHUB_TOKEN` + 9router key → pakai repo sandbox).

## Framework

- **`bun test`** (tanpa dep tambahan). Fixture di `engine/**/__fixtures__/`.
- Tidak pakai framework berat; assert bawaan bun.

## Cross-link

`design/loop.md`, `design/orch.md`, `design/critic.md`, `design/eval.md`, `design/resil.md`, `design/knowledge.md`, `design/model.md`, `configuration.md` (scripts.test), `AGENTS.md` §Verification.
