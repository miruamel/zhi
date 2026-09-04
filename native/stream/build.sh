#!/usr/bin/env bash
# Build native/stream → native/out/stream.wasm (gitignored).
# NOTE: `zig build` runner hangs in this environment; use direct build-lib.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p ../out

# Honor ZIG_BIN if set (CI exports it); fall back to probe loop otherwise.
ZIG_BIN="${ZIG_BIN:-}"
if [ -n "$ZIG_BIN" ] && [ -x "$ZIG_BIN" ]; then
  rm -f ../out/stream.wasm
  if "$ZIG_BIN" build-lib parse.zig \
      -target wasm32-freestanding \
      -O ReleaseSmall \
      -fPIC \
      -femit-bin=../out/stream.wasm 2>/dev/null; then
    echo "zig: $ZIG_BIN (from env)"
  else
    ZIG_BIN=""
  fi
fi
if [ -z "$ZIG_BIN" ]; then
for cand in $(command -v zig 2>/dev/null) /tmp/zig-linux-aarch64-0.14.0/zig /tmp/zig-linux-x86_64-0.14.0/zig; do
  if [ -z "$cand" ] || [ ! -x "$cand" ]; then continue; fi
  rm -f ../out/stream.wasm
  if "$cand" build-lib parse.zig \
      -target wasm32-freestanding \
      -O ReleaseSmall \
      -fPIC \
      -femit-bin=../out/stream.wasm 2>/dev/null; then
    ZIG_BIN="$cand"
    break
  fi
done
fi

if [ -z "$ZIG_BIN" ]; then
  echo "ERROR: no usable zig binary (all candidates failed)" >&2
  exit 1
fi
echo "zig: $ZIG_BIN"

# Self-diagnose: -femit-bin path may be ignored on some Zig versions
# (wasm emitted to default name in CWD). Verify magic, fallback to copy.
if ! head -c 4 ../out/stream.wasm 2>/dev/null | grep -q $'\0asm'; then
  emitted=$(find . -maxdepth 1 -name '*.wasm' | head -1)
  if [ -n "$emitted" ]; then
    cp "$emitted" ../out/stream.wasm
  else
    echo "ERROR: zig build-lib emitted no .wasm"; exit 1
  fi
fi
head -c 4 ../out/stream.wasm | grep -q $'\0asm' \
  || { echo "ERROR: native/out/stream.wasm not valid wasm"; exit 1; }
echo "ok: native/out/stream.wasm built ($(wc -c < ../out/stream.wasm) bytes)"
