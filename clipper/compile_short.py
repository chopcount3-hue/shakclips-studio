#!/usr/bin/env python3
"""Join several finished vertical segments (from edit.py, rendered without music) into one multi-streamer Short.

usage: python compile_short.py spec.json
spec: {"out": "x.mp4", "segments": ["a.mp4", "b.mp4", ...], "hook": "STREAMERS WHEN GTA 6 UNLOCKED",
       "hook_dur": 3.5, "flash": 0.2, "music": {"file": "...mp3", "gain": 0.12, "from": 0}, "boom": "sfx path (optional)"}
White flash (xfade fadewhite) between segments, the hook banner over the opening, a music bed under everything,
then loudness to -14 LUFS like edit.py.
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

FONT = '/root/.fonts/LilitaOne-Regular.ttf'

def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)

def banner(text, path, W=1080):
    """red rounded banner with white outlined text, wrapped to two lines if needed"""
    f = ImageFont.truetype(FONT, 78); words = text.split(); lines = [text]
    if f.getlength(text) > W - 140:
        best = min(range(1, len(words)), key=lambda k: abs(f.getlength(' '.join(words[:k])) - f.getlength(' '.join(words[k:]))))
        lines = [' '.join(words[:best]), ' '.join(words[best:])]
    lw = max(f.getlength(l) for l in lines); lh = 88; bw, bh = int(lw + 70), int(lh * len(lines) + 34)
    im = Image.new('RGBA', (W, bh + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(im); x0 = (W - bw) // 2
    d.rounded_rectangle([x0, 10, x0 + bw, 10 + bh], 22, fill=(232, 52, 58, 255), outline=(0, 0, 0, 255), width=6)
    for i, l in enumerate(lines):
        tw = f.getlength(l); d.text(((W - tw) / 2, 22 + i * lh), l, font=f, fill='white', stroke_width=5, stroke_fill='black')
    im.save(path)

def main():
    s = json.load(open(sys.argv[1])); segs = s['segments']; fl = float(s.get('flash', 0.2)); tmp = tempfile.mkdtemp(prefix='cmp_')
    ds = [dur(x) for x in segs]
    ins = []; [ins.extend(['-i', x]) for x in segs]
    fc = []; v = '[0:v]'; a = '[0:a]'; t = ds[0]
    for i in range(1, len(segs)):
        fc.append(f"{v}[{i}:v]xfade=transition=fadewhite:duration={fl}:offset={t - fl:.3f}[v{i}]")
        fc.append(f"{a}[{i}:a]acrossfade=d={fl}[a{i}]"); v, a = f'[v{i}]', f'[a{i}]'; t += ds[i] - fl
    total = t
    png = os.path.join(tmp, 'hook.png'); banner(s['hook'], png); ins += ['-loop', '1', '-t', f'{total:.2f}', '-i', png]; hi = len(segs)
    hd = float(s.get('hook_dur', 3.5))
    fc.append(f"{v}[{hi}:v]overlay=0:70:enable='lt(t,{hd})'[vo]")
    mix = [a]; k = hi + 1
    mu = s.get('music')
    if mu:
        ins += ['-stream_loop', '-1', '-ss', str(mu.get('from', 0)), '-i', mu['file']]
        fc.append(f"[{k}:a]atrim=0:{total:.2f},asetpts=PTS-STARTPTS,volume={mu.get('gain', 0.12)},afade=t=out:st={total - 1.2:.2f}:d=1.2[mu]"); mix.append('[mu]'); k += 1
    if s.get('boom'):
        ins += ['-i', s['boom']]; fc.append(f"[{k}:a]volume=0.45[bm]"); mix.append('[bm]'); k += 1
    fc.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[ao]")
    cmd = ['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[vo]', '-map', '[ao]', '-t', f'{total:.2f}',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', s['out']]
    subprocess.run(cmd, check=True)
    print(f"{s['out']}  {total:.1f}s  ({len(segs)} segments)")

if __name__ == '__main__':
    main()
