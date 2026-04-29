#!/usr/bin/env bash
# quickrec-1.5a.sh — fastest path to a real-screen Phase 1.5a demo on macOS.
#
# Records 90s of your primary display while you drive a scripted sequence:
#   1. Switch to your terminal (already running the daemon + bridge)
#   2. Issue + redeem a mandate
#   3. Switch to a browser open at the Basescan tx URL
#   4. Scroll once
#
# Output: out/phase-1.5a-captured.mp4
#
# Requires: macOS, ffmpeg (brew install ffmpeg). Grant Screen Recording permission
# to your terminal in System Settings > Privacy & Security > Screen Recording.

set -euo pipefail

if [[ "$(uname)" != "Darwin" ]]; then
  echo "this script is macOS only" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not installed. run: brew install ffmpeg" >&2
  exit 1
fi

OUT="out/phase-1.5a-captured.mp4"
mkdir -p out

DURATION=90
FPS=30
DISPLAY_ID="1"  # primary display, see `ffmpeg -f avfoundation -list_devices true -i ""` to find others

cat <<EOF

==================== quickrec-1.5a ====================
recording duration: ${DURATION}s @ ${FPS}fps
output:             ${OUT}
display:            ${DISPLAY_ID}

PRESS ENTER WHEN READY. you'll have 5 seconds to switch
to the window you want to record.
=======================================================
EOF
read -r

echo "starting in 5..."
for i in 5 4 3 2 1; do
  echo "$i"
  sleep 1
done

echo "RECORDING."

ffmpeg \
  -y \
  -f avfoundation \
  -framerate "$FPS" \
  -i "$DISPLAY_ID" \
  -t "$DURATION" \
  -vcodec libx264 \
  -preset ultrafast \
  -crf 18 \
  -pix_fmt yuv420p \
  "$OUT"

echo ""
echo "done. open the file:"
echo "  open $OUT"
