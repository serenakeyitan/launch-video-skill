#!/usr/bin/env bash
# Synthesize keyboard-typing + mouse-click SFX with ffmpeg.
# Usage:  scripts/make-sfx.sh <output_dir>
# Produces <dir>/sfx-typing.mp3 (7s loopable) and <dir>/sfx-click.mp3 (~0.2s).
# No binary assets are committed — regenerate per project.
set -euo pipefail
OUT="${1:-public}"
mkdir -p "$OUT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# one keystroke: short filtered noise burst, sharp attack/decay
ffmpeg -y -f lavfi -i "anoisesrc=d=0.03:c=pink:a=0.5" \
  -af "highpass=f=900,lowpass=f=5500,afade=t=in:st=0:d=0.002,afade=t=out:st=0.012:d=0.018,volume=2.2" \
  -ar 44100 "$TMP/key.wav" -loglevel error

python3 - "$TMP" "$OUT" <<'PY'
import random, subprocess, sys, os
tmp, out = sys.argv[1], sys.argv[2]
random.seed(7)
t=0.0; delays=[]
while t < 7.0:
    delays.append(t); t += random.uniform(0.055, 0.135)
filt=[f"[0:a]adelay={int(d*1000)}|{int(d*1000)},volume={random.uniform(0.7,1.0):.2f}[k{i}]"
      for i,d in enumerate(delays)]
mix="".join(f"[k{i}]" for i in range(len(delays)))
graph=";".join(filt)+f";{mix}amix=inputs={len(delays)}:normalize=0[o]"
subprocess.run(["ffmpeg","-y","-i",os.path.join(tmp,"key.wav"),"-filter_complex",graph,
  "-map","[o]","-t","7","-ar","44100","-b:a","128k",os.path.join(out,"sfx-typing.mp3"),
  "-loglevel","error"],check=True)
PY

# mouse click: two short transients (down + softer up)
ffmpeg -y -f lavfi -i "anoisesrc=d=0.015:c=white:a=0.6" \
  -af "highpass=f=1500,lowpass=f=8000,afade=t=out:st=0.003:d=0.01,volume=3.0" \
  -ar 44100 "$TMP/tick.wav" -loglevel error
ffmpeg -y -i "$TMP/tick.wav" -i "$TMP/tick.wav" -filter_complex \
  "[0:a]apad=pad_dur=0.2[a0];[1:a]apad=pad_dur=0.2,adelay=60|60,volume=0.5[a1];[a0]volume=1.0[a0v];[a0v][a1]amix=inputs=2:normalize=0:duration=longest[o]" \
  -map "[o]" -t 0.22 -ar 44100 -b:a 128k "$OUT/sfx-click.mp3" -loglevel error

echo "wrote $OUT/sfx-typing.mp3  $OUT/sfx-click.mp3"
