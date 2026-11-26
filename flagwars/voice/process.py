#!/usr/bin/env python3
"""wav/<key>.wav (Chatterbox) -> mp3/<key>.mp3: trim silence, +5% pitch/speed (manic), short lab echo, compress, loudness -15 LUFS."""
import glob, os, subprocess, json
os.makedirs('mp3', exist_ok=True); dur = {}
FX = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,"
      "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,"
      "asetrate=24000*1.05,aresample=24000,aecho=0.8:0.55:28:0.16,"
      "acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-15:TP=-1.5:LRA=7,aresample=24000")
for w in sorted(glob.glob('wav/*.wav')):
    k = os.path.basename(w)[:-4]; m = f'mp3/{k}.mp3'
    if not os.path.exists(m) or os.path.getmtime(m) < os.path.getmtime(w):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', w, '-af', FX, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '56k', m], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', m], capture_output=True, text=True).stdout)
    dur[k] = round(d, 2)
json.dump(dur, open('dur.json', 'w')); print(len(dur), 'clips', round(sum(dur.values()), 1), 's total')
