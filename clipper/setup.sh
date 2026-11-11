#!/bin/bash
# Clipper setup for a fresh workspace (needs pypi, github.com and huggingface/googleapis). Safe to re-run.
# Shares the venv with the Shak Clips voice (/home/claude/venvs/cbx) so faster-whisper is installed once.
set -e
HERE=$(cd "$(dirname "$0")" && pwd); V=/home/claude/venvs/cbx; export UV_HTTP_TIMEOUT=600
command -v uv >/dev/null || pip install -q --break-system-packages uv
[ -x "$V/bin/python" ] || uv venv -q "$V" --python 3.13
"$V/bin/python" -c "import torch" 2>/dev/null || uv pip install -q --python "$V/bin/python" torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
uv pip install -q --python "$V/bin/python" faster-whisper==1.2.1 "yt-dlp[default]" streamlink "scenedetect[opencv-headless]" mediapipe rapidocr onnxruntime auto-editor
# TwitchDownloaderCLI (MIT): Twitch VODs, clips and chat replay
TD=1.56.5
if [ ! -x "$HERE/bin/TwitchDownloaderCLI" ]; then
  mkdir -p "$HERE/bin" /home/claude/untrusted/td && cd /home/claude/untrusted/td
  curl -fsSL -o td.zip "https://github.com/lay295/TwitchDownloader/releases/download/$TD/TwitchDownloaderCLI-$TD-Linux-x64.zip"
  unzip -q -o td.zip && cp TwitchDownloaderCLI "$HERE/bin/" && chmod +x "$HERE/bin/TwitchDownloaderCLI" && cd "$HERE"
fi
# MediaPipe face model (Apache-2.0) for facecam.py
[ -s "$HERE/models/blaze_face_short_range.tflite" ] || curl -fsSL -o "$HERE/models/blaze_face_short_range.tflite" \
  https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite
# caption + hook fonts (OFL / Apache-2.0)
mkdir -p ~/.fonts
for f in apache/luckiestguy/LuckiestGuy-Regular.ttf ofl/anton/Anton-Regular.ttf ofl/bangers/Bangers-Regular.ttf; do
  [ -s ~/.fonts/$(basename $f) ] || curl -fsSL -o ~/.fonts/$(basename $f) https://raw.githubusercontent.com/google/fonts/main/$f
done; fc-cache -f >/dev/null
# our own synthesized SFX (regenerated, deterministic)
[ -s "$HERE/sfx/made/boom.wav" ] || python3 "$HERE/sfx/comedy_sfx.py" "$HERE/sfx/made"
"$V/bin/python" -c "import faster_whisper, mediapipe, streamlink, yt_dlp" && "$HERE/bin/TwitchDownloaderCLI" --version >/dev/null
echo "CLIPPER SETUP OK"
