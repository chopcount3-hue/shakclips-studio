# Speed x GTA 6 Extended Look reaction (Twitch highlight 2858084267, 27 Aug 2026): 4 no-voiceover Shorts in the owner's reference style
import json, re
S = '/home/claude/speedgta/'; G = '/home/claude/gta6vid/gifs/'; B = '/home/claude/clipper/bgm/'
W = json.load(open(S + 'xl.words.json'))['words']
# only Speed's own words are captioned (the trailer has its own subtitles); text checked against a second, prompted transcription
SPEECH = [
 (552.3, 554.2, "Chat, bro, why she look like a real girl though?"), (558.6, 560.0, "Nah, I can't do this right now, bro."),
 (561.0, 562.3, "Nah, what it... why?"), (564.1, 565.4, "Why she look like a real girl?"),
 (566.2, 570.9, "No, like an actual real girl, like a true traditionally 2026 girl, bro."),
 (571.7, 575.2, "Like it's making me... it's making me turn up."), (576.3, 577.3, "I don't know what's going on, bro."),
 (374.7, 376.6, "Wait, chat! Oh my gosh, I can play!"), (376.7, 378.4, "No, I can play!"), (380.2, 382.1, "Chat, I'm playing a game right now!"),
 (382.3, 383.6, "Oh my gosh!"), (385.0, 386.2, "I'm trolling!"), (389.4, 390.4, "I'm trolling!"),
 (406.1, 407.5, "Doing that quality stuff again. Hold on."), (410.6, 415.6, "Okay, okay, okay... GTA!"),
 (419.4, 426.8, "Oh, they got that again. I'm getting excited, bro. I'm getting excited."),
 (469.3, 470.5, "Hah! Who grandma is that?"), (475.6, 476.2, "Bro..."), (477.0, 478.6, "Who grandma is that, chat?"),
 (492.8, 493.8, "Oh... oh..."), (494.2, 498.5, "Oh my goodness, oh my goodness!"), (505.2, 510.0, "Oh my goodness, oh my goodness!"),
 (202.1, 206.3, "Oh, it's lagging again. Oh my gosh, bro. I have to keep doing this, bro."), (258.1, 259.4, "Yo, the voices sound good!"),
 (328.7, 330.3, "Chat, the graphics is crazy!"), (606.6, 608.1, "What, they got pigs in the game?"), (613.1, 614.9, "They got deers!"),
]
words = []
for a, b, text in SPEECH:
    toks = text.split(); hw = [w for w in W if a <= w['s'] < b]
    if len(hw) == len(toks):
        words += [dict(w=t, s=h['s'], e=h['e'], p=1.0) for t, h in zip(toks, hw)]
    else:   # spread evenly by length
        tot = sum(len(t) + 2 for t in toks); t0 = a
        for t in toks:
            d = (b - a) * (len(t) + 2) / tot; words.append(dict(w=t, s=round(t0, 2), e=round(t0 + d - 0.03, 2), p=1.0)); t0 += d
words.sort(key=lambda w: w['s'])
json.dump({'segments': [{'s': 0, 'e': 620, 't': '', 'words': words}]}, open(S + 'shorts/speed_xl_tx.json', 'w'))

GREEN = ['GTA', 'GRAPHICS', 'CRAZY', 'GOOD', 'REAL', 'GIRL', '2026', 'QUALITY', 'EXCITED', 'PIGS', 'DEERS', 'GOODNESS', 'TURN', 'UP', 'PLAY', 'PLAYING', 'GAME']
YELLOW = ['CHAT', 'OH', 'WHY', 'WHO', 'GRANDMA', 'WAIT', 'TROLLING', 'LOOK', 'TRADITIONALLY', 'VOICES']
RED = ['NAH', 'NO', "CAN'T", 'LAGGING']
cols = {**{k: 'green' for k in GREEN}, **{k: 'yellow' for k in YELLOW}, **{k: 'red' for k in RED}}
base = {
  'source': '/home/claude/untrusted/speed_xl/source.mp4', 'transcript': S + 'shorts/speed_xl_tx.json', 'asr': '', 'min_word_prob': 0.45, 'min_narration': 0,
  'layout': 'split', 'top': [30, 600, 540, 480], 'bottom': [590, 70, 1024, 910],
  'cap_mode': 'single', 'cap_size': 132, 'cap_colors': cols, 'hook_size': 80, 'note_size': 92,
  'sfx_dirs': ['/home/claude/clipper/sfx/drive', '/home/claude/clipper/sfx/made', '/home/claude/clipper/sfx/cc0'],
  'cut_sfx': {'name': 'swipe_swoosh_transition', 'gain': 0.22, 'every': 3},
}
def note(t, text, color='yellow', sfx='pop', gain=0.5, dur=1.5, y=0.12, rot=-3): return dict(src_t=t, text=text, color=color, sfx=sfx, gain=gain, dur=dur, y=y, rot=rot)
BR, BL = [0.74, 0.33], [0.03, 0.33]      # stickers sit in the top (cam) half, beside Speed's head
def mus(f, gain=0.13, frm=0): return {'file': B + f, 'gain': gain, 'from': frm}
shorts = {
 'lucia': dict(title='Speed Thinks Lucia Is A Real Girl', hook='SPEED THINKS LUCIA IS REAL', teaser=[564.0, 565.5],
   ranges=[[543.4, 548.3], [549.9, 555.3], [557.1, 560.1], [560.9, 577.4]], music=mus('chill/chill_wave.mp3', 0.14, 8),
   notes=[note(544.6, 'LUCIA PICKING AN OUTFIT', 'white', 'pop', 0.4), note(552.9, 'CHAT, IS SHE REAL?', 'yellow', 'what', 0.5),
          note(558.9, "HE CAN'T HANDLE IT", 'red', 'bruh', 0.55), note(569.0, '"TRADITIONALLY 2026"', 'green', 'ding_correct', 0.45),
          note(574.6, 'SPEED IS TURNING UP', 'purple', 'airhorn', 0.35)],
   stickers=[dict(src_t=553.5, gif=G + 'flirt.gif', pos=BR, size=260, dur=1.6), dict(src_t=564.6, emoji='😳', pos=BR, size=210, dur=1.5),
             dict(src_t=571.8, gif=G + 'cat_applause.gif', pos=BL, size=260, dur=1.6), dict(src_t=576.4, gif=G + 'mona_laugh.gif', pos=BR, size=250, dur=1.4)],
   fx=[{'src_t': 553.3, 'type': 'tint'}, {'src_t': 565.0, 'type': 'punch'}, {'src_t': 569.5, 'type': 'tint_y'}, {'src_t': 575.0, 'type': 'shake'}, {'src_t': 546.6, 'type': 'punch'}],
   sfx=[{'src_t': 564.9, 'name': 'boom', 'gain': 0.4}]),
 'troll': dict(title='Speed Pretended He Was Playing GTA 6 Early', hook='SPEED IS PLAYING GTA 6 EARLY?!', teaser=[380.6, 382.3],
   ranges=[[373.0, 391.0], [403.8, 408.0], [410.3, 416.0], [419.2, 427.0]], bleep=[[383.8, 384.3]], music=mus('trap_hiphop/laser_groove.mp3', 0.12, 4),
   notes=[note(375.6, 'SPEED GRABBED A CONTROLLER', 'white', 'mario_jump', 0.4), note(381.0, "GTA 6 ISN'T OUT YET", 'red', 'buzzer_wrong', 0.45),
          note(385.2, 'HE WAS TROLLING', 'yellow', 'funny_laugh_2', 0.45), note(387.6, 'CHAT FELL FOR IT', 'purple', 'bruh', 0.5),
          note(406.3, 'ROCKSTAR QUALITY', 'green', 'ding_correct', 0.4), note(414.8, 'GTA!!!', 'green', 'airhorn', 0.35),
          note(423.6, 'SPEED IS LOCKED IN', 'purple', 'kids_cheering', 0.3)],
   stickers=[dict(src_t=377.4, emoji='🎮', pos=BR, size=210, dur=1.4), dict(src_t=381.4, gif=G + 'troll1.gif', pos=BR, size=260, dur=1.6),
             dict(src_t=388.8, gif=G + 'troll2.gif', pos=BL, size=260, dur=1.6), dict(src_t=415.0, emoji='🔥', pos=BR, size=210, dur=1.5),
             dict(src_t=424.6, gif=G + 'cat_applause.gif', pos=BL, size=250, dur=1.6)],
   fx=[{'src_t': 378.6, 'type': 'punch'}, {'src_t': 381.2, 'type': 'tint_r'}, {'src_t': 385.4, 'type': 'shake'}, {'src_t': 412.5, 'type': 'punch'},
       {'src_t': 415.0, 'type': 'tint'}, {'src_t': 421.5, 'type': 'punch'}, {'src_t': 424.0, 'type': 'tint'}],
   sfx=[{'src_t': 415.0, 'name': 'boom', 'gain': 0.4}]),
 'grandma': dict(title='Who Grandma Is That? Speed Meets Aunt Tee', hook='WHO GRANDMA IS THAT?!', teaser=[477.0, 478.7],
   ranges=[[466.9, 470.6], [475.4, 478.9], [489.0, 511.0]], music=mus('vice_city_80s/miami_nights_extended_theme.mp3', 0.13, 6),
   notes=[note(467.4, 'AUNT TEE IS NOT HAPPY', 'red', 'oh_no', 0.45), note(469.6, 'WHO GRANDMA IS THAT?!', 'yellow', 'funny_laugh_1', 0.4),
          note(475.8, "HE CAN'T STOP LAUGHING", 'white', 'pop', 0.4), note(490.0, 'WAIT FOR IT...', 'purple', 'drum_roll', 0.35, 2.2),
          note(494.6, 'THE GTA VI LOGO', 'green', 'wow_choir', 0.35), note(499.6, 'SPEED HAS NO WORDS', 'white', 'shocked_2', 0.4),
          note(505.6, 'OH MY GOODNESS x2', 'yellow', 'sheesh', 0.45), note(509.4, 'NOVEMBER 19', 'purple', 'clock_tick', 0.4)],
   stickers=[dict(src_t=470.0, gif=G + 'mona_laugh.gif', pos=BR, size=250, dur=1.5), dict(src_t=477.6, gif=G + 'phone_laugh.gif', pos=BL, size=250, dur=1.5),
             dict(src_t=495.2, gif=G + 'aura.gif', pos=BR, size=260, dur=1.8), dict(src_t=501.4, emoji='😱', pos=BL, size=210, dur=1.4),
             dict(src_t=506.4, gif=G + 'prayer.gif', pos=BR, size=250, dur=1.6)],
   fx=[{'src_t': 469.6, 'type': 'tint_y'}, {'src_t': 477.3, 'type': 'punch'}, {'src_t': 492.5, 'type': 'punch'}, {'src_t': 494.8, 'type': 'tint'},
       {'src_t': 497.5, 'type': 'punch'}, {'src_t': 502.5, 'type': 'punch'}, {'src_t': 505.5, 'type': 'shake'}, {'src_t': 508.0, 'type': 'tint'}],
   sfx=[{'src_t': 494.6, 'name': 'boom', 'gain': 0.4}, {'src_t': 505.3, 'name': 'bass_drop', 'gain': 0.3}]),
 'graphics': dict(title="Speed's First Look At GTA 6 Gameplay", hook="SPEED'S FIRST LOOK AT GTA 6", teaser=[606.6, 608.2],
   ranges=[[199.9, 206.5], [256.3, 259.6], [323.6, 330.5], [595.5, 609.0], [612.8, 615.6]], music=mus('vice_city_80s/miami_viceroy.mp3', 0.12, 10),
   notes=[note(202.6, 'THE STREAM IS LAGGING', 'red', 'windows_error', 0.4), note(205.2, 'REWIND #47', 'white', 'tape_rewind', 0.35),
          note(258.4, 'THE VOICE ACTING', 'green', 'ding_correct', 0.4), note(325.6, 'LOOK AT THE DETAIL', 'white', 'pop', 0.4),
          note(329.2, 'THE GRAPHICS ARE CRAZY', 'green', 'wow_2', 0.4), note(597.6, "GTA 6'S NATURE AD", 'white', 'pop', 0.35),
          note(601.6, 'WILDLIFE IS BACK', 'yellow', 'birds', 0.3), note(606.9, 'PIGS IN GTA 6?!', 'yellow', 'what', 0.45),
          note(613.3, 'AND DEER', 'green', 'ding_correct', 0.4)],
   stickers=[dict(src_t=203.4, gif=G + 'cheems_cry.gif', pos=BR, size=250, dur=1.6), dict(src_t=329.5, emoji='🤯', pos=BR, size=210, dur=1.5),
             dict(src_t=599.6, gif=G + 'look_at_this.gif', pos=BL, size=250, dur=1.6), dict(src_t=607.3, emoji='🐗', pos=BR, size=210, dur=1.5),
             dict(src_t=613.6, emoji='🦌', pos=BR, size=210, dur=1.5)],
   fx=[{'src_t': 202.8, 'type': 'tint_r'}, {'src_t': 258.6, 'type': 'tint'}, {'src_t': 327.0, 'type': 'punch'}, {'src_t': 329.4, 'type': 'tint'},
       {'src_t': 598.5, 'type': 'punch'}, {'src_t': 603.6, 'type': 'punch'}, {'src_t': 607.0, 'type': 'shake'}, {'src_t': 613.3, 'type': 'tint_y'}],
   sfx=[{'src_t': 329.3, 'name': 'boom', 'gain': 0.35}]),
}
for k, c in shorts.items():
    c.update(max_len=59, min_len=8, max_untouched=4.0, jump_cuts=False)
    json.dump(dict(base, clips=[c]), open(S + f'shorts/plan_{k}.json', 'w'), indent=1, ensure_ascii=False)
print('plans', list(shorts), len(words), 'caption words')
