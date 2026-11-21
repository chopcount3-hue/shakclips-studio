#!/bin/bash
# Re-encode a video so it fits under GitHub's 100 MB file limit (vidIQ pulls uploads from raw.githubusercontent.com).
# usage: fit100.sh in.mp4 out.mp4 [target_MB=94]   two-pass x264 at the bitrate that lands on the target size
set -e; IN=$1; OUT=$2; T=${3:-94}; FF=${FFMPEG:-ffmpeg}
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
VB=$(python3 -c "print(int(min(8000, ($T*8*1024*1024/$D - 160*1024)/1000)))")
cd "$(mktemp -d)"
$FF -v error -y -i "$IN" -c:v libx264 -preset medium -b:v ${VB}k -pass:v 1 -an -f null /dev/null
$FF -v error -y -i "$IN" -c:v libx264 -preset medium -b:v ${VB}k -maxrate $((VB*2))k -bufsize $((VB*4))k -pass:v 2 -pix_fmt yuv420p \
    -c:a aac -b:a 160k -ar 48000 -movflags +faststart "$OUT"
echo "fit100: $(du -m "$OUT" | cut -f1) MB at ${VB} kb/s (${D%.*} s)"
