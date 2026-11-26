#!/usr/bin/env python3
"""Input for yt_agent's /yt-viral (swipe.py): find clip channels in our niche and list their recent uploads.
YouTube search (yt-dlp, free) -> the channels behind the results -> each channel's last N Shorts or videos with views.
usage: python3 viral_collect.py out.json [--kind shorts|videos] [--channels 6] [--per 25] [query ...]
then:  python3 yt_agent/skills/yt-viral/swipe.py out.json --min 2.0"""
import glob, json, os, shutil, subprocess, sys
YTDLP = shutil.which('yt-dlp') or os.environ.get('YTDLP') or next(iter(glob.glob('/home/claude/venvs/*/bin/yt-dlp')), 'yt-dlp')
a = sys.argv[1:]; out = a.pop(0)
opt = lambda k, d: (a.pop(a.index(k) + 1), a.remove(k))[0] if k in a else d
kind, nch, per = opt('--kind', 'shorts'), int(opt('--channels', 6)), int(opt('--per', 25))
queries = a or ['kai cenat ishowspeed funny moments', 'kai cenat stream highlights', 'ishowspeed funny moments clips']
def ytj(*args):
    r = subprocess.run([YTDLP, '-J', '--flat-playlist', '--no-warnings', *args], capture_output=True, text=True, timeout=180)
    return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip() else {}
chans = []
for q in queries:
    for e in ytj(f'ytsearch20:{q}').get('entries') or []:
        cu, cn = e.get('channel_url'), e.get('channel')
        if cu and cn and cu not in [c[0] for c in chans] and 'Kai Cenat' != cn and 'IShowSpeed' != cn: chans.append((cu, cn))
rows = []
for cu, cn in chans[:nch]:
    ents = [e for e in (ytj('--playlist-end', str(per), f'{cu}/{kind}').get('entries') or []) if e.get('view_count')]
    rows += [{'channel': cn, 'title': e.get('title'), 'views': e['view_count'], 'url': e.get('url'), 'duration': e.get('duration')} for e in ents]
    print(f'{cn}: {len(ents)} {kind}', file=sys.stderr)
json.dump(rows, open(out, 'w'), indent=1); print(out, len(rows), 'videos from', min(nch, len(chans)), 'channels')
