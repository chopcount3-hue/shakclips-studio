import json, os, sys
WORK = os.environ.get('WORK', '/home/claude/gtaday') + '/'; CL = '/home/claude/studio/clipper'
sys.path.insert(0, CL + '/daily'); from lib import words, own
FIX = {'SF9.': 'SF90.', 'break': 'brake'}
def tx(f):
    p = WORK + 'tx/' + f + '.fixed_long.json'
    json.dump({'words': [dict(w, w=FIX.get(w['w'], w['w']), p=1.0) for w in words(f)]}, open(p, 'w')); return p
NAMES = ['hasanabi_39', 'cohhcarnage_33', 'theburntpeanut_34', 'agent00_27', 'jynxzi_17', 'jynxzi_18', 'agent00_28']
clips = {n: WORK + 'clips/' + n + '_bl.mp4' for n in NAMES}
C = [0.05, 0.0, 0.9, 0.9]; AG = [0.0, 0.18, 0.76, 0.76]; JX = [0.0, 0.1, 0.88, 0.88]
S = lambda f, a, b, crop=C: {'clip': f, 'a': a, 'b': b, 'crop': crop}
def M(f, a, b, label, crop=C, **k): return {'moment': [f, a, b], 'tx': tx(f), 'audio': 1.25, 'label': label, 'crop': crop, **k}
def st(t, c='yellow', s='ting'): return {'text': t, 'at': 0.15, 'dur': 2.2, 'color': c, 'sfx': s}
items = [
 {'line': 'h0', 'shots': [S('agent00_28', 17.5, 20.5, AG), S('agent00_27', 10.0, 13.5, AG), S('jynxzi_17', 4.5, 8.0, JX)], 'stamp': {'text': 'GTA 6 · DAY 7', 'at': 0.3, 'dur': 2.4, 'color': 'purple', 'sfx': 'camera_shutter'}},
 {'line': 'a1', 'shots': [S('hasanabi_39', 0.0, 4.0)], 'stamp': st('#7 · HASANABI')},
 M('hasanabi_39', 0.0, 16.0, 'HASANABI', replay=[8.5, 12.0]),
 {'line': 'r1', 'shots': [S('hasanabi_39', 4.0, 8.0)]},
 {'line': 'a2', 'shots': [S('cohhcarnage_33', 0.0, 5.0)], 'stamp': st('#6 · COHHCARNAGE')},
 M('cohhcarnage_33', 0.0, 23.0, 'COHHCARNAGE', replay=[15.0, 19.5]),
 {'line': 'r2', 'shots': [S('cohhcarnage_33', 17.0, 22.0)]},
 {'line': 'a3', 'shots': [S('theburntpeanut_34', 0.0, 4.0)], 'stamp': st('#5 · THEBURNTPEANUT')},
 M('theburntpeanut_34', 0.0, 22.5, 'THEBURNTPEANUT'),
 {'line': 'r3', 'shots': [S('theburntpeanut_34', 15.0, 20.0)]},
 {'line': 'a4', 'shots': [S('agent00_27', 4.0, 12.0, AG)], 'stamp': st('#4 · AGENT00')},
 M('agent00_27', 21.0, 30.0, 'AGENT00', crop=AG, replay=[23.5, 27.0]),
 {'line': 'r4', 'shots': [S('agent00_27', 27.0, 30.0, AG)]},
 {'line': 'a5', 'shots': [S('jynxzi_17', 0.0, 4.0, JX)], 'stamp': st('#3 · JYNXZI x NICKEH30')},
 M('jynxzi_17', 0.0, 30.0, 'JYNXZI', crop=JX, replay=[5.0, 8.5]),
 {'line': 'r5', 'shots': [S('jynxzi_17', 12.0, 16.0, JX)]},
 {'line': 'a6', 'shots': [S('jynxzi_18', 0.0, 2.2, JX)], 'stamp': st('#2 · JYNXZI')},
 M('jynxzi_18', 0.0, 22.0, 'JYNXZI', crop=JX, replay=[2.4, 5.0]),
 {'line': 'r6', 'shots': [S('jynxzi_18', 9.0, 13.0, JX)]},
 {'line': 'a7', 'shots': [S('agent00_28', 0.0, 4.0, AG), S('agent00_28', 4.0, 7.0, AG)], 'stamp': st('#1 · AGENT00', 'red', 'drum_roll')},
 M('agent00_28', 0.0, 30.0, 'AGENT00', crop=AG, replay=[17.8, 21.0]),
 {'line': 'z0', 'shots': [S('agent00_28', 18.0, 21.0, AG), S('jynxzi_18', 2.4, 5.0, JX)], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [WORK + '/sfx_user_safe', CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/vice_city_80s/neon_laser_horizon.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json', plan['music']['file'])
