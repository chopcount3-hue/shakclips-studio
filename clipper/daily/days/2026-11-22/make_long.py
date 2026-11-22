import json, os, sys
WORK = os.environ.get('WORK', '/home/claude/gtaday') + '/'; CL = '/home/claude/studio/clipper'
sys.path.insert(0, CL + '/daily'); from lib import words, own
def tx(f):
    p = WORK + 'tx/' + f + '.fixed_long.json'; json.dump({'words': [dict(w, p=1.0) for w in words(f)]}, open(p, 'w')); return p
NAMES = ['lirik_37', 'jerma985_25', 'fuslie_34', 'joe_bartolozzi_04', 'lacy_14', 'woolieversus_02', 'dunc_18', 'jshrobz_08']
clips = {n: WORK + 'clips/' + n + '_bl.mp4' for n in NAMES}   # bleeped copies (bleep_clips.py)
S = lambda f, a, b, crop=[0.05, 0.0, 0.9, 0.9]: {'clip': f, 'a': a, 'b': b, 'crop': crop}
C = [0.05, 0.0, 0.9, 0.9]
def M(f, a, b, label, crop=C, **k): return {'moment': [f, a, b], 'tx': tx(f), 'audio': 1.25, 'label': label, 'crop': crop, **k}
def st(t, c='yellow', s='ting'): return {'text': t, 'at': 0.15, 'dur': 2.2, 'color': c, 'sfx': s}
items = [
 {'line': 'h0', 'shots': [S('jshrobz_08', 4, 12), S('dunc_18', 0, 6), S('woolieversus_02', 0, 4)], 'stamp': {'text': 'GTA 6 · DAY 4', 'at': 0.3, 'dur': 2.4, 'color': 'purple', 'sfx': 'camera_shutter'}},
 {'line': 'a1', 'shots': [S('lirik_37', 0.5, 5.8)], 'stamp': st('#8 · LIRIK')},
 M('lirik_37', 5.8, 14.6, 'LIRIK', replay=[9.0, 11.5]),
 {'line': 'r1', 'shots': [S('lirik_37', 14.5, 22)]},
 {'line': 'a2', 'shots': [S('jerma985_25', 0.5, 13.5, [0.0, 0.0, 0.9, 0.9])], 'stamp': st('#7 · JERMA985')},
 M('jerma985_25', 13.5, 26.0, 'JERMA985', crop=[0.0, 0.0, 0.9, 0.9], replay=[19.5, 22.5]),
 {'line': 'r2', 'shots': [S('jerma985_25', 26.0, 30.0, [0.0, 0.0, 0.9, 0.9])]},
 {'line': 'a3', 'shots': [S('fuslie_34', 0.5, 9.0, [0.0, 0.0, 0.9, 0.9])], 'stamp': st('#6 · FUSLIE')},
 M('fuslie_34', 21.4, 29.2, 'FUSLIE', crop=[0.0, 0.0, 0.9, 0.9]),
 M('fuslie_34', 35.3, 48.3, 'FUSLIE', crop=[0.0, 0.0, 0.9, 0.9]),
 {'line': 'r3', 'shots': [S('fuslie_34', 44.0, 49.0, [0.0, 0.0, 0.9, 0.9])]},
 {'line': 'a4', 'shots': [S('joe_bartolozzi_04', 0.0, 2.8, [0.1, 0.0, 0.9, 0.9]), S('joe_bartolozzi_04', 17.5, 22.0, [0.1, 0.0, 0.9, 0.9])], 'stamp': st('#5 · JOE BARTOLOZZI')},
 M('joe_bartolozzi_04', 2.8, 17.2, 'JOE BARTOLOZZI', crop=[0.1, 0.0, 0.9, 0.9], replay=[13.5, 16.0]),
 {'line': 'r4', 'shots': [S('joe_bartolozzi_04', 18.0, 24.0, [0.1, 0.0, 0.9, 0.9])]},
 {'line': 'a5', 'shots': [S('lacy_14', 0.0, 1.8, [0.0, 0.0, 0.9, 0.9]), S('lacy_14', 7.5, 11.0, [0.0, 0.0, 0.9, 0.9])], 'stamp': st('#4 · LACY')},
 M('lacy_14', 1.8, 32.5, 'LACY', crop=[0.0, 0.0, 0.9, 0.9]),
 {'line': 'r5', 'shots': [S('lacy_14', 25.0, 29.0, [0.0, 0.0, 0.9, 0.9])]},
 {'line': 'a6', 'shots': [S('woolieversus_02', 0.0, 3.0)], 'stamp': st('#3 · WOOLIEVERSUS')},
 M('woolieversus_02', 3.0, 28.4, 'WOOLIEVERSUS', replay=[3.0, 6.0]),
 M('woolieversus_02', 35.5, 48.0, 'WOOLIEVERSUS'),
 {'line': 'r6', 'shots': [S('woolieversus_02', 52.0, 58.0)]},
 {'line': 'a7', 'shots': [S('dunc_18', 14.0, 22.5)], 'stamp': st('#2 · DUNC')},
 M('dunc_18', 0.0, 14.0, 'DUNC'),
 M('dunc_18', 27.6, 44.4, 'DUNC'),
 M('dunc_18', 49.8, 58.5, 'DUNC'),
 {'line': 'r7', 'shots': [S('dunc_18', 58.0, 60.0), S('dunc_18', 18.0, 22.0)]},
 {'line': 'a8', 'shots': [S('jshrobz_08', 3.5, 13.5, [0.0, 0.0, 0.9, 0.9])], 'stamp': st('#1 · JSHROBZ', 'red', 'drum_roll')},
 M('jshrobz_08', 13.5, 18.5, 'JSHROBZ', crop=[0.0, 0.0, 0.9, 0.9]),
 M('jshrobz_08', 21.0, 43.0, 'JSHROBZ', crop=[0.0, 0.0, 0.9, 0.9], replay=[35.6, 38.5]),
 {'line': 'z0', 'shots': [S('dunc_18', 52.0, 58.0), S('lacy_14', 25.0, 30.0, [0.0, 0.0, 0.9, 0.9])], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [WORK + '/sfx_user_safe', CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/vice_city_80s/' + sorted(os.listdir(CL + '/bgm/vice_city_80s'))[0], 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json', plan['music']['file'])
