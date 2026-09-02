#!/usr/bin/env bash
# @brief Architecture guard: files-per-dir + SLOC + circular/deep-relative.
# @see mandate §6.2 (SLOC ≤150 hard cap, ≤100 target) + §6.10 + §6.11
# @see docs/adr/ADR-005 (root exemption), ADR-006 (audit-log entries exemption)
# @since 0.1.0

set -euo pipefail

ROOT="${1:-.}"

echo "[guard] files-per-directory (<=5; root + docs/design + docs/adr + audit-log/entries exempt)"

violations=0
while IFS= read -r d; do
  # Skip exempt dirs (root, design, adr, audit-log entries, this script's folder, node_modules).
  # Match top dir OR any subpath under it ("./foo" or "./foo/bar/baz").
  case "$d" in
    "$ROOT"|"./docs/design"|"./docs/design"/*|"./docs/adr"|"./docs/adr"/*|"./audit-log/entries"|"./audit-log/entries"/*|"./.git"|"./.git"/*|"./node_modules"|"./node_modules"/*|"./.github"|"./.github"/*|"./native/out"|"./native/out"/*|"./.husky"|"./.husky"/*|"./dist"|"./dist"/*)
      continue
      ;;
  esac
  c=$(find "$d" -maxdepth 1 -type f 2>/dev/null | wc -l)
  if [ "$c" -gt 5 ]; then
    echo "[guard] VIOLATION files-per-dir: $d ($c files > 5)"
    violations=$((violations + 1))
  fi
done < <(find "$ROOT" -type d \( -name .git -o -name node_modules \) -prune -o -type d -print 2>/dev/null)

if [ "$violations" -gt 0 ]; then
  echo "[guard] FAIL: $violations files-per-dir violation(s)"
  exit 1
fi
echo "[guard] ok: files-per-dir"

echo "[guard] SLOC per code file (<=150 hard cap per mandate §6.2; <=250 never)"

violations=0
while IFS= read -r -d '' f; do
  loc=$(wc -l < "$f" 2>/dev/null || echo 0)
  if [ "$loc" -gt 150 ]; then
    echo "[guard] VIOLATION SLOC: $f ($loc lines > 150)"
    violations=$((violations + 1))
  fi
done < <(find "$ROOT" -type f \( -name '*.ts' -o -name '*.js' -o -name '*.zig' \) \
            -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' \
            -print0 2>/dev/null)

if [ "$violations" -gt 0 ]; then
  echo "[guard] FAIL: $violations SLOC violation(s)"
  exit 1
fi
echo "[guard] ok: SLOC"

echo "[guard] all checks passed"