#!/usr/bin/env python3
"""Viral-style Shorts editor (v2): cold-open teaser, jump cuts, punch-in zooms, flash/shake impacts,
slow-mo replay, VFX transitions, word captions and SFX on exact words. Output always under 60 s.

usage: python edit.py plan.json outdir
plan.json (per-plan keys as in render.py: source, transcript, layout, facecam, zoom, crop_x, font) plus per clip:
  "start", "end"          source seconds of the story (or "ranges": [[a, b], ...] hand-picked spans, in order)
  "teaser": [a, b]        optional: the payoff shown first (1.5-3 s), then a flash transition into the story
  "replay": [a, b]        optional: the peak again at half speed with a REPLAY tag, at the end
  "jump_cuts": true       drop dead air (gaps > 0.35 s with no speech and no loud reaction)
  "hook": "TEXT"          banner for the first ~2.8 s
  "sfx":  [{"src_t": 346.0, "name": "bruh", "gain": 0.9}]   times in SOURCE seconds (mapped through the cuts)
  "fx":   [{"src_t": 346.0, "type": "flash" | "shake" | "punch"}]
  "narration": [{"src_t": 418.5, "text": "Kai thought this mountain was a shortcut."}]   # our voiceover (house voice);
                          # "out_t" instead of "src_t" places a line at an output time (e.g. 0.3 over the teaser)
  "marks": [{"src_t": 433.0, "type": "arrow" | "circle", "x": 0.55, "y": 0.62, "dur": 1.6, "size": 0.16, "dir": "down"}]
                          # red arrow (tip at x,y) / red circle (centre at x,y); x,y are fractions of the 1080x1920 frame
  "notes": [{"src_t": 440.2, "text": "BRO IS SERIOUS", "color": "yellow"|"red"|"green"|"purple"|"white"|"black", "y": 0.30,
             "dur": 1.6, "rot": -3, "sfx": "vine_boom"}]   # our own written commentary pop-ups (the no-voiceover Shorts);
                          # "|" breaks a line; "out_t" instead of "src_t" places it at an output time
  "stickers": [{"src_t": 441.0, "gif": "/path/x.gif" | "emoji": "😭", "pos": "tr"|"tl"|"mr"|"ml"|"br"|"bl"|"c" or [x, y],
                "size": 300, "dur": 1.6, "sfx": "..."}]     # Giphy meme stickers or emoji
  "min_narration": 0.25   # originality gate: share of the Short covered by our voice (YouTube reused-content rules)
  "max_len": 58, "min_len": 45   # Shorts land at 45-58 s: the lead-up is extended automatically when the cut story is short
All SFX names come from sfx/user (the owner's pack), sfx/made (ours) or sfx/cc0.
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import render as R

W, H, FPS = 1080, 1920, 30
HERE = os.path.dirname(os.path.abspath(__file__))
SFX_DIRS = [os.path.join(HERE, 'sfx', d) for d in ('user', 'made', 'cc0')]

def sh(cmd): return R.sh(cmd)

def loud_frames(src, a, b):
    """0.1 s loudness (dB) for [a, b] of the source."""
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{a:.2f}', '-t', f'{b - a:.2f}', '-i', src, '-vn', '-ac', '1', '-ar', '16000',
                          '-f', 's16le', '-'], capture_output=True).stdout
    y = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; hop = 1600
    fr = y[:len(y) // hop * hop].reshape(-1, hop)
    return 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-6)

def keep_ranges(c, words, src):
    """speech (word spans) plus loud reactions; gaps longer than cut_gap (default 0.6 s) removed, within [start, end].
    With "ranges": [[a, b], ...] only those hand-picked source spans are used (each one jump-cut the same way)."""
    if c.get('ranges'):
        return [r for a, b in c['ranges'] for r in keep_ranges(dict(c, start=a, end=b, ranges=None), words, src)]
    st, en = c['start'], c['end']
    if not c.get('jump_cuts', True): return [[st, en]]
    iv = [[w['s'] - 0.10, w['e'] + 0.18] for w in words if w['e'] > st and w['s'] < en]
    db = loud_frames(src, st, en)
    if len(db):
        thr = max(np.percentile(db, 60), db.max() - 18)
        for i in np.where(db > thr)[0]: iv.append([st + i * 0.1 - 0.05, st + i * 0.1 + 0.15])
    iv.sort(); out = []
    for a, b in iv:
        a, b = max(a, st), min(b, en)
        if b <= a: continue
        if out and a - out[-1][1] <= float(c.get('cut_gap', 0.6)): out[-1][1] = max(out[-1][1], b)
        else: out.append([a, b])
    out = [r for r in out if r[1] - r[0] >= 0.25]
    return out or [[st, en]]

def seg_video(plan, src, a, b, out, zoom=1.0, slow=1.0, fx=(), tag=None):
    """one segment in the vertical layout at 30 fps; zoom = punch-in; fx = [(t_rel, type)]; slow = 2 for half speed."""
    p = json.loads(sh(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', src]).stdout)['streams'][0]
    vf, _ = R.video_filter(plan, p['width'], p['height'])
    chain = [f'fps={FPS}']
    if zoom != 1.0: chain.append(f"scale={int(W * zoom) // 2 * 2}:{int(H * zoom) // 2 * 2},crop={W}:{H}")
    shakes = [t for t, k in fx if k == 'shake']; flashes = [t for t, k in fx if k == 'flash']; punches = [t for t, k in fx if k == 'punch']
    if punches:
        z = '+'.join(f"0.15*exp(-(t-{t:.2f})*7)*gte(t,{t:.2f})*lt(t,{t + 0.9:.2f})" for t in punches)
        chain.append(f"scale=w='trunc({W}*(1+{z})/2)*2':h='trunc({H}*(1+{z})/2)*2':eval=frame,crop={W}:{H}")
    if shakes:
        sx = '+'.join(f"between(t,{t:.2f},{t + 0.4:.2f})*22*sin(t*95)*exp(-(t-{t:.2f})*6)" for t in shakes)
        sy = '+'.join(f"between(t,{t:.2f},{t + 0.4:.2f})*16*cos(t*80)*exp(-(t-{t:.2f})*6)" for t in shakes)
        chain.append(f"scale={W + 64}:{H + 114},crop={W}:{H}:x='32+{sx}':y='57+{sy}'")
    TINT = {'tint': '0x52FF2E', 'tint_y': '0xFFD400', 'tint_r': '0xFF2E2E', 'tint_p': '0xB04CFF'}
    for t, k in fx:
        if k in TINT:
            chain.append(f"drawbox=x=0:y=0:w={W}:h={H}:color={TINT[k]}@0.34:t=fill:enable='between(t,{t:.2f},{t + 0.22:.2f})'")
            chain.append(f"drawbox=x=0:y=0:w={W}:h={H}:color={TINT[k]}@0.16:t=fill:enable='between(t,{t + 0.22:.2f},{t + 0.5:.2f})'")
    for t in flashes:
        chain.append(f"drawbox=x=0:y=0:w={W}:h={H}:color=white@0.85:t=fill:enable='between(t,{t:.2f},{t + 0.07:.2f})'")
        chain.append(f"drawbox=x=0:y=0:w={W}:h={H}:color=white@0.35:t=fill:enable='between(t,{t + 0.07:.2f},{t + 0.14:.2f})'")
    if slow != 1.0:
        chain.insert(0, f'setpts={slow}*PTS')
        chain += ["eq=brightness=0.06:gamma=1.35:saturation=1.25:contrast=1.05", "vignette=PI/5"]
    if tag:
        chain.append(f"drawtext=fontfile={os.path.expanduser('~/.fonts/Anton-Regular.ttf')}:text='{tag}':fontsize=70:fontcolor=white:borderw=6:bordercolor=black:"
                     f"x=(w-text_w)/2:y=300:enable='lt(mod(t,0.8),0.55)'")
    af = 'aformat=sample_rates=48000:channel_layouts=stereo' + (f',atempo={1 / slow:.3f},asetrate=48000*0.9,aresample=48000' if slow != 1.0 else '')
    fc = f"{vf.replace('[v]', '[v0]')};[v0]{','.join(chain)},format=yuv420p[vo];[0:a]{af}[ao]"
    sh(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', src, '-filter_complex', fc, '-map', '[vo]', '-map', '[ao]', '-map_metadata', '-1', '-map_chapters', '-1', '-dn', 
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-r', str(FPS), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', out])
    return float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).stdout)

VOICE_REF = '/home/claude/shakclips-studio/tts/voices/michael_ref.wav'

def synth_lines(lines, cache, narrator=None):
    """[(key, text)] -> {key: (wav, seconds)} with Chatterbox Turbo in a subprocess (frees ~5.7 GB before Whisper runs)."""
    import hashlib
    os.makedirs(cache, exist_ok=True); todo, out = [], {}
    for key, text in lines:
        nr = narrator or {}; f = os.path.join(cache, hashlib.sha1((text + json.dumps(nr, sort_keys=True)).encode()).hexdigest()[:16] + '.wav')
        out[key] = f
        if not os.path.exists(f): todo.append((f, text))
    if todo:
        code = r'''
import json, sys, numpy as np, soundfile as sf, torch, pyloudnorm as ln
torch.set_num_threads(2); a = json.loads(sys.argv[1])
nr = a.get('narrator') or {}
if nr.get('engine', 'orig') == 'orig':
    from chatterbox.tts import ChatterboxTTS as M
else:
    from chatterbox.tts_turbo import ChatterboxTurboTTS as M
m = M.from_pretrained(device='cpu')
if hasattr(m, 'norm_loudness'):
    _nl = m.norm_loudness; m.norm_loudness = lambda w, s, target_lufs=-27: np.asarray(_nl(w, s, target_lufs), dtype=np.float32)
m.prepare_conditionals(a['ref'], exaggeration=float(nr.get('exaggeration', 0.85))) if nr.get('engine', 'orig') == 'orig' else m.prepare_conditionals(a['ref'])
for i, (f, t) in enumerate(a['todo']):
    torch.manual_seed(11 + i)
    kw = dict(exaggeration=float(nr.get('exaggeration', 0.85)), cfg_weight=float(nr.get('cfg', 0.3)), temperature=0.8) if nr.get('engine', 'orig') == 'orig' else dict(temperature=0.8)
    import re as _re
    w = m.generate(_re.sub(r'\[[a-z ]+\]', '', t) if nr.get('engine', 'orig') == 'orig' else t, **kw).squeeze().cpu().numpy().astype(np.float64)
    idx = np.where(np.abs(w) > 0.01 * np.abs(w).max())[0]; w = w[max(0, idx[0] - 600): idx[-1] + 2400]
    g = 10 ** ((-16 - ln.Meter(m.sr).integrated_loudness(w)) / 20); w = np.clip(w * g, -0.97, 0.97)
    sf.write(f, w.astype(np.float32), m.sr)
'''
        sh(['/home/claude/venvs/cbx/bin/python', '-c', code, json.dumps({'todo': todo, 'ref': (narrator or {}).get('ref', VOICE_REF), 'narrator': narrator or {}})])
    return {k: (f, float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout)) for k, f in out.items()}

def sticker_png(kind, d, direction='down'):
    """red arrow (tip at the bottom centre before rotation) or red ring, white outline, 400x400 PNG."""
    from PIL import Image, ImageDraw
    p = os.path.join(d, f'{kind}_{direction}.png')
    if os.path.exists(p): return p
    os.makedirs(d, exist_ok=True); im = Image.new('RGBA', (400, 400), (0, 0, 0, 0)); dr = ImageDraw.Draw(im)
    if kind == 'circle':
        dr.ellipse((14, 14, 386, 386), outline=(255, 255, 255, 255), width=34); dr.ellipse((24, 24, 376, 376), outline=(232, 40, 40, 255), width=18)
    else:
        pts = [(200, 392), (330, 230), (250, 230), (250, 8), (150, 8), (150, 230), (70, 230)]
        dr.polygon(pts, fill=(255, 255, 255, 255)); inner = [(200, 362), (296, 244), (234, 244), (234, 24), (166, 24), (166, 244), (104, 244)]
        dr.polygon(inner, fill=(232, 40, 40, 255))
        rot = {'down': 0, 'down-left': -45, 'left': -90, 'up-left': -135, 'up': 180, 'up-right': 135, 'right': 90, 'down-right': 45}[direction]
        im = im.rotate(rot, resample=Image.BICUBIC)
    im.save(p); return p

COLS = {'green': '&H2EFF52&', 'yellow': '&H00D4FF&', 'red': '&H2E2EFF&', 'white': '&H00FFFFFF&', 'purple': '&HFF4CB0&'}
def single_words(ass, words, cap_y, plan):
    """one word at a time on the seam (the owner's reference edit): Lilita One, thick outline, pop-in, key words coloured."""
    head, _, rest = open(ass).read().partition('[Events]')
    keep = [l for l in rest.splitlines() if l.startswith('Dialogue:') and ',Cap,' not in l]
    size = int(plan.get('cap_size', 132)); font = plan.get('cap_font', 'Lilita One')
    head = re.sub(r'Style: Cap,[^\n]*', f'Style: Cap,{font},{size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,0,0,0,0,100,100,1,0,1,10,5,5,40,40,0,1', head)
    kw = {k.upper(): COLS.get(v, v) for k, v in (plan.get('cap_colors') or {}).items()}
    ev = []
    for i, w in enumerate(words):
        txt = R.esc(w['w'].upper()).strip(' .,!?;:"')
        if not txt: continue
        t0 = w['s']; t1 = words[i + 1]['s'] if i + 1 < len(words) else w['e'] + 0.3
        t1 = min(t1, w['e'] + 0.45); t1 = max(t1, t0 + 0.12)
        if i + 1 < len(words): t1 = min(t1, words[i + 1]['s'] - 0.02)
        if t1 <= t0: continue
        col = kw.get(txt, '&H00FFFFFF&')
        ev.append(f"Dialogue: 1,{R.ass_t(t0)},{R.ass_t(t1)},Cap,,0,0,0,,{{\\pos({W // 2},{cap_y})\\1c{col}\\fscx72\\fscy72\\t(0,70,\\fscx114\\fscy114)\\t(70,140,\\fscx100\\fscy100)}}{txt}")
    open(ass, 'w').write(head + '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n' + '\n'.join(keep + ev) + '\n')

def concat(parts, out):
    lst = out + '.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    sh(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-map', '0:v', '-map', '0:a', '-c', 'copy', '-map_metadata', '-1', '-map_chapters', '-1', '-dn', out])
    return float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).stdout)

def xfade(a, b, out, kind, dur, da):
    """join two clips with a VFX transition (ffmpeg xfade): fadewhite, zoomin, slideleft, circleopen, pixelize, hblur..."""
    off = max(0.05, da - dur)
    sh(['ffmpeg', '-v', 'error', '-y', '-i', a, '-i', b, '-filter_complex',
        f"[0:v]settb=AVTB,fps={FPS},format=yuv420p[a0];[1:v]settb=AVTB,fps={FPS},format=yuv420p[b0];[a0][b0]xfade=transition={kind}:duration={dur}:offset={off:.3f},format=yuv420p[v];[0:a][1:a]acrossfade=d={dur}[a]",
        '-map', '[v]', '-map', '[a]', '-map_metadata', '-1', '-map_chapters', '-1', '-dn',  '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-r', str(FPS), '-c:a', 'aac', '-b:a', '192k', out])
    return off

def main():
    plan = json.load(open(sys.argv[1])); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
    plan.setdefault('sfx_dirs', SFX_DIRS)
    src = plan['source']; tr = json.load(open(plan['transcript']))
    words = [dict(w, w=R.clean(w['w'])) for s in tr['segments'] for w in s['words']]
    narr_lines = [(f'{ci}_{k}', n['text']) for ci, c in enumerate(plan['clips']) for k, n in enumerate(c.get('narration', []))]
    voice = synth_lines(narr_lines, plan.get('voice_cache', os.path.join(outdir, '_voice')), plan.get('narrator')) if narr_lines else {}
    voice_words = {}
    # better captions: re-transcribe only the clip windows with a larger model (base.en mishears game audio)
    asr = plan.get('asr', 'small.en')
    if asr:
        from faster_whisper import WhisperModel
        wm = WhisperModel(asr, device='cpu', compute_type='int8', cpu_threads=2)
        for c in plan['clips']:
            if c.get('ranges'): c.setdefault('start', min(a for a, _ in c['ranges'])); c.setdefault('end', max(b for _, b in c['ranges']))
            a0 = min([c['start']] + [c[k][0] for k in ('teaser', 'replay') if c.get(k)]) - 1.0
            a1 = max([c['end']] + [c[k][1] for k in ('teaser', 'replay') if c.get(k)]) + 1.0
            pcm = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{a0:.2f}', '-t', f'{a1 - a0:.2f}', '-i', src, '-vn', '-ac', '1', '-ar', '16000',
                                  '-f', 's16le', '-'], capture_output=True).stdout
            segs, _ = wm.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, beam_size=5, word_timestamps=True,
                                    vad_filter=True, language='en', condition_on_previous_text=False)
            new = [{'w': R.clean(w.word.strip()), 's': a0 + w.start, 'e': a0 + w.end, 'p': w.probability} for sg in segs for w in (sg.words or [])]
            words = [w for w in words if not (a0 <= w['s'] < a1)] + new
        words.sort(key=lambda w: w['s'])
        for key, (f, _) in voice.items():
            pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
            sg, _ = wm.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, beam_size=5, word_timestamps=True, language='en')
            voice_words[key] = [{'w': R.clean(w.word.strip()), 's': w.start, 'e': w.end, 'p': 1.0, 'narr': True} for x in sg for w in (x.words or [])]
        del wm
    words = [w for w in words if w.get('p', 1) >= float(plan.get('min_word_prob', 0.7))]   # only caption clearly understood speech
    if plan.get('layout') == 'facecam' and plan.get('facecam') in (None, 'auto'):
        r = json.loads(sh([sys.executable, os.path.join(HERE, 'facecam.py'), src]).stdout.strip().splitlines()[-1])
        plan['facecam'], plan['layout'] = (r['facecam'], 'facecam') if r.get('facecam') else (None, 'blur')
    pr = json.loads(sh(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', src]).stdout)['streams'][0]
    global SW, SH; SW, SH = pr['width'], pr['height']
    meta = ['# Shorts\n']
    for ci, c in enumerate(plan['clips']):
        name = f"{ci + 1:02d}_{R.slug(c.get('title') or c.get('hook') or 'clip')}"
        tmp = tempfile.mkdtemp(prefix='edit_', dir=outdir)
        fx_src = [(float(f['src_t']), f['type']) for f in c.get('fx', [])]
        # 1. story with jump cuts (alternate punch-ins hide the jumps), capped so the whole Short stays under max_len
        cap = float(c.get('max_len', 58)) - (c['teaser'][1] - c['teaser'][0] if c.get('teaser') else 0) \
            - (2 * (c['replay'][1] - c['replay'][0]) if c.get('replay') else 0)
        min_story = float(c.get('min_len', 45)) - (cap_extra := float(c.get('max_len', 58)) - cap)
        if c.get('ranges'): c.setdefault('start', c['ranges'][0][0]); c.setdefault('end', c['ranges'][-1][1])
        for _ in range(0 if c.get('ranges') else 12):          # pull in more lead-up (5 s at a time, up to 60 s) until long enough
            if sum(b - a for a, b in keep_ranges(c, words, src)) >= min_story or c['start'] <= float(c.get('earliest', 0)): break
            c['start'] = max(float(c.get('earliest', 0)), c['start'] - 5.0)
        rngs, tot = [], 0.0
        for a, b in keep_ranges(c, words, src):
            if tot >= cap: break
            b = min(b, a + cap - tot); rngs.append([a, b]); tot += b - a
        tl, parts, t_out = [], [], 0.0                              # timeline map: (src_a, src_b, out_t0, speed)
        if c.get('teaser'):
            a, b = c['teaser']; f = os.path.join(tmp, 'teaser.mp4')
            d = seg_video(plan, src, a, b, f, zoom=1.12, fx=[(t - a, k) for t, k in fx_src if a <= t < b])
            tl.append((a, b, 0.0, 1.0)); teaser = (f, d)
        else: teaser = None
        for k, (a, b) in enumerate(rngs):
            f = os.path.join(tmp, f'seg{k:03d}.mp4')
            d = seg_video(plan, src, a, b, f, zoom=1.0 if k % 2 == 0 else 1.08, fx=[(t - a, kk) for t, kk in fx_src if a <= t < b])
            parts.append(f); tl.append((a, b, t_out, 1.0)); t_out += d
        story = os.path.join(tmp, 'story.mp4'); ds = concat(parts, story)
        cur, dcur = story, ds; shift = 0.0; trans_at = []
        if teaser:
            j = os.path.join(tmp, 'tease_story.mp4'); off = xfade(teaser[0], story, j, 'fadewhite', 0.25, teaser[1])
            shift = off; trans_at.append(off); cur, dcur = j, off + ds
            tl = [tl[0]] + [(a, b, t0 + shift, s) for a, b, t0, s in tl[1:]]
        if c.get('replay'):
            a, b = c['replay']; f = os.path.join(tmp, 'replay.mp4')
            dr = seg_video(plan, src, a, b, f, slow=2.0, tag='REPLAY')
            j = os.path.join(tmp, 'with_replay.mp4'); off = xfade(cur, f, j, 'zoomin', 0.3, dcur)
            trans_at.append(off); cur, dcur = j, off + dr
            tl.append((a, b, off, 2.0))
        # 2. map words and SFX through the timeline (replay gets no captions)
        def to_out(t, first_only=True):
            outs = [t0 + (t - a) * s for a, b, t0, s in tl if a <= t < b and s == 1.0]
            return (outs[1] if len(outs) > 1 and tl and teaser and first_only else (outs[0] if outs else None))
        cw = []
        for w in words:
            for a, b, t0, s in tl:
                if s == 1.0 and a <= w['s'] < b and w['e'] <= b + 0.2:
                    cw.append(dict(w, s=t0 + w['s'] - a, e=t0 + min(w['e'], b) - a))
        cw.sort(key=lambda w: w['s'])
        sfx = [(to_out(float(x['src_t'])), x) for x in c.get('sfx', [])]
        sfx = [(t, x) for t, x in sfx if t is not None]
        sfx += [(max(0, t - 0.12), {'name': 'whoosh_transition', 'gain': 0.7}) for t in trans_at]
        if plan.get('cut_sfx'):
            cs = plan['cut_sfx']; cuts = [t0 for _, _, t0, sp in tl if sp == 1.0 and t0 > 0.5]
            sfx += [(max(0, t - 0.05), {'name': cs['name'], 'gain': cs.get('gain', 0.35)}) for k, t in enumerate(cuts) if k % int(cs.get('every', 2)) == 0]
        if c.get('replay'): sfx.append((tl[-1][2] + 0.05, {'name': 'tape_rewind', 'gain': 0.35}))
        # narration placement (no overlaps), ducking intervals
        narr, last_end = [], 0.0
        for k, n in enumerate(c.get('narration', [])):
            t = float(n['out_t']) if 'out_t' in n else to_out(float(n['src_t']))
            if t is None: continue
            f, nd = voice[f'{ci}_{k}']; t = max(t, last_end + 0.12); narr.append((t, nd, f, f'{ci}_{k}')); last_end = t + nd
        if narr:
            cw = [w for w in cw if not any(t - 0.15 <= w['s'] <= t + nd + 0.1 for t, nd, _, _ in narr)]
            for t, nd, _, key in narr: cw += [dict(w, s=t + w['s'], e=t + w['e']) for w in voice_words.get(key, [])]
            cw.sort(key=lambda w: w['s'])
        # 3. captions + hook + SFX mix + loudness
        ass = os.path.join(tmp, 'subs.ass'); _, cap_y = R.video_filter(plan, SW, SH)
        if plan.get('cap_y'): cap_y = int(H * float(plan['cap_y']))   # caption height override (keep them off the face)
        R.ass_file(ass, cw, c.get('hook', ''), cap_y, plan.get('font', 'Luckiest Guy'), plan.get('accent', '&H4AD2FF&'), 2.8)
        if plan.get('cap_mode') == 'single': single_words(ass, cw, cap_y, plan)
        duck = '+'.join(f'between(t,{t - 0.1:.2f},{t + nd + 0.15:.2f})' for t, nd, _, _ in narr)
        marks = []
        for m in c.get('marks', []):
            t = float(m['out_t']) if 'out_t' in m else to_out(float(m['src_t']))
            if t is not None: marks.append((t, m))
        def at_out(o): return float(o['out_t']) if 'out_t' in o else to_out(float(o['src_t']))
        notes = [(at_out(n), n) for n in c.get('notes', [])]; notes = [(t, n) for t, n in notes if t is not None and t < dcur]
        stick = [(at_out(g), g) for g in c.get('stickers', [])]; stick = [(t, g) for t, g in stick if t is not None and t < dcur]
        for t, o in notes + stick:
            if o.get('sfx'): sfx.append((t, {'name': o['sfx'], 'gain': o.get('gain', 0.8)}))
        ins = ['-i', cur]; mix = ['[ga]']; vlast = '[0:v]'; fc = ''
        for j, (t, m) in enumerate(marks):
            png = sticker_png(m.get('type', 'arrow'), os.path.join(outdir, '_stickers'), m.get('dir', 'down'))
            sz = int(W * float(m.get('size', 0.16))); x = int(W * float(m['x'])); y = int(H * float(m['y'])); t1 = t + float(m.get('dur', 1.6))
            ins += ['-loop', '1', '-t', f'{t1 + 0.1:.2f}', '-i', png]
        # input indexes: 0 = video, then one per mark, then sfx, then narration
        if plan.get('cap_size'):
            c_txt = open(ass).read(); c_txt = re.sub(r'(Style: Cap,[^,]+,)\d+', lambda m: m.group(1) + str(int(plan['cap_size'])), c_txt); open(ass, 'w').write(c_txt)
        if plan.get('hook_size'):
            h_txt = open(ass).read(); h_txt = re.sub(r'(Style: Hook,Anton,)\d+', lambda m: m.group(1) + str(int(plan['hook_size'])), h_txt); open(ass, 'w').write(h_txt)
        print('  notes at', [round(float(t), 1) for t, _ in notes], '| stickers at', [round(float(t), 1) for t, _ in stick], flush=True)
        miss = [o.get('text') or o.get('gif') or o.get('emoji') for o in c.get('notes', []) + c.get('stickers', []) if at_out(o) is None]
        if miss: print('  NOT PLACED (time falls in a cut):', miss, flush=True)
        if notes:
            NC = {'yellow': ('&H004AD2FF&', '&H00101010&'), 'red': ('&H003A34E8&', '&H00FFFFFF&'), 'green': ('&H0050C83C&', '&H00FFFFFF&'),
                  'purple': ('&H00FF4691&', '&H00FFFFFF&'), 'white': ('&H00FFFFFF&', '&H00101010&'), 'black': ('&H00101010&', '&H00FFFFFF&')}
            a_txt = open(ass).read().replace('[Events]', f'Style: Note,Anton,{int(plan.get('note_size', 112))},&H00FFFFFF,&H00FFFFFF,&H004AD2FF,&H004AD2FF,0,0,0,0,100,100,1,0,3,22,0,5,40,40,0,1\n\n[Events]', 1)
            a_txt = a_txt.replace('\n\nStyle: Note', '\nStyle: Note', 1)
            evs = []
            for t, n in notes:
                box, col = NC.get(n.get('color', 'yellow'), NC['yellow']); d = float(n.get('dur', 1.6)); y = int(H * float(n.get('y', 0.30)))
                txt = '\\N'.join(R.esc(x.strip().upper()) for x in n['text'].split('|'))
                evs.append(f"Dialogue: 3,{R.ass_t(t)},{R.ass_t(min(dcur, t + d))},Note,,0,0,0,,{{\\pos({W // 2},{y})\\frz{float(n.get('rot', -3)):.1f}"
                           f"\\3c{box}\\4c{box}\\1c{col}\\fad(40,160)\\fscx150\\fscy150\\t(0,130,\\fscx94\\fscy94)\\t(130,210,\\fscx100\\fscy100)}}{txt}")
            open(ass, 'w').write(a_txt.rstrip('\n') + '\n' + '\n'.join(evs) + '\n')
        SP = {'tr': ('W-w-50', '420'), 'tl': ('50', '420'), 'mr': ('W-w-40', '(H-h)/2'), 'ml': ('40', '(H-h)/2'), 'c': ('(W-w)/2', '(H-h)/2'),
              'br': ('W-w-50', 'H-h-430'), 'bl': ('50', 'H-h-430')}
        emo_dir = os.path.join(outdir, '_emoji')
        def emoji_png(ch, size):
            from PIL import Image, ImageDraw, ImageFont
            os.makedirs(emo_dir, exist_ok=True); f = os.path.join(emo_dir, f'emoji_{ord(ch[0]):x}_{size}.png')
            if not os.path.exists(f):
                font = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)
                im = Image.new('RGBA', (160, 160), (0, 0, 0, 0)); ImageDraw.Draw(im).text((10, 10), ch, font=font, embedded_color=True)
                im = im.crop(im.getbbox()); im.resize((size, int(size * im.height / im.width)), Image.LANCZOS).save(f)
            return f
        for t, g in stick:
            d = float(g.get('dur', 1.6))
            if g.get('gif'): ins += ['-ignore_loop', '0', '-t', f'{d:.2f}', '-i', g['gif']]
            else: ins += ['-loop', '1', '-t', f'{d:.2f}', '-framerate', str(FPS), '-i', emoji_png(g['emoji'], int(g.get('size', 260)))]
        idx = 1
        for j, (t, m) in enumerate(marks):
            sz = int(W * float(m.get('size', 0.16))); x = int(W * float(m['x'])); y = int(H * float(m['y'])); t1 = t + float(m.get('dur', 1.6))
            if m.get('type', 'arrow') == 'circle': ox, oy = f'{x - sz // 2}', f'{y - sz // 2}'
            else:   # arrow: tip at (x, y), bobbing toward the target
                dx, dy = {'down': (0, -1), 'up': (0, 1), 'left': (1, 0), 'right': (-1, 0), 'down-left': (0.7, -0.7), 'down-right': (-0.7, -0.7),
                          'up-left': (0.7, 0.7), 'up-right': (-0.7, 0.7)}[m.get('dir', 'down')]
                ox = f"{x - sz // 2 + int(dx * sz * 0.5)}+{dx * 14:.0f}*sin(t*11)"; oy = f"{y - sz // 2 + int(dy * sz * 0.5)}+{dy * 14:.0f}*sin(t*11)"
            fc += f"[{idx}:v]scale={sz}:{sz},format=rgba,fade=in:st={t:.2f}:d=0.12:alpha=1[mk{j}];{vlast}[mk{j}]overlay=x='{ox}':y='{oy}':enable='between(t,{t:.2f},{t1:.2f})'[vm{j}];"
            vlast = f'[vm{j}]'; idx += 1
        for j, (t, g) in enumerate(stick):
            d = float(g.get('dur', 1.6)); size = int(g.get('size', 300))
            x, y = SP.get(g.get('pos', 'tr'), SP['tr']) if isinstance(g.get('pos', 'tr'), str) else (str(int(W * g['pos'][0])), str(int(H * g['pos'][1])))
            fc += (f"[{idx}:v]fps={FPS},tpad=stop_mode=clone:stop_duration={d:.2f},trim=duration={d:.2f},scale={size}:-1,format=rgba,fade=t=in:st=0:d=0.12:alpha=1,fade=t=out:st={max(0.1, d - 0.22):.2f}:d=0.2:alpha=1,"
                   f"tpad=start_duration={t:.3f}:color=black@0.0[gk{j}];{vlast}[gk{j}]overlay=x={x}:y='{y}+40*exp(-7*max(0\\,t-{t:.2f}))*cos(16*max(0\\,t-{t:.2f}))':"
                   f"enable='between(t,{t:.2f},{t + d:.2f})':eof_action=pass[vg{j}];")
            vlast = f'[vg{j}]'; idx += 1
        fc += f"{vlast}ass={ass}:fontsdir={os.path.expanduser('~/.fonts')},format=yuv420p[vo]"
        fc += f";[0:a]aformat=sample_rates=48000:channel_layouts=stereo" + (f",volume='if({duck},0.22,1)':eval=frame" if duck else '') + "[ga]"
        for j, (t, x) in enumerate(sfx):
            ins += ['-i', R.sfx_path(x['name'], plan)]; ms = int(t * 1000)
            fc += f";[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume={float(x.get('gain', 0.9)):.2f}[s{j}]"; mix.append(f'[s{j}]'); idx += 1
        mu = c.get('music', plan.get('music'))
        if mu:
            mp = os.path.join(outdir, '_music', f"{mu.get('style', 'phonk')}_{mu.get('bpm', 130)}_{mu.get('seed', 1)}.wav")
            if not os.path.exists(mp):
                os.makedirs(os.path.dirname(mp), exist_ok=True)
                sh([sys.executable, os.path.join(HERE, 'music.py'), mp, '--seconds', '70', '--bpm', str(mu.get('bpm', 130)),
                    '--seed', str(mu.get('seed', 1)), '--style', mu.get('style', 'phonk')])
            ins += ['-stream_loop', '-1', '-i', mp]; g = float(mu.get('gain', 0.22))
            fc += (f";[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{dcur:.2f},afade=t=in:d=0.4,afade=t=out:st={max(0, dcur - 1.5):.2f}:d=1.5,"
                   f"volume='{g}*if({duck or 0},0.45,1)':eval=frame[mus]"); mix.append('[mus]'); idx += 1
        for j, (t, nd, f, _) in enumerate(narr):
            ins += ['-i', f]; ms = int(t * 1000)
            fc += f";[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume=1.5[n{j}]"; mix.append(f'[n{j}]'); idx += 1
        fc += f";{''.join(mix)}amix=inputs={len(mix)}:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[ao]"
        final = os.path.join(outdir, name + '.mp4')
        sh(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[vo]', '-map', '[ao]', '-map_metadata', '-1', '-map_chapters', '-1', '-dn',  '-c:v', 'libx264', '-preset', 'veryfast',
            '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', final])
        d = float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', final]).stdout)
        subprocess.run(['rm', '-rf', tmp])
        # originality report: our voice coverage + the longest stretch with no cut, narration, mark or effect
        cov = sum(nd for _, nd, _, _ in narr) / max(d, 1)
        ev = sorted({0.0, d} | {t0 for _, _, t0, _ in tl} | set(trans_at) | {t for t, _ in marks} |
                    {to_out(f) or 0 for f, _ in fx_src} | {t for t, _ in stick})
        busy = [(t, t + nd) for t, nd, _, _ in narr] + [(t, t + float(n.get('dur', 1.6))) for t, n in notes]
        gaps, prev = [], 0.0
        for t in ev:
            if t > prev:
                free = [(max(prev, a), min(t, b)) for a, b in busy if b > prev and a < t]
                cur_s = prev
                for a, b in sorted(free): gaps.append((a - cur_s, cur_s)); cur_s = max(cur_s, b)
                gaps.append((t - cur_s, cur_s))
            prev = max(prev, t)
        mx, mx_at = max(gaps or [(0, 0)]); need = float(c.get('min_narration', plan.get('min_narration', 0.25)))
        ok = cov >= need and mx <= float(c.get('max_untouched', 8.0))
        rep_line = f"originality: voice {cov * 100:.0f}% (need {need * 100:.0f}%), {len(notes)} on-screen notes, {len(stick)} stickers, {len(sfx)} sfx, longest untouched stretch {mx:.1f}s at {mx_at:.1f}s (max {float(c.get('max_untouched', 8.0)):.0f}) -> {'PASS' if ok else 'FAIL: add narration or edits'}"
        meta.append(f"## {name}.mp4 ({d:.0f} s)\n**Title:** {c.get('title', '')}\n\n{c.get('description', '')}\n\n{rep_line}\n")
        print('  ' + rep_line, flush=True)
        print(f'{name}.mp4  {d:.1f}s  ({len(rngs)} cuts, {len(sfx)} sfx)', flush=True)
    open(os.path.join(outdir, 'metadata.md'), 'w').write('\n'.join(meta))

if __name__ == '__main__':
    main()
