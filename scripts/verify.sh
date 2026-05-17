#!/usr/bin/env bash
# Frame-grab a render at given frames for visual QA, and print audio windows.
# Usage:  scripts/verify.sh <entry> <CompId> <public-dir> <frame1> [frame2 ...]
#   <public-dir>  the project's public/ dir, passed as --public-dir so
#                  staticFile() assets resolve (use "-" if the project has
#                  none / uses repo-root public/).
# Then Read the out/verify-<frame>.png files. Audio windows help confirm
# typing/click SFX land on the right beats.
set -euo pipefail
if [ "$#" -lt 4 ]; then
  echo "usage: verify.sh <entry> <CompId> <public-dir> <frame> [frame ...]" >&2
  echo "  pass '-' for <public-dir> if the project has no public/ dir" >&2
  exit 2
fi
ENTRY="$1"; COMP="$2"; PUBDIR="$3"; shift 3
PD=()
[ "$PUBDIR" != "-" ] && PD=(--public-dir="$PUBDIR")
mkdir -p out
for fr in "$@"; do
  # Do NOT silence: a staticFile 404 must be visible, not swallowed.
  npx remotion still "$ENTRY" "$COMP" "out/verify-$fr.png" --frame="$fr" "${PD[@]}"
  echo "out/verify-$fr.png"
done
if [ -f out/*.mp4 ] 2>/dev/null; then :; fi
MP4="$(ls -t out/*.mp4 2>/dev/null | head -1 || true)"
if [ -n "${MP4:-}" ]; then
  echo "--- audio windows in $MP4 ---"
  ffmpeg -y -i "$MP4" -af "astats=metadata=1:reset=6,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=/tmp/_rms.txt" -f null - -loglevel error 2>/dev/null || true
  python3 - <<'PY'
import re
try:
    txt=open('/tmp/_rms.txt').read()
except FileNotFoundError:
    raise SystemExit
pts=re.findall(r'pts_time:([\d.]+)\n.*?RMS_level=(-?[\d.]+|-inf)', txt, re.S)
loud=[float(t) for t,v in pts if v!='-inf' and float(v)>-55]
if loud:
    segs=[]; s=loud[0]; p=loud[0]
    for t in loud[1:]:
        if t-p>0.4: segs.append((s,p)); s=t
        p=t
    segs.append((s,p))
    for a,b in segs: print(f"  audio {a:.2f}s - {b:.2f}s")
PY
fi
