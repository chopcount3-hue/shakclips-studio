#!/usr/bin/env python3
"""Chatterbox Turbo (Resemble AI, MIT code + MIT weights) narration: the house voice since 2026-11-12
(owner's blind pick "A": Turbo + Michael reference + a [chuckle] cue). Drop-in for kokoro_tts.py:
same input script.json, same out_dir/voice_raw.wav + out_dir/timing.json, so shots.js S(i)/E(i)/wordT() work unchanged.

usage: /home/claude/venvs/cbx/bin/python chatterbox_tts.py script.json out_dir [ref.wav]
  ref.wav: 6-12 s of clean narration whose timbre is copied (default: tts/voices/michael_ref.wav,
           a Kokoro am_michael clip, Apache-2.0, so no real person's voice is cloned).
  Inline cues Turbo performs, in "paragraphs" only (they are stripped from timing and captions):
      [chuckle] [laugh] [sigh] [gasp] [surprised] [whispering] [dramatic] [narration] ...
  Rules for using them are in RUNBOOK step 4.

Every paragraph is checked with faster-whisper (MIT): a take that skips, garbles or repeats words, or whose
length is far from the expected pace, is re-generated (up to 3 takes, best one kept). Report: out_dir/voice_qa.json.
"""
import json, os, re, sys, time
import numpy as np, torch, soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
torch.set_num_threads(int(os.environ.get('THREADS', '2')))
TAG = re.compile(r'\s*\[[a-z ]+\]\s*')
TAKES = int(os.environ.get('TAKES', '3'))

def strip_tags(t): return re.sub(r'\s+', ' ', TAG.sub(' ', t)).strip()
def words(t): return re.findall(r"[a-z']+", strip_tags(t).lower().replace('-', ' '))

def trim(a, sr, thr=0.008):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)] if len(idx) else a

def sentence_spans(a, sr, weights, min_gap=0.12):
    """sentence boundaries inside one paragraph: silences (< -38 dB of peak, >= min_gap) matched to the
    character-proportional expected boundaries, preferring longer pauses (same method as kokoro_tts.py)."""
    fr = int(0.01 * sr); e = np.sqrt((a[:len(a) // fr * fr].reshape(-1, fr) ** 2).mean(1))
    quiet = e < e.max() * 10 ** (-38 / 20); gaps, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * 0.01 >= min_gap and i > 0 and j < len(quiet): gaps.append((i * 0.01, j * 0.01))
            i = j
        else: i += 1
    dur = len(a) / sr; tot = float(sum(weights)); acc = 0; exp = []
    for x in weights[:-1]: acc += x; exp.append(acc / tot * dur)
    chosen, start = [], 0
    for k, tau in enumerate(exp):
        left = len(exp) - k - 1; cand = gaps[start:len(gaps) - left] if left else gaps[start:]
        if not cand: return []
        best = min(range(len(cand)), key=lambda m: abs((cand[m][0] + cand[m][1]) / 2 - tau) - 2.0 * (cand[m][1] - cand[m][0]))
        chosen.append(cand[best]); start += best + 1
    spans, s0 = [], 0.0
    for g0, g1 in chosen: spans.append([s0, g0]); s0 = g1
    spans.append([s0, dur]); return spans

class Checker:
    """faster-whisper base.en word check. Digits are suppressed so 'forty-five' is heard as words, like the script."""
    def __init__(self):
        try:
            from faster_whisper import WhisperModel
            self.m = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=int(os.environ.get('THREADS', '2')))
            voc = self.m.hf_tokenizer.get_vocab()
            self.sup = [-1] + sorted(i for t, i in voc.items() if any(c.isdigit() or c in '%$£€' for c in t))
        except Exception as e:
            print('WARN: no word check (faster-whisper unavailable):', str(e)[:120]); self.m = None
    def errors(self, a, sr, text):
        if self.m is None: return 0, []
        from scipy.signal import resample_poly
        y = resample_poly(a, 16000, sr).astype(np.float32)
        segs, _ = self.m.transcribe(y, beam_size=5, language='en', suppress_tokens=self.sup, condition_on_previous_text=False)
        hyp = words(' '.join(s.text for s in segs)); ref = words(text)
        import difflib
        n, diffs = 0, []
        for op, a0, a1, b0, b1 in difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False).get_opcodes():
            if op == 'equal': continue
            r, h = ' '.join(ref[a0:a1]), ' '.join(hyp[b0:b1])
            if r.replace(' ', '') == h.replace(' ', ''): continue      # "star base" vs "starbase"
            n += max(a1 - a0, b1 - b0); diffs.append(f'{op}: {r!r} -> {h!r}')
        return n, diffs

if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]
    ref = sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, 'voices', 'michael_ref.wav')
    os.makedirs(out, exist_ok=True); t0 = time.time()
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    m = ChatterboxTurboTTS.from_pretrained(device='cpu')
    if hasattr(m, 'norm_loudness'):   # upstream bug (chatterbox-tts 0.1.7): pyloudnorm's gain makes the ref float64 -> "expected Double"
        _nl = m.norm_loudness; m.norm_loudness = lambda w, s, target_lufs=-27: np.asarray(_nl(w, s, target_lufs), dtype=np.float32)
    m.prepare_conditionals(ref); SR = m.sr; chk = Checker()
    S = json.load(open(src)); paras = S.get('paragraphs') or [' '.join(S['sentences'])]
    pauses = S.get('pause_after_paragraph') or [0.6] * len(paras)
    sents = [strip_tags(x) for x in S.get('sentences') or [x for p in paras for x in re.split(r'(?<=[.!?])\s+', strip_tags(p)) if x.strip()]]
    _q = list(sents)
    def split(p):   # sentences of paragraph p, in order from the script's sentence list (handles Ms., U.S., quotes)
        p = strip_tags(p); o, rest = [], p
        while _q and _q[0] in rest: o.append(_q[0]); rest = rest.split(_q.pop(0), 1)[1]
        return o or [x.strip() for x in re.split(r'(?<=[.!?])\s+(?=[A-Z])', p) if x.strip()]
    parts, spans, cur, qa = [np.zeros(int(0.25 * SR), np.float32)], [], 0.25, []
    for i, p in enumerate(paras):
        nw = len(words(p)); want = nw / 158 * 60          # expected seconds at the house pace
        best = None
        for take in range(TAKES):
            torch.manual_seed(1000 * i + take)
            a = trim(m.generate(p, temperature=0.8).squeeze().cpu().numpy().astype(np.float32), SR)
            ratio = len(a) / SR / max(want, 0.5); n, diffs = chk.errors(a, SR, p)
            bad = n > max(2, 0.08 * nw) or not (0.72 <= ratio <= 1.40)
            score = n + (10 if not (0.72 <= ratio <= 1.40) else 0)
            if best is None or score < best[0]: best = (score, a, n, ratio, diffs, take)
            if not bad: break
            print(f'  para {i + 1}: take {take + 1} rejected ({n} word errors, length x{ratio:.2f}) {diffs[:3]}', flush=True)
        _, a, n, ratio, diffs, take = best
        qa.append({'paragraph': i + 1, 'words': nw, 'word_errors': n, 'length_ratio': round(ratio, 2), 'take': take + 1, 'diffs': diffs})
        ps = split(p); ns = len(ps)
        sp = sentence_spans(a, SR, [len(x) for x in ps]) if ns > 1 else [[0.0, len(a) / SR]]
        if len(sp) != ns:
            L = [len(x) for x in ps]; tot = sum(L); acc = 0; sp = []
            for l in L: sp.append([acc / tot * len(a) / SR, (acc + l) / tot * len(a) / SR]); acc += l
        spans += [[cur + x0, cur + x1] for x0, x1 in sp]
        pz = pauses[i] if i < len(pauses) else 0.6
        parts += [a, np.zeros(int(pz * SR), np.float32)]; cur += len(a) / SR + (pz if i < len(paras) - 1 else 0)
        print(f'para {i + 1}/{len(paras)}: {len(a) / SR:.1f}s, take {take + 1}, {n} word errors  ({time.time() - t0:.0f}s elapsed)', flush=True)
    a = np.concatenate(parts[:-1]); a = a / max(1e-6, np.max(np.abs(a))) * 0.89
    sf.write(os.path.join(out, 'voice_raw.wav'), a, SR, subtype='FLOAT')
    json.dump({'times': spans, 'total': len(a) / SR, 'sentences': sents, 'voice': 'chatterbox-turbo+michael_ref', 'speed': 1.0,
               'paragraph_count': len(paras)}, open(os.path.join(out, 'timing.json'), 'w'))
    json.dump(qa, open(os.path.join(out, 'voice_qa.json'), 'w'), indent=1)
    dur = len(a) / SR; nwt = sum(len(s.split()) for s in sents); worst = max(q['word_errors'] for q in qa)
    print(f'chatterbox-turbo: {dur:.2f}s, {nwt / dur * 60:.0f} wpm, synth {time.time() - t0:.0f}s, {len(spans)} spans for {len(sents)} sentences, '
          f'worst paragraph {worst} word errors')
