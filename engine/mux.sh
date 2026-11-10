#!/bin/bash
# usage: ./mux.sh OUTPUT.mp4   (joins scenes/s*.mp4 with -c copy, adds mix.wav as AAC)
set -e; cd "$(dirname "$0")"; OUT=${1:?output name}
ls scenes/s*.mp4 | grep -v tmp | sort | sed "s|^|file '$PWD/|; s|$|'|" > concat.txt
ffmpeg -v error -y -f concat -safe 0 -i concat.txt -c copy video_only.mp4
ffmpeg -v error -y -i video_only.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact "$OUT"
