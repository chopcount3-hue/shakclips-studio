# synthesize every script line with Chatterbox Turbo (blend ref), Whisper-check, up to 3 takes; writes narr/NN.wav + narr/lines.json
import json, os, re, time, difflib, numpy as np, soundfile as sf, torch
torch.set_num_threads(2)
from chatterbox.tts_turbo import ChatterboxTurboTTS as M
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
R = '/home/claude/ronaldo'; os.makedirs(f'{R}/narr', exist_ok=True)
X = json.load(open(f'{R}/extra.json')); lines = [(x['k'], x['text']) for x in X]
m = M.from_pretrained(device='cpu')
_nl = m.norm_loudness; m.norm_loudness = lambda w, s, target_lufs=-27: np.asarray(_nl(w, s, target_lufs), dtype=np.float32)
m.prepare_conditionals(f'{R}/voice_refs/ref_blend.wav')
wm = WhisperModel('base.en', device='cpu', compute_type='int8', cpu_threads=2)
voc = wm.hf_tokenizer.get_vocab(); sup = [-1] + sorted(i for t, i in voc.items() if any(c.isdigit() for c in t))
def words(t): return re.findall(r"[a-z']+", t.lower().replace('-', ' '))
out, t0 = [], time.time()
for i, (sec, text) in enumerate(lines):
    best = None
    for take in range(3):
        torch.manual_seed(7000 + 100 * i + take)
        w = m.generate(text, temperature=0.75).squeeze().cpu().numpy().astype(np.float32)
        idx = np.where(np.abs(w) > 0.01 * np.abs(w).max())[0]; w = w[max(0, idx[0] - 480): idx[-1] + 2400]
        segs, _ = wm.transcribe(resample_poly(w, 16000, m.sr).astype(np.float32), beam_size=5, language='en', suppress_tokens=sup, word_timestamps=True)
        segs = list(segs); hyp = [x for s in segs for x in s.words or []]
        ref = words(text); hw = words(' '.join(x.word for x in hyp))
        err = sum(max(a1 - a0, b1 - b0) for op, a0, a1, b0, b1 in difflib.SequenceMatcher(a=ref, b=hw, autojunk=False).get_opcodes() if op != 'equal')
        ratio = len(w) / m.sr / max(0.5, len(ref) / 185 * 60)
        score = err + (10 if not 0.65 <= ratio <= 1.5 else 0)
        if best is None or score < best[0]: best = (score, w, err, take, [{'w': x.word.strip(), 's': x.start, 'e': x.end} for x in hyp])
        if err <= max(1, 0.06 * len(ref)) and 0.65 <= ratio <= 1.5: break
    _, w, err, take, wd = best
    sf.write(f'{R}/narr/{sec}.wav', w, m.sr)
    out.append({'i': sec, 'section': sec, 'text': text, 'file': f'{R}/narr/{sec}.wav', 'dur': len(w) / m.sr, 'errors': err, 'take': take + 1, 'words': wd})
    json.dump(out, open(f'{R}/narr/extra_lines.json', 'w'), indent=1)
    print(f'{i:02d} {sec:9s} {len(w) / m.sr:5.1f}s take {take + 1} err {err}  ({time.time() - t0:.0f}s)', flush=True)
tot = sum(x['dur'] for x in out); nw = sum(len(words(x['text'])) for x in out)
print(f'DONE {len(out)} lines, {tot:.0f}s narration, {nw / tot * 60:.0f} wpm, worst {max(x["errors"] for x in out)} errors')
