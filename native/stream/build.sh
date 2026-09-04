#!/usr/bin/env bash
# Build native/stream → native/out/stream.wasm (gitignored).
# NOTE: `zig build` runner hangs in this environment; use direct build-exe.
# -fno-entry --export=parse_sse links a proper WASM module with exports,
# no ar archive wrapping, no entry symbol needed.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p ../out

# Resolve zig: honor ZIG_BIN if set, then try candidates.
# PATH may point to a stripped ELF that cannot find its own install directory.
zig_bin="${ZIG_BIN:-}"
if [ -z "$zig_bin" ] || ! "$zig_bin" build-exe --help >/dev/null 2>&1; then
  zig_candidates=(
    "/tmp/zig-linux-aarch64-0.14.0/zig"
    "$(command -v zig 2>/dev/null || true)"
  )
  zig_bin=""
  for cand in "${zig_candidates[@]}"; do
    [ -z "$cand" ] && continue
    [ -x "$cand" ] || continue
    if "$cand" build-exe --help >/dev/null 2>&1; then
      zig_bin="$cand"
      break
    fi
  done
fi
if [ -z "$zig_bin" ]; then
  echo "ERROR: no usable zig binary found in ZIG_BIN, PATH, or candidates"; exit 1
fi

# -dynamic is rejected by wasm32-freestanding target (Zig 0.14.0).
# -rdynamic and -fPIC are also unnecessary for freestanding wasm.
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT
"$zig_bin" build-exe parse.zig \
  -target wasm32-freestanding \
  -O ReleaseSmall \
  -fno-entry \
  --export=parse_sse \
  -femit-bin="$tmpdir/stream.wasm"

cp "$tmpdir/stream.wasm" ../out/stream.wasm

# Verify wasm magic (od, not grep — null bytes don't survive grep).
if ! head -c 4 ../out/stream.wasm | od -A n -t x1 | grep -q '00 61 73 6d'; then
  echo "ERROR: native/out/stream.wasm not valid wasm"; exit 1
fi
echo "ok: native/out/stream.wasm built ($(wc -c < ../out/stream.wasm) bytes)"