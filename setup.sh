#!/bin/bash
# Fresh-workspace setup for the daily Shak Clips run. Safe to re-run.
# 1-2: espeak-ng (phonemes) and Kokoro-82M (fallback voice), from GitHub only.
# 3: Chatterbox Turbo (house voice since 2026-11-12) + faster-whisper word check, from pypi/pytorch/Hugging Face.
#    If those hosts are blocked, step 3 only warns and engine/voice.sh falls back to Kokoro.
set -e
STUDIO=$(cd "$(dirname "$0")" && pwd); REPO=$(git -C "$STUDIO" remote get-url origin | sed -E 's#.*github.com[:/]##; s#\.git$##')
mkdir -p /home/claude/untrusted /home/claude/tts
if [ ! -x /home/claude/tts/espeak/bin/espeak-ng ]; then
  if git -C "$STUDIO" fetch -q --depth 1 origin tools 2>/dev/null && git -C "$STUDIO" show FETCH_HEAD:tools/espeak-ng-prebuilt.tar.gz > /home/claude/untrusted/espeak-ng-prebuilt.tar.gz; then
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
# 3. Chatterbox Turbo house voice (MIT code + weights; owner's blind pick 2026-11-12). About 4 GB, 3-6 min.
CBXV=/home/claude/venvs/cbx
if ! "$CBXV/bin/python" -c "import chatterbox.tts_turbo, faster_whisper" 2>/dev/null; then
  ( set -e; export UV_HTTP_TIMEOUT=600
    command -v uv >/dev/null || pip install -q --break-system-packages uv
    [ -x "$CBXV/bin/python" ] || uv venv -q "$CBXV" --python 3.13
    uv pip install -q --python "$CBXV/bin/python" torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cpu
    uv pip install -q --python "$CBXV/bin/python" chatterbox-tts==0.1.7 faster-whisper==1.2.1
  ) || echo "WARN: Chatterbox install failed (pypi/pytorch blocked?) -> narration will FALL BACK to Kokoro"
fi
"$CBXV/bin/python" - <<'PY' 2>/dev/null || echo "WARN: Chatterbox/Whisper weights not downloaded (huggingface.co blocked?) -> narration will FALL BACK to Kokoro"
from huggingface_hub import snapshot_download
snapshot_download('ResembleAI/chatterbox-turbo', allow_patterns=['*.safetensors', '*.json', '*.txt', '*.pt', '*.model'])
snapshot_download('Systran/faster-whisper-base.en')
print('VOICE: Chatterbox Turbo ready')
PY

python3 -c "import onnxruntime, numpy, scipy" && node -e "require('playwright')" && ffmpeg -version >/dev/null
fc-list | grep -q "Inter Display" || echo "WARN: Inter Display font missing; text will fall back to Inter"
echo "SETUP OK"
