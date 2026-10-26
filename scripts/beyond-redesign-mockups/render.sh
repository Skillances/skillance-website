#!/usr/bin/env bash
# Build the fictional Beyond before/after mock-ups and rasterise them to WebP.
# Needs Node, Google Chrome and Pillow. Nothing is downloaded at render time.
# OUT=<dir> renders somewhere else (for previews). Default is public/beyond/redesigns.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="${OUT:-$ROOT/../../public/beyond/redesigns}"
mkdir -p "$OUT"
OUT="$(cd "$OUT" && pwd)"

CHROME="${CHROME:-}"
if [[ -z "$CHROME" ]]; then
  for c in "/c/Program Files/Google/Chrome/Application/chrome.exe" \
           "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
           /usr/bin/google-chrome-stable /usr/bin/google-chrome; do
    [[ -x "$c" ]] && CHROME="$c" && break
  done
fi
[[ -n "$CHROME" ]] || { echo "Chrome not found. Set CHROME=/path/to/chrome" >&2; exit 1; }

# file:// URLs and Chrome flags need native paths on Windows (C:/...), POSIX elsewhere.
if pwd -W >/dev/null 2>&1; then
  native() { (cd "$1" && pwd -W); }
else
  native() { (cd "$1" && pwd); }
fi
ROOT_N="$(native "$ROOT")"
TMP="$(mktemp -d)"
TMP_N="$(native "$TMP")"
trap 'rm -rf "$TMP"' EXIT

node "$ROOT/build.mjs"

render_one() {
  local name="$1" w="$2" h="$3"
  local udd
  udd="$(mktemp -d)"
  # Chrome sometimes stays up after writing the PNG. Keep the picture either way.
  timeout 40 "$CHROME" \
    --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 \
    --user-data-dir="$(cd "$udd" && (pwd -W 2>/dev/null || pwd))" \
    --window-size="${w},${h}" \
    --virtual-time-budget=4000 \
    --screenshot="$TMP_N/${name}.png" \
    "file:///${ROOT_N}/pages/${name}.html" \
    >/dev/null 2>&1 || true
  rm -rf "$udd"
  [[ -s "$TMP/${name}.png" ]] || { echo "screenshot missing: $name" >&2; exit 1; }
  python - "$TMP_N/${name}.png" "$OUT/${name}.webp" "$w" "$h" <<'PY'
from PIL import Image
import sys
png, webp, w, h = sys.argv[1:]
im = Image.open(png).convert("RGB")
expect = (int(w), int(h))
if im.size != expect:
    raise SystemExit(f"{png} is {im.size}, expected {expect}")
im.save(webp, "WEBP", quality=82, method=6)
print(webp, im.size)
PY
}

export -f render_one
export ROOT_N OUT CHROME TMP TMP_N

for n in 1 2 3 4 5; do
  for side in before after; do
    render_one "example-${n}-${side}-desktop" 1600 1000 &
    render_one "example-${n}-${side}-mobile" 780 1688 &
  done
  wait
done
echo "rendered 20 mock-ups into $OUT"
