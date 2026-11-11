#!/usr/bin/env python3
"""16:9 commentary long-form builder (narration over real clips, title cards, moments, SFX, VFX, captions, music bed).

usage: python longform.py plan.json out.mp4
plan.json:
{
  "lines": "/path/narr/lines.json",            # synthesized narration: [{i, file, dur, words:[{w,s,e}]}]
  "music": {"style": "trap", "bpm": 90, "seed": 4, "gain": 0.10},
  "sections": [
    {"id": "lake", "card": {"file": "cards/lake.mp4"},                       # optional pre-rendered title card (Remotion)
     "pool": [["clip.mp4", 3.0, 18.0], ...],                                  # b-roll under narration: cut into 2.2-3.2 s shots
     "items": [{"line": 7}, {"line": 8},
               {"moment": ["clip.mp4", 6.0, 9.5], "slow": 1.0, "fx": [["flash", 1.2], ["shake", 1.2]], "label": "LYON · 2016",
                "replay": true, "sfx": [["record_scratch", 0.0, 0.7]]},
               {"line": 9, "sfx": [["crickets", "end", 0.4]]}],
     "sfx": [["whoosh_transition", 0.0, 0.7]]}                                # at the section start
  ]
}
SFX names resolve in clipper/sfx/user, sfx/made, sfx/cc0 (see sfx/user/index.md for names to avoid on monetized uploads).
Output: out.mp4 (1920x1080, 30 fps, -14 LUFS) + out.json (timeline, narration share = commentary %).
"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import render as R

W, H, FPS = 1920, 1080, 30
W2, H2 = 2112, 1188                       # 10 % oversize for pans and shakes
FF = os.environ.get('FFMPEG', 'ffmpeg')
GAP = 0.22                                # pause between narration lines

def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: raise RuntimeError(' '.join(map(str, cmd[:8])) + ' ...\n' + r.stderr[-1500:])
    return r
def dur(f): return float(sh(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout)
def has_audio(f): return bool(sh(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', f]).stdout.strip())

def shot(src, a, b, out, k=0, slow=1.0, fx=(), label=None, tint=None):
    """one 1920x1080 shot: cover-scale, slow pan (direction by k), optional slow-mo, flash/shake, label, tint."""
    d = (b - a) * slow
    xs = [f"(iw-{W})*t/{d:.2f}", f"(iw-{W})*(1-t/{d:.2f})", f"(iw-{W})/2", f"(iw-{W})/2"][k % 4]
    ys = [f"(ih-{H})/2", f"(ih-{H})/2", f"(ih-{H})*t/{d:.2f}", f"(ih-{H})*(1-t/{d:.2f})"][k % 4]
    for kind, t in fx:
        if kind == 'shake':
            xs += f"+between(t,{t:.2f},{t + 0.45:.2f})*30*sin(t*90)*exp(-(t-{t:.2f})*6)"
            ys += f"+between(t,{t:.2f},{t + 0.45:.2f})*22*cos(t*75)*exp(-(t-{t:.2f})*6)"
    vf = ([f'setpts={slow}*PTS'] if slow != 1 else []) + [f'fps={FPS}',
          f'scale={W2}:{H2}:force_original_aspect_ratio=increase,crop={W2}:{H2}',
          f"crop={W}:{H}:x='max(0,min(iw-{W},{xs}))':y='max(0,min(ih-{H},{ys}))'", 'unsharp=5:5:0.5']
    if tint == 'bw': vf.append('hue=s=0,eq=contrast=1.15')
    if tint == 'red': vf.append('colorchannelmixer=rr=1.15:gg=0.75:bb=0.75,eq=contrast=1.1')
    if slow != 1: vf += ['eq=saturation=1.2:contrast=1.08', 'vignette=PI/5']
    for kind, t in fx:
        if kind == 'flash':
            vf.append(f"drawbox=x=0:y=0:w={W}:h={H}:color=white@0.85:t=fill:enable='between(t,{t:.2f},{t + 0.07:.2f})'")
            vf.append(f"drawbox=x=0:y=0:w={W}:h={H}:color=white@0.35:t=fill:enable='between(t,{t + 0.07:.2f},{t + 0.14:.2f})'")
    if label:
        txt = label.replace(':', '\\:').replace("'", '')
        vf.append(f"drawtext=fontfile={os.path.expanduser('~/.fonts/Anton-Regular.ttf')}:text='{txt}':fontsize=46:fontcolor=white:"
                  f"box=1:boxcolor=0xE8343A@0.95:boxborderw=14:x=60:y=60")
    if slow != 1:
        vf.append(f"drawtext=fontfile={os.path.expanduser('~/.fonts/Anton-Regular.ttf')}:text='REPLAY':fontsize=60:fontcolor=white:"
                  f"borderw=5:bordercolor=black:x=w-tw-70:y=60:enable='lt(mod(t,0.8),0.55)'")
    vf.append('format=yuv420p')
    if has_audio(src):
        af = 'aformat=sample_rates=48000:channel_layouts=stereo' + (f',atempo={1 / slow:.3f}' if slow != 1 else '')
        cmd = [FF, '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', src, '-filter_complex',
               f"[0:v]{','.join(vf)}[v];[0:a]{af},apad[a]", '-map', '[v]', '-map', '[a]', '-t', f'{d:.3f}']
    else:
        cmd = [FF, '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{b - a:.3f}', '-i', src, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
               '-filter_complex', f"[0:v]{','.join(vf)}[v]", '-map', '[v]', '-map', '1:a', '-t', f'{d:.3f}']
    sh(cmd + ['-map_metadata', '-1', '-map_chapters', '-1', '-dn', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', str(FPS),
              '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', out])
    return dur(out)

def card_clip(src, out):
    """bring a Remotion card to the shot format (30 fps, yuv420p, silent stereo track)."""
    sh([FF, '-v', 'error', '-y', '-i', src, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-map', '0:v', '-map', '1:a', '-shortest',
        '-vf', f'fps={FPS},scale={W}:{H},format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', str(FPS),
        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-map_metadata', '-1', out])
    return dur(out)

def main():
    plan = json.load(open(sys.argv[1])); out = sys.argv[2]; work = out + '.parts'; os.makedirs(work, exist_ok=True)
    plan.setdefault('sfx_dirs', [os.path.join(HERE, 'sfx', d) for d in ('user', 'made', 'cc0')])
    lines = {x['i']: x for x in json.load(open(plan['lines']))}
    parts, narr, sfx, words, t, k = [], [], [], [], 0.0, 0
    def add(f, d):
        nonlocal t; parts.append(f); t += d
    for si, sec in enumerate(plan['sections']):
        pool = [list(p) for p in sec.get('pool', [])]; pi, pos = 0, None
        def broll(need, tag):
            """cut need seconds of b-roll from the section pool into 2.2-3.2 s shots, cycling through it."""
            nonlocal pi, pos, k
            left = need
            while left > 0.05:
                src, a, b = pool[pi % len(pool)]
                if pos is None or pos >= b - 0.5: pos = a
                ln = min(left if left < 3.6 else (2.2 + (k % 3) * 0.5), b - pos)
                f = os.path.join(work, f'{len(parts):04d}_{tag}.mp4'); d = shot(src, pos, pos + ln, f, k=k)
                add(f, d); left -= d; pos += ln; k += 1
                if pos >= b - 0.5: pi += 1; pos = None
        for s in sec.get('sfx', []): sfx.append((t + float(s[1]), s[0], float(s[2]) if len(s) > 2 else 0.8))
        if sec.get('card'):
            f = os.path.join(work, f'{len(parts):04d}_card.mp4'); d = card_clip(sec['card']['file'], f); add(f, d)
        for it in sec['items']:
            if 'line' in it:
                L = lines[it['line']]; t0 = t
                narr.append((t0, L['dur'], L['file']))
                words += [dict(w, s=t0 + w['s'], e=t0 + w['e']) for w in L.get('words', [])]
                broll(L['dur'] + GAP, f"s{si}")
                for s in it.get('sfx', []):
                    at = t0 + L['dur'] if s[1] == 'end' else t0 + float(s[1]); sfx.append((at, s[0], float(s[2]) if len(s) > 2 else 0.8))
            elif 'moment' in it:
                src, a, b = it['moment']; t0 = t
                f = os.path.join(work, f'{len(parts):04d}_m.mp4'); d = shot(src, a, b, f, k=k, fx=[tuple(x) for x in it.get('fx', [])], label=it.get('label'))
                add(f, d); k += 1
                for s in it.get('sfx', []): sfx.append((t0 + float(s[1]), s[0], float(s[2]) if len(s) > 2 else 0.8))
                if it.get('replay'):
                    ra, rb = it.get('replay_range', [a, b]); f = os.path.join(work, f'{len(parts):04d}_r.mp4')
                    sfx.append((t, 'tape_rewind', 0.35)); d = shot(src, ra, rb, f, k=k, slow=2.0); add(f, d); k += 1
    # concat
    lst = os.path.join(work, 'list.txt'); open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    track = os.path.join(work, 'track.mp4')
    sh([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-map_chapters', '-1', '-dn', track]); T = dur(track)
    # captions for the narration
    ass = os.path.join(work, 'subs.ass')
    R.ass_file(ass, words, '', int(H * 0.86), plan.get('font', 'Luckiest Guy'), '&H4AD2FF&', 0)
    s = open(ass).read().replace('PlayResX: 1080', f'PlayResX: {W}').replace('PlayResY: 1920', f'PlayResY: {H}')
    s = s.replace(',96,&H00FFFFFF', ',64,&H00FFFFFF').replace(f'\\pos(540,', f'\\pos({W // 2},'); open(ass, 'w').write(s)
    # final mix: clip audio ducked under narration, narration, music bed, SFX
    duck = '+'.join(f'between(t,{a - 0.08:.2f},{a + d + 0.12:.2f})' for a, d, _ in narr) or '0'
    ins = ['-i', track]; fc = f"[0:v]ass={ass}:fontsdir={os.path.expanduser('~/.fonts')},format=yuv420p[vo];[0:a]volume='if({duck},0.10,0.9)':eval=frame[ca]"
    mix = ['[ca]']; idx = 1
    mu = plan.get('music')
    if mu:
        mp = os.path.join(work, 'music.wav')
        sh([sys.executable, os.path.join(HERE, 'music.py'), mp, '--seconds', str(int(T) + 2), '--bpm', str(mu.get('bpm', 90)), '--seed', str(mu.get('seed', 4)),
            '--style', mu.get('style', 'trap')])
        ins += ['-i', mp]; g = float(mu.get('gain', 0.10))
        fc += f";[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{T:.2f},volume='{g}*if({duck},0.6,1.4)':eval=frame[mu]"; mix.append('[mu]'); idx += 1
    for j, (a, dd, f) in enumerate(narr):
        ins += ['-i', f]; ms = int(a * 1000)
        fc += f";[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume=1.5[n{j}]"; mix.append(f'[n{j}]'); idx += 1
    for j, (a, name, g) in enumerate(sorted(sfx)):
        if a < 0 or a > T: continue
        ins += ['-i', R.sfx_path(name, plan)]; ms = int(a * 1000)
        fc += f";[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms},volume={g:.2f}[x{j}]"; mix.append(f'[x{j}]'); idx += 1
    fc += f";{''.join(mix)}amix=inputs={len(mix)}:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[ao]"
    open(os.path.join(work, 'filter.txt'), 'w').write(fc)
    sh([FF, '-v', 'error', '-y', *ins, '-filter_complex_script', os.path.join(work, 'filter.txt'), '-map', '[vo]', '-map', '[ao]',
        '-map_metadata', '-1', '-map_chapters', '-1', '-dn', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'aac', '-b:a', '192k',
        '-ar', '48000', '-shortest', '-movflags', '+faststart', out])
    D = dur(out); cov = sum(d for _, d, _ in narr) / D
    rep = {'duration': D, 'commentary_share': round(cov, 3), 'shots': len(parts), 'narration_lines': len(narr), 'sfx': len(sfx)}
    json.dump(rep, open(out.replace('.mp4', '.json'), 'w'), indent=1)
    print(f'{out}: {D / 60:.1f} min, commentary {cov * 100:.0f}%, {len(parts)} shots, {len(sfx)} sfx')

if __name__ == '__main__':
    main()
