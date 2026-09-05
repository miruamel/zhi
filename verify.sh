#!/usr/bin/env bash
# verify.sh — Full local verification: clean + install + build + test

set -e

echo "=== verify: clean ==="
rm -rf dist/ native/out/ .zig-cache/ native/.zig-cache/ coverage/ .nyc_output/

echo "=== verify: install ==="
npm ci

echo "=== verify: build ==="
bun run native:build
bun run build

echo "=== verify: gate ==="
bun run gate

echo "=== verify: all passed ==="
