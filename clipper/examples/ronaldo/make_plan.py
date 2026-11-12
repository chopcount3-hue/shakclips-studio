# builds plan.json for clipper/longform.py: "Every Time Cristiano Ronaldo Snapped (And What Happened Next)"
import json
C = '/home/claude/untrusted/ronaldo_clips/'
R = '/home/claude/ronaldo/'
clips = {
    'comp': C + '01_cordoba__x327ytq.mp4', 'malaga': C + '01_cordoba__xbzb1i.mp4', 'lake': C + '02_mic_lake__x4htxoa.mp4',
    'val': C + '03_valencia__x6tvfmr.mp4', 'bel': C + '04_belgium_armband__x82akz8.mp4', 'bel2': C + '04_serbia__x82akha.mp4',
    'evnews': C + '05_everton__x89vd25.mp4', 'evraw': C + '05_everton__x89w8m8.mp4', 'ev': C + '05_everton__x8frnxn.mp4',
    'press': C + '06_tottenham__x8erzpl.mp4', 'chants': C + '07_messi_chants__x9xr9pg.mp4', 'hilal': C + '08_alhilal__x8k81xq.mp4',
    'dub': C + '09_ireland__x9tuwpk.mp4', 'train': C + '11_training2026__xaiphhy.mp4', 'hamp': C + '12_hampden2024__x97gmig.mp4',
    'storm': C + '13_stormsoff2023__x8izdim.mp4'}
clipopts = {   # crop away burned-in captions, tickers and channel logos; vertical clips on a blurred fill
    'comp': {'crop': [0.03, 0.03, 0.94, 0.80]}, 'malaga': {'crop': [0.0, 0.05, 1.0, 0.82]}, 'lake': {'crop': [0.0, 0.0, 1.0, 0.76]},
    'bel': {'crop': [0.11, 0.0, 0.72, 0.85]}, 'bel2': {'crop': [0.11, 0.0, 0.72, 0.85]}, 'evnews': {'crop': [0.0, 0.08, 0.86, 0.64]},
    'ev': {'crop': [0.0, 0.0, 1.0, 0.70]}, 'chants': {'crop': [0.0, 0.0, 1.0, 0.62], 'fit': True},
    'train': {'crop': [0.0, 0.0, 1.0, 0.43], 'fit': True}}
def S(c, a, b, **k): return dict(clip=c, a=a, b=b, **k)
def I(head, sub='', bg=None, d=None):
    x = {'info': [head, sub], 'bg': bg}
    if d: x['d'] = d
    return x
WHOOSH = ['whoosh_transition', 'fast_swish_transition', 'swipe_swoosh_transition']
def card(n): return {'card': f'{R}cards/{n:02d}.mp4', 'card_sfx': [[WHOOSH[n % 3], 0.0, 0.8], ['boom', 0.12, 0.55]]}
RED = [['whistle', 0.0, 0.7]]

sections = [
  # ---------- cold open: the worst moments, no narration, then the hook ----------
  {'items': [
     {'moment': ['val', 37.6, 40.2], 'fx': [['flash', 1.2], ['shake', 1.2]], 'sfx': [['whistle', 1.1, 0.8], ['bass_drop', 1.2, 0.6]], 'audio': 0.8},
     {'moment': ['lake', 9.4, 12.2], 'fx': [['flash', 0.05]], 'sfx': [['fast_swish_transition', 0.0, 0.7], ['throw_away', 1.2, 0.9]], 'audio': 0.0},
     {'moment': ['evraw', 0.4, 3.0], 'fx': [['flash', 0.05], ['shake', 1.0]], 'sfx': [['swipe_swoosh_transition', 0.0, 0.7], ['slap_2', 1.0, 0.8]], 'audio': 0.0},
     {'moment': ['dub', 361.0, 363.8], 'fx': [['flash', 0.05], ['red', 1.0]], 'sfx': [['whoosh_transition', 0.0, 0.7], ['whistle', 0.9, 0.7]], 'audio': 0.8},
     {'moment': ['val', 45.0, 48.6], 'tint': 'bw', 'fx': [['flash', 0.05]], 'sfx': [['dun_dun_dunnn', 0.3, 0.8]], 'audio': 0.0},
     {'file': f'{R}cards/hook.mp4', 'sfx': [['boom', 0.0, 0.8]]},
     {'line': 0, 'shots': [S('comp', 242, 336, d=2.2), S('ev', 0.5, 4.3, d=2.2), S('lake', 9, 13, d=2.0), S('bel', 29, 39)],
      'stamp': {'text': '14 RED CARDS', 'at': 0.05, 'dur': 2.0, 'sfx': 'camera_shutter'}},
     {'line': 1, 'shots': [S('malaga', 64, 69), S('val', 43, 52)]},
     {'line': 2, 'shots': [S('comp', 344, 420), S('hamp', 14, 26)]},
     {'line': 'x0', 'hold': 1.0, 'shots': [S('train', 2, 20, tint='bw')], 'sfx': [['dun_dun_duun', 'end', 0.7]]},
  ]},
  # ---------- #1 the early fire ----------
  {**card(1), 'pool': [['comp', 242, 336], ['comp', 344, 484]], 'items': [
     {'line': 3, 'shots': [S('comp', 242, 336), S('comp', 344, 484)], 'stamp': {'text': '14 CAREER RED CARDS', 'at': 1.2, 'dur': 2.8, 'sfx': 'camera_shutter'}},
     {'line': 'x1', 'shots': [S('malaga', 5, 13), S('malaga', 25, 37)], 'stamp': {'text': 'MÁLAGA · JANUARY 2010', 'at': 0.1, 'dur': 2.4}},
     {'line': 'x2', 'shots': [S('malaga', 43, 47.5)], 'sfx': [['suspense_5', 0.0, 0.25]]},
     {'moment': ['malaga', 44.0, 51.0], 'fx': [['flash', 2.7], ['shake', 2.7]], 'label': 'MÁLAGA · 2010', 'replay': [59.0, 63.0],
      'sfx': [['punch', 2.7, 0.8]], 'replay_sfx': [['bone_crack', 3.4, 0.7]]},
     {'moment': ['malaga', 64.0, 69.0], 'label': 'MÁLAGA · 2010', 'audio': 0.9, 'fx': [['flash', 0.03], ['red', 3.0]], 'sfx': [['whistle', 2.9, 0.6]]},
     {'line': 'x3', 'shots': [S('malaga', 99, 110), S('malaga', 14.5, 21), S('malaga', 64, 69)],
      'stamp': [{'text': 'BROKEN NOSE', 'at': 0.2, 'dur': 2.0, 'sfx': 'bone_crack', 'gain': 0.5},
                {'text': '2-MATCH BAN', 'at': 5.2, 'dur': 2.6, 'sfx': 'camera_shutter'}]},
     {'line': 'x4', 'hold': 1.0, 'shots': [S('comp', 344, 380, tint='bw')], 'sfx': [['dun_dun_dunnn', 'end', 0.6]]},
     {'line': 4, 'shots': [I('CÓRDOBA 1–1 REAL MADRID', 'JANUARY 2015 · 7 MINUTES LEFT', ['comp', 340])]},
     {'line': 5, 'shots': [I('A SLAP. A KICK.', 'STRAIGHT RED', ['comp', 400])], 'sfx': [['slap_2', 1.6, 0.6], ['whistle', 'end', 0.6]]},
     {'line': 6, 'shots': [S('comp', 420, 484, label='ARCHIVE')]},
     {'line': 7, 'shots': [I('2-MATCH BAN|+ AN APOLOGY', 'REAL MADRID STILL WON 2–1', ['comp', 450])]},
     {'line': 'x5', 'hold': 1.0, 'shots': [S('lake', 0, 8, tint='bw')], 'sfx': [['whoosh_transition', 'end', 0.6]]},
  ]},
  # ---------- #2 the lake ----------
  {**card(2), 'pool': [['lake', 30, 60], ['lake', 0, 9]], 'items': [
     {'line': 8, 'shots': [S('lake', 30, 47), S('lake', 47, 60)], 'stamp': {'text': 'EURO 2016 · 2 GAMES · 0 GOALS', 'at': 2.0, 'dur': 3.0, 'sfx': 'camera_shutter'}},
     {'line': 'x6', 'shots': [S('lake', 40, 52)], 'sfx': [['heartbeat', 0.0, 0.35]]},
     {'line': 9, 'shots': [S('lake', 0, 7)]},
     {'line': 10, 'shots': [S('lake', 6.5, 9.4)], 'sfx': [['suspense_5', 0.0, 0.25]]},
     {'moment': ['lake', 8.6, 13.0], 'fx': [['flash', 1.5], ['shake', 1.5]], 'label': 'LYON · JUNE 2016', 'replay': [9.6, 12.4], 'audio': 0.0,
      'sfx': [['throw_away', 1.2, 0.9], ['water_spray', 2.4, 0.6], ['nani', 3.4, 0.7]], 'replay_sfx': [['water_drop', 4.0, 0.7]]},
     {'line': 11, 'shots': [S('lake', 14, 29)]},
     {'line': 'x7', 'shots': [S('lake', 33, 45)], 'stamp': {'text': 'HUNGARY 3–3 PORTUGAL · RONALDO ×2', 'at': 0.6, 'dur': 2.8, 'sfx': 'ting'}},
     {'line': 12, 'shots': [S('lake', 47, 60)], 'stamp': {'text': 'NO PUNISHMENT · EURO 2016 CHAMPIONS', 'at': 1.2, 'dur': 3.4, 'sfx': 'cheering_kids', 'gain': 0.35}},
     {'line': 'x8', 'hold': 1.0, 'shots': [S('val', 43, 51, tint='bw')], 'sfx': [['whoosh_transition', 'end', 0.6]]},
  ]},
  # ---------- #3 tears in Valencia ----------
  {**card(3), 'pool': [['val', 60, 90], ['val', 0, 12]], 'items': [
     {'line': 13, 'shots': [S('val', 62, 90)]},
     {'line': 14, 'shots': [S('val', 0, 12)], 'stamp': {'text': 'VS JEISON MURILLO', 'at': 1.4, 'dur': 2.4}},
     {'line': 15, 'shots': [S('val', 12, 36)], 'sfx': [['suspense_5', 0.0, 0.3]]},
     {'moment': ['val', 34.6, 41.8], 'fx': [['flash', 4.2], ['shake', 4.2], ['red', 4.2]], 'label': 'VALENCIA · SEPT 2018', 'replay': [37.8, 40.4],
      'sfx': [['whistle', 4.1, 0.8], ['oh_no', 5.4, 0.7]], 'audio': 0.9},
     {'line': 'x9', 'shots': [S('val', 41.5, 47)], 'stamp': {'text': '1ST CHAMPIONS LEAGUE RED · GAME 154', 'at': 0.3, 'dur': 3.4, 'sfx': 'camera_shutter'}},
     {'line': 16, 'shots': [S('val', 45, 52)]},
     {'moment': ['val', 46.0, 53.0], 'label': 'VALENCIA · SEPT 2018', 'audio': 0.9, 'fx': [['flash', 0.03], ['shake', 4.0]]},
     {'line': 17, 'shots': [S('val', 52, 60), S('val', 90, 103)], 'stamp': {'text': '1-MATCH BAN · JUVENTUS WON 2–0', 'at': 0.6, 'dur': 3.0, 'sfx': 'camera_shutter'}},
     {'line': 'x10', 'hold': 1.0, 'shots': [I('A GOAL THAT|DOESN’T COUNT', '', ['bel', 30])], 'sfx': [['dun_dun_duun', 'end', 0.6]]},
  ]},
  # ---------- #4 the armband ----------
  {**card(4), 'pool': [['bel', 0, 60], ['bel2', 60, 119]], 'items': [
     {'line': 18, 'shots': [I('SERBIA 2–2 PORTUGAL', 'BELGRADE · MARCH 2021 · STOPPAGE TIME', ['bel', 30])], 'sfx': [['ticking_clock', 0.0, 0.35]]},
     {'line': 19, 'shots': [I('NO VAR.|NO GOAL-LINE TECH.', 'THE REFEREE: NO GOAL', ['bel', 70])], 'sfx': [['wrong', 2.6, 0.6], ['what', 'end', 0.7]]},
     {'line': 20, 'shots': [I('ARMBAND THROWN.|WALKED OFF.', 'YELLOW CARD FOR PROTESTS', ['bel', 34]), S('bel', 108, 115)],
      'sfx': [['throw_away', 1.8, 0.6]]},
     {'line': 21, 'shots': [I('“AN ENTIRE NATION|IS BEING HARMED”', 'RONALDO, THAT NIGHT', ['bel', 110])], 'sfx': [['type_writer', 0.3, 0.3]]},
     {'line': 22, 'shots': [I('AUCTIONED FOR CHARITY', 'SURGERY FOR A 6-MONTH-OLD BOY', ['bel', 50]), S('bel', 44, 58)], 'sfx': [['cash_register', 1.0, 0.5]]},
     {'line': 23, 'shots': [S('bel', 0, 30, label='EURO 2020 · BELGIUM 1–0 PORTUGAL'), S('bel', 29, 40, label='EURO 2020 · BELGIUM 1–0 PORTUGAL')]},
     {'line': 'x11', 'hold': 1.0, 'shots': [S('ev', 5.8, 13, tint='bw')], 'stamp': {'text': 'HALFWAY · PICK YOUR WORST SO FAR', 'at': 0.1, 'dur': 2.8, 'sfx': 'ting'},
      'sfx': [['dun_dun_dunnn', 'end', 0.7]]},
  ]},
  # ---------- #5 the phone ----------
  {**card(5), 'pool': [['ev', 5.8, 13], ['evnews', 23, 66]], 'items': [
     {'line': 24, 'shots': [S('evnews', 9, 18), S('ev', 5.8, 13)], 'stamp': {'text': 'EVERTON 1–0 MAN UTD · APRIL 2022', 'at': 0.2, 'dur': 2.8}},
     {'line': 25, 'shots': [S('ev', 0.3, 4.3)], 'sfx': [['suspense_5', 0.0, 0.3]]},
     {'moment': ['evraw', 0.0, 5.2], 'fx': [['shake', 1.0], ['flash', 1.0]], 'label': 'GOODISON PARK · 2022', 'replay': [0.4, 2.8], 'audio': 0.0,
      'sfx': [['slap_2', 1.0, 0.7], ['bruh', 2.2, 0.7]]},
     {'line': 'x12', 'shots': [S('evnews', 23, 45)]},
     {'line': 26, 'shots': [S('evnews', 79, 92)], 'sfx': [['lphone_ding', 0.6, 0.5]]},
     {'line': 27, 'shots': [S('ev', 24, 34), S('evnews', 70, 78), S('ev', 5.8, 13)],
      'stamp': [{'text': 'POLICE CAUTION', 'at': 0.0, 'dur': 1.9, 'sfx': 'camera_shutter'},
                {'text': '2-MATCH BAN + £50,000 FINE', 'at': 6.2, 'dur': 3.8, 'sfx': 'cash_register'}]},
     {'line': 'x13', 'hold': 1.0, 'shots': [S('press', 0, 20, tint='bw')], 'sfx': [['whoosh_transition', 'end', 0.6]]},
  ]},
  # ---------- #6 the walk-off ----------
  {**card(6), 'pool': [['press', 20, 180]], 'items': [
     {'line': 28, 'shots': [I('MAN UTD 2–0 TOTTENHAM', 'OLD TRAFFORD · OCTOBER 2022', ['press', 5]), S('press', 20, 60)]},
     {'line': 29, 'shots': [S('press', 60, 100)], 'stamp': {'text': 'REFUSED TO COME ON', 'at': 1.0, 'dur': 2.4, 'sfx': 'camera_shutter'},
      'sfx': [['what', 'end', 0.6]]},
     {'line': 'x14', 'shots': [I('“I FEEL BETRAYED”', 'RONALDO TO PIERS MORGAN · NOV 2022', ['press', 120]), S('press', 120, 160)],
      'sfx': [['type_writer', 0.3, 0.3]]},
     {'line': 30, 'shots': [S('press', 100, 120), I('GONE FROM UNITED', 'NOVEMBER 2022', ['press', 160])], 'sfx': [['door_bell', 'end', 0.0]]},
  ]},
  # ---------- #7 Saudi fire ----------
  {**card(7), 'pool': [['storm', 0, 13], ['chants', 0, 15]], 'items': [
     {'line': 31, 'shots': [S('chants', 0, 6), S('storm', 8, 13)]},
     {'line': 32, 'shots': [S('storm', 0, 7)], 'stamp': {'text': 'AL ITTIHAD 1–0 AL NASSR', 'at': 0.6, 'dur': 2.6}},
     {'moment': ['storm', 0.0, 7.0], 'label': 'AL NASSR · 2023', 'audio': 0.8, 'fx': [['flash', 0.03]], 'sfx': [['bamboo_hit', 3.0, 0.5]]},
     {'line': 33, 'shots': [S('chants', 0, 7)], 'sfx': [['what', 'end', 0.6]]},
     {'moment': ['chants', 7.5, 11.0], 'fit': True, 'crop': [0.0, 0.0, 1.0, 0.62], 'label': 'AL HILAL FANS: “MESSI! MESSI!”', 'audio': 0.0, 'fx': [['flash', 0.03]]},
     {'line': 34, 'shots': [S('chants', 0, 7, tint='bw'), I('OBSCENE GESTURE', '1-MATCH BAN + A FINE · FEB 2024', ['chants', 4])],
      'sfx': [['censored', 2.6, 0.5]]},
     {'line': 35, 'shots': [S('hilal', 0, 8, label='AL HILAL · 2023', d=4.0), I('SUPER CUP SEMI-FINAL', 'APRIL 2024 · ELBOW ON AL-BULAIHI', ['hilal', 12]),
                            I('STRAIGHT RED', 'ANOTHER 2-MATCH BAN', ['hilal', 13])], 'sfx': [['whistle', 'end', 0.6]]},
     {'moment': ['hilal', 1.0, 8.0], 'label': 'AL HILAL · 2023', 'audio': 0.0, 'fx': [['flash', 6.0], ['shake', 6.0]], 'replay': [5.4, 7.8],
      'sfx': [['punch', 6.0, 0.7]]},
     {'line': 'x15', 'hold': 1.0, 'shots': [S('hamp', 0, 10, tint='bw')], 'sfx': [['whoosh_transition', 'end', 0.6]]},
  ]},
  # ---------- #8 Hampden ----------
  {**card(8), 'pool': [['hamp', 0, 33]], 'items': [
     {'line': 36, 'shots': [S('hamp', 0, 12)], 'stamp': {'text': 'SCOTLAND 0–0 PORTUGAL', 'at': 0.8, 'dur': 2.4}},
     {'line': 37, 'shots': [S('hamp', 9, 14)], 'sfx': [['whistle', 'end', 0.7]]},
     {'line': 38, 'shots': [S('hamp', 13, 22)]},
     {'moment': ['hamp', 14.0, 24.0], 'label': 'HAMPDEN · OCTOBER 2024', 'audio': 0.9, 'fx': [['flash', 0.03], ['shake', 4.5], ['red', 7.5]], 'sfx': []},
     {'line': 'x16', 'shots': [S('hamp', 22, 33)]},
     {'line': 39, 'shots': [I('“SEGUIMOS JUNTOS”', 'WE CONTINUE TOGETHER', ['hamp', 20])], 'sfx': [['crickets', 'end', 0.5]]},
     {'line': 'x17', 'hold': 1.0, 'shots': [S('dub', 341, 358, tint='bw')], 'sfx': [['dun_dun_duun', 'end', 0.6]]},
  ]},
  # ---------- #9 Dublin ----------
  {**card(9), 'pool': [['dub', 0, 60], ['dub', 300, 340]], 'items': [
     {'line': 40, 'shots': [S('dub', 2, 40), S('dub', 318, 340)], 'stamp': {'text': 'IRELAND 2–0 PORTUGAL', 'at': 2.0, 'dur': 2.6}},
     {'line': 41, 'shots': [S('dub', 341, 360)], 'stamp': {'text': '1ST RED IN 226 PORTUGAL GAMES', 'at': 3.4, 'dur': 3.0, 'sfx': 'camera_shutter'},
      'sfx': [['whistle', 2.6, 0.7]]},
     {'moment': ['dub', 358.0, 368.0], 'label': 'DUBLIN · NOVEMBER 2025', 'audio': 0.9, 'fx': [['flash', 0.03], ['red', 3.5], ['shake', 6.5]], 'sfx': [['oh_no', 3.6, 0.6]]},
     {'line': 42, 'shots': [S('dub', 380, 401)]},
     {'line': 43, 'shots': [I('BAN SUSPENDED', 'FIFA · ONE YEAR OF PROBATION', ['dub', 395]), S('dub', 455, 480)], 'sfx': [['unlocked', 2.0, 0.5]]},
     {'line': 'x18', 'hold': 1.0, 'shots': [S('train', 2, 20, tint='bw')], 'sfx': [['dun_dun_dunnn', 'end', 0.7]]},
  ]},
  # ---------- #10 the last chapter ----------
  {**card(10), 'pool': [['train', 0, 30]], 'items': [
     {'line': 44, 'shots': [I('SPAIN 1–0 PORTUGAL', 'WORLD CUP 2026 · ROUND OF 16', ['train', 10]), S('train', 0, 12)]},
     {'line': 45, 'shots': [S('train', 12, 22)], 'stamp': {'text': '“A CLEAR CONSCIENCE”', 'at': 1.0, 'dur': 2.8}},
     {'line': 46, 'shots': [I('NOT STARTING|VS DENMARK', 'JORGE JESUS · SEPTEMBER 2026', ['train', 22])], 'sfx': [['what', 'end', 0.5]]},
     {'line': 47, 'shots': [I('HE LEFT THE CAMP', 'THE DAY BEFORE THE GAME', ['train', 25]), S('train', 22, 30, tint='bw')],
      'sfx': [['dun_dun_dunnn', 1.4, 0.7]]},
     {'line': 48, 'shots': [S('val', 38, 40, d=1.3), S('lake', 10, 12, d=1.3), S('ev', 0.5, 2.5, d=1.3), S('bel', 30, 32, d=1.3),
                            S('hamp', 18, 20, d=1.3), S('dub', 362, 364, d=1.3), S('malaga', 46, 48)],
      'sfx': [['whoosh_transition', 1.3, 0.4], ['whoosh_transition', 3.9, 0.4], ['whoosh_transition', 6.5, 0.4]]},
     {'line': 49, 'shots': [S('comp', 290, 300), S('val', 30, 34)]},
     {'line': 50, 'shots': [I('WHICH WAS THE WORST?', 'COMMENT A NUMBER · 1 TO 10', ['val', 46])], 'hold': 4.0, 'sfx': [['ting', 0.2, 0.5]]},
  ]},
]
# a line object with no audio key would break; replace the unknown door_bell placeholder
for sec in sections:
    for it in sec['items']:
        it['sfx'] = [s for s in it.get('sfx', []) if not (s[0] == 'door_bell')]
plan = {'lines': [R + 'narr/lines.json', R + 'narr/extra_lines.json'], 'clips': clips, 'clipopts': clipopts,
        'music': {'style': 'trap', 'bpm': 84, 'seed': 11, 'full_lufs': -22, 'duck_db': 14}, 'sections': sections}
json.dump(plan, open(R + 'plan.json', 'w'), indent=1, ensure_ascii=False)
n = sum(1 for s in sections for it in s['items'] if 'line' in it)
print('plan.json:', len(sections), 'sections,', n, 'narration items')
