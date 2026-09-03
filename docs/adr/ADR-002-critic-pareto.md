# ADR-002: Multi-Critic Weighted Pareto Gate

## Status

Accepted — 2026-08-29

## Context

- Zhi menilai hasil generate lewat 15 kritikus. Keputusan layak-commit tidak boleh bergantung pada satu model call (vibes). Perlu agregasi terukur yang: (a) menolak keras kerentanan, (b) menghargai trade-off antar-dimensi (Pareto), (c) toleran terhadap kritikus yang belum diimplementasi (stub → abstain).

## Decision

1. Tiap kritikus mengembalikan `CriticScore { value: 0..1, abstain?: boolean, reason }`.
2. **Security floor**: bila Security < 0.5 → auto-fail, abaikan Pareto.
3. **Weighted Pareto**: `pass` bila tidak ada kritikus konkret di bawah floor (0.4) DAN rata-rata berbobot ≥ 0.7.
4. **Bobot default** (v1): Security 0.25, Perf 0.15, Testing 0.20, Style 0.10, sisanya 0.30 dibagi rata pada kritikus konkret.
5. **Abstain**: kritikus stub (belum diimplementasi) tidak memengaruhi agregasi; bila SEMUA abstain → `aggregate` fallback ke `eval/gate.ts`.
6. Bobot dapat disesuaikan dari hasil eval (`EVALUATE → C4` feedback, lihat `ARCHITECTURE.md` §4).

## Consequences

- **+** Keputusan terukur & dapat di-audit (setiap skor punya `reason`).
- **+** Trade-off diterima: mis. perf turun sedikit tapi security naik tetap bisa `pass`.
- **+** Stub aman: tidak memblokir v1, naik bertahap.
- **-** Threshold (0.4/0.7) perlu kalibrasi empiris saat v1 jalan; rawan false-negative di awal.
- **-** Pareto mahal bila semua 15 konkret (belakangan) — butuh caching (`critic/cache.ts`).

## References

- `docs/design/critic.md` §Threshold, §12 Kritikus
- `docs/ARCHITECTURE.md` §3, §4
- `engine/critic/aggregate.ts` (implementasi)
