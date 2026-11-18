#!/usr/bin/env python3
"""Rebuild clipper/bgm: download the chosen Kevin MacLeod tracks (CC BY 4.0) from incompetech.com, then loudness-match to -16 LUFS.
usage: python3 bgm_fetch.py   (needs ffmpeg; about 250 MB download)"""
import json, os, re, subprocess, sys, tempfile, urllib.parse, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__)); DST = os.path.join(HERE, 'bgm'); TMP = tempfile.mkdtemp(prefix='bgm_')
PICK = {
 'vice_city_80s': ['Miami Nights - Extended Theme', 'Miami Viceroy', 'Neon Laser Horizon', 'Eighties Action', 'Voltaic', 'Newer Wave'],
 'trap_hiphop': ['Laser Groove', 'What Is Love', 'Pyro Flow', 'Lewis and Dekalb', 'Dream Catcher', 'Hitman', 'MTA', 'Griphop'],
 'chill': ['Chill Wave', 'Chillin Hard', 'Slow Jam', 'Wallpaper', 'Local Forecast - Elevator', 'Hypnothis'],
 'funny': ['Sneaky Snitch', 'Fluffing a Duck', 'Quirky Dog', 'Run Amok', 'Scheming Weasel (faster version)', 'Pixelland'],
 'mystery': ['Investigations', 'Cipher', 'Hidden Agenda', 'I Can Feel it Coming', 'Spy Glass', 'Covert Affair'],
 'action_epic': ['Exit the Premises', 'Volatile Reaction', 'Movement Proposition', 'Heroic Age', 'Go Cart - Loop Mix', 'Cut and Run'],
}

cat = os.path.join(TMP, 'pieces.json')
urllib.request.urlretrieve('https://incompetech.com/music/royalty-free/pieces.json', cat)
d = {x['title']: x for x in json.load(open(cat))}; out = []
for mood, titles in PICK.items():
    for t in titles:
        x = d[t]; fn = x['filename']; raw = os.path.join(TMP, fn)
        req = urllib.request.Request('https://incompetech.com/music/royalty-free/mp3-royaltyfree/' + urllib.parse.quote(fn), headers={'User-Agent': 'Mozilla/5.0'})
        open(raw, 'wb').write(urllib.request.urlopen(req, timeout=120).read())
        slug = re.sub(r'[^a-z0-9]+', '_', t.lower()).strip('_'); o = os.path.join(DST, mood, slug + '.mp3'); os.makedirs(os.path.dirname(o), exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-map', '0:a', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'libmp3lame', '-b:a', '192k', '-map_metadata', '-1', o], check=True)
        out.append(dict(mood=mood, title=t, file=os.path.relpath(o, DST), bpm=x['bpm'], length=x['length'], feel=x['feel'], license='CC BY 4.0', source='https://incompetech.com'))
        print(mood, slug, flush=True)
json.dump(out, open(os.path.join(DST, 'tracks.json'), 'w'), indent=1)
