import json, os, sys
WORK = os.environ.get('WORK', '/home/claude/gtaday') + '/'; CL = '/home/claude/studio/clipper'
sys.path.insert(0, CL + '/daily'); from lib import words, own
def tx(f):
    p = WORK + 'tx/' + f + '.fixed_long.json'
    json.dump({'words': [dict(w, p=1.0) for w in words(f) if not w['w'].lower().startswith('piece')]}, open(p, 'w')); return p
NAMES = ['kaicenat_m10', 'kaicenat_m02', 'kaicenat_m11', 'kaicenat_m03', 'kaiw_12020', 'kaiw_11685', 'kaicenat_m08', 'kaiw_15700', 'kaiw_16930', 'kaiw_17070']
clips = {n: WORK + 'clips/' + n + '_bl.mp4' for n in NAMES}
C = [0.0, 0.0, 1.0, 1.0]
S = lambda f, a, b, crop=C: {'clip': f, 'a': a, 'b': b, 'crop': crop}
def M(f, a, b, label='KAI x SPEED', crop=C, fx=(), **k): return {'moment': [f, a, b], 'tx': tx(f), 'audio': 1.25, 'label': label, 'crop': crop, 'fx': [[n, round(t - a, 2)] for n, t in fx], **k}   # fx at SOURCE times -> moment-relative
def st(t, c='yellow', s='ting'): return {'text': t, 'at': 0.1, 'dur': 1.7, 'color': c, 'sfx': s}
k = lambda n: 'kaicenat_m%02d' % n
items = [
 {'line': 'h0', 'shots': [S(k(8), 2.0, 3.2), S('kaiw_17070', 70.0, 71.5)], 'stamp': {'text': 'KAI vs SPEED · PART 2', 'at': 0.2, 'dur': 2.2, 'color': 'purple', 'sfx': 'camera_shutter'}},
 {'line': 'a1', 'shots': [S(k(10), 5.0, 7.0)], 'stamp': st('#8 · KAI\'S GETAWAY', s='whoosh_transition')},
 M(k(10), 47.5, 80.5, label='KAI CENAT', replay=[53.2, 57.0], fx=[['flash', 53.3]]),
 {'line': 'a2', 'shots': [S(k(2), 55.0, 57.0)], 'stamp': st('#7 · "DON\'T DIE"')},
 M(k(2), 57.4, 90.0, replay=[82.0, 85.0], fx=[['shake', 76.4]]),
 {'line': 'a3', 'shots': [S(k(11), 58.0, 60.0)], 'stamp': st('#6 · KAI ASKS SPEED', s='whoosh_transition')},
 M(k(11), 62.4, 84.5, replay=[70.5, 73.0], fx=[['flash', 71.0]]),
 {'line': 'a4', 'shots': [S(k(3), 24.0, 26.0)], 'stamp': st('#5 · HOW MUCH IS IN THE BAG?')},
 M(k(3), 27.3, 75.0, label='KAI CENAT', replay=[52.0, 54.3], fx=[['flash', 53.6], ['shake', 53.7]]),
 {'line': 'a5', 'shots': [S('kaiw_12020', 30.0, 32.0)], 'stamp': st('#4 · WHY IS SPEED STANDING?', s='whoosh_transition')},
 M('kaiw_12020', 36.0, 74.0, replay=[52.0, 56.0], fx=[['shake', 52.2]]),
 {'line': 'a6', 'shots': [S('kaiw_11685', 9.0, 11.0)], 'stamp': st('#3 · KAI GOT GREEDY', 'red')},
 M('kaiw_11685', 14.0, 58.0, label='KAI CENAT', replay=[43.8, 48.0], fx=[['flash', 44.0]]),
 {'line': 'a7', 'shots': [S(k(8), 0.0, 2.0)], 'stamp': st('#2 · SPEED\'S GAME', 'red', 'drum_roll')},
 M(k(8), 0.5, 6.0, replay=[2.0, 4.5], fx=[['flash', 2.2], ['shake', 2.3]]),
 M(k(8), 45.8, 88.0, replay=[74.9, 77.4], fx=[['flash', 75.1], ['shake', 75.2]]),
 {'line': 'a8', 'shots': [S('kaiw_15700', 55.0, 57.0)], 'stamp': st('#1 · THE LAST 60 SECONDS', 'red', 'drum_roll')},
 M('kaiw_15700', 60.2, 83.3, replay=[74.2, 76.8], fx=[['shake', 74.3]]),
 M('kaiw_16930', 44.3, 59.6, replay=[51.6, 55.0]),
 M('kaiw_17070', 47.8, 74.0, replay=[68.0, 73.5], fx=[['flash', 72.6], ['shake', 72.7]]),
 {'line': 'z0', 'shots': [S(k(3), 52.0, 54.0), S(k(8), 74.9, 76.5)], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [WORK + '/sfx_user_safe', CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/funny/run_amok.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json')
