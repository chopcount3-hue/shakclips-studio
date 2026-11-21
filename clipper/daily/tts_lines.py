#!/usr/bin/env python3
"""Narration lines for longform.py with Kokoro-82M (Apache-2.0, local, free). Each line is synthesized on its own, so no
sentence is ever cut out of a longer take (that clipped words on 20 Nov). Words come from Whisper on each line.
usage: <cbx python> tts_lines.py lines_in.json out_dir [voice=am_michael] [speed=1.05]
lines_in.json: [{"i": "h0", "text": "..."}, ...]  (spell names the way they sound, numbers as words where it matters)
-> out_dir/<i>.wav (24 kHz mono, -19 LUFS-ish peak-normalised) and out_dir/lines.json [{i, text, file, dur, words}]"""
import json, os, sys
import numpy as np
from scipy.io import wavfile
sys.path.insert(0, os.environ.get('STUDIO', '/home/claude/shakclips-studio') + '/tts')
from kokoro_tts import Kokoro, trim, SR
src, out = sys.argv[1], sys.argv[2]; voice = sys.argv[3] if len(sys.argv) > 3 else 'am_michael'; speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.05
os.makedirs(out, exist_ok=True); L = json.load(open(src)); k = Kokoro()
from faster_whisper import WhisperModel
wm = WhisperModel('small.en', device='cpu', compute_type='int8', cpu_threads=2)
res = []
for x in L:
    a, _ = k.synth(x['text'], voice, speed); a = trim(a)
    a = np.concatenate([np.zeros(int(0.04 * SR), np.float32), a, np.zeros(int(0.12 * SR), np.float32)])
    a = a / max(1e-6, np.abs(a).max()) * 0.89
    f = os.path.join(out, x['i'] + '.wav'); wavfile.write(f, SR, (a * 32767).astype(np.int16))
    y16 = np.interp(np.arange(0, len(a), SR / 16000), np.arange(len(a)), a).astype(np.float32)
    segs, _ = wm.transcribe(y16, beam_size=5, language='en', word_timestamps=True, condition_on_previous_text=False)
    words = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2), 'p': 1.0} for s in segs for w in (s.words or [])]
    heard = ' '.join(w['w'] for w in words)
    res.append({'i': x['i'], 'text': x['text'], 'file': os.path.abspath(f), 'dur': round(len(a) / SR, 3), 'words': words, 'errors': 0})
    print(f"{x['i']}: {len(a) / SR:.1f}s | {heard[:90]}", flush=True)
json.dump(res, open(os.path.join(out, 'lines.json'), 'w'), indent=1)
print('TTS_DONE', len(res), 'lines,', round(sum(r['dur'] for r in res), 1), 's')
