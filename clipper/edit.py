#!/usr/bin/env python3
"""Viral-style Shorts editor (v2): cold-open teaser, jump cuts, punch-in zooms, flash/shake impacts,
slow-mo replay, VFX transitions, word captions and SFX on exact words. Output always under 60 s.

usage: python edit.py plan.json outdir
plan.json (per-plan keys as in render.py: source, transcript, layout, facecam, zoom, crop_x, font) plus per clip:
  "start", "end"          source seconds of the story
  "teaser": [a, b]        optional: the payoff shown first (1.5-3 s), then a flash transition into the story
  "replay": [a, b]        optional: the peak again at half speed with a REPLAY tag, at the end
  "jump_cuts": true       drop dead air (gaps > 0.35 s with no speech and no loud reaction)
  "hook": "TEXT"          banner for the first ~2.8 s
  "sfx":  [{"src_t": 346.0, "name": "bruh", "gain": 0.9}]   times in SOURCE seconds (mapped through the cuts)
  "fx":   [{"src_t": 346.0, "type": "flash" | "shake" | "punch"}]
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
    """speech (word spans) plus loud reactions, gaps > 0.35 s removed, within [start, end]."""
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
        if out and a - out[-1][1] <= 0.35: out[-1][1] = max(out[-1][1], b)
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
    # better captions: re-transcribe only the clip windows with a larger model (base.en mishears game audio)
    asr = plan.get('asr', 'small.en')
    if asr:
        from faster_whisper import WhisperModel
        wm = WhisperModel(asr, device='cpu', compute_type='int8', cpu_threads=2)
        for c in plan['clips']:
            a0 = min([c['start']] + [c[k][0] for k in ('teaser', 'replay') if c.get(k)]) - 1.0
            a1 = max([c['end']] + [c[k][1] for k in ('teaser', 'replay') if c.get(k)]) + 1.0
            pcm = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{a0:.2f}', '-t', f'{a1 - a0:.2f}', '-i', src, '-vn', '-ac', '1', '-ar', '16000',
                                  '-f', 's16le', '-'], capture_output=True).stdout
            segs, _ = wm.transcribe(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768, beam_size=5, word_timestamps=True,
                                    vad_filter=True, language='en', condition_on_previous_text=False)
            new = [{'w': R.clean(w.word.strip()), 's': a0 + w.start, 'e': a0 + w.end, 'p': w.probability} for sg in segs for w in (sg.words or [])]
            words = [w for w in words if not (a0 <= w['s'] < a1)] + new
        words.sort(key=lambda w: w['s'])
    words = [w for w in words if w.get('p', 1) >= float(plan.get('min_word_prob', 0.45))]   # don't caption guesses
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
        for _ in range(12):                                   # pull in more lead-up (5 s at a time, up to 60 s) until long enough
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
        if c.get('replay'): sfx.append((tl[-1][2] + 0.05, {'name': 'tape_rewind', 'gain': 0.35}))
        # 3. captions + hook + SFX mix + loudness
        ass = os.path.join(tmp, 'subs.ass'); _, cap_y = R.video_filter(plan, SW, SH)
        R.ass_file(ass, cw, c.get('hook', ''), cap_y, plan.get('font', 'Luckiest Guy'), plan.get('accent', '&H4AD2FF&'), 2.8)
        ins = ['-i', cur]; mix = ['[0:a]']; fc = f"[0:v]ass={ass}:fontsdir={os.path.expanduser('~/.fonts')},format=yuv420p[vo]"
        for k, (t, x) in enumerate(sfx, 1):
            ins += ['-i', R.sfx_path(x['name'], plan)]; ms = int(t * 1000)
            fc += f";[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume={float(x.get('gain', 0.9)):.2f}[s{k}]"; mix.append(f'[s{k}]')
        fc += f";{''.join(mix)}amix=inputs={len(mix)}:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[ao]"
        final = os.path.join(outdir, name + '.mp4')
        sh(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[vo]', '-map', '[ao]', '-map_metadata', '-1', '-map_chapters', '-1', '-dn',  '-c:v', 'libx264', '-preset', 'veryfast',
            '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', final])
        d = float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', final]).stdout)
        subprocess.run(['rm', '-rf', tmp])
        meta.append(f"## {name}.mp4 ({d:.0f} s)\n**Title:** {c.get('title', '')}\n\n{c.get('description', '')}\n")
        print(f'{name}.mp4  {d:.1f}s  ({len(rngs)} cuts, {len(sfx)} sfx)', flush=True)
    open(os.path.join(outdir, 'metadata.md'), 'w').write('\n'.join(meta))

if __name__ == '__main__':
    main()
