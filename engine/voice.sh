#!/bin/bash
# usage: ./voice.sh [voice] [speed]  -> voice/voice_raw.wav, voice/timing.json, voice/voice_proc.wav (48 kHz polished), timing.js
set -e; cd "$(dirname "$0")"; V=${1:-am_michael}; SP=${2:-0.96}
THREADS=2 nice python3 "${STUDIO:-/home/claude/shakclips-studio}/tts/kokoro_tts.py" script.json voice "$V" "$SP"
ffmpeg -v error -y -i voice/voice_raw.wav -af "highpass=f=70,equalizer=f=3500:t=q:w=1.0:g=2,deesser=i=0.4,acompressor=threshold=0.18:ratio=2.2:attack=8:release=150:makeup=1.3,aecho=0.85:0.9:38|67:0.07|0.05,aresample=48000" voice/voice_proc.wav
echo "window.TIMING = $(cat voice/timing.json);" > timing.js
