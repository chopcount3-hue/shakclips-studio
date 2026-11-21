#!/bin/bash
# One-shot setup of a FRESH workspace for the daily Shak Replay GTA 6 run. Safe to re-run (each step skips if done).
# usage: bash clipper/daily/setup_gta.sh        (from anywhere inside the cloned repo; takes ~5-10 min the first time)
set -e
DAILY=$(cd "$(dirname "$0")" && pwd); CL=$(dirname "$DAILY"); STUDIO=$(dirname "$CL")
# scripts and older plans refer to /home/claude/clipper and /home/claude/shakclips-studio
[ -e /home/claude/clipper ] || ln -s "$CL" /home/claude/clipper
[ -e /home/claude/shakclips-studio ] || ln -s "$STUDIO" /home/claude/shakclips-studio
# 1. voice (espeak-ng + Kokoro-82M) and 2. clipper (venv /home/claude/venvs/cbx, faster-whisper, TwitchDownloaderCLI, fonts, sfx/made)
bash "$STUDIO/setup.sh"
bash "$CL/setup.sh"
# 3. caption font used by edit.py (Lilita One, OFL) - tracked in clipper/fonts
mkdir -p ~/.fonts && cp -n "$CL"/fonts/*.ttf ~/.fonts/ 2>/dev/null || true; fc-cache -f >/dev/null
fc-list | grep -q "Lilita One" || { echo "FAIL: Lilita One font missing"; exit 1; }
# 4. ffmpeg master build for longform.py (system ffmpeg 6.1 is fine for edit.py)
FFD=/home/claude/untrusted/ffmpeg
if [ ! -x $FFD/ffmpeg-master-latest-linux64-gpl/bin/ffmpeg ]; then
  mkdir -p $FFD && curl -fsSL -o $FFD/ff.tar.xz https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz
  tar -xJf $FFD/ff.tar.xz -C $FFD && rm -f $FFD/ff.tar.xz
fi
# 5. music library (Kevin MacLeod, CC BY 4.0): mp3s are gitignored on this branch, binaries live on branch assets-bgm
if [ ! -s "$CL/bgm/funny/sneaky_snitch.mp3" ]; then
  git -C "$STUDIO" fetch -q --depth 1 origin assets-bgm
  git -C "$STUDIO" --work-tree="$CL/bgm" checkout FETCH_HEAD -- . && git -C "$STUDIO" reset -q
fi
ls "$CL"/bgm/*/*.mp3 | wc -l | xargs -I{} echo "bgm tracks: {}"
mkdir -p /home/claude/gtaday
echo "export WORK=/home/claude/gtaday STUDIO=$STUDIO FFMPEG=$FFD/ffmpeg-master-latest-linux64-gpl/bin/ffmpeg PY=/home/claude/venvs/cbx/bin/python" > /home/claude/gtaday/env.sh
echo "GTA SETUP OK  (source /home/claude/gtaday/env.sh)"
