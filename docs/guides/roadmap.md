# roadmap.md — Phased Delivery

Zhi dikirim bertahap. Setiap rilis naik maturity per `AGENTS.md` §Maturity. Experimental `0.y.z`: breaking = minor; minor = batch per milestone.

## v0.1.0 — Experimental (foundation)

**Cakupan:** loop end-to-end single-step happy path + recovery bounded.

- `loop/*` (state machine + pipeline + gatePass + recover wiring).
- `orch/*` (parse, dag, cycle, budget, serial scheduler).
- `build/*` (generate + verify + context; sanitize stub).
- `critic/*` (cache + **Security/Perf/Testing/Style** konkret + aggregate; 8 stub).
- `eval/*` (test + security + gate; sandbox stub/worktree).
- `resil/*` (breaker + retry max-3 + DLQ + recover).
- `knowledge/*` (git worktree + index + commit + ledger; vectors/docs/versions stub).
- `model/*` (router 9router/OMP/local + stream Zig WASM).
- `native/stream/parse.wasm` (Zig).
- `src/cli.ts` + `src/tui/` (ink, viewer tipis).
- Testing: unit + integration loop + e2e dummy repo.

**Exit:** `zhi run "<goal>"` di dummy repo → PR terbuka + CI hijau, tanpa intervensi.

## v0.2.0 — Experimental (depth)

- `orch/scheduler.ts` paralel antar-step — **DITUNDA** (lihat Catatan v0.2.0): `buildDag` hanya hasilkan rantai linier, thus no parallel steps; conflict resolver belum ada (roadmap keliru "sudah ada").
- 8 kritikus sisa naik dari stub → konkret bertahap (Architecture, Doc, DevOps, Privacy, DX, Accessibility, Maintainability, Legal).
- `eval/sandbox.ts` container (untuk kode tak-terpercaya).
- `build/sanitize.ts` (AST/PII/XSS) — bila Zhi terima input web.

### Catatan v0.2.0
- **Parallel scheduler ditunda.** `buildDag` (dag.ts) hanya menghasilkan rantai linier (`s{i}` depends on `s{i-1}`), sehingga tidak ada step independen yang bisa dijalankan paralel. Roadmap menyatakan "conflict resolver sudah ada" — **tidak akurat**: tidak ada conflict resolver di `types.ts`/`dag.ts`/`schedule.ts`. Menambah resolver sekarang = dead code (tidak ada branch untuk di-resolve). Ditunda ke v1.0.0 (Multi-PR orchestration), di mana wave paralel menjadi bermakna.
- **Sandbox container** (`eval/sandbox.ts`) butuh runtime container; belum diprioritaskan di env ini.
- **Sanitize** (`build/sanitize.ts`) bersifat kondisional: hanya bila Zhi menerima input web (AST/PII/XSS). Belum aktif.
- Semua 11 single-file critic + 4 repo-wide hygiene (devops/legal/dx/testing) sudah lulus; testing gap tertutup (PR #23–#28). Kritik `testing` sekarang = 0 findings di `main`.

## v0.3.0 — Experimental → Stable candidate

- `knowledge/vectors.ts` + `native/embed/embed.wasm` → Vector DB + semantic cache (`critic/cache`).
- `knowledge/docs.ts` (KB docs/API) + `knowledge/versions.ts` (OpenAPI history).
- Cross-session learning: ledger dipakai untuk tingkatkan prompt/route.

## v1.0.0 — Stable

- Multi-PR orchestration (N goal paralel, pane TUI).
- Negosiasi review-comment (respon PR review otomatis).
- Memory lintas-sesi penuh + dashboard cost/quality.
- Maturity dideklarasikan `stable` (external consumer / 4–15 packages per `AGENTS.md` §Maturity).

## Catatan

- Setiap minor = batch milestone, bukan 1-fitur-1-minor.
- Major butuh RFC + migration guide + §27 dwell (lihat `AGENTS.md`).
- `EXPLAIN-CHANGES.md` di-update tiap rilis.

## Cross-link

`ARCHITECTURE.md` §8 (v1 scope), `AGENTS.md` §Maturity, `design/*.md`, `testing.md`, `EXPLAIN-CHANGES.md`.
