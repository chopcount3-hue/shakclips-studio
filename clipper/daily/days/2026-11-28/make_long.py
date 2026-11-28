import json, os, sys
WORK = os.environ.get('WORK', '/home/claude/gtaday') + '/'; CL = '/home/claude/studio/clipper'
sys.path.insert(0, CL + '/daily'); from lib import words, own
def tx(f):
    p = WORK + 'tx/' + f + '.fixed_long.json'
    json.dump({'words': [dict(w, p=1.0) for w in words(f) if not w['w'].lower().startswith('piece')]}, open(p, 'w')); return p
NAMES = ['kaicenat_m15', 'kaicenat_m22', 'kaicenat_m16', 'kaicenat_m23', 'kaicenat_m13', 'kaicenat_m03', 'kaicenat_m27']
clips = {n: WORK + 'clips/' + n + '_bl.mp4' for n in NAMES}
C = [0.0, 0.0, 1.0, 1.0]
S = lambda f, a, b, crop=C: {'clip': f, 'a': a, 'b': b, 'crop': crop}
def M(f, a, b, label='KAI x SPEED', crop=C, fx=(), **k): return {'moment': [f, a, b], 'tx': tx(f), 'audio': 1.25, 'label': label, 'crop': crop, 'fx': [[n, round(t - a, 2)] for n, t in fx], **k}   # fx at SOURCE times -> moment-relative
def st(t, c='yellow', s='ting'): return {'text': t, 'at': 0.1, 'dur': 1.7, 'color': c, 'sfx': s}
k = lambda n: 'kaicenat_m%02d' % n
items = [
 {'line': 'h0', 'shots': [S(k(27), 49.0, 51.4), S(k(3), 60.3, 62.0)], 'stamp': {'text': 'KAI vs SPEED · PART 3', 'at': 0.2, 'dur': 2.2, 'color': 'purple', 'sfx': 'camera_shutter'}},
 {'line': 'a2', 'shots': [S(k(15), 33.0, 35.0)], 'stamp': st('#8 · WHAT DID SPEED SAY?')},
 M(k(15), 36.0, 70.0, replay=[62.4, 66.6], fx=[['flash', 63.5]]),
 {'line': 'a3', 'shots': [S(k(22), 58.0, 60.0)], 'stamp': st("#7 · WHO'S AHEAD?", s='whoosh_transition')},
 M(k(22), 61.0, 90.0, replay=[76.1, 82.5], fx=[['flash', 80.0]]),
 {'line': 'a4', 'shots': [S(k(16), 41.0, 43.0)], 'stamp': st('#6 · NEW CLOTHES, NEW JASON')},
 M(k(16), 44.0, 80.0, label='KAI CENAT', replay=[50.0, 53.6], fx=[['shake', 50.2]]),
 {'line': 'a5', 'shots': [S(k(23), 21.0, 23.0)], 'stamp': st('#5 · THE POLICE STATION JOB', s='whoosh_transition')},
 M(k(23), 24.0, 58.0, label='KAI CENAT', replay=[52.4, 56.0], fx=[['flash', 30.8], ['shake', 41.6]]),
 {'line': 'a6', 'shots': [S(k(13), 14.0, 16.0)], 'stamp': st('#4 · KAI WENT TO SPACE')},
 M(k(13), 18.0, 60.0, label='KAI CENAT', replay=[32.4, 36.0], fx=[['flash', 34.0]]),
 {'line': 'a7', 'shots': [S(k(3), 8.0, 10.0)], 'stamp': st('#3 · IS SPEED READY?', 'red', 'drum_roll')},
 M(k(3), 8.4, 19.8, label='KAI CENAT'),
 M(k(3), 42.2, 69.7, label='KAI CENAT', replay=[56.4, 62.0], fx=[['flash', 58.5], ['shake', 61.2]]),
 {'line': 'a8', 'shots': [S(k(27), 2.0, 4.0)], 'stamp': st('#2 · 12 MINUTES LEFT', 'red', 'drum_roll')},
 M(k(27), 5.0, 31.5, replay=[9.8, 12.0], fx=[['shake', 7.0]]),
 {'line': 'a9', 'shots': [S(k(27), 36.0, 38.0)], 'stamp': st("#1 · KAI'S LAST CHASE", 'red', 'drum_roll')},
 M(k(27), 40.0, 77.0, replay=[48.8, 52.0], fx=[['flash', 49.9], ['shake', 50.0]]),
 {'line': 'z0', 'shots': [S(k(3), 60.3, 62.0), S(k(27), 49.5, 51.0)], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [WORK + '/sfx_user_safe', CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/funny/run_amok.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json')
