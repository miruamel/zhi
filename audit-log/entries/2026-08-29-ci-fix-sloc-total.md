# Audit — 2026-08-29 — CI fix: SLOC guard false-positive on wc total

## Trigger

CI `architecture-guard` merah pada run `33250634874` setelah commit `engine/resil`. Log: `VIOLATION SLOC: total`.

## Root cause

SLOC guard menjalankan `wc -l` atas banyak file → GNU wc mencetak baris ringkasan `NNN total` di mana `$1=NNN` (total baris), `$2="total"`. Bila total >200, `awk '$1>200'` memicu false-positive pada baris ringkasan (bukan file nyata). Commit loop (2 file, total <200) lulus; commit resil (7 file, total >200) gagal.

## Actions

1. Filter baris ringkasan: `awk '$2 != "total" && $1>200{...}'` — hanya file nyata yang dicek.
2. Commit + push; CI harus hijau.

## Verification

- Setelah perbaikan: hanya file `.ts/.js/.zig` individual yang dicek; baris `total` diabaikan.

## Status

CI guard dikoreksi (false-positive wc total). Commit: `fix(ci): ignore wc total line in SLOC guard`.
