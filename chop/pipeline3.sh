#!/bin/bash
# Banana: concat the rendered scenes, synthesise the ASMR track, loudness-normalise to -14 LUFS, mux.
cd /home/claude/chop
export NODE_PATH=/opt/npm-tools/node_modules
set -e
finish () { # $1 video_only, $2 wav, $3 out
  J=$(ffmpeg -hide_banner -i $2 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  MI=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
  ffmpeg -v error -y -i $2 -af "loudnorm=I=-14:TP=-1.5:LRA=11:$MI:linear=true,aresample=48000" -c:a pcm_s16le ${2%.wav}_norm.wav
  ffmpeg -v error -y -i $1 -i ${2%.wav}_norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $3
}
for i in 0 1 2 3 4 5 6; do echo "file '$PWD/scenes_banana/s$i.mp4'"; done > scenes_banana/cfin.txt
ffmpeg -v error -y -f concat -safe 0 -i scenes_banana/cfin.txt -c copy scenes_banana/video_only.mp4
echo "[pipe] concat done $(date +%T)"
ENGINE=engine_banana.html OUT=audio_timeline_banana.json node dumphist.js
OBJ=banana TL=audio_timeline_banana.json WAV=mix_banana.wav python3 audio.py
echo "[pipe] audio done $(date +%T)"
finish scenes_banana/video_only.mp4 mix_banana.wav ShakClips_Banana_1000_Cuts.mp4
echo "[pipe] BANANA READY $(date +%T)"
