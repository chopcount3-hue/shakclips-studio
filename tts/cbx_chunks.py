# usage (in a project folder, after voice.sh fell back to Kokoro because Chatterbox was OOM-killed):
#   /home/claude/venvs/cbx/bin/python $STUDIO/tts/cbx_chunks.py 8 && echo chatterbox-turbo > voice/ENGINE && $STUDIO/tts/voice_post.sh
# Each chunk of 8 paragraphs runs in a fresh process, so the memory growth never reaches the 7 GB limit (2026-11-12).
# Run Chatterbox Turbo in fresh processes over paragraph chunks (one long run was OOM-killed at para 17), then merge.
import json, subprocess, sys, os, numpy as np, soundfile as sf
CH = int(sys.argv[1]) if len(sys.argv) > 1 else 8
S = json.load(open('script.json')); P = S['paragraphs']; pz = S['pause_after_paragraph']
import re
TAG = re.compile(r'\s*\[[a-z ]+\]\s*'); strip = lambda t: re.sub(r'\s+', ' ', TAG.sub(' ', t)).strip()
sents = S['sentences']; si = 0; chunks = []
for a in range(0, len(P), CH):
    ps = P[a:a + CH]; n = 0; rest = ' '.join(strip(p) for p in ps)
    while si + n < len(sents) and sents[si + n] in rest: rest = rest.split(sents[si + n], 1)[1]; n += 1
    chunks.append((a, ps, sents[si:si + n], pz[a:a + CH])); si += n
assert si == len(sents), (si, len(sents))
cbx = '/home/claude/venvs/cbx/bin/python'; tool = '/home/claude/shakclips-studio/tts/chatterbox_tts.py'
for k, (a, ps, ss, pp) in enumerate(chunks):
    d = f'cbx_part{k}'
    if os.path.exists(d + '/timing.json'): print('skip', d); continue
    json.dump({'title': S['title'], 'paragraphs': ps, 'sentences': ss, 'pause_after_paragraph': pp, 'pron': S.get('pron', {})}, open(f'cbx_part{k}.json', 'w'))
    r = subprocess.run(['nice', cbx, tool, f'cbx_part{k}.json', d], env=dict(os.environ, THREADS='2'))
    if r.returncode: sys.exit(f'chunk {k} failed ({r.returncode})')
audio, times, qa, cur, SR = [], [], [], 0.0, None
for k, (a, ps, ss, pp) in enumerate(chunks):
    x, SR = sf.read(f'cbx_part{k}/voice_raw.wav', dtype='float32'); T = json.load(open(f'cbx_part{k}/timing.json'))
    if k: gap = max(0.0, pz[a - 1] - 0.25); audio.append(np.zeros(int(gap * SR), np.float32)); cur += gap
    times += [[cur + s0, cur + s1] for s0, s1 in T['times']]; audio.append(x); cur += len(x) / SR
    for q in json.load(open(f'cbx_part{k}/voice_qa.json')): q['paragraph'] += a; qa.append(q)
y = np.concatenate(audio); y = y / np.max(np.abs(y)) * 0.89
os.makedirs('voice', exist_ok=True); sf.write('voice/voice_raw.wav', y, SR, subtype='FLOAT')
json.dump({'times': times, 'total': len(y) / SR, 'sentences': [strip(s) for s in sents], 'voice': 'chatterbox-turbo+michael_ref', 'speed': 1.0, 'paragraph_count': len(P)}, open('voice/timing.json', 'w'))
json.dump(qa, open('voice/voice_qa.json', 'w'), indent=1)
nw = sum(len(s.split()) for s in sents); print(f'merged: {len(y)/SR:.2f}s, {nw/(len(y)/SR)*60:.0f} wpm, {len(times)} spans / {len(sents)} sentences, worst {max(q["word_errors"] for q in qa)} errors')
