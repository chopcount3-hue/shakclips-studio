#!/usr/bin/env python3
"""Narration with Google's Gemini TTS (the channel voice: Fenrir), longform.py-ready, few requests.

usage: <cbx venv python> tts_gemini.py lines.json out_dir [--voice Fenrir] [--style "..."]
lines.json: [{"i": 0, "text": "...", "group": 0}, ...]   lines with the same group are read in ONE request (one natural
take, like a person reading a paragraph), then cut back into lines with Whisper word timings.
writes out_dir/<i>.wav (24 kHz mono) and out_dir/lines.json [{i, text, file, dur, words:[{w,s,e}], errors}]
Key: GEMINI_API_KEY in the environment or ~/.config/watch/.env. Free tier: gemini-2.5-flash-preview-tts, which allows only a
few requests per minute and per day: groups keep a 5-minute video to about 6 requests, spaced 22 s apart.
"""
import argparse, base64, difflib, json, os, re, time, urllib.request, urllib.error, wave
import numpy as np

MODEL = os.environ.get('TTS_MODEL', 'gemini-2.5-flash-preview-tts')
STYLE = ("Read this script as a hyped, funny YouTube storyteller talking to a friend: quick, natural, real energy, little dramatic "
         "pauses, deadpan on the jokes, never robotic or announcer-like. Leave a short pause between paragraphs")
_last = [0.0]

def key():
    k = os.environ.get('GEMINI_API_KEY', '').strip()
    if not k:
        for l in open(os.path.expanduser('~/.config/watch/.env')):
            if l.startswith('GEMINI_API_KEY='): k = l.split('=', 1)[1].strip()
    return k

def tts(text, voice, style):
    body = {'contents': [{'parts': [{'text': f'{style}:\n\n{text}'}]}],
            'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}
    for attempt in range(8):
        wait = 22 - (time.time() - _last[0])
        if wait > 0: time.sleep(wait)
        _last[0] = time.time()
        req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
                                     data=json.dumps(body).encode(), headers={'x-goog-api-key': key(), 'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=240) as r: d = json.load(r)
            return base64.b64decode(d['candidates'][0]['content']['parts'][0]['inlineData']['data'])
        except urllib.error.HTTPError as e:
            body_txt = e.read().decode(); msg = body_txt[:400]
            if e.code in (429, 500, 503):
                if 'PerDay' in body_txt:
                    raise RuntimeError('daily free limit reached (10 requests/day on the free tier): try again after midnight Pacific time, or enable billing')
                print(f'  wait ({e.code})', flush=True)
                time.sleep(30 * (attempt + 1)); continue
            raise RuntimeError(f'HTTP {e.code}: {msg}')
    raise RuntimeError('TTS kept failing (rate limit or server busy)')

def toks(s): return re.findall(r"[a-z']+", s.lower().replace('-', ' '))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('lines'); ap.add_argument('out')
    ap.add_argument('--voice', default='Fenrir'); ap.add_argument('--style', default=STYLE)
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    from faster_whisper import WhisperModel
    wm = WhisperModel('small.en', device='cpu', compute_type='int8', cpu_threads=4)
    voc = wm.hf_tokenizer.get_vocab(); sup = [-1] + sorted(i for t, i in voc.items() if any(c.isdigit() for c in t))
    L = json.load(open(a.lines)); res_path = os.path.join(a.out, 'lines.json')
    done = {str(x['i']): x for x in json.load(open(res_path))} if os.path.exists(res_path) else {}
    out = [done[str(x['i'])] for x in L if str(x['i']) in done and done[str(x['i'])]['text'] == x['text']]
    have = {str(x['i']) for x in out}
    groups = {}
    for x in L:
        if str(x['i']) not in have: groups.setdefault(x.get('group', x['i']), []).append(x)
    for g, items in groups.items():
        best = None
        for take in range(2):
            pcm = tts('\n\n'.join(x['text'] for x in items), a.voice, a.style)
            y = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
            y16 = np.interp(np.arange(0, len(y), 1.5), np.arange(len(y)), y).astype(np.float32)
            segs, _ = wm.transcribe(y16, beam_size=5, language='en', suppress_tokens=sup, word_timestamps=True, condition_on_previous_text=False)
            hw = [{'w': w.word.strip(), 's': w.start, 'e': w.end} for s in segs for w in (s.words or [])]
            hyp = []; hmap = []
            for j, w in enumerate(hw):
                for t in toks(w['w']): hyp.append(t); hmap.append(j)
            ref, rline = [], []
            for k, x in enumerate(items):
                for t in toks(x['text']): ref.append(t); rline.append(k)
            m = [None] * len(ref); errs = [0] * len(items)
            for op, a1, a2, b1, b2 in difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False).get_opcodes():
                if op == 'equal':
                    for q in range(a2 - a1): m[a1 + q] = hmap[b1 + q]
                else:
                    for q in range(a1, max(a2, a1 + 1)):
                        if q < len(ref): errs[rline[q]] += 1
            spans = []
            for k in range(len(items)):
                idx = [m[q] for q in range(len(ref)) if rline[q] == k and m[q] is not None]
                spans.append((hw[min(idx)]['s'], hw[max(idx)]['e']) if idx else None)
            score = sum(errs) + 50 * sum(sp is None for sp in spans)
            if best is None or score < best[0]: best = (score, y, hw, spans, errs)
            if score <= max(2, 0.05 * len(ref)): break
        score, y, hw, spans, errs = best
        sr = 24000; n = len(y)
        for k, x in enumerate(items):                        # cut halfway into the pauses between lines
            if spans[k] is None: print(f"  line {x['i']} not found in take", flush=True); continue
            s0, e0 = spans[k]
            prev_e = next((spans[q][1] for q in range(k - 1, -1, -1) if spans[q]), 0.0)
            next_s = next((spans[q][0] for q in range(k + 1, len(items)) if spans[q]), n / sr)
            cs = max(0.0, (prev_e + s0) / 2 if k else s0 - 0.08); ce = min(n / sr, (e0 + next_s) / 2 if k < len(items) - 1 else e0 + 0.12)
            cs, ce = max(cs, s0 - 0.25), min(ce, e0 + 0.30)
            seg = y[int(cs * sr): int(ce * sr)].copy(); fade = int(0.012 * sr)
            seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
            f = os.path.join(a.out, f"{x['i']}.wav")
            with wave.open(f, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(seg, -1, 1) * 32767).astype(np.int16).tobytes())
            words = [{'w': w['w'], 's': round(w['s'] - cs, 2), 'e': round(w['e'] - cs, 2)} for w in hw if cs <= w['s'] < ce]
            out.append({'i': x['i'], 'text': x['text'], 'file': f, 'dur': round(len(seg) / sr, 3), 'words': words, 'errors': errs[k]})
            print(f"{x['i']}: {len(seg) / sr:.1f}s err {errs[k]} | {x['text'][:60]}", flush=True)
        json.dump(out, open(res_path, 'w'), indent=1)
    print('DONE', len(out), 'lines', round(sum(x['dur'] for x in out)), 's', flush=True)

if __name__ == '__main__':
    main()
