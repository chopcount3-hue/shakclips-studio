import json, os, sys
WORK = os.environ.get('WORK', '/home/claude/gtaday') + '/'; CL = '/home/claude/studio/clipper'
sys.path.insert(0, CL + '/daily'); from lib import words, own
def tx(f):
    p = WORK + 'tx/' + f + '.fixed_long.json'; json.dump({'words': [dict(w, p=1.0) for w in words(f)]}, open(p, 'w')); return p
NAMES = ['ludwig_59', 'cohhcarnage_21', 'darkviperau_52', 'xqc_11', 'jerma985_14', 'moistcr1tikal_69', 'darkviperau_32', 'ishowspeed_01']
clips = {n: WORK + 'clips/' + n + '_bl.mp4' for n in NAMES}   # bleeped copies (bleep_clips.py)
C = [0.05, 0.0, 0.9, 0.9]; DV = [0.0, 0.0, 0.81, 0.81]; SP = [0.0, 0.04, 0.84, 0.84]
S = lambda f, a, b, crop=C: {'clip': f, 'a': a, 'b': b, 'crop': crop}
def M(f, a, b, label, crop=C, **k): return {'moment': [f, a, b], 'tx': tx(f), 'audio': 1.25, 'label': label, 'crop': crop, **k}
def st(t, c='yellow', s='ting'): return {'text': t, 'at': 0.15, 'dur': 2.2, 'color': c, 'sfx': s}
items = [
 {'line': 'h0', 'shots': [S('darkviperau_32', 9, 14, DV), S('moistcr1tikal_69', 5, 10), S('ishowspeed_01', 17, 22, SP)], 'stamp': {'text': 'GTA 6 · DAY 5', 'at': 0.3, 'dur': 2.4, 'color': 'purple', 'sfx': 'camera_shutter'}},
 {'line': 'a1', 'shots': [S('ludwig_59', 0.0, 2.5)], 'stamp': st('#8 · LUDWIG')},
 M('ludwig_59', 0.0, 12.4, 'LUDWIG', replay=[1.5, 5.5]),
 {'line': 'r1', 'shots': [S('ludwig_59', 8.0, 12.4)]},
 {'line': 'a2', 'shots': [S('cohhcarnage_21', 0.0, 4.0), S('cohhcarnage_21', 4.0, 8.0)], 'stamp': st('#7 · COHHCARNAGE')},
 M('cohhcarnage_21', 8.0, 30.0, 'COHHCARNAGE', replay=[11.5, 16.0]),
 {'line': 'r2', 'shots': [S('cohhcarnage_21', 17.0, 21.0)]},
 {'line': 'a3', 'shots': [S('darkviperau_52', 0.0, 8.0, DV)], 'stamp': st('#6 · DARKVIPERAU')},
 M('darkviperau_52', 8.0, 30.0, 'DARKVIPERAU', crop=DV, replay=[10.0, 14.5]),
 {'line': 'r3', 'shots': [S('darkviperau_52', 15.0, 19.0, DV)]},
 {'line': 'a4', 'shots': [S('xqc_11', 0.0, 8.0)], 'stamp': st('#5 · XQC')},
 M('xqc_11', 8.0, 28.5, 'XQC'),
 {'line': 'r4', 'shots': [S('xqc_11', 14.0, 18.0)]},
 {'line': 'a5', 'shots': [S('jerma985_14', 43.0, 52.0)], 'stamp': st('#4 · JERMA985')},
 M('jerma985_14', 0.0, 32.0, 'JERMA985', replay=[8.5, 13.0]),
 {'line': 'r5', 'shots': [S('jerma985_14', 50.0, 56.0)]},
 {'line': 'a6', 'shots': [S('moistcr1tikal_69', 0.0, 2.4), S('moistcr1tikal_69', 26.8, 30.0)], 'stamp': st('#3 · MOISTCR1TIKAL')},
 M('moistcr1tikal_69', 3.9, 30.0, 'MOISTCR1TIKAL', replay=[5.8, 9.0]),
 {'line': 'r6', 'shots': [S('moistcr1tikal_69', 10.0, 14.0)]},
 {'line': 'a7', 'shots': [S('darkviperau_32', 0.0, 4.0, DV), S('darkviperau_32', 1.5, 5.0, DV)], 'stamp': st('#2 · DARKVIPERAU')},
 M('darkviperau_32', 0.0, 20.1, 'DARKVIPERAU', crop=DV, replay=[10.5, 14.5]),
 {'line': 'r7', 'shots': [S('darkviperau_32', 14.5, 19.5, DV)]},
 {'line': 'a8', 'shots': [S('ishowspeed_01', 11.0, 16.5, SP), S('ishowspeed_01', 25.0, 29.0, SP)], 'stamp': st('#1 · ISHOWSPEED', 'red', 'drum_roll')},
 M('ishowspeed_01', 0.5, 30.0, 'ISHOWSPEED', crop=SP, replay=[17.5, 22.5]),
 {'line': 'z0', 'shots': [S('moistcr1tikal_69', 6.0, 10.0), S('darkviperau_32', 11.0, 15.0, DV)], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [WORK + '/sfx_user_safe', CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/vice_city_80s/miami_nights_extended_theme.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json', plan['music']['file'])
