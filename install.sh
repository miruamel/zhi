#!/usr/bin/env bash
# install.sh — Install deps + build native artifacts (fast path)

set -e

echo "=== install: dependencies ==="
npm ci

echo "=== install: build native ==="
bun run native:build
bun run build

echo "=== install: done ==="
