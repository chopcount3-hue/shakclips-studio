#!/usr/bin/env python3
"""Split an SFX compilation video (one title card per sound) into named sound files.

usage: python split_sfx_video.py video.mp4 outdir [--fps 5]
  finds each title card (white text in the middle of the frame), reads it with RapidOCR (Apache-2.0),
  cuts the audio from that card to the next one, trims silence, writes outdir/<name>.wav + outdir/index.md
"""
import argparse, json, os, re, subprocess
import numpy as np

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('out'); ap.add_argument('--fps', type=float, default=5)
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    p = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', a.src],
                                  capture_output=True, text=True).stdout)['streams'][0]
    cw, ch = 320, 72                                  # downscaled centre band: x 15-85 %, y 35-65 %
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.src, '-vf', f'fps={a.fps},crop=iw*0.7:ih*0.3:iw*0.15:ih*0.35,scale={cw}:{ch},format=gray',
                          '-f', 'rawvideo', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, ch, cw); masks = fr > 225
    has = masks.sum((1, 2)) > 60
    # segments: consecutive text frames whose text mask stays the same
    segs, cur = [], None
    for i, (m, h) in enumerate(zip(masks, has)):
        if h and cur is not None:
            ref = masks[cur[0] + (i - cur[0]) // 2]
            iou = (m & ref).sum() / max(1, (m | ref).sum())
            if iou >= 0.55: cur[1] = i; continue
        if cur is not None: segs.append(cur); cur = None
        if h: cur = [i, i]
    if cur: segs.append(cur)
    segs = [s for s in segs if s[1] - s[0] >= 1]
    print(f'{len(segs)} title cards', flush=True)

    from rapidocr import RapidOCR
    ocr = RapidOCR(); names = []
    for s0, s1 in segs:
        t = (s0 + s1) / 2 / a.fps
        png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', a.src, '-frames:v', '1', '-vf', 'crop=iw*0.7:ih*0.3:iw*0.15:ih*0.35',
                              '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
        tmp = os.path.join(a.out, '_ocr.png'); open(tmp, 'wb').write(png)
        r = ocr(tmp); txt = ' '.join(r.txts) if r.txts else ''
        names.append(re.sub(r'\s+', ' ', txt).strip() or f'sound {len(names) + 1}')
    os.remove(os.path.join(a.out, '_ocr.png'))

    # audio: from each card's start to the next card's start, silence-trimmed, max 15 s
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.src, '-vn', '-ac', '2', '-ar', '48000', '-f', 's16le', '-'], capture_output=True).stdout
    y = np.frombuffer(pcm, np.int16).reshape(-1, 2).astype(np.float32) / 32768; SR = 48000
    used, rows = {}, []
    from scipy.io import wavfile
    for k, ((s0, s1), name) in enumerate(zip(segs, names)):
        t0 = max(0, s0 / a.fps - 0.25); t1 = (segs[k + 1][0] / a.fps - 0.05) if k + 1 < len(segs) else len(y) / SR
        t1 = min(t1, t0 + 15); seg = y[int(t0 * SR):int(t1 * SR)]
        if not len(seg): continue
        env = np.abs(seg).max(1); thr = max(0.004, env.max() * 0.02); idx = np.where(env > thr)[0]
        if not len(idx): continue
        seg = seg[max(0, idx[0] - int(0.01 * SR)): idx[-1] + int(0.08 * SR)]
        slug = re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')[:40] or f'sound_{k + 1}'
        used[slug] = used.get(slug, 0) + 1
        fn = slug if used[slug] == 1 else f'{slug}_{used[slug]}'
        fade = np.ones(len(seg)); n = min(len(seg), int(0.02 * SR)); fade[-n:] = np.linspace(1, 0, n)
        wavfile.write(os.path.join(a.out, fn + '.wav'), SR, (seg * fade[:, None] * 32767).astype(np.int16))
        rows.append((fn, name, round(t0, 1), round(len(seg) / SR, 2)))
    with open(os.path.join(a.out, 'index.md'), 'w') as f:
        f.write(f'# Sound effects from {os.path.basename(a.src)} ({len(rows)} sounds)\n\n| file | title on card | at (s) | length (s) |\n|---|---|---|---|\n')
        for r in rows: f.write(f'| {r[0]}.wav | {r[1]} | {r[2]} | {r[3]} |\n')
    print(f'{len(rows)} sounds -> {a.out}')

if __name__ == '__main__':
    main()
