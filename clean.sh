#!/usr/bin/env bash
# clean.sh — Remove all build artifacts

set -e

echo "=== clean: removing build artifacts ==="
rm -rf dist/
rm -rf native/out/
rm -rf native/.zig-cache/
rm -rf .zig-cache/
rm -rf node_modules/.cache/
rm -rf .nyc_output/
rm -rf coverage/
echo "=== clean: done ==="
