#!/usr/bin/env python3
"""Find clip-worthy moments in a long video or stream recording.

usage: python analyze.py source.mp4 workdir [--model base.en|small.en] [--n 10] [--min 15] [--max 55]
writes workdir/transcript.json  (segments + words with times, for captions)
       workdir/candidates.json  (scored windows) and workdir/candidates.md (readable, for picking clips)

Scoring per window (all relative to the video's own baseline, so quiet and loud streams both work):
  loudness spikes (reactions, shouting, explosions), hype words, speech density, visual cuts (keyframe scene changes).
The candidates are a shortlist: a person (or Claude) reads candidates.md and writes clips.json for render.py.
"""
import argparse, json, os, re, subprocess
import numpy as np

HYPE = set('''no way what wow bro yo dude insane crazy oh god omg wait look run go stop help dead died kill killed
cops police wanted stars chase crash explosion boom lets bruh holy yes yeah huge biggest best worst never ever
actually literally impossible secret hidden easter egg glitch bug funny lol haha laugh scream'''.split())

def sh(cmd): return subprocess.run(cmd, capture_output=True, text=True)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('work')
    ap.add_argument('--model', default='base.en'); ap.add_argument('--n', type=int, default=0)
    ap.add_argument('--min', type=float, default=15); ap.add_argument('--max', type=float, default=55)
    ap.add_argument('--chat', help='TwitchDownloader chat.json (default: chat.json next to the source, if present)')
    ap.add_argument('--chat-delay', type=float, default=6.0, help='seconds chat lags behind the moment')
    a = ap.parse_args(); os.makedirs(a.work, exist_ok=True)
    dur = float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.src]).stdout.strip())
    n_want = a.n or max(5, min(25, int(dur / 240)))

    # 1. audio at 16 kHz mono (int16 keeps a 3-hour stream under 400 MB)
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.src, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    y = np.frombuffer(pcm, np.int16)
    hop = 8000                                                    # 0.5 s frames
    fr = y[:len(y) // hop * hop].reshape(-1, hop).astype(np.float32) / 32768
    db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-6)
    # local excitement: how far each frame sits above the rolling median of the last ~60 s
    k = 120; med = np.array([np.median(db[max(0, i - k):i + 1]) for i in range(len(db))])
    spread = max(3.0, float(np.percentile(db, 90) - np.percentile(db, 30)))
    exc = np.clip((db - med) / spread, 0, 3)

    # 2. transcript with word times (VAD skips music and silence)
    from faster_whisper import WhisperModel
    m = WhisperModel(a.model, device='cpu', compute_type='int8', cpu_threads=int(os.environ.get('THREADS', '2')))
    segs, info = m.transcribe(y.astype(np.float32) / 32768, beam_size=5, word_timestamps=True, vad_filter=True,
                              condition_on_previous_text=False, language='en')
    segments = []
    for s in segs:
        segments.append({'start': s.start, 'end': s.end, 'text': s.text.strip(),
                         'words': [{'w': w.word.strip(), 's': w.start, 'e': w.end, 'p': round(w.probability, 2)} for w in (s.words or [])]})
    json.dump({'source': os.path.abspath(a.src), 'duration': dur, 'segments': segments}, open(f'{a.work}/transcript.json', 'w'))

    # 3. visual activity: scene changes on keyframes only (fast even for long streams)
    out = sh(['ffmpeg', '-hide_banner', '-skip_frame', 'nokey', '-i', a.src, '-vf', "scale=192:-2,select='gt(scene,0.3)',showinfo", '-an', '-f', 'null', '-']).stderr
    cuts = np.array([float(x) for x in re.findall(r'pts_time:([0-9.]+)', out)])

    # 4. per-0.5 s word features
    nfr = len(db); hype = np.zeros(nfr); talk = np.zeros(nfr)
    for s in segments:
        for w in s['words']:
            i = min(nfr - 1, int(w['s'] * 2)); talk[i] += 1
            if re.sub(r"[^a-z]", '', w['w'].lower()) in HYPE: hype[i] += 1
        if s['text'].endswith(('!', '?')): hype[min(nfr - 1, int(s['end'] * 2))] += 0.5

    # 4b. chat replay: message rate and hype emotes, shifted back by the chat delay (chat reacts after the moment)
    chat = np.zeros(nfr); chat_path = a.chat or os.path.join(os.path.dirname(os.path.abspath(a.src)), 'chat.json')
    n_msgs = 0
    if os.path.exists(chat_path):
        off_f = os.path.join(os.path.dirname(chat_path), 'chat_offset.txt')
        off = float(open(off_f).read()) if os.path.exists(off_f) else 0.0
        for c in json.load(open(chat_path)).get('comments', []):
            t = c.get('content_offset_seconds', 0) - off - a.chat_delay
            if 0 <= t < dur:
                body = (c.get('message') or {}).get('body', '') or ''
                w = 1.0 + 1.5 * bool(re.search(r'KEKW|LUL|OMEGALUL|LMAO|Pog|POG|W{2,}|^W$|\?{3,}|WTF|CLIP|clip it|monkaS|Sadge|ICANT|Aware|LOL', body))
                chat[min(nfr - 1, int(t * 2))] += w; n_msgs += 1
        if n_msgs:
            sm = np.convolve(chat, np.ones(20) / 20, mode='same')                    # 10 s rate
            base = np.array([np.median(sm[max(0, i - 600):i + 1]) for i in range(nfr)])  # 5 min baseline
            chat = np.clip((sm - base) / max(1e-6, float(np.percentile(sm, 90) - np.percentile(sm, 40))), 0, 3)
        print(f'chat: {n_msgs} messages used', flush=True)

    # 5. candidate windows: start at a sentence start (or every 5 s when nobody talks), end at a sentence end
    starts = sorted({round(s['start'], 2) for s in segments} | {float(t) for t in np.arange(0, max(0, dur - a.min), 5.0)})
    ends = np.array(sorted({round(s['end'], 2) for s in segments} | {float(t) for t in np.arange(a.min, dur, 5.0)}))
    cand = []
    for st in starts:
        ok = ends[(ends >= st + a.min) & (ends <= st + a.max)]
        if not len(ok): continue
        for en in ok[:: max(1, len(ok) // 4)]:
            i0, i1 = int(st * 2), int(en * 2)
            e = exc[i0:i1]
            if not len(e): continue
            peak = float(np.sort(e)[-3:].mean())                     # the loudest moments carry a clip
            early = float(e[: min(len(e), 10)].max()) if len(e) else 0   # something happens in the first 5 s (hook)
            vis = float(((cuts >= st) & (cuts < en)).sum()) / max(1.0, (en - st) / 10)
            score = 1.6 * peak + 0.6 * early + 0.8 * min(3, hype[i0:i1].sum()) / 3 + 0.4 * min(1.5, talk[i0:i1].sum() / ((en - st) * 2.5)) \
                + 0.3 * min(2.0, vis) - 0.004 * max(0, en - st - 35) + (2.0 * float(np.sort(chat[i0:i1])[-6:].mean()) if n_msgs else 0)
            cand.append((score, st, float(en)))
    cand.sort(reverse=True); picked = []
    for sc, st, en in cand:                                           # greedy, no overlaps
        if all(en <= p[1] - 2 or st >= p[2] + 2 for p in picked): picked.append((sc, st, en))
        if len(picked) >= n_want: break
    picked.sort(key=lambda p: p[1])
    res = []
    for sc, st, en in picked:
        txt = ' '.join(s['text'] for s in segments if s['end'] > st and s['start'] < en)
        i0, i1 = int(st * 2), int(en * 2); pk = st + float(np.argmax(exc[i0:i1])) / 2
        cpk = st + float(np.argmax(chat[i0:i1])) / 2 if n_msgs else None
        res.append({'start': round(st, 2), 'end': round(en, 2), 'score': round(sc, 2), 'peak_at': round(pk, 1), 'chat_peak_at': cpk, 'text': txt})
    json.dump(res, open(f'{a.work}/candidates.json', 'w'), indent=1)
    with open(f'{a.work}/candidates.md', 'w') as f:
        f.write(f'# Candidates for {os.path.basename(a.src)} ({dur / 60:.1f} min, {len(segments)} speech segments, {len(cuts)} scene cuts)\n\n')
        for i, r in enumerate(res, 1):
            f.write(f"## {i}. {r['start']:.1f}–{r['end']:.1f} s ({r['end'] - r['start']:.0f} s)  score {r['score']}  loudest at {r['peak_at']} s" + (f"  chat peak {r['chat_peak_at']:.1f} s" if r.get('chat_peak_at') is not None else '') + f"\n{r['text'] or '(no speech)'}\n\n")
    print(f'{len(res)} candidates -> {a.work}/candidates.md')

if __name__ == '__main__':
    main()
