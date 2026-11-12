#!/usr/bin/env python3
"""Render vertical Shorts (1080x1920) from a long video using a clips.json plan.

usage: python render.py clips.json outdir
clips.json:
{
  "source": "/path/source.mp4", "transcript": "/path/work/transcript.json",
  "layout": "blur",            # blur: full frame over a blurred fill | crop: 9:16 crop | facecam: cam on top, game below
  "crop_x": 0.5,               # crop layout: 0 = left edge, 1 = right edge
  "facecam": [x, y, w, h],     # facecam layout: the webcam box in source pixels, or "auto" (facecam.py finds it)
  "zoom": 1.0,                 # blur layout: >1 enlarges the gameplay (crops its sides)
  "font": "Luckiest Guy", "accent": "&H4AD2FF&",   # caption font; ASS colour BGR (this is #FFD24A gold)
  "voice_ref": "/home/claude/shakclips-studio/tts/voices/michael_ref.wav",
  "clips": [{"start": 12.3, "end": 41.0, "hook": "HE ROBBED THE BANK IN 30 SECONDS",
             "intro": "optional line the narrator says over the first seconds",
             "title": "...", "captions": true,
             "sfx": [{"t": 7.5, "name": "boom", "gain": 0.9}]}]   # times from the clip start; names from sfx/made or sfx/cc0
}
Writes outdir/NN_slug.mp4, outdir/NN_slug.jpg (QA contact sheet) and outdir/metadata.md.
Safe areas: nothing important in the top 14% or bottom 20% (Shorts UI).
"""
import json, os, re, subprocess, sys
import numpy as np

W, H = 1080, 1920
HERE = os.path.dirname(os.path.abspath(__file__))
PUNCH = {'boom', 'bonk', 'bass_drop', 'airhorn'}

def sfx_path(name, plan):
    """a kit name ('boom', 'sad_trombone') from sfx/made/, or a CC0 file name ('glitch_003') from sfx/cc0/, or a path."""
    if os.path.isfile(name): return name
    dirs = plan.get('sfx_dirs') or [os.path.join(HERE, 'sfx', 'made'), os.path.join(HERE, 'sfx', 'cc0')]
    for dd in dirs:
        for ext in ('', '.wav', '.ogg', '.mp3'):
            p = os.path.join(dd, name + ext)
            if os.path.isfile(p): return p
    raise FileNotFoundError(f'sound effect {name!r} not found in {dirs}')

def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: raise RuntimeError(' '.join(cmd[:6]) + '...\n' + r.stderr[-1500:])
    return r

def slug(t): return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')[:40] or 'clip'
def ass_t(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h}:{m:02d}:{s:05.2f}'
def esc(t): return t.replace('\\', '').replace('{', '(').replace('}', ')')
SWEAR = re.compile(r"^(fuck\w*|motherfuck\w*|shit\w*|bitch\w*|nigg\w*|cunt\w*|dick\w*|pussy|asshole|bullshit)$", re.I)
def clean(w):   # mask swear words in burned-in captions (advertiser-friendly); keeps first letter and punctuation
    core = re.sub(r"[^\w']", '', w)
    return w.replace(core, core[0] + '*' * (len(core) - 1)) if core and SWEAR.match(core) else w

def ass_file(path, words, hook, cap_y, font, accent, hook_dur):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{font},96,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,1,0,1,7,4,5,60,60,0,1
Style: Hook,Anton,84,&H00FFFFFF,&H00FFFFFF,&H002A2ACF,&H002A2ACF,0,0,0,0,100,100,1,0,3,22,0,8,70,70,300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    if hook:
        ev.append(f"Dialogue: 2,{ass_t(0.05)},{ass_t(hook_dur)},Hook,,0,0,0,,{{\\fad(120,200)\\t(0,180,\\fscx106\\fscy106)\\t(180,320,\\fscx100\\fscy100)}}{esc(hook.upper())}")
    # word-by-word captions: chunks of up to 3 words (break on punctuation or a pause), the spoken word in the accent colour
    chunks, cur = [], []
    words = [dict(w, w=clean(w['w'])) for w in words]
    for w in words:
        if cur and (len(cur) == 3 or w['s'] - cur[-1]['e'] > 0.45 or re.search(r'[.!?,]$', cur[-1]['w'])
                    or (w['w'][:1].isupper() and w['w'] not in ('I', "I'm", "I'll", "I've") and not w['w'].isupper())):
            chunks.append(cur); cur = []
        cur.append(w)
    if cur: chunks.append(cur)
    for ci, ch in enumerate(chunks):
        nxt = chunks[ci + 1][0]['s'] if ci + 1 < len(chunks) else ch[-1]['e'] + 0.6
        for k, w in enumerate(ch):
            t0 = w['s']; t1 = ch[k + 1]['s'] if k + 1 < len(ch) else min(nxt, ch[-1]['e'] + 0.6)
            if t1 - t0 < 0.04: continue
            txt = ' '.join((f"{{\\c{accent}\\fscx112\\fscy112}}{esc(x['w'].upper())}{{\\c&H00FFFFFF&\\fscx100\\fscy100}}" if j == k else esc(x['w'].upper()))
                           for j, x in enumerate(ch))
            pop = '\\t(0,90,\\fscx104\\fscy104)\\t(90,160,\\fscx100\\fscy100)' if k == 0 else ''
            ev.append(f"Dialogue: 1,{ass_t(t0)},{ass_t(t1)},Cap,,0,0,0,,{{\\pos({W // 2},{cap_y}){pop}}}{txt}")
    open(path, 'w').write(head + '\n'.join(ev) + '\n')

def video_filter(plan, src_w, src_h):
    lay = plan.get('layout', 'blur')
    if lay == 'crop':
        cx = plan.get('crop_x', 0.5); z = float(plan.get('crop_zoom', 1.0)); cy = float(plan.get('crop_y', 0.5))
        return f"[0:v]scale=-2:{int(H * z) // 2 * 2},crop={W}:{H}:(iw-{W})*{cx}:(ih-{H})*{cy},setsar=1[v]", int(H * 0.66)
    if lay == 'facecam':
        x, y, w, h = plan['facecam']; cam_h = int(round(W * h / w / 2) * 2); game_h = H - cam_h
        gz = float(plan.get('game_zoom', 0.8))   # <1 shows more of the gameplay width (on a blurred fill) so centred text isn't cut
        gh = int(game_h * gz) // 2 * 2
        return (f"[0:v]split=3[a][b][c];[a]crop={w}:{h}:{x}:{y},scale={W}:{cam_h}[cam];"
                f"[b]scale=-2:{game_h},crop={W}:{game_h}:(iw-{W})/2:0,gblur=sigma=26,eq=brightness=-0.12[gb];"
                f"[c]scale=-2:{gh},crop={W}:{gh}:(iw-{W})/2:0[gf];[gb][gf]overlay=0:({game_h}-{gh})/2[g];[cam][g]vstack,setsar=1[v]"), cam_h + int(game_h * 0.62)
    z = float(plan.get('zoom', 1.0)); fw = int(W * z) // 2 * 2; fh = int(fw * src_h / src_w) // 2 * 2
    crop = f",crop={W}:{fh}:(iw-{W})/2:0" if fw > W else ''
    yc = (H - fh) // 2 - 60
    return (f"[0:v]split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},gblur=sigma=28,eq=brightness=-0.10:saturation=1.1[bg];"
            f"[b]scale={fw}:{fh}{crop}[fg];[bg][fg]overlay=(W-w)/2:{yc},setsar=1[v]"), yc + fh + 150

def make_intros(plan, outdir):
    lines = [(i, c['intro']) for i, c in enumerate(plan['clips']) if c.get('intro')]
    if not lines: return {}
    py = '/home/claude/venvs/cbx/bin/python'
    spec = json.dumps({'lines': lines, 'ref': plan.get('voice_ref', '/home/claude/shakclips-studio/tts/voices/michael_ref.wav'), 'out': outdir})
    code = r'''
import json, sys, numpy as np, soundfile as sf, torch
torch.set_num_threads(2); a = json.loads(sys.argv[1])
from chatterbox.tts_turbo import ChatterboxTurboTTS as M
m = M.from_pretrained(device='cpu')
_nl = m.norm_loudness; m.norm_loudness = lambda w, s, target_lufs=-27: np.asarray(_nl(w, s, target_lufs), dtype=np.float32)
m.prepare_conditionals(a['ref'])
for i, t in a['lines']:
    torch.manual_seed(7 + i); w = m.generate(t, temperature=0.8).squeeze().cpu().numpy()
    sf.write(f"{a['out']}/intro_{i:02d}.wav", w / max(1e-6, abs(w).max()) * 0.9, m.sr)
'''
    sh([py, '-c', code, spec])
    return {i: f'{outdir}/intro_{i:02d}.wav' for i, _ in lines}

def main():
    plan = json.load(open(sys.argv[1])); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
    src = plan['source']; tr = json.load(open(plan['transcript'])) if plan.get('transcript') else {'segments': []}
    words = [w for s in tr['segments'] for w in s['words']]
    p = json.loads(sh(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', src]).stdout)['streams'][0]
    sw, shh = p['width'], p['height']; fps = int(plan.get('fps', 30))   # Shorts standard; 60 doubles encode time
    if plan.get('layout') == 'facecam' and plan.get('facecam') in (None, 'auto'):
        r = json.loads(sh([sys.executable, os.path.join(HERE, 'facecam.py'), src]).stdout.strip().splitlines()[-1])
        if r.get('facecam'): plan['facecam'] = r['facecam']; print('facecam found at', r['facecam'], f"({r['hits']}/{r['frames']} frames)")
        else: plan['layout'] = 'blur'; print('no steady webcam face -> blur layout')
    vf, cap_y = video_filter(plan, sw, shh)
    intros = make_intros(plan, outdir)
    meta = ['# Shorts metadata\n']
    for i, c in enumerate(plan['clips']):
        st, en = float(c['start']), float(c['end']); d = en - st; name = f"{i + 1:02d}_{slug(c.get('title') or c.get('hook') or 'clip')}"
        cw = [dict(w, s=w['s'] - st, e=w['e'] - st) for w in words if w['s'] >= st - 0.05 and w['e'] <= en + 0.05] if c.get('captions', True) else []
        intro = intros.get(i); idur = 0.0
        if intro: idur = float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', intro]).stdout)
        ass = f'{outdir}/{name}.ass'
        ass_file(ass, cw, c.get('hook', ''), cap_y, plan.get('font', 'Luckiest Guy'), plan.get('accent', '&H4AD2FF&'), max(2.8, idur + 0.3))
        # sound effects: [{"t": 3.2, "name": "boom", "gain": 1.0}], times relative to the clip start.
        # boom / bonk / bass_drop / airhorn (or "punch": true) also get a quick zoom-punch on screen.
        fx = [s for s in c.get('sfx', []) if 0 <= float(s['t']) < d]
        punches = [float(s['t']) for s in fx if s.get('punch', s['name'] in PUNCH)]
        if punches:
            z = '+'.join(f"0.14*exp(-(t-{p:.2f})*7)*gte(t,{p:.2f})*lt(t,{p + 0.9:.2f})" for p in punches)
            # per-frame scale + centre crop: only re-scales while a punch is active (zoompan was ~20x slower)
            vz = f"[v]scale=w='trunc({W}*(1+{z})/2)*2':h='trunc({H}*(1+{z})/2)*2':eval=frame,crop={W}:{H}[vz]"
        else:
            vz = "[v]null[vz]"
        vz = vz.replace('[v]', f'[v]fps={fps},', 1)          # drop to the output frame rate before any per-frame work
        fcx = f"{vf};{vz};[vz]ass={ass}:fontsdir={os.path.expanduser('~/.fonts')},format=yuv420p[vo]"
        inputs = ['-ss', f'{st:.3f}', '-t', f'{d:.3f}', '-i', src]; AF = 'aformat=sample_rates=48000:channel_layouts=stereo'
        # duck the game/stream audio under the narrator intro, then bring it back
        fcx += f";[0:a]{AF},volume='if(lt(t,{idur + 0.15:.2f}),0.28,1)':eval=frame[ga]" if intro else f";[0:a]{AF}[ga]"
        mixin = ['[ga]']; k = 1
        if intro:
            inputs += ['-i', intro]; fcx += f";[{k}:a]{AF},adelay=150|150,volume=1.6[na]"; mixin.append('[na]'); k += 1
        for j, s in enumerate(fx):
            inputs += ['-i', sfx_path(s['name'], plan)]; ms = int(float(s['t']) * 1000)
            fcx += f";[{k}:a]{AF},adelay={ms}|{ms},volume={float(s.get('gain', 0.9)):.2f}[s{j}]"; mixin.append(f'[s{j}]'); k += 1
        fcx += f";{''.join(mixin)}amix=inputs={len(mixin)}:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[ao]"
        sh(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', fcx, '-map', '[vo]', '-map', '[ao]', '-map_metadata', '-1', '-map_chapters', '-1', '-dn', '-shortest',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
            '-movflags', '+faststart', f'{outdir}/{name}.mp4'])
        # QA sheet: 4 frames side by side
        sh(['ffmpeg', '-v', 'error', '-y', '-i', f'{outdir}/{name}.mp4', '-vf', f"fps=4/{max(d, 1):.2f},scale=270:-2,tile=4x1", '-frames:v', '1', f'{outdir}/{name}.jpg'])
        meta.append(f"## {name}.mp4 ({d:.0f} s)\n**Title:** {c.get('title', '')}\n\n**Description:** {c.get('description', '')}\n\n**Hashtags:** {c.get('hashtags', '')}\n")
        print(f'{name}.mp4  {d:.1f}s  captions {len(cw)} words  intro {idur:.1f}s', flush=True)
    open(f'{outdir}/metadata.md', 'w').write('\n'.join(meta))

if __name__ == '__main__':
    main()
