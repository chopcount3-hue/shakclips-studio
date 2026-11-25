#!/usr/bin/env python3
"""Download the candidates (1080p60), then make a 16-frame contact sheet and a word-timed transcript of each.
usage: <cbx python> pull.py [name ...]      (default: every clip in $WORK/cands.json)
-> $WORK/clips/<name>.mp4, $WORK/sheets/<name>.jpg, $WORK/tx/<name>.json ({segments:[{words:[{w,s,e,p}]}]}), $WORK/tx/<name>.txt
Twitch clips get deleted within hours of going viral; a failed download is listed and skipped."""
import concurrent.futures as cf, json, os, subprocess, sys
from io import BytesIO
WORK = os.environ.get('WORK', '/home/claude/gtaday'); HERE = os.path.dirname(os.path.abspath(__file__))
TD = '/home/claude/clipper/bin/TwitchDownloaderCLI'
C = {n['name']: n for n in json.load(open(os.path.join(WORK, 'cands.json')))}
names = sys.argv[1:] or list(C)
for d in ('clips', 'sheets', 'tx'): os.makedirs(os.path.join(WORK, d), exist_ok=True)

def dl(name):
    out = os.path.join(WORK, 'clips', name + '.mp4')
    if os.path.exists(out): return name, 'exists'
    c = C[name]
    if c.get('vod'):   # a stream-moment window (streams.py): cut it straight from the VOD
        for q in ('1080p60', '1080p', '720p60', '720p'):
            p = subprocess.run([TD, 'videodownload', '--id', c['vod'], '-b', str(int(c['a'])), '-e', str(int(c['b'])), '-q', q, '-o', out,
                                '--collision', 'Overwrite', '-t', '6'], capture_output=True, text=True)
            if p.returncode == 0 and os.path.exists(out) and os.path.getsize(out) > 100000: return name, 'vod ' + q
        return name, 'FAILED ' + (p.stdout + p.stderr)[-160:].replace('\n', ' ')
    for q in ('1080p60', '1080p', '720p60', '720p'):
        p = subprocess.run([TD, 'clipdownload', '--id', C[name]['slug'], '-q', q, '-o', out, '--collision', 'Overwrite'], capture_output=True, text=True)
        if p.returncode == 0 and os.path.exists(out) and os.path.getsize(out) > 100000: return name, q
    return name, 'FAILED ' + (p.stdout + p.stderr)[-160:].replace('\n', ' ')

def sheet(name):
    from PIL import Image, ImageDraw, ImageFont
    src = os.path.join(WORK, 'clips', name + '.mp4'); out = os.path.join(WORK, 'sheets', name + '.jpg')
    if os.path.exists(out) or not os.path.exists(src): return
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout or 1)
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20); W, H = 400, 225
    sh = Image.new('RGB', (W * 4, H * 4 + 34)); d = ImageDraw.Draw(sh)
    d.text((6, 6), f"{name}  {dur:.0f}s  {C[name]['viewCount']} views | {C[name]['title'][:70]}", fill='yellow', font=F)
    for k in range(16):
        t = dur * (k + 0.5) / 16
        p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', src, '-frames:v', '1', '-vf', f'scale={W}:{H}', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True)
        try: sh.paste(Image.open(BytesIO(p.stdout)), ((k % 4) * W, 34 + (k // 4) * H))
        except Exception: continue
        ImageDraw.Draw(sh).text(((k % 4) * W + 4, 36 + (k // 4) * H), f'{t:.1f}', fill='white', font=F, stroke_width=2, stroke_fill='black')
    sh.save(out, quality=80)

with cf.ThreadPoolExecutor(4) as ex:
    for name, st in ex.map(dl, names): print('download', name, st, flush=True)
for n in names: sheet(n)
print('sheets done', flush=True)
import numpy as np
from faster_whisper import WhisperModel
wm = WhisperModel(os.environ.get('WHISPER', 'small.en'), device='cpu', compute_type='int8', cpu_threads=2)
for name in names:
    src = os.path.join(WORK, 'clips', name + '.mp4'); o = os.path.join(WORK, 'tx', name + '.json')
    if os.path.exists(o) or not os.path.exists(src): continue
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    segs, _ = wm.transcribe(x, beam_size=5, word_timestamps=True, condition_on_previous_text=False, vad_filter=True,
                            initial_prompt=f"Twitch streamer {C[name]['broadcaster'].get('displayName', '')} live with chat. Kai Cenat, IShowSpeed, Speed, Fanum, Agent, Duke, AMP, chat, bro, bruh.")
    words, text = [], []
    for s in segs:
        text.append(f'[{s.start:.1f}] {s.text.strip()}')
        words += [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2), 'p': round(w.probability, 2)} for w in (s.words or [])]
    json.dump({'segments': [{'s': 0, 'e': len(x) / 16000, 't': ' '.join(text), 'words': words}]}, open(o, 'w'))
    open(o[:-5] + '.txt', 'w').write('\n'.join(text) + '\n')
    print('tx', name, '|', ' '.join(text)[:160], flush=True)
print('PULL_DONE')
