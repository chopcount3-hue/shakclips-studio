import json
J = '/home/claude/job5/'; G = '/home/claude/gta6vid/gifs/'
med = [w for s in json.load(open(J + 'src.medium.json'))['segments'] for w in s['words'] if not (167.0 <= w['s'] < 175.0)]
sml = [w for s in json.load(open(J + 'src.words.json'))['segments'] for w in s['words']]
words = list(med)
for w in sml:      # fill stretches the bigger model skipped (trailer voice-over, "yo that's lit")
    if not any(abs(m['s'] - w['s']) < 1.5 for m in med): words.append(w)
words.sort(key=lambda w: w['s'])
FIX = {  # (start, heard) -> replacement words
  (114.6, "can't"): ['KFC?!'], (115.5, 'see'): [], (125.9, 'Lucy'): ['Lucia,'], (135.1, 'he'): ['they'],
  (107.4, 'begin'): ['be', 'getting'], (208.9, 'NOT'): ['not'], (209.0, 'Nana.'): [], (181.8, 'life'): [], (182.0, 'show'): ['IShowSpeed'], (182.2, 'speed'): [],
  (144.7, 'did'): ['be'], (143.8, 'but'): ['about', 'to'], (102.5, "can't"): ['can'], (144.8, 'he'): [], (145.0, 'eat'): ['eating'], (68.4, 'Wait,'): ['Wait,'], (69.3, 'tell'): ['what'],
  (190.6, 'So'): ['So'], (191.4, 'played'): ['play'], (2.6, 'From'): ['From'],
}
out = []
for w in words:
    k = (round(w['s'], 1), w['w'])
    if k in FIX:
        rep = FIX[k]; n = len(rep)
        for j, r in enumerate(rep):
            d = (w['e'] - w['s']) / max(n, 1)
            out.append(dict(w, w=r, s=round(w['s'] + j * d, 2), e=round(w['s'] + (j + 1) * d, 2), p=1.0))
    else: out.append(w)
merged = []
for w in out:
    if merged and w['w'].startswith('.'): merged[-1]['w'] += w['w']; merged[-1]['e'] = w['e']
    else: merged.append(w)
out = merged
json.dump({'segments': [{'s': 0, 'e': 224, 't': '', 'words': out}]}, open('speed_tx.json', 'w'))

GREEN = ['LIT', 'GOD', 'KEANU', 'REEVES', 'PLAYSTATION', 'PLAYSTATION.', 'PS5', 'PS5.', 'BUFF', 'KFC?!', 'KFC', 'GAMEPLAY', 'QUALITY', 'LET\'S', 'GO!', 'GO', 'TRAILER', 'BEST', 'CHICKEN']
YELLOW = ['OH', 'MY', 'WAIT', 'WHAT', 'HUH', 'ME', 'YOU', 'EYES', 'NOVEMBER', '19TH', 'IShowSpeed'.upper(), 'JASON', 'LUCIA', 'TOM', 'CRUISE']
RED = ['XBOX', 'XBOX?', 'NO', 'NAH', 'NOT', 'CAN\'T']
cols = {**{k: 'green' for k in GREEN}, **{k: 'yellow' for k in YELLOW}, **{k: 'red' for k in RED}}
base = {
  'source': J + 'in/src.mp4', 'transcript': J + 'shorts/speed_tx.json', 'asr': '', 'min_word_prob': 0.45, 'min_narration': 0,
  'layout': 'split', 'top': [60, 296, 840, 746], 'bottom': [860, 330, 780, 694],
  'cap_mode': 'single', 'cap_size': 132, 'cap_colors': cols, 'hook_size': 80, 'note_size': 92,
  'sfx_dirs': ['/home/claude/clipper/sfx/drive', '/home/claude/clipper/sfx/made', '/home/claude/clipper/sfx/cc0'],
  'music': {'style': 'dream', 'bpm': 123, 'seed': 3, 'gain': 0.11},
  'cut_sfx': {'name': 'swipe_swoosh_transition', 'gain': 0.22, 'every': 3},
}
def note(t, text, color='yellow', sfx='pop', gain=0.5, dur=1.5, y=0.12, rot=-3): return dict(src_t=t, text=text, color=color, sfx=sfx, gain=gain, dur=dur, y=y, rot=rot)
BR, BL = [0.70, 0.56], [0.03, 0.56]
shorts = {
 'keanu': dict(title='Speed Thinks Keanu Reeves Is In GTA 6', hook='SPEED SPOTTED KEANU REEVES IN GTA 6?!', teaser=[132.1, 134.3],
   ranges=[[114.4, 116.4], [118.1, 121.1], [124.0, 126.9], [127.0, 129.1], [129.2, 134.3], [134.5, 136.3], [137.6, 139.5], [141.6, 142.1], [144.5, 146.3]],
   notes=[note(118.8, 'KFC IN GTA 6?', 'yellow'), note(124.6, 'OK THAT IS JASON', 'white', 'ding_correct', 0.4), note(128.7, 'THAT IS NOT TOM CRUISE', 'red', 'wrong', 0.6),
          note(133.3, 'KEANU REEVES?!', 'green', 'boom', 0.6), note(145.2, 'SPEED JUST WANTS CHICKEN', 'purple', 'munch_bite', 0.6)],
   stickers=[dict(src_t=128.9, gif=G + 'troll1.gif', pos=BR, size=300, dur=1.6), dict(src_t=133.4, gif=G + 'imoji_b.gif', pos=BR, size=300, dur=1.6),
             dict(src_t=145.0, emoji='🍗', pos=BR, size=230, dur=1.6)],
   fx=[{'src_t': 133.3, 'type': 'tint'}, {'src_t': 115.0, 'type': 'tint_y'}, {'src_t': 128.8, 'type': 'punch'}, {'src_t': 138.9, 'type': 'punch'}],
   sfx=[{'src_t': 133.3, 'name': 'bass_drop', 'gain': 0.35}]),
 'xbox': dict(title='Speed: Why Would You Play GTA 6 On Xbox?', hook='PLAYSTATION OR XBOX FOR GTA 6?', teaser=[217.7, 219.3],
   ranges=[[190.5, 192.6], [195.7, 200.4], [201.6, 205.5], [205.7, 212.2], [212.5, 219.3], [220.7, 221.3], [222.7, 223.95]],
   notes=[note(197.0, 'GO BACK, PRESS PLAY', 'white', 'tape_rewind', 0.35, 1.4, 0.12, 3), note(191.7, 'THE BIG QUESTION', 'white', 'suspense_1', 0.35), note(203.2, '"PLAYS BEST ON PS5"', 'green', 'ding_correct', 0.45),
          note(207.2, 'SPEED HAS DECIDED', 'yellow'), note(219.0, 'XBOX PLAYERS IN SHAMBLES', 'red', 'bruh', 0.6), note(214.5, 'IT SAYS IT ON THE SCREEN', 'white', 'pop', 0.45, 1.5, 0.12, 3)],
   stickers=[dict(src_t=204.6, emoji='🎮', pos=BR, size=230, dur=1.5), dict(src_t=219.1, gif=G + 'cheems_cry.gif', pos=BR, size=320, dur=1.8),
             dict(src_t=223.5, gif=G + 'mona_laugh.gif', pos=BR, size=300, dur=1.6), dict(src_t=216.4, emoji='📺', pos=BR, size=220, dur=1.4)],
   fx=[{'src_t': 204.6, 'type': 'tint'}, {'src_t': 211.7, 'type': 'tint'}, {'src_t': 219.1, 'type': 'tint_r'}, {'src_t': 223.7, 'type': 'shake'}],
   sfx=[{'src_t': 219.1, 'name': 'boom', 'gain': 0.5}]),
 'nov19': dict(title='Speed Is Ready For GTA 6 On November 19', hook='SPEED AFTER THE GTA 6 LAUNCH TRAILER', teaser=[180.1, 182.4],
   ranges=[[159.8, 164.2], [164.6, 168.3], [176.8, 186.0], [186.6, 188.2]],
   notes=[note(160.9, 'SPEED APPROVES', 'green', 'ding_correct', 0.45), note(166.2, 'NOVEMBER 19', 'purple', 'clock_tick', 0.5, 2.0),
          note(180.6, 'DAY-ONE STREAM LOADING', 'yellow', 'cartoon_rocket', 0.45), note(187.4, 'IT LOOKS LIT', 'green')],
   stickers=[dict(src_t=161.0, gif=G + 'cat_applause.gif', pos=BR, size=300, dur=1.6), dict(src_t=180.8, emoji='🔥', pos=BR, size=230, dur=1.8)],
   fx=[{'src_t': 160.9, 'type': 'tint'}, {'src_t': 163.1, 'type': 'tint'}, {'src_t': 187.5, 'type': 'tint'}, {'src_t': 166.1, 'type': 'punch'}],
   sfx=[{'src_t': 164.7, 'name': 'boom', 'gain': 0.4}]),
 'talking': dict(title='Speed Thought His Friend Was Talking To Chat', hook='SPEED BEFORE THE GTA 6 TRAILER', teaser=[12.5, 13.3],
   ranges=[[0.0, 1.6], [2.5, 2.95], [5.5, 20.6], [41.0, 42.6]],
   notes=[note(6.3, 'HE THOUGHT IT WAS CHAT', 'yellow', 'bruh', 0.6), note(12.6, 'YOU TALKING TO ME?', 'white', 'what', 0.5),
          note(19.2, 'OK, TRAILER TIME', 'green', 'drum_roll', 0.35), note(41.3, 'SPEED HAS NO WORDS', 'purple', 'shocked_2', 0.5)],
   stickers=[dict(src_t=9.3, gif=G + 'imoji_d.gif', pos=BR, size=280, dur=1.5), dict(src_t=16.3, gif=G + 'black_cat.gif', pos=BR, size=300, dur=1.6),
             dict(src_t=41.4, emoji='😱', pos=BR, size=230, dur=1.4)],
   fx=[{'src_t': 20.2, 'type': 'tint'}, {'src_t': 42.0, 'type': 'tint'}, {'src_t': 12.7, 'type': 'punch'}, {'src_t': 41.5, 'type': 'shake'}],
   sfx=[{'src_t': 20.3, 'name': 'boom', 'gain': 0.45}]),
 'buff': dict(title='Speed Found Out You Can Work Out In GTA 6', hook='YOU CAN WORK OUT IN GTA 6?!', teaser=[106.4, 107.95],
   ranges=[[68.3, 72.5], [77.6, 78.8], [92.6, 93.4], [98.5, 103.6], [106.4, 107.95]],
   notes=[note(70.0, 'HE HAD TO REWIND', 'white', 'tape_rewind', 0.4), note(100.1, 'GYMS IN GTA 6', 'green', 'ding_correct', 0.4),
          note(101.5, 'A SNAKE AS A PET?!', 'yellow', 'what', 0.5), note(107.5, 'GAINS LOADING...', 'purple', 'goofy_cartoon_rubber', 0.5)],
   stickers=[dict(src_t=101.6, emoji='🐍', pos=BR, size=230, dur=1.5), dict(src_t=107.5, emoji='💪', pos=BR, size=240, dur=1.6)],
   fx=[{'src_t': 100.3, 'type': 'tint'}, {'src_t': 107.7, 'type': 'tint'}, {'src_t': 101.6, 'type': 'punch'}],
   sfx=[{'src_t': 107.7, 'name': 'boom', 'gain': 0.45}]),
}
for k, c in shorts.items():
    c.update(max_len=59, min_len=8, max_untouched=4.0)
    json.dump(dict(base, clips=[c]), open(f'plan_{k}.json', 'w'), indent=1)
print('plans', list(shorts))
