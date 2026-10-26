#!/usr/bin/env bash
# Rasterise the fictional Beyond before/after mock-ups into public/beyond/redesigns.
# Needs Google Chrome and Pillow. Nothing is downloaded at render time.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT="$(cd "$ROOT/../../public/beyond/redesigns" && pwd)"
# Call Chrome itself. The /usr/local/bin/google-chrome wrapper pins every
# launch to debugging port 9222, which makes parallel screenshots hang.
CHROME="${CHROME:-/usr/bin/google-chrome-stable}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

render_one() {
  local name="$1" w="$2" h="$3"
  local udd png webp
  udd="$(mktemp -d)"
  png="$TMP/${name}.png"
  webp="$OUT/${name}.webp"
  # Chrome sometimes stays up after writing the PNG. Keep the picture either way.
  timeout 25 "$CHROME" \
    --headless=new \
    --no-sandbox \
    --disable-dev-shm-usage \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --user-data-dir="$udd" \
    --window-size="${w},${h}" \
    --screenshot="$png" \
    "file://${ROOT}/pages/${name}.html" \
    >/tmp/chrome-${name}.log 2>&1 || true
  rm -rf "$udd"
  if [[ ! -s "$png" ]]; then
    echo "screenshot missing: $name" >&2
    exit 1
  fi
  python3 - "$png" "$webp" "$w" "$h" <<'PY'
from PIL import Image
import sys
png, webp, w, h = sys.argv[1:]
im = Image.open(png).convert("RGB")
expect = (int(w), int(h))
if im.size != expect:
    raise SystemExit(f"{png} is {im.size}, expected {expect}")
im.save(webp, "WEBP", quality=82, method=6)
print(f"{webp} {im.size}")
PY
}

export -f render_one
export ROOT OUT CHROME TMP

specs=(
  "example-1-before-desktop 1600 1000"
  "example-1-before-mobile 780 1688"
  "example-1-after-desktop 1600 1000"
  "example-1-after-mobile 780 1688"
  "example-2-before-desktop 1600 1000"
  "example-2-before-mobile 780 1688"
  "example-2-after-desktop 1600 1000"
  "example-2-after-mobile 780 1688"
  "example-3-before-desktop 1600 1000"
  "example-3-before-mobile 780 1688"
  "example-3-after-desktop 1600 1000"
  "example-3-after-mobile 780 1688"
  "example-4-before-desktop 1600 1000"
  "example-4-before-mobile 780 1688"
  "example-4-after-desktop 1600 1000"
  "example-4-after-mobile 780 1688"
  "example-5-before-desktop 1600 1000"
  "example-5-before-mobile 780 1688"
  "example-5-after-desktop 1600 1000"
  "example-5-after-mobile 780 1688"
)

running=0
for spec in "${specs[@]}"; do
  read -r name w h <<<"$spec"
  render_one "$name" "$w" "$h" &
  running=$((running + 1))
  if [[ "$running" -ge 4 ]]; then
    wait
    running=0
  fi
done
wait
echo "rendered ${#specs[@]} mock-ups into $OUT"
