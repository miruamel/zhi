# ADR-003: Bounded Resilience Budget

## Status

Accepted — 2026-08-29

## Context

Loop otonom berisiko **spin**: gagal → coba lagi → gagal, menghabiskan token tanpa progres. Chat-wrapper klasik tidak punya rem. Zhi butuh recovery terbatas yang: (a) cegah retry tak terbatas, (b) klasifikasi error → strategi tepat, (c) tidak diam-diam buang kegagalan.

## Decision

1. **Circuit Breaker**: buka (tolak eksekusi) bila error rate > 50% dalam window N panggilan.
2. **Retry Budget**: maksimal **3** percobaan per operasi gagal, lalu masuk **Dead Letter Queue** (DLQ).
3. **DLQ**: entry gagal final tercatat + dinotifikasi ke `tui`, tidak dibuang diam-diam.
4. **Recovery Strategies** (dipilih dari klasifikasi error):
   - `replan` — goal ambigu / siklus DAG → `orch` dari awal.
   - `patch` — test/syntax gagal → `build` ulang dengan error context.
   - `abort` — budget habis / fatal → `DONE(PARTIAL)` + laporan.
5. **Budget habis** di mana pun → `RECOVER` → `abort` (tidak lanjut spin).

## Consequences

- **+** Loop selalu berhenti dalam waktu terbatas (bounded oleh retry×3 + budget).
- **+** Kegagalan terlihat (DLQ + laporan), bukan hilang.
- **+** Strategi tepat: tidak semua error butuh replan.
- **-** `max-3` bisa terlalu rendah untuk task sangat kompleks; dapat dinaikkan via config bila empiris butuh.
- **-** DLQ butuh consumer (alert/UI) agar tidak menumpuk.

## References

- `docs/design/resil.md` §Strategi recovery, §Edge cases
- `docs/ARCHITECTURE.md` §3, §4
- `engine/resil/retry.ts`, `engine/resil/recover.ts`
