# Pattern for the daily long video plan (copy to $WORK/long/make_long.py and fill in the day's moments).
# 1) write $WORK/long/lines_in.json  [{"i": "h0", "text": "..."}, {"i": "a1", ...}, ...]
# 2) $PY clipper/daily/tts_lines.py $WORK/long/lines_in.json $WORK/long/narr am_michael 1.08
# 3) python3 make_long.py  ->  $WORK/long/plan.json
# 4) $PY clipper/longform.py $WORK/long/plan.json $WORK/long/long.mp4   (FFMPEG=master build from env.sh)
# 5) bash clipper/daily/fit100.sh $WORK/long/long.mp4 $WORK/long/long_fit.mp4 94
import json, os, sys
WORK = os.environ.get('WORK', '/home/claude/gtaday') + '/'; CL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, CL + '/daily'); from lib import words
def tx(f):
    """moment captions from the clip's Whisper words (read the .txt first; fix words with lib.fixed if needed)"""
    p = WORK + 'tx/' + f + '.fixed_long.json'; json.dump({'words': [dict(w, p=1.0) for w in words(f)]}, open(p, 'w')); return p
NAMES = ['zoreee_07', 'caseoh__00']                       # the day's clips (aliases = $WORK/clips/<name>.mp4)
clips = {n: WORK + 'clips/' + n + '.mp4' for n in NAMES}
S = lambda f, a, b, crop: {'clip': f, 'a': a, 'b': b, 'crop': crop}   # b-roll shot under a narration line; crop = [x,y,w,h] fractions
items = [
 # cold open: narration line h0 over the day's best moment, with a stamp
 {'line': 'h0', 'shots': [S('zoreee_07', 9, 13, [0.0, 0.1, 0.8, 0.8])], 'stamp': {'text': 'GTA 6 · DAY 3', 'at': 0.3, 'dur': 2.4, 'color': 'purple', 'sfx': 'camera_shutter'}},
 # per moment: a short narrated intro (who, what to watch for) ...
 {'line': 'a1', 'shots': [S('zoreee_07', 0, 3, [0.0, 0.1, 0.8, 0.8])], 'stamp': {'text': '#2 · ZOREEE', 'at': 0.15, 'dur': 2.2, 'color': 'yellow', 'sfx': 'ting'}},
 # ... then the moment itself with original audio, captions, streamer label (crop out chat / Twitch caption pill)
 {'moment': ['zoreee_07', 3.0, 12.0], 'tx': tx('zoreee_07'), 'audio': 1.25, 'label': 'ZOREEE', 'crop': [0.0, 0.0, 0.88, 0.88]},
 # outro line (subscribe ask + tomorrow tease)
 {'line': 'z0', 'shots': [S('caseoh__00', 3, 8, [0.2, 0.1, 0.75, 0.75])], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/funny/pixelland.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json')
