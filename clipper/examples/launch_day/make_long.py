# plan.json for clipper/longform.py: "Streamers Played GTA 6 First (New Zealand Launch, First Hour)"
import json, os, sys
sys.path.insert(0, '/home/claude/launch')
from lib import words, HQ, G, BGM
L = '/home/claude/launch/long/'
REP = {'jasontheween_130': {44.4: 'flipped'}, 'lacy_198': {31.4: 'Grand', 31.6: 'Theft', 31.8: 'Auto'}, 'jasontheween_w2_1195': {17.4: 'plane,', 21.7: '', 22.1: ''},
       'jasontheween_w2_1100': {32.7: 'behind.'}, 'lacy_w2_500': {38.7: 'W', 39.5: 'BUMP!'}}
def tx(f):
    """captions for a moment: every word I've read, as {words: [...]} for longform.py"""
    rep = REP.get(f, {}); out = []
    for w in words(f):
        k = round(w['s'], 1)
        if k in rep and not rep[k]: continue
        out.append(dict(w, w=rep.get(k, w['w']), p=1.0))
    p = L + 'tx/' + f + '.json'; os.makedirs(L + 'tx', exist_ok=True); json.dump({'words': out}, open(p, 'w')); return p
CROP = {'xqc': [0.25, 0.05, 0.75, 0.75], 'clix': [0.3, 0.05, 0.7, 0.7], 'clixg': [0.25, 0.25, 0.75, 0.75], 'jasontheween': [0.0, 0.25, 0.75, 0.75],
        'jasong': [0.0, 0.1, 0.75, 0.75], 'lacy': [0.25, 0.25, 0.75, 0.75], 'hutchmf': [0.25, 0.0, 0.75, 0.75], 'darkviperau': [0.0, 0.1, 0.8, 0.8],
        'quin69': [0.22, 0.22, 0.78, 0.78], 'tgg_gta': [0.25, 0.1, 0.75, 0.75]}
FILES = ['xqc_0', 'xqc_398', 'xqc_598', 'xqc_790', 'clix_225', 'clix_800', 'clix_w2_1316', 'clix_w2_1508', 'jasontheween_130', 'jasontheween_203', 'jasontheween_700',
         'jasontheween_808', 'jasontheween_w2_1100', 'jasontheween_w2_1195', 'jasontheween_w2_1256', 'lacy_40', 'lacy_198', 'lacy_338', 'lacy_712', 'lacy_w2_500',
         'hutchmf_100', 'hutchmf_212', 'darkviperau_230', 'darkviperau_830', 'darkviperau_w2_250', 'darkviperau_w2_1322', 'quin69_208', 'quin69_795',
         'quin69_w2_660', 'quin69_w2_1118', 'tgg_gta_148', 'tgg_gta_220', 'tgg_gta_w2_1332']
clips = {f: HQ + f + '.mp4' for f in FILES}
def user(f): return f.split('_w2')[0].rsplit('_', 1)[0] if not f.startswith('tgg') else 'tgg_gta'
def crop(f):
    u = user(f)
    if u == 'clix' and (f.endswith('800') or '_w2' in f): return CROP['clixg']
    if u == 'jasontheween' and '_w2' in f: return CROP['jasong']
    return CROP[u]
NAME = {'xqc': 'XQC', 'clix': 'CLIX', 'jasontheween': 'JASONTHEWEEN', 'lacy': 'LACY', 'hutchmf': 'HUTCHMF', 'darkviperau': 'DARKVIPERAU', 'quin69': 'QUIN69', 'tgg_gta': 'TGG'}
def S(f, a, b): return {'clip': f, 'a': a, 'b': b, 'crop': crop(f)}
def M(f, a, b, label=True, **k):
    it = {'moment': [f, a, b], 'tx': tx(f), 'audio': 1.25}
    if label: it['label'] = NAME[user(f)]
    it.update(k); return it
def gif(name, at=0.3, dur=1.8, pos='br', size=280): return {'gif': G + name + '.gif', 'at': at, 'dur': dur, 'pos': pos, 'size': size}
def emo(ch, at=0.3, dur=1.4, pos='tr', size=190): return {'emoji': ch, 'at': at, 'dur': dur, 'pos': pos, 'size': size}
WH = [['whoosh_transition', 0.0, 0.6]]
items = [
 {'line': 'h0', 'shots': [S('xqc_598', 0, 7), S('quin69_795', 15, 22), S('jasontheween_w2_1256', 0, 5)], 'sfx': [['record_scratch', 'end', 0.45]]},
 {'line': 'h1', 'shots': [S('lacy_198', 31, 41), S('tgg_gta_220', 0, 10), S('darkviperau_230', 0, 6)],
  'stamp': {'text': 'GTA 6 · NEW ZEALAND LAUNCH', 'at': 0.3, 'dur': 2.6, 'color': 'purple', 'sfx': 'camera_shutter'}},
 # the last minutes
 {'line': 'a0', 'shots': [S('hutchmf_100', 0, 8), S('lacy_40', 0, 6)], 'stamp': {'text': 'THE LAST MINUTES', 'at': 0.2, 'dur': 2.4, 'color': 'yellow', 'sfx': 'ting'}, 'sfx': WH},
 M('lacy_40', 17.4, 21.7), M('lacy_40', 62.8, 68.1, label=False, overlays=[emo('🥹', 1.0)]),
 M('hutchmf_100', 33.5, 41.5, overlays=[emo('💓', 1.5)]),
 M('tgg_gta_148', 19.5, 29.0), M('jasontheween_130', 43.9, 46.0), M('jasontheween_130', 50.5, 52.0, label=False), M('jasontheween_130', 57.5, 62.2, label=False, overlays=[emo('🕯️', 0.8)]),
 M('xqc_0', 16.0, 21.1), M('xqc_0', 24.0, 30.2, label=False),
 # the unlock
 {'line': 'b0', 'shots': [S('darkviperau_230', 0, 5)], 'stamp': {'text': 'THE UNLOCK', 'at': 0.1, 'dur': 2.0, 'color': 'red', 'sfx': 'ting'}, 'sfx': [['drumroll_crash', 0.0, 0.4]]},
 M('tgg_gta_220', 14.0, 31.6, sfx=[['boom', 16.2, 0.4]]), M('lacy_198', 42.3, 52.1), M('darkviperau_230', 11.3, 24.9, sfx=[['boom', 4.2, 0.35]]),
 M('jasontheween_203', 27.4, 37.1, overlays=[gif('cat_applause', 4.0)]), M('clix_225', 42.5, 48.3, fx=[['shake', 1.0]]), M('quin69_208', 33.2, 46.0),
 {'line': 'b1', 'shots': [S('hutchmf_212', 65, 70)], 'sfx': WH}, M('hutchmf_212', 77.2, 87.1, sfx=[['ba_dum_tss', 9.0, 0.45]]),
 # first impressions
 {'line': 'c0', 'shots': [S('xqc_598', 0, 7), S('quin69_795', 15, 24)], 'stamp': {'text': 'FIRST IMPRESSIONS', 'at': 0.2, 'dur': 2.4, 'color': 'green', 'sfx': 'ting'}, 'sfx': WH},
 M('xqc_398', 6.2, 8.6), M('xqc_598', 7.6, 10.7, label=False), M('quin69_795', 3.2, 8.8, overlays=[emo('😍', 1.0)]), M('lacy_712', 8.9, 11.2), M('lacy_712', 13.6, 16.5, label=False),
 M('tgg_gta_220', 60.9, 64.0), M('lacy_338', 6.7, 8.5), M('lacy_338', 14.3, 17.4, label=False), M('lacy_338', 32.6, 39.1, label=False),
 M('lacy_338', 50.5, 58.6, label=False, overlays=[gif('cheems_cry', 6.2)], sfx=[['sad_trombone', 6.6, 0.4]]),
 {'line': 'c1', 'shots': [S('clix_800', 20, 28)], 'stamp': {'text': '30 FPS?', 'at': 0.2, 'dur': 2.2, 'color': 'red', 'sfx': 'ting'}},
 M('clix_800', 29.7, 36.2), M('jasontheween_700', 28.7, 35.1), M('xqc_790', 7.8, 12.3), M('xqc_790', 16.9, 18.9, label=False), M('jasontheween_808', 21.8, 25.3),
 {'line': 'c2', 'shots': [S('jasontheween_700', 0, 8)]},
 # first gameplay
 {'line': 'd0', 'shots': [S('darkviperau_w2_250', 0, 4), S('quin69_w2_1118', 5, 13)], 'stamp': {'text': 'FIRST GAMEPLAY', 'at': 0.2, 'dur': 2.4, 'color': 'yellow', 'sfx': 'ting'}, 'sfx': WH},
 M('darkviperau_w2_250', 18.9, 28.1), M('darkviperau_w2_250', 35.1, 43.6, label=False, overlays=[gif('troll1', 5.5)], sfx=[['sad_trombone', 6.0, 0.4]]),
 M('darkviperau_w2_250', 52.1, 54.4, label=False), M('darkviperau_w2_1322', 10.9, 16.1, overlays=[emo('🚪', 2.5)]),
 M('quin69_w2_1118', 13.7, 22.2), M('quin69_w2_1118', 54.7, 60.8, label=False, overlays=[emo('💀', 2.0)]),
 M('quin69_w2_660', 26.0, 33.4), M('clix_w2_1508', 16.7, 25.1), M('clix_w2_1508', 45.8, 53.1, label=False, overlays=[emo('🎮', 1.0)]),
 # the plane
 {'line': 'd1', 'shots': [S('jasontheween_w2_1195', 0, 10)], 'stamp': {'text': 'THE PLANE', 'at': 0.1, 'dur': 2.0, 'color': 'purple', 'sfx': 'ting'}, 'sfx': [['dun_dun_duun', 'end', 0.4]]},
 M('jasontheween_w2_1100', 29.4, 34.1), M('jasontheween_w2_1100', 39.1, 49.4, label=False), M('clix_w2_1316', 23.5, 32.5), M('clix_w2_1316', 59.6, 63.1, label=False),
 M('jasontheween_w2_1195', 10.3, 18.1), M('jasontheween_w2_1195', 22.7, 24.8, label=False), M('tgg_gta_w2_1332', 4.2, 12.2), M('lacy_w2_500', 36.9, 40.1, overlays=[emo('✈️', 0.5)]),
 M('jasontheween_w2_1256', 11.2, 18.5, fx=[['shake', 1.5]], sfx=[['boom', 1.6, 0.4]]),
 # outro
 {'line': 'z0', 'shots': [S('jasontheween_w2_1256', 0, 10), S('quin69_795', 15, 24), S('xqc_598', 0, 7)], 'hold': 1.2,
  'stamp': {'text': 'USA: MIDNIGHT ET', 'at': 9.0, 'dur': 3.0, 'color': 'purple', 'sfx': 'clock_tick'}},
]
plan = {'lines': [L + 'narr/lines.json'], 'clips': clips, 'clipopts': {}, 'info_tint': 'vice',
        'sfx_dirs': ['/home/claude/clipper/sfx/made', '/home/claude/clipper/sfx/drive', '/home/claude/clipper/sfx/cc0'],
        'music': {'file': BGM + 'vice_city_80s/miami_nights_extended_theme.mp3', 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(L + 'plan.json', 'w'), indent=1, ensure_ascii=False)
mom = sum(it['moment'][2] - it['moment'][1] for it in items if 'moment' in it)
print('plan.json:', len(items), 'items;', f'{mom:.0f}s of moments')
