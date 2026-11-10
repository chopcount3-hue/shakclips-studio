#!/bin/bash
# Fresh-workspace setup for the daily Shak Clips run (only GitHub is reachable from the shell; pip/npm are blocked).
# Installs espeak-ng (phonemes) and Kokoro-82M (voice) into the paths kokoro_tts.py expects. Safe to re-run.
set -e
STUDIO=$(cd "$(dirname "$0")" && pwd); REPO=$(git -C "$STUDIO" remote get-url origin | sed -E 's#.*github.com[:/]##; s#\.git$##')
mkdir -p /home/claude/untrusted /home/claude/tts
if [ ! -x /home/claude/tts/espeak/bin/espeak-ng ]; then
  if gh release download tools-v1 -R "$REPO" -p 'espeak-ng-prebuilt.tar.gz' -D /home/claude/untrusted --clobber 2>/dev/null \
     || curl -fsSL -o /home/claude/untrusted/espeak-ng-prebuilt.tar.gz "https://github.com/$REPO/releases/download/tools-v1/espeak-ng-prebuilt.tar.gz"; then
    tar -xzf /home/claude/untrusted/espeak-ng-prebuilt.tar.gz -C /home/claude/tts
  else
    git clone -q --depth 1 https://github.com/espeak-ng/espeak-ng.git /home/claude/untrusted/espeak-ng
    cmake -S /home/claude/untrusted/espeak-ng -B /home/claude/tts/espeak-build -DCMAKE_INSTALL_PREFIX=/home/claude/tts/espeak \
      -DBUILD_SHARED_LIBS=OFF -DUSE_ASYNC=OFF -DUSE_MBROLA=OFF -DUSE_LIBSONIC=OFF -DUSE_LIBPCAUDIO=OFF -DESPEAK_BUILD_MANPAGES=OFF >/dev/null
    cmake --build /home/claude/tts/espeak-build -j2 >/dev/null && cmake --install /home/claude/tts/espeak-build >/dev/null
  fi
fi
K=/home/claude/untrusted/kokoro; mkdir -p $K
[ -s $K/kokoro-v1.0.onnx ] || curl -fsSL -o $K/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -s $K/voices-v1.0.bin ] || curl -fsSL -o $K/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
[ -d $K/repo ] || git clone -q --depth 1 https://github.com/thewh1teagle/kokoro-onnx.git $K/repo
/home/claude/tts/espeak/bin/espeak-ng -q --ipa "setup check" >/dev/null
python3 -c "import onnxruntime, numpy, scipy" && node -e "require('playwright')" && ffmpeg -version >/dev/null
fc-list | grep -q "Inter Display" || echo "WARN: Inter Display font missing; text will fall back to Inter"
echo "SETUP OK"
