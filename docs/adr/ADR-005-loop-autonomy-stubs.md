# ADR-005: Loop Autonomy Stubs (ISOLATE / PR_OPEN / CI_WATCH)

## Status

Proposed — 2026-08-29

## Context

Loop (`engine/loop`) menjalankan PLAN → EXECUTE → EVALUATE → … → DONE di lokal, tapi tidak bisa mengisolasi kerja ke branch, membuka PR, atau memantau CI. MANDAT OPERASIONAL 7.0 §3 memberi wewenang penuh atas branch/PR/CI; flow harus trunk-based (§5.2) dan transparan (§3). Rencana awal menunda `ISOLATE`/`PR_OPEN`/`CI_WATCH` ke milestone terpisah.

Tanpa stub ini, loop hanya sampai DONE lokal — tidak ada PR/CI, melanggar wewenang otonom dan §5.2 (semua lewat PR + CI).

## Decision

1. **Tiga ops opsional di `LoopDeps`** (deterministik, tanpa LLM):
   - `isolate?(): string` — buat branch dari `main` (mis. `feat/<slug>`), return nama branch.
   - `prOpen?(title: string, body: string): string` — buka PR via `gh` CLI, return URL.
   - `ciWatch?(runId: string): 'green' | 'red' | 'pending'` — poll status CI via `gh` API.
2. **Wire ke state loop**: setelah EXECUTE + VERIFY ok → `ISOLATE` → `PR_OPEN` → `CI_WATCH`; CI green → `DONE`; CI red → `RECOVER` + catat.
3. **Semua git/gh ops lewat wrapper CLI** (`git`/`gh`), deterministik, egress-aware. Tidak ada LLM di jalur ini.
4. **Ops tetap opsional** di `LoopDeps` (integration test bangun tanpa mereka) — pola sama dengan `compress`.

## Consequences

- **+** Loop self-merge PR trunk-based (eksekutif otonom nyata).
- **+** Transparansi: setiap event branch/PR/CI tercatat (§3).
- **-** Butuh egress untuk `git push` / `gh` API; bila down → mode hold (§2.4).
- **-** Risiko proliferasi branch; dibatasi §2.3 (≤10 branch/hari, hapus merged >14 hari).

## References

- MANDAT OPERASIONAL 7.0 §3, §5.2, §2.4
- `AGENTS.md` (layer-first, LoopDeps signature pinned)
- `engine/loop/wiring/handlers.ts` (state machine)
- Rencana awal: stub `ISOLATE`/`PR_OPEN`/`CI_WATCH` ditunda ke milestone ini
