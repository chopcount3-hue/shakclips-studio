import json, os, sys
WORK = '/home/claude/gtaday/'; CL = '/home/claude/clipper'
sys.path.insert(0, CL + '/daily'); from lib import words
def tx(f, rep=None):
    rep = rep or {}; out = []
    for w in words(f):
        k = round(w['s'], 1)
        if k in rep:
            if not rep[k]: continue
            w = dict(w, w=rep[k])
        out.append(dict(w, p=1.0))
    p = WORK + 'tx/' + f + '.fixed_long.json'; json.dump({'words': out}, open(p, 'w')); return p
NAMES = ['zoreee_07', 'zoreee_10', 'xqc_21', 'lacy_14', 'ohnepixel_16', 'jerma985_31', 'ishowspeed_20', 'ishowspeed_34']
clips = {n: WORK + 'clips/' + n + '.mp4' for n in NAMES}
S = lambda f, a, b, crop: {'clip': f, 'a': a, 'b': b, 'crop': crop}
Z = [0.0, 0.1, 0.82, 0.82]; LA = [0.0, 0.17, 0.75, 0.75]; PX = [0.04, 0.0, 0.92, 0.92]; SP = [0.0, 0.08, 0.88, 0.88]; FULL = [0.0, 0.0, 0.93, 0.93]
def M(f, a, b, lab, crop, t=None, audio=1.25): return {'moment': [f, a, b], 'tx': t or tx(f), 'audio': audio, 'label': lab, 'crop': crop}
def st(text, color='yellow'): return {'text': text, 'at': 0.15, 'dur': 2.2, 'color': color, 'sfx': 'ting'}
lacy_tx = tx('lacy_14', {15.4: 'fox!', 16.8: 'ground!'})
items = [
 {'line': 'h0', 'shots': [S('zoreee_07', 8.4, 12, Z), S('lacy_14', 22.6, 25, LA), S('jerma985_31', 17, 21, FULL), S('ishowspeed_34', 16, 20, SP)],
  'stamp': {'text': 'GTA 6 · DAY 3', 'at': 0.3, 'dur': 2.4, 'color': 'purple', 'sfx': 'camera_shutter'}},
 {'line': 'a1', 'shots': [S('zoreee_07', 0.4, 3.0, Z), S('zoreee_07', 12, 15, Z)], 'stamp': st('#7 · ZOREEE')},
 M('zoreee_07', 0.4, 3.0, 'ZOREEE', Z), M('zoreee_07', 8.4, 15.0, 'ZOREEE', Z),
 {'line': 'r1', 'shots': [S('zoreee_07', 9, 13, Z)]},
 {'line': 'a2', 'shots': [S('zoreee_10', 17.8, 21.2, Z), S('zoreee_10', 0, 4, Z)], 'stamp': st('#6 · ZOREEE AGAIN')},
 M('zoreee_10', 0.0, 8.2, 'ZOREEE', Z), M('zoreee_10', 13.0, 21.2, 'ZOREEE', Z),
 {'line': 'r2', 'shots': [S('zoreee_10', 18, 22, Z)]},
 {'line': 'a3', 'shots': [S('xqc_21', 22, 28, FULL)], 'stamp': st('#5 · XQC', 'green')},
 M('xqc_21', 0.3, 26.0, 'XQC', FULL),
 {'line': 'r3', 'shots': [S('xqc_21', 24, 28, FULL), S('lacy_14', 0, 3, LA)]},
 {'line': 'a4', 'shots': [S('lacy_14', 0, 3, LA), S('lacy_14', 18, 22, LA)], 'stamp': st('#4 · LACY')},
 M('lacy_14', 3.0, 17.4, 'LACY', LA, lacy_tx), M('lacy_14', 22.6, 24.6, 'LACY', LA, lacy_tx), M('lacy_14', 32.7, 36.0, 'LACY', LA, lacy_tx),
 {'line': 'r4', 'shots': [S('lacy_14', 24, 30, LA)]},
 {'line': 'a5', 'shots': [S('ohnepixel_16', 16, 22, PX)], 'stamp': st('#3 · OHNEPIXEL')},
 M('ohnepixel_16', 0.0, 4.2, 'OHNEPIXEL', PX), M('ohnepixel_16', 12.4, 14.2, 'OHNEPIXEL', PX), M('ohnepixel_16', 16.0, 45.0, 'OHNEPIXEL', PX),
 {'line': 'r5', 'shots': [S('ohnepixel_16', 45, 50, PX)]},
 {'line': 'a6', 'shots': [S('jerma985_31', 0, 6, FULL)], 'stamp': st('#2 · JERMA', 'red')},
 M('jerma985_31', 0.0, 10.4, 'JERMA', FULL), M('jerma985_31', 11.8, 30.0, 'JERMA', FULL),
 {'line': 'r6', 'shots': [S('jerma985_31', 26, 30, FULL)]},
 {'line': 'a7', 'shots': [S('ishowspeed_34', 0, 4, SP), S('ishowspeed_20', 0, 5, SP)], 'stamp': st('#1 · ISHOWSPEED', 'red')},
 M('ishowspeed_20', 0.0, 9.5, 'ISHOWSPEED', SP),
 {'line': 'b7', 'shots': [S('ishowspeed_34', 6, 11, SP)]},
 M('ishowspeed_34', 0.0, 23.0, 'ISHOWSPEED', SP),
 {'line': 'z0', 'shots': [S('ishowspeed_34', 18, 23, SP), S('zoreee_07', 9, 13, Z), S('lacy_14', 22.6, 25, LA)], 'hold': 1.0},
]
plan = {'lines': [WORK + 'long/narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': [CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
        'music': {'file': CL + '/bgm/vice_city_80s/miami_viceroy.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(WORK + 'long/plan.json', 'w'), indent=1); print('plan ->', WORK + 'long/plan.json')
