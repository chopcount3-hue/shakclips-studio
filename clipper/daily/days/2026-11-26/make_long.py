import json, os, sys
WORK = os.environ.get('WORK', '/home/claude/gtaday') + '/'; CL = '/home/claude/studio/clipper'
sys.path.insert(0, CL + '/daily'); from lib import words, own
FIX = {}
def tx(f):
    p = WORK + 'tx/' + f + '.fixed_long.json'
    json.dump({'words': [dict(w, w=FIX.get(w['w'], w['w']), p=1.0) for w in words(f)]}, open(p, 'w')); return p
NAMES = ['kaicenat_m01', 'kaicenat_m04', 'kaicenat_m05', 'kaicenat_m06', 'kaicenat_m12', 'kaicenat_m07', 'kaicenat_m13', 'kaicenat_m14']
clips = {n: WORK + 'clips/' + n + '_bl.mp4' for n in NAMES}
C = [0.0, 0.0, 1.0, 1.0]
S = lambda f, a, b, crop=C: {'clip': f, 'a': a, 'b': b, 'crop': crop}
def M(f, a, b, label='KAI x SPEED', crop=C, **k): return {'moment': [f, a, b], 'tx': tx(f), 'audio': 1.25, 'label': label, 'crop': crop, **k}
def st(t, c='yellow', s='ting'): return {'text': t, 'at': 0.15, 'dur': 2.2, 'color': c, 'sfx': s}
m = lambda n: 'kaicenat_m%02d' % n
items = [
 {'line': 'h0', 'shots': [S(m(13), 52.6, 55.2), S(m(13), 57.8, 59.0), S(m(4), 60.0, 64.0), S(m(5), 47.0, 51.0), S(m(12), 46.0, 50.0)], 'stamp': {'text': 'KAI vs SPEED · RACE TO $1M', 'at': 0.3, 'dur': 2.6, 'color': 'purple', 'sfx': 'camera_shutter'}},
 {'line': 'a1', 'shots': [S(m(1), 0.0, 6.0)], 'stamp': st('#7 · KAI IS BROKE')},
 M(m(1), 7.0, 34.5),
 {'line': 'r1', 'shots': [S(m(1), 36.0, 41.0)]},
 {'line': 'a2', 'shots': [S(m(4), 30.0, 36.0)], 'stamp': st('#6 · $186K vs $13K')},
 M(m(4), 42.9, 73.5),
 {'line': 'r2', 'shots': [S(m(4), 74.0, 79.0)]},
 {'line': 'a3', 'shots': [S(m(5), 30.0, 41.0)], 'stamp': st('#5 · THE NAP')},
 M(m(5), 41.5, 80.0, replay=[47.0, 51.0]),
 {'line': 'r3', 'shots': [S(m(5), 70.0, 75.0)]},
 {'line': 'a4', 'shots': [S(m(6), 8.0, 16.0)], 'stamp': st('#4 · COP CAR')},
 M(m(6), 22.0, 60.0),
 {'line': 'r4', 'shots': [S(m(6), 62.0, 67.0)]},
 {'line': 'a5', 'shots': [S(m(12), 30.0, 38.0)], 'stamp': st('#3 · LOL')},
 M(m(12), 38.0, 62.0, replay=[46.0, 50.0]),
 {'line': 'r5', 'shots': [S(m(12), 62.0, 67.0)]},
 {'line': 'a6', 'shots': [S(m(7), 2.0, 10.0)], 'stamp': st('#2 · THE RULE')},
 M(m(7), 17.8, 46.0),
 {'line': 'r6', 'shots': [S(m(7), 50.0, 54.0)]},
 {'line': 'a7', 'shots': [S(m(13), 2.0, 6.0), S(m(13), 36.0, 44.0)], 'stamp': st('#1 · $524K', 'red', 'drum_roll')},
 M(m(13), 52.5, 82.4, replay=[53.0, 55.2]),
 {'line': 'r7', 'shots': [S(m(14), 2.5, 9.0)]},
 M(m(14), 9.0, 47.5),
 {'line': 'r8', 'shots': [S(m(14), 70.0, 73.0)]},
 M(m(14), 76.0, 83.5),
 {'line': 'z0', 'shots': [S(m(13), 57.8, 61.0), S(m(4), 60.0, 64.0), S(m(12), 46.0, 50.0)], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [WORK + '/sfx_user_safe', CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/funny/run_amok.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json', plan['music']['file'])
