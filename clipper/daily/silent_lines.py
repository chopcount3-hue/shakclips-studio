#!/usr/bin/env python3
"""Silent title cards for NO-VOICEOVER long videos (owner, 26 Nov: "skip the voice over to make the videos feel good and
real but make it so we don't get copyright or reused content"). Writes lines.json in the format longform.py reads, with
silent audio: a 'line' item then shows its shots + stamp (the card text) for that long, with the music bed and SFX, and no
voice. Use one card before each moment ("#7 · KAI IS ALREADY BROKE") plus a cold-open card and an outro card.

usage: python3 silent_lines.py cards.json out_dir
cards.json = [{"i": "h0", "dur": 2.6, "text": "KAI vs SPEED: RACE TO $1,000,000"}, {"i": "a1", "dur": 1.8, "text": "#7 ..."}, ...]"""
import json, os, subprocess, sys
cards, out = json.load(open(sys.argv[1])), os.path.abspath(sys.argv[2]); os.makedirs(out, exist_ok=True); L = []
for c in cards:
    f = os.path.join(out, f"{c['i']}.wav"); d = float(c.get('dur', 1.8))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', f'{d:.2f}', f], check=True)
    L.append({'i': c['i'], 'text': c.get('text', ''), 'file': f, 'dur': d, 'words': [], 'errors': [], 'silent': True})
json.dump(L, open(os.path.join(out, 'lines.json'), 'w'), indent=1); print(len(L), 'silent cards ->', os.path.join(out, 'lines.json'))
