#!/bin/bash
# usage: ./voice.sh [voice] [speed]  -> voice/voice_raw.wav, voice/timing.json, voice/voice_proc.wav (48 kHz polished), timing.js
set -e; cd "$(dirname "$0")"; V=${1:-am_michael}; SP=${2:-0.96}
THREADS=2 nice python3 "${STUDIO:-/home/claude/shakclips-studio}/tts/kokoro_tts.py" script.json voice "$V" "$SP"
# 1. the house chain (owner's blind-test pick 2026-11-11: do not change the EQ without asking)
ffmpeg -v error -y -i voice/voice_raw.wav -af "highpass=f=70,equalizer=f=3500:t=q:w=1.0:g=2,deesser=i=0.4,acompressor=threshold=0.18:ratio=2.2:attack=8:release=150:makeup=1.3,aecho=0.85:0.9:38|67:0.07|0.05,aresample=48000" -c:a pcm_s16le voice/pre.wav
# 2. mastering tail: -25 LUFS + limiter + room tone, so mix.sh's +9.5 dB has headroom.
#    Measured 2026-11-11: without it the mix hits +0.0 dBTP; with it, -4.3 dBTP. latency=1 keeps the
#    duration identical, so timing.json stays valid. See skills/tts-voice-mastering.
I=$(ffmpeg -hide_banner -i voice/pre.wav -af ebur128 -f null - 2>&1 | awk '/^ +I:/{print $2}' | tail -1)
G=$(python3 -c "print(round(-25.0 - ($I), 2))")
ffmpeg -v error -y -i voice/pre.wav -filter_complex \
"[0:a]volume=${G}dB,alimiter=limit=-11dB:attack=5:release=60:level=0:latency=1[v];\
anoisesrc=r=48000:c=pink:a=0.0013:seed=7,highpass=f=100,lowpass=f=4000[rt];\
[v][rt]amix=inputs=2:duration=first:normalize=0[o]" -map "[o]" -c:a pcm_s16le voice/voice_proc.wav
echo "window.TIMING = $(cat voice/timing.json);" > timing.js
# 3. guard: the tail must not change the length, or captions drift
python3 - <<'PY'
import json, wave
d = json.load(open('voice/timing.json'))
for f in ('voice/pre.wav', 'voice/voice_proc.wav'):
    w = wave.open(f); n = w.getnframes() / w.getframerate()
    assert abs(n - d['total']) < 0.25, f"{f} is {n:.3f}s but timing.json says {d['total']:.3f}s"
print('voice ok: %.2fs' % d['total'])
PY
