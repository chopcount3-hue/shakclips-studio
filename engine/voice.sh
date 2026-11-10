#!/bin/bash
# usage: ./voice.sh [voice] [speed]  -> voice/voice_raw.wav, voice/timing.json, voice/voice_proc.wav (48 kHz polished), timing.js
set -e; cd "$(dirname "$0")"; V=${1:-bm_george:0.7+bm_fable:0.3}; SP=${2:-0.94}   # owner pick 2026-11-11: "D British storyteller"
THREADS=2 nice python3 "${STUDIO:-/home/claude/shakclips-studio}/tts/kokoro_tts.py" script.json voice "$V" "$SP"
ffmpeg -v error -y -i voice/voice_raw.wav -af "highpass=f=75,equalizer=f=180:t=q:w=0.9:g=2.5,equalizer=f=320:t=q:w=1.2:g=-1.5,equalizer=f=3200:t=q:w=1.4:g=-2,deesser=i=0.5,acompressor=threshold=0.2:ratio=2:attack=12:release=200:makeup=1.2,aecho=0.8:0.85:28|47:0.05|0.035,lowpass=f=13500,aresample=48000" voice/voice_proc.wav
echo "window.TIMING = $(cat voice/timing.json);" > timing.js
