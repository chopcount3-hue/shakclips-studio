import json, os, sys
WORK = os.environ.get('WORK', '/home/claude/gtaday') + '/'; CL = '/home/claude/studio/clipper'
sys.path.insert(0, CL + '/daily'); from lib import words, own
def tx(f):
    p = WORK + 'tx/' + f + '.fixed_long.json'; json.dump({'words': [dict(w, p=1.0) for w in words(f)]}, open(p, 'w')); return p
NAMES = ['ishowspeed_06', 'fanum_27', 'caseoh__13', 'lirik_31', 'jynxzi_15', 'cohhcarnage_30', 'caseoh__08', 'kaicenat_14']
clips = {n: WORK + 'clips/' + n + '_bl.mp4' for n in NAMES}   # bleeped copies (bleep_clips.py)
C = [0.05, 0.0, 0.9, 0.9]; FN = [0.0, 0.1, 0.8, 0.8]; CO = [0.0, 0.09, 0.86, 0.86]; JX = [0.0, 0.1, 0.85, 0.85]; KC = [0.17, 0.02, 0.83, 0.83]
S = lambda f, a, b, crop=C: {'clip': f, 'a': a, 'b': b, 'crop': crop}
def M(f, a, b, label, crop=C, **k): return {'moment': [f, a, b], 'tx': tx(f), 'audio': 1.25, 'label': label, 'crop': crop, **k}
def st(t, c='yellow', s='ting'): return {'text': t, 'at': 0.15, 'dur': 2.2, 'color': c, 'sfx': s}
items = [
 {'line': 'h0', 'shots': [S('caseoh__08', 6.5, 10.0, CO), S('cohhcarnage_30', 3, 8), S('kaicenat_14', 13, 17, KC)], 'stamp': {'text': 'GTA 6 · DAY 6', 'at': 0.3, 'dur': 2.4, 'color': 'purple', 'sfx': 'camera_shutter'}},
 {'line': 'a1', 'shots': [S('ishowspeed_06', 0.0, 3.0)], 'stamp': st('#8 · ISHOWSPEED')},
 M('ishowspeed_06', 0.0, 14.0, 'ISHOWSPEED'),
 {'line': 'r1', 'shots': [S('ishowspeed_06', 9.0, 13.0)]},
 {'line': 'a2', 'shots': [S('fanum_27', 0.0, 4.5, FN)], 'stamp': st('#7 · FANUM')},
 M('fanum_27', 0.0, 20.0, 'FANUM', crop=FN, replay=[6.0, 11.0]),
 {'line': 'r2', 'shots': [S('fanum_27', 15.0, 19.0, FN)]},
 {'line': 'a3', 'shots': [S('caseoh__13', 0.0, 3.5, CO)], 'stamp': st('#6 · CASEOH')},
 M('caseoh__13', 0.0, 22.0, 'CASEOH', crop=CO),
 {'line': 'r3', 'shots': [S('caseoh__13', 12.0, 16.0, CO)]},
 {'line': 'a4', 'shots': [S('lirik_31', 9.0, 15.0)], 'stamp': st('#5 · LIRIK')},
 M('lirik_31', 9.0, 34.0, 'LIRIK', replay=[20.5, 24.5]),
 {'line': 'r4', 'shots': [S('lirik_31', 26.0, 30.0)]},
 {'line': 'a5', 'shots': [S('jynxzi_15', 0.0, 3.0, JX)], 'stamp': st('#4 · JYNXZI')},
 M('jynxzi_15', 0.0, 15.0, 'JYNXZI', crop=JX, replay=[4.5, 8.5]),
 {'line': 'r5', 'shots': [S('jynxzi_15', 10.5, 14.5, JX)]},
 {'line': 'a6', 'shots': [S('cohhcarnage_30', 0.0, 6.0)], 'stamp': st('#3 · COHHCARNAGE')},
 M('cohhcarnage_30', 0.0, 21.5, 'COHHCARNAGE', replay=[11.0, 16.0]),
 {'line': 'r6', 'shots': [S('cohhcarnage_30', 39.0, 45.0)]},
 {'line': 'a7', 'shots': [S('caseoh__08', 3.0, 6.0, CO)], 'stamp': st('#2 · CASEOH')},
 M('caseoh__08', 3.0, 34.8, 'CASEOH', crop=CO, replay=[6.0, 10.0]),
 {'line': 'r7', 'shots': [S('caseoh__08', 26.0, 30.0, CO)]},
 {'line': 'a8', 'shots': [S('kaicenat_14', 0.0, 4.0, KC), S('kaicenat_14', 4.0, 8.0, KC)], 'stamp': st('#1 · KAI CENAT', 'red', 'drum_roll')},
 M('kaicenat_14', 0.0, 23.0, 'KAI CENAT', crop=KC, replay=[12.0, 17.0]),
 {'line': 'z0', 'shots': [S('caseoh__08', 7.0, 10.0, CO), S('kaicenat_14', 14.0, 17.0, KC)], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [WORK + '/sfx_user_safe', CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/vice_city_80s/voltaic.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json', plan['music']['file'])
