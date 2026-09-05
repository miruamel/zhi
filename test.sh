#!/usr/bin/env bash
# test.sh — Run tests with optional arguments

set -e

if [ $# -eq 0 ]; then
  echo "=== test: running full suite ==="
  bun run test
else
  echo "=== test: running '$@' ==="
  bun test "$@"
fi
