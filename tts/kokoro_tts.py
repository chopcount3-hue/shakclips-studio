#!/usr/bin/env python3
"""Kokoro-82M (ONNX, Apache-2.0) narration: paragraph-level synthesis, no time-stretch.

usage: python3 kokoro_tts.py script.json out_dir [voice] [speed]
  script.json: {"paragraphs": ["...", "..."], "pause_after": [0.6, ...]}   (or {"sentences": [...]}: grouped automatically)
  voice: a Kokoro voice name (am_michael, am_fenrir, am_puck, af_heart, af_bella, bm_george, ...)
         or a blend "am_michael:0.6+am_fenrir:0.4"
writes out_dir/voice_raw.wav (24 kHz mono) and out_dir/timing.json (sentence start/end from silence detection)
"""
import json, os, re, subprocess, sys, time
import numpy as np, onnxruntime as rt
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
KDIR = os.environ.get('KOKORO_DIR', '/home/claude/untrusted/kokoro')
ESPEAK = os.environ.get('ESPEAK', '/home/claude/tts/espeak/bin/espeak-ng')
SR = 24000
VOCAB = json.load(open(os.path.join(KDIR, 'repo/src/kokoro_onnx/config.json')))['vocab']
PUNCT = ';:,.!?—…"()“”'

def ipa(chunk, lang='en-us'):
    out = subprocess.run([ESPEAK, '-q', '--ipa', '-v', lang, chunk], capture_output=True, text=True).stdout
    return ' '.join(l.strip() for l in out.splitlines() if l.strip())

PRON = {}   # word -> IPA overrides (set from the script's "pron" field)
def phonemize(text, lang='en-us'):
    """espeak IPA per clause, punctuation re-inserted (what phonemizer's preserve_punctuation does); PRON words use given IPA."""
    text = text.replace('...', '…').replace(' - ', ' — ')
    parts = re.split(r'([;:,.!?—…"()“”]+)', text)
    out = ''
    for p in parts:
        if not p: continue
        if re.fullmatch(r'[;:,.!?—…"()“”]+', p): out = out.rstrip() + p + ' '; continue
        if not p.strip(): continue
        if PRON:
            pat = r'\b(' + '|'.join(re.escape(k) for k in sorted(PRON, key=len, reverse=True)) + r')\b'
            for seg in re.split(pat, p.strip()):
                if not seg.strip(): continue
                out += (PRON[seg] if seg in PRON else ipa(seg.strip(), lang)) + ' '
        else: out += ipa(p.strip(), lang) + ' '
    ph = ''.join(c for c in out.strip() if c in VOCAB)
    return re.sub(r' +', ' ', ph)

def load_voice(spec, voices):
    if '+' in spec or ':' in spec:
        acc = None
        for part in spec.split('+'):
            name, w = (part.split(':') + ['1'])[:2]
            v = voices[name].astype(np.float32) * float(w); acc = v if acc is None else acc + v
        return acc
    return voices[spec].astype(np.float32)

class Kokoro:
    def __init__(self, model='kokoro-v1.0.onnx'):
        so = rt.SessionOptions(); so.intra_op_num_threads = int(os.environ.get('THREADS', '2'))
        self.sess = rt.InferenceSession(os.path.join(KDIR, model), so, providers=['CPUExecutionProvider'])
        self.voices = np.load(os.path.join(KDIR, 'voices-v1.0.bin'))
    def synth(self, text, voice='am_michael', speed=1.0, lang='en-us'):
        ph = phonemize(text, lang); style_all = load_voice(voice, self.voices)
        chunks, cur = [], ''
        for sent in re.split(r'(?<=[.!?…])\s+', ph):           # keep chunks under the 510-token limit
            if len(cur) + len(sent) + 1 > 400 and cur: chunks.append(cur); cur = sent
            else: cur = (cur + ' ' + sent).strip()
        if cur: chunks.append(cur)
        audio = []
        for c in chunks:
            toks = [VOCAB[x] for x in c if x in VOCAB]
            style = style_all[min(len(toks), len(style_all)) - 1]
            a = self.sess.run(None, {'tokens': np.array([[0, *toks, 0]], dtype=np.int64), 'style': style.reshape(1, -1).astype(np.float32), 'speed': np.array([speed], dtype=np.float32)})[0]
            audio.append(a.reshape(-1)); audio.append(np.zeros(int(0.25 * SR), np.float32))
        return np.concatenate(audio[:-1]) if audio else np.zeros(1, np.float32), ph

def trim(a, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - int(0.03 * SR)): idx[-1] + int(0.08 * SR)] if len(idx) else a

def sentence_spans(a, n_expected, min_gap=0.16, weights=None):
    """sentence start/end times inside one paragraph. Candidate silences (frames under -38 dB of the peak, >= min_gap)
    are matched to the expected boundaries (character-proportional), preferring longer pauses near each expected point."""
    fr = int(0.01 * SR); e = np.sqrt((a[:len(a) // fr * fr].reshape(-1, fr) ** 2).mean(1))
    quiet = e < e.max() * 10 ** (-38 / 20)
    gaps, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * 0.01 >= min_gap and i > 0 and j < len(quiet): gaps.append((i * 0.01, j * 0.01))
            i = j
        else: i += 1
    dur = len(a) / SR; w = weights or [1] * n_expected; tot = float(sum(w)); acc = 0; exp = []
    for x in w[:-1]: acc += x; exp.append(acc / tot * dur)
    chosen, start = [], 0
    for k, tau in enumerate(exp):
        left = len(exp) - k - 1; cand = gaps[start:len(gaps) - left] if left else gaps[start:]
        if not cand: return []
        best = min(range(len(cand)), key=lambda m: abs((cand[m][0] + cand[m][1]) / 2 - tau) - 2.0 * (cand[m][1] - cand[m][0]))
        chosen.append(cand[best]); start += best + 1
    spans, s0 = [], 0.0
    for g0, g1 in chosen: spans.append([s0, g0]); s0 = g1
    spans.append([s0, dur]); return spans

if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else 'am_michael'
    speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
    os.makedirs(out, exist_ok=True)
    S = json.load(open(src)); PRON.update(S.get('pron', {})); k = Kokoro()
    paras = S.get('paragraphs') or [' '.join(S['sentences'])]
    pauses = S.get('pause_after_paragraph') or [0.6] * len(paras)
    sents = S.get('sentences') or [x for p in paras for x in re.split(r'(?<=[.!?])\s+', p) if x.strip()]
    t0 = time.time(); _q = list(sents)
    def split(p):   # sentences of paragraph p, taken in order from the script's sentence list (handles Ms., U.S., quotes)
        out, rest = [], p
        while _q and _q[0] in rest: out.append(_q[0]); rest = rest.split(_q.pop(0), 1)[1]
        return out or [x.strip() for x in re.split(r'(?<=[.!?])\s+(?=[A-Z])', p) if x.strip()]
    parts, spans, cur = [np.zeros(int(0.25 * SR), np.float32)], [], 0.25
    for i, p in enumerate(paras):
        a, ph = k.synth(p, voice, speed); a = trim(a)
        ps = split(p); ns = len(ps); sp = sentence_spans(a, ns, 0.09, [len(x) for x in ps]) if ns > 1 else [[0.0, len(a) / SR]]
        if len(sp) != ns:                                   # fallback: proportional to characters
            L = [len(x) for x in ps]; tot = sum(L); acc = 0; sp = []
            for l in L: sp.append([acc / tot * len(a) / SR, (acc + l) / tot * len(a) / SR]); acc += l
        spans += [[cur + x0, cur + x1] for x0, x1 in sp]
        parts += [a, np.zeros(int(pauses[i] * SR), np.float32)]; cur += len(a) / SR + (pauses[i] if i < len(paras) - 1 else 0)
    a = np.concatenate(parts[:-1]) if pauses[-1] else np.concatenate(parts)
    a = a / max(1e-6, np.max(np.abs(a))) * 0.89
    wavfile.write(os.path.join(out, 'voice_raw.wav'), SR, a.astype(np.float32))
    json.dump({'times': spans, 'total': len(a) / SR, 'sentences': sents, 'voice': voice, 'speed': speed, 'paragraph_count': len(paras)}, open(os.path.join(out, 'timing.json'), 'w'))
    dur = len(a) / SR; words = sum(len(s.split()) for s in sents)
    print(f'{voice} speed {speed}: {dur:.2f}s, {words / dur * 60:.0f} wpm, synth {time.time() - t0:.1f}s, {len(spans)} spans for {len(sents)} sentences')
