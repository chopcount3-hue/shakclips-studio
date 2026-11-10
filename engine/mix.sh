#!/bin/bash
# voice +9.5 dB, music -7.5 dB ducked under the voice, SFX -6 dB, two-pass loudnorm to -14 LUFS / -1.5 dBTP -> mix.wav
set -e; cd "$(dirname "$0")"
T=$(python3 -c "import json;print(json.load(open('cues.json'))['total'])")
ffmpeg -v error -y -i voice/voice_proc.wav -i audio_music.wav -i audio_sfx.wav -filter_complex "\
[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=9.5dB,apad=whole_dur=$T,asplit=2[v][vsc];\
[1:a]volume=-7.5dB[m];[m][vsc]sidechaincompress=threshold=0.05:ratio=4:attack=40:release=450[md];\
[2:a]volume=-6dB[s];[v][md][s]amix=inputs=3:normalize=0:duration=longest,atrim=0:$T[out]" -map "[out]" -c:a pcm_s16le mix_pre.wav
J=$(ffmpeg -hide_banner -i mix_pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i mix_pre.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a pcm_s16le mix.wav
ffmpeg -hide_banner -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)"
