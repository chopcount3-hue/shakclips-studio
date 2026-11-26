import json, glob, os, re, sys, subprocess, numpy as np
load = lambda f: np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout, np.float32)
from faster_whisper import WhisperModel
m = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=1)
exp = {f'p_{k}{i}': t for k, v in json.load(open('lines.json')).items() for i, t in enumerate(v)}
exp.update({f'n_{c}': t for c, t in json.load(open('names.json')).items()})
norm = lambda s: re.sub(r'[^a-z ]', ' ', s.lower().replace('mwaha', ' ')).split()
bad = []
for f in sorted(glob.glob('mp3/*.mp3')):
    k = os.path.basename(f)[:-4]
    if sys.argv[1:] and not any(k.startswith(p) for p in sys.argv[1:]): continue
    got = ' '.join(s.text for s in m.transcribe(load(f), beam_size=1, language='en')[0])
    e, g = set(w for w in norm(exp[k]) if len(w) > 2 and 'ha' not in w), set(norm(got))
    miss = [w for w in e if w not in g]
    ok = len(miss) <= max(0, len(e) // 4)
    if not ok: bad.append(k)
    print('OK ' if ok else 'BAD', k, '|', got.strip()[:70], '| missing:', miss[:4])
print('BAD:', ' '.join(bad))
