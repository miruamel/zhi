#!/usr/bin/env bash
# build.sh — Build TypeScript + native WASM

set -e

echo "=== build: WASM ==="
bun run native:build

echo "=== build: TypeScript ==="
bun run build

echo "=== build: done ==="
