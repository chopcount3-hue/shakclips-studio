#!/usr/bin/env python3
"""16:9 commentary long-form builder: narration over real clips, stat stamps, info cards, original-audio moments with
slow-mo replays, section title cards, user SFX, a ducked original music bed and burned-in captions.

usage: <cbx venv python> longform.py plan.json out.mp4      (needs numpy, scipy, soundfile, pyloudnorm)

plan.json
{
  "lines": ["narr/lines.json", "narr/extra_lines.json"],      # [{i, file, dur, text, words:[{w,s,e}]}]; i is an int or a key ("x3")
  "clips": {"lake": "/path/lake.mp4", ...},                    # aliases
  "clipopts": {"lake": {"crop": [0, 0, 1, 0.8]}},              # default options per clip (crop out burned-in captions, fit, tint)
  "music": {"style": "trap", "bpm": 84, "seed": 7, "full_lufs": -21, "duck_db": 14},
  "sections": [{
     "card": "cards/03.mp4",                                  # pre-rendered title card (Remotion TitleCard), optional
     "card_sfx": [["fast_swish_transition", 0.0, 0.8], ["boom", 0.15, 0.7]],
     "pool": [["lake", 0, 30], ...],                           # default b-roll under this section's narration lines
     "items": [
        {"line": 8, "shots": [{"clip": "lake", "a": 30, "b": 60}, {"info": ["NO GOALS|IN 2 GAMES", "EURO 2016"], "bg": ["lake", 35]}],
         "stamp": {"text": "SCORED TWICE", "at": 0.4, "dur": 2.6, "sfx": "ting"}, "sfx": [["suspense_5", 0.0, 0.25]]},
        {"moment": ["lake", 8.5, 13.0], "fx": [["flash", 1.6], ["shake", 1.6]], "label": "LYON · JUNE 2016", "replay": [9.5, 12.5],
         "audio": 1.0, "sfx": [["throw_away", 1.4, 0.9]]},
        {"info": ["CÓRDOBA 1–2 REAL MADRID", "JANUARY 2015"], "bg": ["comp", 340], "dur": 2.4, "sfx": [...]},   # card with no narration
        {"file": "cards/word.mp4", "sfx": [...]}                                                             # any pre-rendered clip
     ]}]
}
A shot spec: {"clip", "a", "b", "crop": [x, y, w, h] (fractions), "fit": true (vertical sources on a blurred fill), "tint": "bw"|"red",
"label"} or an info card {"info": [head, sub], "bg": [clip, t]} ("|" breaks the head into lines). All shots but the last take
"d" seconds (default: split evenly); a long shot is cut into 2.2-3.4 s pieces that keep moving through its range.
SFX: [name, at, gain], at in seconds from the item start or "end" (end of the narration line). Whooshes, risers and swishes
are aligned on their loudest point; everything else on its onset.
Output: out.mp4 (1920x1080 30 fps, -14 LUFS, AAC 320k) and out.json (commentary share, longest untouched stretch, timeline).
"""
import json, os, re, subprocess, sys, difflib
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
from scipy.ndimage import maximum_filter1d, uniform_filter1d
import pyloudnorm as pyln

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, SR = 1920, 1080, 30, 48000
W2, H2 = 2112, 1188
FF = os.environ.get('FFMPEG', 'ffmpeg')
FONT = os.path.expanduser('~/.fonts/Anton-Regular.ttf')
GAP = 0.22

def sh(cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode: raise RuntimeError(' '.join(map(str, cmd[:10])) + ' ...\n' + r.stderr[-2000:])
    return r
def dur(f): return float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout)
ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-r', str(FPS), '-pix_fmt', 'yuv420p']

class Builder:
    def __init__(self, plan, out):
        self.p, self.out = plan, os.path.abspath(out); self.work = self.out + '.parts'; os.makedirs(self.work, exist_ok=True)
        self.parts, self.t, self.k = [], 0.0, 0
        self.narr, self.sfx, self.words, self.stamps, self.moments, self.timeline = [], [], [], [], [], []
        self.overlays = []
        self.lines = {}
        for f in plan['lines']:
            for x in json.load(open(f)): self.lines[str(x['i'])] = x
        self.sfx_dirs = plan.get('sfx_dirs') or [os.path.join(HERE, 'sfx', d) for d in ('user', 'made', 'cc0')]

    def clip(self, alias): return self.p['clips'].get(alias, alias)
    def opts(self, spec):
        o = dict(self.p.get('clipopts', {}).get(spec.get('clip', ''), {})); o.update({k: v for k, v in spec.items() if v is not None}); return o

    # ---------- video pieces ----------
    def render(self, spec, a, d, slow=1.0, fx=(), label=None, audio=0.0, replay=False):
        """one 1920x1080 shot of d output seconds starting at source time a."""
        o = self.opts(spec); src = self.clip(o['clip']); k = self.k; self.k += 1
        f = os.path.join(self.work, f'{len(self.parts):04d}.mov')
        L = d / slow
        pre = [f'setpts={slow}*PTS'] if slow != 1 else []
        if o.get('crop'):
            x, y, w, h = o['crop']; pre.append(f'crop=iw*{w}:ih*{h}:iw*{x}:ih*{y}')
        pre += [f'fps={FPS}']
        xs = [f"(iw-{W})*t/{d:.2f}", f"(iw-{W})*(1-t/{d:.2f})", f"(iw-{W})/2", f"(iw-{W})/2"][k % 4]
        ys = [f"(ih-{H})/2", f"(ih-{H})/2", f"(ih-{H})*t/{d:.2f}", f"(ih-{H})*(1-t/{d:.2f})"][k % 4]
        for kind, t in fx:
            if kind == 'shake':
                xs += f"+between(t,{t:.2f},{t + 0.5:.2f})*34*sin(t*90)*exp(-(t-{t:.2f})*6)"
                ys += f"+between(t,{t:.2f},{t + 0.5:.2f})*24*cos(t*75)*exp(-(t-{t:.2f})*6)"
        mv = f"crop={W}:{H}:x='max(0,min(iw-{W},{xs}))':y='max(0,min(ih-{H},{ys}))'"
        post = ['unsharp=5:5:0.6']
        tint = o.get('tint')
        if tint == 'bw': post.append('hue=s=0,eq=contrast=1.18:brightness=-0.03')
        if tint == 'red': post.append('colorchannelmixer=rr=1.18:gg=0.72:bb=0.72,eq=contrast=1.12')
        if replay: post += ['eq=saturation=1.25:contrast=1.1', 'vignette=PI/4.5']
        for kind, t in fx:
            if kind == 'flash':
                post.append(f"drawbox=x=0:y=0:w={W}:h={H}:color=white@0.9:t=fill:enable='between(t,{t:.2f},{t + 0.067:.2f})'")
                post.append(f"drawbox=x=0:y=0:w={W}:h={H}:color=white@0.4:t=fill:enable='between(t,{t + 0.067:.2f},{t + 0.134:.2f})'")
            if kind == 'red':
                post.append(f"drawbox=x=0:y=0:w={W}:h={H}:color=0xE8343A@0.35:t=fill:enable='between(t,{t:.2f},{t + 0.2:.2f})'")
            if kind in ('green', 'yellow'):   # colour wash on a hype word (the owner's reference edit)
                col = '0x52FF2E' if kind == 'green' else '0xFFD400'
                post.append(f"drawbox=x=0:y=0:w={W}:h={H}:color={col}@0.32:t=fill:enable='between(t,{t:.2f},{t + 0.22:.2f})'")
                post.append(f"drawbox=x=0:y=0:w={W}:h={H}:color={col}@0.15:t=fill:enable='between(t,{t + 0.22:.2f},{t + 0.5:.2f})'")
        lab = label or o.get('label')
        if lab: post.append(self.text_filter(lab, 'x=60:y=56', 54, 'white', box='0xE8343A@0.95', boxw=16))
        if replay:
            post.append(self.text_filter('REPLAY', 'x=w-tw-70:y=56', 58, 'white', border=5, enable='lt(mod(t,0.8),0.55)'))
            post.append(f"drawbox=x=0:y=0:w={W}:h={H}:color=white@0.6:t=fill:enable='lt(t,0.07)'")
        if o.get('cam'):
            cx, cy, cw, chh = o['cam']; CH = int(H2 * 0.80)
            fc = (f"[0:v]{','.join(pre)},split=3[b][f][g];[b]scale={W2}:{H2}:force_original_aspect_ratio=increase,crop={W2}:{H2},boxblur=30:2,"
                  f"eq=brightness=-0.28:saturation=0.6[bg];[f]crop=iw*{cw}:ih*{chh}:iw*{cx}:ih*{cy},scale='min(1150,iw*{CH}/ih)':-2,"
                  f"pad=iw+18:ih+18:9:9:white[fg];[g]scale=720:-2,pad=iw+12:ih+12:6:6:white[gi];"
                  f"[bg][fg]overlay=150:(H-h)/2[t1];[t1][gi]overlay=W-w-150:190,{mv},{','.join(post)}[v]")
        elif o.get('fit'):
            fc = (f"[0:v]{','.join(pre)},split[b][f];[b]scale={W2}:{H2}:force_original_aspect_ratio=increase,crop={W2}:{H2},boxblur=28:2,"
                  f"eq=brightness=-0.18:saturation=0.7[bg];[f]scale=-2:{int(H2 * 0.96)}[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,{mv},{','.join(post)}[v]")
        else:
            fc = f"[0:v]{','.join(pre)},scale={W2}:{H2}:force_original_aspect_ratio=increase,crop={W2}:{H2},{mv},{','.join(post)}[v]"
        cmd = [FF, '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{L + 0.1:.3f}', '-i', src]
        if audio > 0:
            af = 'aformat=sample_rates=48000:channel_layouts=stereo' + (f',atempo={1 / slow:.4f}' if slow != 1 else '')
            af += f",loudnorm=I=-21:TP=-3:LRA=9,volume={audio:.2f},afade=t=in:d=0.03,apad"
            fc += f";[0:a]{af}[a]"; amap = ['-map', '[a]']
        else:
            cmd += ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']; amap = ['-map', '1:a']
        sh(cmd + ['-filter_complex', fc, '-map', '[v]', *amap, '-t', f'{d:.3f}', '-map_metadata', '-1', '-map_chapters', '-1', '-dn',
                  *ENC, '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', f])
        return self.add(f, d, o.get('clip'))

    def text_filter(self, text, pos, size, color, box=None, boxw=12, border=0, enable=None, alpha=None):
        tf = os.path.join(self.work, f'txt_{abs(hash((text, size))) % 10 ** 10}.txt'); open(tf, 'w').write(text)
        s = f"drawtext=fontfile={FONT}:textfile={tf}:fontsize={size}:fontcolor={color}:{pos}"
        if box: s += f":box=1:boxcolor={box}:boxborderw={boxw}"
        if border: s += f":borderw={border}:bordercolor=black"
        if enable: s += f":enable='{enable}'"
        if alpha: s += f":alpha='{alpha}'"
        return s

    def post_png(self, p):
        """a news-post card: outlet and date, the real headline, and a yellow highlight with our one-line takeaway."""
        from PIL import Image, ImageDraw, ImageFont
        F = '/usr/share/fonts/opentype/inter/'
        f_out, f_date, f_head, f_hi = (ImageFont.truetype(F + 'Inter-ExtraBold.otf', 38), ImageFont.truetype(F + 'Inter-Regular.otf', 32),
                                       ImageFont.truetype(F + 'Inter-Bold.otf', 58), ImageFont.truetype(F + 'Inter-ExtraBold.otf', 40))
        Wc, pad = 1180, 56; words = p['headline'].split(); lines, cur = [], ''
        for w in words:
            t = (cur + ' ' + w).strip()
            if f_head.getlength(t) > Wc - 2 * pad - 20 and cur: lines.append(cur); cur = w
            else: cur = t
        lines.append(cur)
        hi = p.get('highlight', ''); Hc = pad + 50 + 28 + len(lines) * 72 + (36 + 70 if hi else 0) + pad
        im = Image.new('RGBA', (Wc + 40, Hc + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rounded_rectangle((20, 26, Wc + 20, Hc + 26), 30, fill=(0, 0, 0, 120))
        d.rounded_rectangle((14, 14, Wc + 14, Hc + 14), 30, fill=(255, 255, 255, 255))
        d.rounded_rectangle((14, 14, 14 + 16, Hc + 14), 8, fill=tuple(int(p.get('accent', '9146FF')[i:i + 2], 16) for i in (0, 2, 4)) + (255,))
        x, y = 14 + pad, 14 + pad
        d.text((x, y), p['outlet'].upper(), font=f_out, fill=(17, 17, 17)); ox = x + f_out.getlength(p['outlet'].upper()) + 18
        d.text((ox, y + 5), '·  ' + p['date'], font=f_date, fill=(110, 110, 120)); y += 50 + 28
        for ln in lines: d.text((x, y), ln, font=f_head, fill=(15, 15, 20)); y += 72
        if hi:
            y += 36; tw = f_hi.getlength(hi) + 40
            d.rounded_rectangle((x - 6, y - 8, x + tw, y + 56), 10, fill=(255, 212, 0)); d.text((x + 14, y), hi, font=f_hi, fill=(20, 20, 20))
        f = os.path.join(self.work, f'post_{abs(hash(json.dumps(p, sort_keys=True))) % 10 ** 10}.png'); im.save(f); return f

    def post(self, spec, d):
        """a news-post card sliding up over a blurred frame of related footage."""
        png = self.post_png(spec['post']); bgc, bt = spec.get('bg') or [None, 0]
        f = os.path.join(self.work, f'{len(self.parts):04d}.mov')
        o = self.opts({'clip': bgc}); pre = [f"crop=iw*{o['crop'][2]}:ih*{o['crop'][3]}:iw*{o['crop'][0]}:ih*{o['crop'][1]}"] if o.get('crop') else []
        fc = (f"[0:v]{','.join(pre + [f'fps={FPS}'])},scale={W2}:{H2}:force_original_aspect_ratio=increase,crop={W2}:{H2},crop={W}:{H}:x='(iw-{W})/2+(iw-{W})/2*t/{d:.2f}':y='(ih-{H})/2',"
              f"boxblur=24:2,eq=brightness=-0.22:saturation=0.6,vignette=PI/3.5[bg];[2:v]format=rgba,fade=t=in:st=0:d=0.25:alpha=1[c];"
              f"[bg][c]overlay=x=(W-w)/2:y='(H-h)/2+max(0\\,70*(1-t/0.3))':shortest=0,format=yuv420p[v]")
        sh([FF, '-v', 'error', '-y', '-ss', f'{bt:.2f}', '-t', f'{d + 0.1:.2f}', '-i', self.clip(bgc), '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
            '-loop', '1', '-t', f'{d + 0.1:.2f}', '-i', png, '-filter_complex', fc, '-map', '[v]', '-map', '1:a', '-t', f'{d:.3f}', '-map_metadata', '-1',
            *ENC, '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', f])
        return self.add(f, d, 'post')

    def info(self, spec, d):
        """an info card: the head (and a sub line) over a blurred, darkened, red-tinted frame of related footage."""
        head, sub = (list(spec['info']) + [''])[:2]; bgc, bt = spec.get('bg') or [None, 0]
        f = os.path.join(self.work, f'{len(self.parts):04d}.mov'); k = self.k; self.k += 1
        heads = head.split('|'); m = max(len(x) for x in heads); size = 168 if m <= 18 else 138 if m <= 24 else 112
        lh = int(size * 1.12); top = (H - lh * len(heads) - (110 if sub else 0)) // 2
        vf = []
        for j, ln in enumerate(heads):
            y0 = top + j * lh
            vf.append(self.text_filter(ln, f"x=(w-tw)/2:y={y0}+max(0\\,40*(1-t/0.28))", size, 'white',
                                       alpha=f"min(1\\,max(0\\,(t-{0.06 * j:.2f})/0.22))"))
        if sub:
            ys = top + lh * len(heads) + 26
            vf.append(f"drawbox=x=(iw-760)/2:y={ys - 8}:w=760:h=6:color=0xE8343A@1:t=fill:enable='gte(t,0.15)'")
            vf.append(self.text_filter(sub, f"x=(w-tw)/2:y={ys + 18}", 68, '0xFFD24A', alpha="min(1\\,max(0\\,(t-0.2)/0.25))"))
        sign = '' if k % 2 else '-'
        zoom = f"crop={W}:{H}:x='(iw-{W})/2{sign}+(iw-{W})/2*t/{d:.2f}':y='(ih-{H})/2'".replace('-+', '-')
        if bgc:
            o = self.opts({'clip': bgc}); pre = [f"crop=iw*{o['crop'][2]}:ih*{o['crop'][3]}:iw*{o['crop'][0]}:ih*{o['crop'][1]}"] if o.get('crop') else []
            inp = ['-ss', f'{bt:.2f}', '-t', f'{d + 0.1:.2f}', '-i', self.clip(bgc)]
            fc = (f"[0:v]{','.join(pre + [f'fps={FPS}'])},scale={W2}:{H2}:force_original_aspect_ratio=increase,crop={W2}:{H2},{zoom},"
                  f"boxblur=22:2,hue=s=0.25,{'colorchannelmixer=rr=1.05:gg=0.5:bb=1.15' if self.p.get('info_tint') == 'vice' else 'colorchannelmixer=rr=1.1:gg=0.6:bb=0.6'},eq=brightness=-0.2:contrast=1.1,vignette=PI/3.5,{','.join(vf)}[v]")
        else:
            inp = ['-f', 'lavfi', '-t', f'{d + 0.1:.2f}', '-i', f'color=c=0x140608:s={W}x{H}:r={FPS}']
            fc = f"[0:v]vignette=PI/3.5,{','.join(vf)}[v]"
        sh([FF, '-v', 'error', '-y', *inp, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-filter_complex', fc, '-map', '[v]', '-map', '1:a',
            '-t', f'{d:.3f}', '-map_metadata', '-1', *ENC, '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', f])
        return self.add(f, d, 'info')

    def file(self, src, keep_audio=False):
        f = os.path.join(self.work, f'{len(self.parts):04d}.mov')
        amap = ['-map', '0:a'] if keep_audio else ['-map', '1:a']
        sh([FF, '-v', 'error', '-y', '-i', src, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-map', '0:v', *amap, '-shortest',
            '-vf', f'fps={FPS},scale={W}:{H},format=yuv420p', '-map_metadata', '-1', *ENC, '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2', f])
        return self.add(f, dur(f), 'file')

    def add(self, f, d, what):
        d = dur(f); self.parts.append(f); self.timeline.append((round(self.t, 2), round(d, 2), what)); self.t += d; return d

    def shots(self, specs, need):
        """fill `need` seconds with the given shot specs (last one takes the rest), cutting long ones into 2.2-3.4 s pieces."""
        specs = [dict(s) for s in specs]
        fixed = sum(s.get('d', 0) for s in specs[:-1]); free = [s for s in specs[:-1] if 'd' not in s]
        rest = max(0.6, need - fixed); share = rest / (len(free) + 1)
        for s in free: s['d'] = share
        specs[-1]['d'] = max(0.6, need - sum(s['d'] for s in specs[:-1]))
        t_end = self.t + need
        for j, s in enumerate(specs):
            left = s['d'] if j < len(specs) - 1 else t_end - self.t
            if 'info' in s: self.info(s, left); continue
            if 'post' in s: self.post(s, left); continue
            a, b = s.get('a', 0), s.get('b', 1e9); pos = a
            while left > 0.05:
                ln = left if left < 3.8 else 2.2 + (self.k % 3) * 0.6
                if pos + ln > b: pos = a
                got = self.render(s, pos, min(ln, left)); left -= got; pos += got

    # ---------- items ----------
    def sfx_at(self, item_t, lst, line_end=None):
        for s in lst or []:
            at = (line_end if s[1] == 'end' else item_t + float(s[1])); self.sfx.append((at, s[0], float(s[2]) if len(s) > 2 else 0.8))

    def ov_at(self, item_t, lst, line_end=None):
        for o in lst or []:
            at = line_end + o.get('shift', 0) if o.get('at') == 'end' else item_t + float(o.get('at', 0)); self.overlays.append((at, o))

    def emoji_png(self, ch, size):
        from PIL import Image, ImageDraw, ImageFont
        f = os.path.join(self.work, f'emoji_{ord(ch[0]):x}_{size}.png')
        if not os.path.exists(f):
            font = ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf', 109)
            im = Image.new('RGBA', (160, 160), (0, 0, 0, 0)); ImageDraw.Draw(im).text((10, 10), ch, font=font, embedded_color=True)
            im = im.crop(im.getbbox()); im.resize((size, int(size * im.height / im.width)), Image.LANCZOS).save(f)
        return f

    def line(self, it, pool):
        L = self.lines[str(it['line'])]; t0 = self.t
        self.narr.append((t0, L['dur'], L['file']))
        self.words += [dict(w, s=t0 + w['s'], e=t0 + w['e']) for w in align(L['text'], L.get('words', []))]
        specs = it.get('shots') or self.pool_specs(pool)
        self.shots(specs, L['dur'] + GAP + it.get('hold', 0))
        st = it.get('stamp')
        for s in ([st] if isinstance(st, dict) else st or []):
            a = t0 + s.get('at', 0.3) if s.get('at') != 'end' else t0 + L['dur'] - 0.2
            self.stamps.append((a, a + s.get('dur', 2.6), s['text'], s.get('color', 'red')))
            if s.get('sfx'): self.sfx.append((a, s['sfx'], s.get('gain', 0.7)))
        self.sfx_at(t0, it.get('sfx'), t0 + L['dur']); self.ov_at(t0, it.get('overlays'), t0 + L['dur'])

    def pool_specs(self, pool):
        """rotate through the section pool so each line starts on a different piece of footage."""
        n = len(pool); r = self._pool_i % n; self._pool_i += 1
        return [{'clip': c, 'a': a, 'b': b} for c, a, b in (pool[r:] + pool[:r])][:2]

    def moment(self, it):
        c, a, b = it['moment']; t0 = self.t; spec = {'clip': c, **{k: it[k] for k in ('crop', 'fit', 'tint') if k in it}}
        d = self.render(spec, a, b - a, fx=[tuple(x) for x in it.get('fx', [])], label=it.get('label'), audio=it.get('audio', 1.0))
        self.moments.append((t0, d)); self.sfx_at(t0, it.get('sfx')); self.ov_at(t0, it.get('overlays'), t0 + d)
        if it.get('tx'):
            for w in json.load(open(it['tx']))['words']:
                if w.get('p', 1) >= 0.45 and a <= w['s'] and w['e'] <= b:
                    self.words.append({'w': mask(w['w']), 's': t0 + w['s'] - a, 'e': t0 + w['e'] - a, 'who': 'clip'})
        if it.get('replay'):
            ra, rb = it['replay'] if isinstance(it['replay'], list) else (a, b)
            self.sfx.append((self.t, 'tape_rewind', 0.35)); t1 = self.t
            self.render(spec, ra, (rb - ra) * 2.0, slow=2.0, replay=True, audio=0.0, fx=[tuple(x) for x in it.get('replay_fx', [])])
            self.sfx_at(t1, it.get('replay_sfx'))

    def build(self):
        for si, sec in enumerate(self.p['sections']):
            self._pool_i = 0; pool = [list(x) for x in sec.get('pool', [])]
            if sec.get('card'):
                t0 = self.t; self.file(sec['card']); self.sfx_at(t0, sec.get('card_sfx'))
            for it in sec['items']:
                if 'line' in it: self.line(it, pool)
                elif 'moment' in it: self.moment(it)
                elif 'info' in it:
                    t0 = self.t; self.info(it, it.get('dur', 2.4)); self.sfx_at(t0, it.get('sfx')); self.ov_at(t0, it.get('overlays'), self.t)
                    self.moments.append((t0, it.get('dur', 2.4)))
                elif 'file' in it:
                    t0 = self.t; self.file(it['file'], it.get('keep_audio', False)); self.sfx_at(t0, it.get('sfx'))
            print(f'section {si} done at {self.t / 60:.2f} min', flush=True)
        lst = os.path.join(self.work, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in self.parts))
        track = os.path.join(self.work, 'track.mov')
        sh([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-map_chapters', '-1', '-dn', track])
        T = dur(track); print(f'track {T / 60:.2f} min, {len(self.parts)} pieces', flush=True)
        mix = self.mix(track, T)
        ass = os.path.join(self.work, 'subs.ass'); write_ass(ass, self.words, self.stamps)
        fc = f"[0:v]ass={ass}:fontsdir={os.path.dirname(FONT)}[b0]"; ins = []
        POS = {'tr': ('W-w-70', '170'), 'tl': ('70', '170'), 'br': ('W-w-70', 'H-h-230'), 'bl': ('70', 'H-h-230'), 'c': ('(W-w)/2', '(H-h)/2'),
               'cr': ('W-w-90', '(H-h)/2'), 'cl': ('90', '(H-h)/2')}
        ovs = [(a, o) for a, o in self.overlays if 0 <= a < T]
        for k, (at, o) in enumerate(ovs):
            d = float(o.get('dur', 1.6)); size = int(o.get('size', 260)); idx = 2 + k
            if o.get('gif'): ins += ['-ignore_loop', '0', '-t', f'{d:.2f}', '-i', o['gif']]
            else: ins += ['-loop', '1', '-t', f'{d:.2f}', '-framerate', str(FPS), '-i', self.emoji_png(o['emoji'], size)]
            x, y = POS.get(o.get('pos', 'tr'), POS['tr']) if isinstance(o.get('pos', 'tr'), str) else map(str, o['pos'])
            fc += (f";[{idx}:v]fps={FPS},tpad=stop_mode=clone:stop_duration={d:.2f},trim=duration={d:.2f},scale={size}:-1,format=rgba,fade=t=in:st=0:d=0.12:alpha=1,fade=t=out:st={max(0.1, d - 0.22):.2f}:d=0.2:alpha=1,"
                   f"tpad=start_duration={at:.3f}:color=black@0.0[g{k}];[b{k}][g{k}]overlay=x={x}:y='{y}+36*exp(-7*max(0\\,t-{at:.2f}))*cos(16*max(0\\,t-{at:.2f}))':"
                   f"enable='between(t,{at:.2f},{at + d:.2f})':eof_action=pass[b{k + 1}]")
        fc += f";[b{len(ovs)}]format=yuv420p[v]"
        fcs = os.path.join(self.work, 'final_filter.txt'); open(fcs, 'w').write(fc)
        sh([FF, '-v', 'error', '-y', '-i', track, '-i', mix, *ins, '-/filter_complex', fcs, '-map', '[v]', '-map', '1:a', '-map_metadata', '-1',
            '-map_chapters', '-1', '-dn', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '320k',
            '-ar', '48000', '-shortest', '-movflags', '+faststart', self.out])
        D = dur(self.out); cov = sum(d for _, d, _ in self.narr) / D
        rep = {'duration': round(D, 1), 'commentary_share': round(cov, 3), 'longest_untouched_moment': round(max([d for _, d in self.moments] or [0]), 2),
               'pieces': len(self.parts), 'narration_lines': len(self.narr), 'sfx': len(self.sfx), 'stamps': len(self.stamps), 'timeline': self.timeline}
        json.dump(rep, open(os.path.splitext(self.out)[0] + '.json', 'w'), indent=1)
        print(f'{self.out}: {D / 60:.2f} min, commentary {cov * 100:.0f}%, longest moment {rep["longest_untouched_moment"]} s, '
              f'{len(self.parts)} pieces, {len(self.sfx)} sfx, {len(self.stamps)} stamps', flush=True)

    # ---------- audio ----------
    def load(self, f):
        """any audio file -> float32 stereo at 48 kHz (decoded with ffmpeg, cached)."""
        c = os.path.join(self.work, 'a_' + re.sub(r'\W', '_', os.path.basename(f)) + '.wav')
        if not os.path.exists(c): sh([FF, '-v', 'error', '-y', '-i', f, '-vn', '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_f32le', c])
        x, _ = sf.read(c, dtype='float32', always_2d=True); return x

    def sfx_file(self, name):
        if os.path.isfile(name): return name
        for dd in self.sfx_dirs:
            for ext in ('', '.ogg', '.wav', '.mp3'):
                p = os.path.join(dd, name + ext)
                if os.path.isfile(p): return p
        raise FileNotFoundError(name)

    def mix(self, track, T):
        n = int(T * SR) + SR; meter = pyln.Meter(SR)
        clip = np.zeros((n, 2), np.float32); x = self.load(track); clip[:len(x)] = x[:n]; del x
        # narration stem: each line to -18 LUFS, then one EQ/compression pass (warm low-mids, presence, gentle compression)
        nst = np.zeros(n, np.float32)
        for t0, d, f in self.narr:
            y, sr = sf.read(f, dtype='float32')
            if y.ndim > 1: y = y.mean(1)
            if sr != SR: y = resample_poly(y, SR, sr).astype(np.float32)
            g = 10 ** ((-18 - meter.integrated_loudness(np.pad(y, (0, max(0, SR // 2 - len(y)))))) / 20); y = y * g
            i = int(t0 * SR); nst[i:i + len(y)] += y[:n - i]
        raw = os.path.join(self.work, 'narr_raw.wav'); sf.write(raw, nst, SR, subtype='FLOAT')
        eq = os.path.join(self.work, 'narr_eq.wav')
        sh([FF, '-v', 'error', '-y', '-i', raw, '-af', 'highpass=f=70,equalizer=f=160:t=q:w=1.1:g=2.5,equalizer=f=380:t=q:w=1.5:g=-1.5,'
            'equalizer=f=3200:t=q:w=1.3:g=2,acompressor=threshold=-22dB:ratio=2.5:attack=6:release=90:makeup=1.5', '-c:a', 'pcm_f32le', eq])
        nst, _ = sf.read(eq, dtype='float32')
        if nst.ndim > 1: nst = nst.mean(1)
        nst = np.pad(nst, (0, max(0, n - len(nst))))[:n]
        mixd = clip; mixd += nst[:, None]; del nst
        # music bed: full between lines, duck_db lower under narration; falls 1.0 s before a line, rises 1.2 s after it
        mu = self.p.get('music')
        if mu:
            mp = os.path.join(self.work, 'music.wav')
            if not os.path.exists(mp):
                sh([sys.executable, os.path.join(HERE, 'music.py'), mp, '--seconds', int(T) + 3, '--bpm', mu.get('bpm', 84), '--seed', mu.get('seed', 7),
                    '--style', mu.get('style', 'trap')])
            m = self.load(mp)[:n]; m = np.pad(m, ((0, n - len(m)), (0, 0)))
            full = 10 ** ((mu.get('full_lufs', -21) - meter.integrated_loudness(m[: int(min(T, 120) * SR)])) / 20)
            under = full * 10 ** (-mu.get('duck_db', 14) / 20)
            kr = 100; tt = np.arange(int(T * kr) + kr) / kr; env = np.full(len(tt), full, np.float32)
            spans = sorted((a, a + d) for a, d, _ in self.narr); merged = []
            for a, b in spans:
                if merged and a - merged[-1][1] < 2.4: merged[-1][1] = max(merged[-1][1], b)
                else: merged.append([a, b])
            for a, b in merged:
                env = np.minimum(env, np.interp(tt, [a - 1.0, a, b, b + 1.2], [full, under, under, full]).astype(np.float32))
            env = np.interp(np.arange(n) / SR, tt, env).astype(np.float32)
            mixd += m * env[:, None]; del m, env
        # sound effects
        for at, name, g in self.sfx:
            if at < 0 or at > T: continue
            y = self.load(self.sfx_file(name)); a = np.abs(y).max(1)
            if a.max() <= 0: continue
            if re.search(r'whoosh|swish|swoosh|riser|rising|transition', name): off = int(np.argmax(uniform_filter1d(a, 480)))
            else: off = int(np.argmax(a > a.max() * 0.1))
            i = int(at * SR) - off; j0 = max(0, -i); i = max(0, i); y = y[j0:j0 + n - i]
            mixd[i:i + len(y)] += y * g
        # loudness -14 LUFS, then a smooth peak limiter at -1.5 dBFS
        mixd *= 10 ** ((-14 - meter.integrated_loudness(mixd[: int(T * SR)])) / 20)
        pk = maximum_filter1d(np.abs(mixd).max(1), 480); lim = 10 ** (-1.5 / 20)
        gain = np.minimum(1.0, lim / np.maximum(pk, 1e-9)); gain = np.minimum(gain, uniform_filter1d(gain, 480))
        mixd = (mixd * gain[:, None])[: int(T * SR)]
        print(f'mix: {meter.integrated_loudness(mixd):.1f} LUFS, peak {20 * np.log10(np.abs(mixd).max()):.1f} dBFS', flush=True)
        out = os.path.join(self.work, 'mix.wav'); sf.write(out, mixd, SR, subtype='PCM_16'); return out

# ---------- captions ----------
NUM = {('twenty', 'ten'): '2010', ('twenty', 'fifteen'): '2015', ('twenty', 'sixteen'): '2016', ('twenty', 'eighteen'): '2018',
       ('twenty', 'twenty-one'): '2021', ('twenty', 'twenty-two'): '2022', ('twenty', 'twenty-three'): '2023', ('twenty', 'twenty-four'): '2024',
       ('twenty', 'twenty-five'): '2025', ('twenty', 'twenty-six'): '2026', ('fifty', 'thousand', 'pound'): '£50,000',
       ('two', 'hundred', 'and', 'twenty-six'): '226', ('one', 'hundred', 'and', 'fifty-fourth'): '154TH', ('fourteen',): '14',
       ('forty-one',): '41', ('fourteen-year-old',): '14-YEAR-OLD', ('six-month-old',): '6-MONTH-OLD', ('two-match',): '2-MATCH',
       ('one-match',): '1-MATCH', ('one-year',): '1-YEAR', ('sixth',): '6TH'}
SWEARS = ('fuck', 'shit', 'bitch', 'nigga', 'nigger', 'pussy', 'dick', 'cunt', 'ass')
def mask(w):
    k = re.sub(r"[^a-z]", '', w.lower())
    return (w[0] + '*' * (len(k) - 1)) if any(k.startswith(x) for x in SWEARS) and k not in ('assist', 'assume', 'asset', 'dickens') else w
def norm(w): return re.sub(r"[^a-z']", '', w.lower())
def key(w): return re.sub(r"[^a-z'\-]", '', w.lower())

def align(text, words):
    """caption words = the script's spelling, timed by Whisper's words (fixes misheard names: Mtiliga, Edimar, Córdoba)."""
    ref = [w for w in text.replace('...', '… ').split() if re.search(r'\w', w)]
    if not words or not ref: return []
    hyp = [norm(w['w']) for w in words]; out = [None] * len(ref)
    sm = difflib.SequenceMatcher(a=[norm(w) for w in ref], b=hyp, autojunk=False)
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == 'equal':
            for j in range(a1 - a0): out[a0 + j] = (words[b0 + j]['s'], words[b0 + j]['e'])
        elif op == 'replace':
            s, e = words[b0]['s'], words[b1 - 1]['e']; step = (e - s) / (a1 - a0)
            for j in range(a1 - a0): out[a0 + j] = (s + j * step, s + (j + 1) * step)
    for j in range(len(ref)):                      # words Whisper dropped: squeeze between neighbours
        if out[j] is None:
            p = out[j - 1][1] if j and out[j - 1] else words[0]['s']
            q = next((out[m][0] for m in range(j + 1, len(ref)) if out[m]), p + 0.3); out[j] = (p, max(p + 0.05, min(q, p + 0.3)))
    res = [{'w': w, 's': s, 'e': e} for w, (s, e) in zip(ref, out)]
    i, merged = 0, []
    while i < len(res):
        for L in (4, 3, 2, 1):
            kk = tuple(key(x['w']) for x in res[i:i + L])
            if len(kk) == L and kk in NUM:
                punct = re.sub(r"^.*?([.,?!…]*)$", r'\1', res[i + L - 1]['w'])
                merged.append({'w': NUM[kk] + punct, 's': res[i]['s'], 'e': res[i + L - 1]['e']}); i += L; break
        else:
            merged.append(res[i]); i += 1
    return merged

def ass_t(t): t = max(0, t); return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
def esc(s): return s.replace('{', '(').replace('}', ')')

def write_ass(path, words, stamps):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Anton,104,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,1,0,1,7,3,5,60,60,0,1
Style: Stamp,Anton,118,&H00FFFFFF,&H00FFFFFF,&H003A34E8,&H003A34E8,0,0,0,0,100,100,2,0,3,20,0,8,80,80,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    BOX = {'red': ('&H003A34E8&', '&H00FFFFFF&'), 'green': ('&H0040C83C&', '&H00FFFFFF&'), 'yellow': ('&H0000D4FF&', '&H00101010&'),
           'purple': ('&H00FF4691&', '&H00FFFFFF&')}
    for st in stamps:
        a, b, txt = st[:3]; box, fg = BOX.get(st[3] if len(st) > 3 else 'red', BOX['red'])
        ev.append(f"Dialogue: 2,{ass_t(a)},{ass_t(b)},Stamp,,0,0,0,,{{\\3c{box}\\4c{box}\\1c{fg}\\fad(60,220)\\fscx140\\fscy140\\t(0,140,\\fscx96\\fscy96)\\t(140,220,\\fscx100\\fscy100)}}{esc(txt.upper())}")
    chunks, cur = [], []
    for w in sorted(words, key=lambda x: x['s']):
        if cur and (len(cur) == 3 or w['s'] - cur[-1]['e'] > 0.4 or re.search(r'[.!?,…]$', cur[-1]['w']) or w.get('who') != cur[-1].get('who')): chunks.append(cur); cur = []
        cur.append(w)
    if cur: chunks.append(cur)
    for ci, ch in enumerate(chunks):
        nxt = chunks[ci + 1][0]['s'] if ci + 1 < len(chunks) else ch[-1]['e'] + 0.5
        for k, w in enumerate(ch):
            t0 = w['s']; t1 = ch[k + 1]['s'] if k + 1 < len(ch) else min(nxt, ch[-1]['e'] + 0.5)
            if t1 - t0 < 0.04: continue
            hi = '&H00F0FF&' if ch[0].get('who') == 'clip' else '&H4AD2FF&'
            txt = ' '.join((f"{{\\c{hi}}}{esc(x['w'].upper())}{{\\c&H00FFFFFF&}}" if j == k else esc(x['w'].upper())) for j, x in enumerate(ch))
            pop = '\\t(0,80,\\fscx105\\fscy105)\\t(80,150,\\fscx100\\fscy100)' if k == 0 else ''
            ev.append(f"Dialogue: 1,{ass_t(t0)},{ass_t(t1)},Cap,,0,0,0,,{{\\pos({W // 2},{int(H * 0.885)}){pop}}}{txt}")
    open(path, 'w').write(head + '\n'.join(ev) + '\n')

if __name__ == '__main__':
    Builder(json.load(open(sys.argv[1])), sys.argv[2]).build()
