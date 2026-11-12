# plan.json for clipper/longform.py: "13 GTA 6 Gameplay Myths, Busted Before Launch"
import json
G = '/home/claude/gta6vid/'; M = '/home/claude/gta6myths/'; GIF = G + 'gifs/'
idx = {int(l.split()[0]): l.split()[1] for l in open(G + 'sheets/index.txt')}
clips = {f'c{n}': '/home/claude/untrusted/gta6_clips/' + f for n, f in idx.items()}
def tx(n): return G + 'tx/' + idx[n][:-4] + '.json'
# crop each stream down to the game picture (drop webcams, chat and alerts at the edges)
GAME = {0: [0.0, 0.12, 0.84, 0.84], 1: [0.0, 0.0, 0.70, 0.70], 8: [0.0, 0.0, 0.78, 0.78], 16: [0.0, 0.12, 0.82, 0.82],
        20: [0.10, 0.04, 0.68, 0.68], 22: [0.10, 0.04, 0.68, 0.68], 23: [0.10, 0.04, 0.68, 0.68], 26: [0.10, 0.04, 0.68, 0.68],
        29: [0.12, 0.12, 0.84, 0.84], 31: [0.25, 0.12, 0.72, 0.72], 33: [0.15, 0.12, 0.82, 0.82], 34: [0.22, 0.0, 0.76, 0.76],
        36: [0.22, 0.0, 0.76, 0.76], 39: [0.27, 0.0, 0.72, 0.72]}
clipopts = {f'c{n}': {'crop': c} for n, c in GAME.items()}
clipopts['c19'] = {'cam': [0, 0.64, 0.24, 0.36]}
NAME = {0: 'ANGRYGINGE', 14: 'JASONTHEWEEN', 16: 'JOE BARTOLOZZI', 19: 'KAI CENAT'}
def S(n, a, b, **k): return dict(clip=f'c{n}', a=a, b=b, **k)
def I(head, sub='', bg=None, d=None):
    x = {'info': [head, sub], 'bg': bg}
    if d: x['d'] = d
    return x
def R(n, a, b, crop=None, **k):   # a streamer's own reaction, with its audio and captions
    it = {'moment': [f'c{n}', a, b], 'label': NAME[n], 'tx': tx(n), 'audio': 1.3}
    if crop: it['crop'] = crop
    it.update(k); return it
def gif(name, at='end', dur=2.2, pos='br', size=300, **k): return dict(gif=GIF + name + '.gif', at=at, dur=dur, pos=pos, size=size, **k)
def emo(ch, at, dur=1.4, pos='tr', size=200): return dict(emoji=ch, at=at, dur=dur, pos=pos, size=size)
VERDICT = {'FALSE': ('red', 'buzzer_wrong', 'bruh'), 'TRUE': ('green', 'ding_correct', 'celebration'), 'HALF TRUE': ('yellow', 'ding_correct', 'wrong'),
           'UNCONFIRMED': ('yellow', 'dun_dun_duun', 'crickets'), 'DISPUTED': ('purple', 'drumroll_crash', 'what'), 'PROBABLY FALSE': ('red', 'buzzer_wrong', 'sad_trombone')}

NW = {str(x['i']): x for x in json.load(open(M + 'narr38/lines.json'))}
def at(key, word, k=0):
    """seconds from the line start to the k-th spoken word that starts with `word`"""
    hits = [w['s'] for w in NW[key]['words'] if w['w'].lower().strip('.,!?…').startswith(word.lower())]
    return round(hits[min(k, len(hits) - 1)], 2) if hits else 0.0
WSFX = {   # extra comedy beats, on the exact word
  'a0': [('true', 'wrong', 0.45)],
  'm1b': [('nope', 'denied', 0.6), ('leonida', 'sparkling', 0.35)],
  'm2b': [('seamless', 'magic_wand', 0.45), ('faster', 'cartoon_rocket', 0.45)],
  'm3b': [('professional', 'goofy_cartoon_stealth', 0.55)],
  'm4b': [('notice', 'shocked_1', 0.5), ('hides', 'sneaky', 0.5)],
  'm5b': [('half', 'uh', 0.6)],
  'm6b': [('insane', 'wow_2', 0.5), ('leak', 'suspicious', 0.5)],
  'm7b': [('torch', 'goofy_cartoon_impact', 0.5), ('gone', 'goofy_cartoon_dash_1', 0.55)],
  'm8b': [('depends', 'mystery', 0.45), ('week', 'clock_ticking', 0.4)],
  'm9b': [('true', 'correct', 0.55), ('proud', 'kids_cheering', 0.35)],
  'm10b': [('alligators', 'goofy_cartoon_bite', 0.55), ('stays', 'yeehaw', 0.5)],
  'm11b': [('nope', 'denied', 0.6), ('dimez', 'dj_scratch', 0.45)],
  'm12b': [('thirty', 'wah_wah_wah', 0.5), ('decided', 'clock_tick', 0.4)],
  'm13b': [("doesn't", 'oh_no', 0.6), ('seven', 'cartoon_deflate', 0.5)],
  'z0': [('fooled', 'funny_laugh_2', 0.45)],
}
def wsfx(key): return [[n, at(key, w), g] for w, n, g in WSFX.get(key, [])]
def P(outlet, date, headline, highlight, bg, accent='9146FF', d=3.4):
    return {'post': {'outlet': outlet, 'date': date, 'headline': headline, 'highlight': highlight, 'accent': accent}, 'bg': bg, 'd': d}
SVG = ('SVG', 'August 2026', 'Everything Rockstar Just Confirmed About GTA 6 Gameplay In The Extended Look')
GTI = ('GTA Intel', 'August 2026', 'GTA 6 Extended Look: Gameplay Details Recap')
GBI = ('GamingBible', 'February 2026', 'GTA 6 Rumours Doing The Rounds Right Now')
WH = ['whoosh_transition', 'fast_swish_transition', 'swipe_swoosh_transition']
def myth(n, claim, bg, shots, verdict, sticker, extra_sfx=(), extra_ov=(), after=()):
    col, s1, s2 = VERDICT[verdict]
    return [
        {'line': f'm{n}a', 'shots': [I(f'MYTH #{n}', claim, bg)], 'sfx': [[WH[n % 3], 0.0, 0.7], ['bloop', 0.25, 0.5]]},
        {'line': f'm{n}b', 'shots': shots, 'hold': 2.0,
         'stamp': {'text': verdict, 'at': 'end', 'dur': 2.1, 'color': col, 'sfx': s1, 'gain': 0.8},
         'sfx': [[s2, 'end', 0.55], *[list(x) for x in extra_sfx], *wsfx(f'm{n}b')],
         'overlays': [gif(sticker, at='end', dur=1.9, pos='br', size=320, shift=0.1), *extra_ov]},
        *after]

items = []
items += [
  {'line': 'a0', 'shots': [S(8, 0, 9), S(0, 22.2, 24)], 'stamp': {'text': 'GTA 6 · NOVEMBER 19', 'at': 0.2, 'dur': 2.4, 'color': 'purple', 'sfx': 'camera_shutter'},
   'overlays': [gif('troll1', at='end', dur=1.8, pos='br', size=300, shift=-1.2)], 'sfx': [['record_scratch', 'end', 0.5], *wsfx('a0')]},
  {'line': 'a1', 'shots': [S(36, 0, 12), S(22, 2, 12), S(14, 9, 20)], 'stamp': {'text': '13 MYTHS · BUSTED', 'at': 4.6, 'dur': 2.8, 'color': 'red', 'sfx': 'ting'},
   'sfx': [['dun_dun_dunnn', 'end', 0.55]]},
]
items += myth(1, 'THE MAP IS JUST VICE CITY', ['c8', 28], [P(*SVG, 'LEONIDA = 6 REGIONS', ['c8', 5]), S(0, 9, 12), S(31, 0, 2), S(16, 21, 26), I('6 REGIONS|ONE STATE', 'THE STATE OF LEONIDA', ['c16', 22])],
              'FALSE', 'aura', after=[R(0, 4.2, 12.4, crop=GAME[0], fx=[['shake', 5.6]], sfx=[['wow_1', 1.0, 0.4]])])
items += myth(2, "YOU CAN'T SWITCH JASON & LUCIA", ['c29', 3], [P(*SVG, 'SWITCHING: CONFIRMED', ['c29', 5]), S(29, 0, 12), S(34, 0, 9)], 'FALSE', 'anim3', extra_sfx=[['swipe_swoosh_transition', 3.0, 0.5]])
items += myth(3, 'STEALING A CAR = SMASH & GRAB', ['c14', 10], [P(*SVG, 'QUIET STEALS: CONFIRMED', ['c14', 14]), S(14, 0, 9), S(14, 9, 13), S(14, 13, 21)], 'FALSE', 'troll2',
              extra_sfx=[['glass_002', 1.2, 0.6], ['sneaky', 3.6, 0.5]], after=[R(14, 21.4, 24.7, fx=[['shake', 1.6]])])
items += myth(4, 'NPCS ONLY REACT WHEN YOU SHOOT', ['c39', 16], [P(*GTI, 'NPCS SEE YOUR GUN', ['c39', 8]), S(39, 3, 18), S(36, 0, 10)], 'FALSE', 'black_cat', extra_sfx=[['sneaky', 4.5, 0.5]],
              extra_ov=[emo('👀', 2.0, 1.4, 'tr')])
items += myth(5, 'YOU CAN ROB ANY STORE', ['c22', 8], [P(*SVG, 'STORES, GAS STATIONS, PHONE SHOPS', ['c22', 10]), S(22, 2, 27)], 'HALF TRUE', 'look_at_this', extra_sfx=[['cash_register', 1.5, 0.5]])
items += myth(6, 'EVERY BUILDING IS ENTERABLE (700+)', ['c23', 5], [P(*GBI, '700 = A LEAK, NOT ROCKSTAR', ['c23', 4]), S(23, 0, 15), S(0, 12, 20), I('“700+ ENTERABLE BUILDINGS”', 'WHERE THAT NUMBER CAME FROM: A LEAK', ['c33', 10])],
              'UNCONFIRMED', 'black_cat', extra_sfx=[['door_bell', 1.2, 0.4]])
items += myth(7, 'COPS DRIVE UNMARKED CARS', ['c36', 14], [P(*GBI, 'UNMARKED COPS: UNCONFIRMED', ['c36', 6]), S(36, 12, 22), S(20, 0, 8), S(26, 3, 15)], 'UNCONFIRMED', 'imoji_d',
              extra_sfx=[['zip_away', 'end', 0.45]], extra_ov=[emo('🔥', 7.0, 1.4, 'tl')])
items += myth(8, 'THE 6-STAR WANTED LEVEL IS BACK', ['c39', 24],
              [S(39, 21, 30), P('Dataconomy', 'August 2026', 'GTA 6 Extended Look Reveals Gameplay And Six-star Wanted System', 'SAYS: SIX STARS', ['c36', 5], 'E8343A'), P(*SVG, 'SAYS: FIVE STARS', ['c20', 5], 'E8343A')],
              'DISPUTED', 'imoji_b')
items += myth(9, 'YOUR CHARACTER CAN GET FAT', ['c0', 1], [P(*SVG, 'WEIGHT + MUSCLE: CONFIRMED', ['c16', 18]), S(16, 16, 21), S(0, 0, 3)], 'TRUE', 'cat_applause',
              extra_sfx=[['boing', 'end', 0.4]], extra_ov=[emo('💪', 4.0, 1.4, 'tr')],
              after=[R(0, 0.0, 3.2, crop=GAME[0], label='LUCIA AT THE GYM', sfx=[['ba_dum_tss', 2.6, 0.5]])])
items += myth(10, 'THERE ARE ALLIGATORS', ['c16', 23], [P(*GTI, 'GATORS IN GRASSRIVERS', ['c16', 24]), S(16, 21, 32), S(0, 6, 9), S(31, 4, 6)], 'TRUE', 'imoji_c',
              extra_sfx=[['ba_dum_tss', 'end', 0.45]], extra_ov=[emo('🐊', 2.0, 1.6, 'tr')],
              after=[R(16, 15.5, 17.2, crop=GAME[16], overlays=[emo('😂', 0.4, 1.2, 'tr')])])
items += myth(11, 'THE PHONE IS JUST A MENU', ['c1', 6], [P(*GTI, 'SOCIAL FEEDS IN YOUR PHONE', ['c1', 6]), S(1, 4, 12), S(0, 12, 16.5)], 'FALSE', 'this_is_it', extra_sfx=[['dj_scratch', 'end', 0.4]],
              extra_ov=[emo('📱', 1.0, 1.6, 'tr')])
items += myth(12, 'IT RUNS AT 60 FPS ON PS5', ['c34', 16],
              [P('Push Square', 'August 2026', 'GTA 6 Targeting 30fps on PS5, Undecided on Performance Mode', '30 FPS AT LAUNCH (REPORTED)', ['c34', 20], 'E8343A', d=3.8), S(34, 15, 30)], 'PROBABLY FALSE', 'cheems_cry',
              extra_ov=[emo('😭', 5.5, 1.4, 'tr')])
items += myth(13, 'GTA ONLINE ON DAY ONE', ['c8', 12],
              [P('All Things How', 'November 2026', 'GTA 6 Launches as a Single-Player Experience, No GTA Online at Release', 'ONLINE DATE: NOT ANNOUNCED', ['c8', 14], 'E8343A', d=3.8), S(8, 0, 12),
               I('GTA ONLINE: +2 WEEKS|RED DEAD ONLINE: +7 MONTHS', 'HOW LONG ROCKSTAR MADE US WAIT BEFORE', ['c8', 20])],
              'FALSE', 'anim2', extra_sfx=[['sad_trombone', 'end', 0.5]],
              after=[R(19, 41.0, 43.5, fx=[['shake', 0.6]], sfx=[['bruh', 2.3, 0.6]])])
items += [
  {'line': 'z0', 'shots': [S(8, 0, 9), S(36, 12, 22), I('NOVEMBER 19', 'SUBSCRIBE · WE TEST EVERY MYTH AT LAUNCH', ['c8', 28])], 'hold': 1.5,
   'stamp': {'text': 'WHICH ONE FOOLED YOU?', 'at': 0.2, 'dur': 3.0, 'color': 'purple', 'sfx': 'ting'},
   'overlays': [gif('mona_laugh', at=1.0, dur=2.0, pos='tr', size=260)], 'sfx': wsfx('z0')},
]
plan = {'lines': [M + 'narr38/lines.json'], 'clips': clips, 'clipopts': clipopts, 'info_tint': 'vice',
        'sfx_dirs': ['/home/claude/clipper/sfx/user', '/home/claude/clipper/sfx/made', '/home/claude/clipper/sfx/drive', '/home/claude/clipper/sfx/cc0'],
        'music': {'style': 'phonk', 'bpm': 128, 'seed': 9, 'full_lufs': -23, 'duck_db': 13}, 'sections': [{'items': items}]}
json.dump(plan, open(M + 'plan.json', 'w'), indent=1, ensure_ascii=False)
print('plan.json:', len(items), 'items')
