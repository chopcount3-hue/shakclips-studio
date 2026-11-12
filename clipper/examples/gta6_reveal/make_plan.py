# plan.json for clipper/longform.py: "Streamers React to GTA 6's Live Reveal (It Broke Twitch)"
import json
G = '/home/claude/gta6vid/'
idx = {int(l.split()[0]): l.split()[1] for l in open(G + 'sheets/index.txt')}
clips = {f'c{n}': '/home/claude/untrusted/gta6_clips/' + f for n, f in idx.items()}
def tx(n): return G + 'tx/' + idx[n][:-4] + '.json'
CAM = {19: [0, 0.64, 0.24, 0.36], 35: [0, 0, 0.21, 0.27], 11: [0, 0.50, 0.30, 0.50], 12: [0, 0.55, 0.30, 0.45], 18: [0, 0.58, 0.30, 0.42],
       6: [0.03, 0.52, 0.32, 0.48], 38: [0, 0, 0.265, 0.38], 30: [0, 0.58, 0.25, 0.42], 9: [0, 0.50, 0.30, 0.50]}
clipopts = {f'c{n}': {'cam': c} for n, c in CAM.items()}
for n in (10, 13, 24, 2, 21): clipopts[f'c{n}'] = {'crop': [0, 0, 1, 0.87]}   # crop off the clip makers' burned-in subtitles
NAME = {19: 'KAI CENAT', 21: 'KAI CENAT', 24: 'KAI CENAT', 27: 'LIRIK', 28: 'MOISTCR1TIKAL', 35: 'XQC', 11: 'ISHOWSPEED', 12: 'ISHOWSPEED',
        10: 'ISHOWSPEED', 13: 'ISHOWSPEED', 9: 'ISHOWSPEED', 18: 'JYNXZI', 6: 'FANUM', 38: 'ASMONGOLD', 2: 'DDG', 30: 'OHNEPIXEL'}
def M(n, a, b, fx=(), sfx=(), audio=1.3, replay=None, **k):
    it = {'moment': [f'c{n}', a, b], 'label': NAME[n], 'tx': tx(n), 'audio': audio, 'fx': [list(x) for x in fx], 'sfx': [list(x) for x in sfx]}
    if replay: it['replay'] = replay
    it.update(k); return it
def S(n, a, b, **k): return dict(clip=f'c{n}', a=a, b=b, **k)
def I(head, sub='', bg=None, d=None):
    x = {'info': [head, sub], 'bg': bg}
    if d: x['d'] = d
    return x
def card(n, sw): return {'card': f'{G}cards/{n:02d}.mp4', 'card_sfx': [[sw, 0.0, 0.8], ['boom', 0.12, 0.5]]}

sections = [
  {'items': [   # cold open: the crash, then the hook
     M(19, 41.0, 43.5, fx=[['shake', 0.6], ['flash', 0.05]], sfx=[['glitch', 0.0, 0.7], ['error_004', 0.4, 0.6]]),
     M(27, 10.0, 14.2, fx=[['shake', 3.0], ['flash', 3.0]], sfx=[['lights_out', 2.9, 0.6]]),
     {'file': f'{G}cards/hook.mp4', 'sfx': [['boom', 0.0, 0.8], ['glitch', 0.1, 0.5]]},
     {'line': 0, 'shots': [S(27, 14, 20), S(19, 20, 30)], 'stamp': {'text': 'AUGUST 27 · LIVE ON NETFLIX', 'at': 0.2, 'dur': 2.6, 'sfx': 'camera_shutter'}},
     {'line': 1, 'shots': [S(28, 0, 5), S(21, 0, 8), S(19, 30, 40), S(24, 0, 6)],
      'stamp': [{'text': '1.8 MILLION WATCHING', 'at': 0.3, 'dur': 2.6, 'sfx': 'ting'}], 'sfx': [['dun_dun_duun', 'end', 0.5]]},
  ]},
  {**card(1, 'whoosh_transition'), 'items': [
     {'line': 2, 'shots': [S(27, 0, 1.4)], 'sfx': [['suspense_5', 0.0, 0.25]]},
     M(27, 1.5, 14.2, fx=[['shake', 4.6], ['flash', 9.6], ['shake', 9.6], ['red', 9.6]], sfx=[['error_002', 9.5, 0.7], ['nani', 10.6, 0.6]]),
     {'line': 3, 'shots': [S(27, 14.2, 20.0)], 'stamp': {'text': 'ERROR NSEZ-503', 'at': 0.2, 'dur': 2.6, 'sfx': 'buzzer_wrong'}, 'sfx': [['ba_dum_tss', 'end', 0.5]]},
     {'line': 4, 'shots': [S(28, 0, 5)]},
     M(28, 5.2, 9.2, fx=[['shake', 1.3]], sfx=[['door_bell', 0.3, 0.5]]),
     {'line': 5, 'shots': [S(21, 0, 3.4)]},
     M(21, 3.4, 10.8, fx=[['flash', 0.05], ['shake', 5.0]], sfx=[['celebration', 0.4, 0.3]]),
     {'line': 6, 'shots': [S(19, 16, 40)], 'stamp': {'text': '17,000+ OUTAGE REPORTS', 'at': 0.8, 'dur': 2.8, 'sfx': 'error_006'}, 'sfx': [['glitch', 'end', 0.6]]},
     M(19, 13.8, 16.0, fx=[['shake', 0.4]], sfx=[['record_scratch', 0.0, 0.6]]),
     M(19, 40.9, 43.5, fx=[['shake', 0.6], ['red', 0.6]], replay=[41.2, 42.6], sfx=[['bruh', 2.4, 0.7]]),
  ]},
  {**card(2, 'fast_swish_transition'), 'items': [
     {'line': 7, 'shots': [S(35, 3, 12)]},
     M(35, 0.0, 2.4, sfx=[['wow_choir', 0.6, 0.45]]),
     {'line': 8, 'shots': [S(11, 0, 5)]},
     M(11, 5.0, 15.5, fx=[['flash', 0.05], ['shake', 6.3], ['shake', 12.6]], sfx=[['air_r_horn', 7.6, 0.35]]),
     {'line': 9, 'shots': [S(12, 7, 20)], 'sfx': [['suspense_5', 0.0, 0.25]]},
     M(12, 2.6, 6.4, fx=[['shake', 1.0]], sfx=[['what', 3.5, 0.5]]),
     M(12, 22.5, 24.6, fx=[['flash', 0.05], ['shake', 1.3]], sfx=[['nani', 1.9, 0.6]]),
     {'line': 10, 'shots': [S(11, 16, 35)], 'stamp': {'text': 'GTA V: 2013 → GTA 6: 2026', 'at': 0.2, 'dur': 2.8, 'sfx': 'ting'}},
     M(11, 50.0, 56.7, fx=[['shake', 3.0], ['flash', 3.0]], sfx=[['airhorn', 3.0, 0.45]]),
  ]},
  {**card(3, 'swipe_swoosh_transition'), 'items': [
     {'line': 11, 'shots': [S(18, 0, 4.6)]},
     M(18, 4.6, 12.4, fx=[['shake', 5.1]], sfx=[['ba_dum_tss', 7.6, 0.5]]),
     {'line': 12, 'shots': [S(6, 15, 22.3)]},
     M(6, 13.6, 15.0, sfx=[]),
     M(6, 22.4, 29.2, fx=[['shake', 1.8], ['shake', 4.4]], sfx=[['audience_laughing', 3.0, 0.3]]),
     {'line': 13, 'shots': [S(10, 22, 28), S(13, 2, 10)]},
     M(10, 1.5, 10.9, fx=[['shake', 3.3], ['flash', 3.3]], sfx=[['record_scratch', 3.2, 0.5]]),
     M(13, 26.6, 33.7, fx=[['shake', 3.0]], sfx=[['bruh', 6.9, 0.6]]),
  ]},
  {**card(4, 'whoosh_transition'), 'items': [
     {'line': 14, 'shots': [S(38, 22, 30)]},
     M(38, 1.2, 9.7, fx=[['flash', 0.05], ['shake', 7.4]]),
     {'line': 15, 'shots': [S(38, 30, 36)], 'sfx': [['crickets', 'end', 0.5]]},
     M(38, 16.8, 22.3, fx=[['shake', 4.6]], sfx=[['record_scratch', 4.6, 0.6]]),
     {'line': 16, 'shots': [I('ROCKSTAR NORTH', 'EDINBURGH, SCOTLAND', ['c38', 36])], 'sfx': [['ding_correct', 2.6, 0.5]]},
     {'line': 17, 'shots': [S(2, 14, 30)]},
     M(2, 2.0, 13.0, fx=[['flash', 0.05], ['shake', 2.0], ['shake', 9.5]], sfx=[['tick_tock', 1.5, 0.4]]),
     {'line': 18, 'shots': [S(30, 8, 17)]},
     M(30, 18.0, 23.2, fx=[['shake', 3.5], ['flash', 3.5]], sfx=[['wow_1', 4.0, 0.5]]),
  ]},
  {**card(5, 'fast_swish_transition'), 'items': [
     {'line': 19, 'shots': [I('PRE-ORDERS · JUNE 25', '', ['c24', 3], d=3.0), I('$79.99 STANDARD', '$99.99 ULTIMATE', ['c24', 8])],
      'sfx': [['cash_register', 4.5, 0.6], ['cha_ching', 8.0, 0.5]]},
     {'line': 20, 'shots': [I('4.5 MILLION', 'PRE-ORDERS BEFORE LAUNCH', ['c24', 20])], 'sfx': [['bass_drop', 0.3, 0.5]]},
     {'line': 21, 'shots': [S(24, 3.3, 6.6)], 'sfx': [['drumroll_crash', 0.0, 0.4]]},
     M(24, 0.0, 3.3, fx=[['flash', 0.05]]),
     M(24, 6.6, 19.9, fx=[['shake', 6.6], ['flash', 8.5], ['shake', 11.2]], sfx=[['dun_dun_dunnn', 11.8, 0.6]]),
     M(24, 27.7, 29.2, fx=[['shake', 0.3], ['flash', 0.3], ['red', 0.3]], replay=[27.9, 29.0], sfx=[['boom', 0.3, 0.7], ['airhorn', 0.4, 0.4]]),
     {'line': 22, 'shots': [S(24, 30, 32)], 'sfx': [['sad_trombone', 'end', 0.45]]},
     {'line': 23, 'shots': [S(11, 36, 48), S(21, 11, 22), I('NOVEMBER 19', 'SUBSCRIBE FOR EVERY LAUNCH REACTION', ['c35', 13])], 'hold': 1.5,
      'stamp': {'text': 'GTA 6 · NOVEMBER 19', 'at': 0.3, 'dur': 3.0, 'sfx': 'ting'}},
  ]},
]
plan = {'lines': [G + 'narr/lines.json'], 'clips': clips, 'clipopts': clipopts, 'info_tint': 'vice',
        'music': {'style': 'phonk', 'bpm': 132, 'seed': 6, 'full_lufs': -23, 'duck_db': 13}, 'sections': sections}
json.dump(plan, open(G + 'plan.json', 'w'), indent=1, ensure_ascii=False)
print('plan.json:', sum(1 for s in sections for it in s['items'] if 'moment' in it), 'moments,', sum(1 for s in sections for it in s['items'] if 'line' in it), 'lines')
