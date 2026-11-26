#!/usr/bin/env python3
"""Builds flagwars/index.html: one self-contained page (Matter.js MIT + flag-icons MIT inlined).
usage: python3 build.py   -> /home/claude/flagwars/index.html"""
import json, os
B = '/home/claude/flagwars/build'
NAMES = {
 'us': 'USA', 'in': 'India', 'pk': 'Pakistan', 'bd': 'Bangladesh', 'br': 'Brazil', 'mx': 'Mexico', 'ar': 'Argentina',
 'co': 'Colombia', 'cl': 'Chile', 'pe': 'Peru', 've': 'Venezuela', 'ca': 'Canada', 'gb': 'UK', 'ie': 'Ireland',
 'fr': 'France', 'de': 'Germany', 'it': 'Italy', 'es': 'Spain', 'pt': 'Portugal', 'nl': 'Netherlands', 'be': 'Belgium',
 'ch': 'Switzerland', 'at': 'Austria', 'se': 'Sweden', 'no': 'Norway', 'fi': 'Finland', 'dk': 'Denmark', 'pl': 'Poland',
 'cz': 'Czechia', 'ro': 'Romania', 'gr': 'Greece', 'hu': 'Hungary', 'bg': 'Bulgaria', 'hr': 'Croatia', 'ua': 'Ukraine',
 'tr': 'Turkey', 'ru': 'Russia', 'sa': 'Saudi Arabia', 'ae': 'UAE', 'qa': 'Qatar', 'eg': 'Egypt', 'ma': 'Morocco',
 'dz': 'Algeria', 'tn': 'Tunisia', 'ng': 'Nigeria', 'gh': 'Ghana', 'sn': 'Senegal', 'ke': 'Kenya', 'et': 'Ethiopia',
 'za': 'South Africa', 'jp': 'Japan', 'kr': 'South Korea', 'cn': 'China', 'id': 'Indonesia', 'ph': 'Philippines',
 'vn': 'Vietnam', 'th': 'Thailand', 'my': 'Malaysia', 'np': 'Nepal', 'lk': 'Sri Lanka', 'au': 'Australia',
 'nz': 'New Zealand', 'ir': 'Iran', 'jm': 'Jamaica'}
assert len(NAMES) == 64, len(NAMES)
flags = {c: [n, open(f'{B}/f/package/flags/1x1/{c}.svg').read()] for c, n in NAMES.items()}
tpl = open('/home/claude/flagwars/index.tpl.html').read()
matter = open(f'{B}/m/package/build/matter.min.js').read()
import base64
V = '/home/claude/flagwars/voice'
text = {f'p_{k}{i}': t for k, v in json.load(open(f'{V}/lines.json')).items() for i, t in enumerate(v)}
text.update({f'n_{c}': 'TEAM ' + n.upper() + '!' for c, n in NAMES.items()})
dur = json.load(open(f'{V}/dur.json')) if os.path.exists(f'{V}/dur.json') else {}
audio = {k: [d, base64.b64encode(open(f'{V}/mp3/{k}.mp3', 'rb').read()).decode()] for k, d in dur.items()}
html = tpl.replace('/*MATTER*/', matter).replace('/*FLAGS*/', json.dumps(flags, separators=(',', ':')).replace('</', '<\\/')).replace('/*AUDIO*/', json.dumps(audio, separators=(',', ':'))).replace('/*TEXT*/', json.dumps(text, separators=(',', ':')))
open('/home/claude/flagwars/index.html', 'w').write(html)
print('index.html', len(html) // 1024, 'KB,', len(audio), 'voice clips')
