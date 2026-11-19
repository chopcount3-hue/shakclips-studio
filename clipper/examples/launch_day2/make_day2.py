# GTA 6 US-launch Shorts (19 Nov 2026): Speed, Jynxzi, StableRonaldo, CaseOh from Twitch clips; Kai Cenat from his VOD
import json, os, sys
sys.path.insert(0, '/home/claude/launch')
import lib
lib.HQ = '/home/claude/untrusted/day2/'
from lib import short, note, gif, emo, fx, BR, BL
OUT = '/home/claude/day2/plans/'; os.makedirs(OUT, exist_ok=True)
lib.BOX.update({
  'speed': {'top': [101, 456, 277, 246], 'bottom': [480, 30, 1080, 960]},
  'jynxzi_menu': {'top': [172, 630, 405, 360], 'bottom': [600, 30, 1080, 960]},
  'jynxzi_game': {'top': [0, 480, 405, 360], 'bottom': [520, 30, 1080, 960]},
  'ronaldo': {'top': [120, 715, 315, 280], 'bottom': [500, 30, 1080, 960]},
  'caseoh': {'top': [65, 135, 320, 285], 'bottom': [480, 30, 1080, 960]},
  'kai': {'top': [68, 345, 253, 225], 'bottom': [480, 30, 1080, 960]},
})
P = {}
P['speed_unlock'] = short('speed', 'speed_here', 'Speed When GTA 6 Unlocked: "IT\'S HERE!"', 'SPEED WHEN GTA 6 UNLOCKED',
    [[17.0, 33.5], [42.5, 46.0], [52.6, 54.2], [58.1, 59.6]], teaser=[42.6, 45.6], music=('vice_city_80s/eighties_action.mp3', 0.09, 12),
    rep={11.0: '20', 15.5: '16', 43.6: '', 43.8: ''},
    notes=[note(17.4, '14 SECONDS LEFT', 'purple', 'clock_ticking', 0.35), note(22.0, '9...', 'white', 'pop', 0.35), note(27.0, 'FINAL 5', 'red', 'drum_roll', 0.35),
           note(30.3, 'WHAT?!', 'yellow', 'what', 0.5), note(42.8, 'GTA 6!!!', 'green', 'airhorn', 0.3), note(52.8, "IT'S HERE", 'green', 'ding_correct', 0.4)],
    stickers=[emo(18.5, '⏳'), emo(25.0, '😤', BL), gif(30.6, 'cat_applause'), emo(43.4, '🔥', BL), emo(58.4, '🐐')],
    fxs=[fx(19.5, 'punch'), fx(23.3, 'punch'), fx(26.4, 'punch'), fx(28.1, 'punch'), fx(30.4, 'tint'), fx(31.5, 'shake'), fx(42.8, 'tint'), fx(44.6, 'shake'), fx(52.8, 'tint_y'), fx(58.3, 'punch')],
    sfx=[{'src_t': 30.5, 'name': 'boom', 'gain': 0.4}])
P['speed_robbery'] = short('speed', 'speed_robbery', "Speed's First Robbery In GTA 6 😭", "SPEED'S FIRST ROBBERY",
    [[1.0, 30.0]], teaser=[21.6, 25.0], music=('action_epic/exit_the_premises.mp3', 0.09, 0),
    notes=[note(1.6, "IT'S A STICK-UP", 'red', 'airhorn', 0.3), note(6.0, 'THE CASHIER IS NOT SCARED', 'white', 'pop', 0.4, 1.8),
           note(10.5, 'SPEED IS PANICKING', 'yellow', 'uh', 0.45), note(14.2, 'GIVE ME THIS', 'yellow', 'pop', 0.4), note(20.2, '"CAT BOY"', 'purple', 'what', 0.45),
           note(21.8, 'HURRY UP!', 'red', 'clock_ticking', 0.35), note(28.6, 'GET OFF ME', 'red', 'record_scratch', 0.45)],
    stickers=[emo(2.5, '🥷'), emo(8.0, '😐', BL), gif(12.0, 'troll1'), emo(20.6, '🐱', BL), emo(24.0, '💰'), gif(28.8, 'cheems_cry', BL)],
    fxs=[fx(1.8, 'tint_r'), fx(4.0, 'punch'), fx(8.5, 'punch'), fx(12.4, 'punch'), fx(14.4, 'shake'), fx(17.0, 'punch'), fx(18.5, 'punch'), fx(20.3, 'tint_y'),
         fx(22.0, 'shake'), fx(24.2, 'punch'), fx(26.5, 'punch'), fx(28.7, 'tint_r')])
P['jynxzi_narrator'] = short('jynxzi_menu', 'jynxzi_ragebait', 'Jynxzi vs GTA 6\'s Screen Narrator 😭', 'JYNXZI VS THE NARRATOR',
    [[3.2, 30.0]], teaser=[8.7, 11.6], music=('funny/sneaky_snitch.mp3', 0.08, 0),
    notes=[note(3.4, 'THE GAME READS EVERYTHING OUT LOUD', 'white', 'pop', 0.4, 2.0), note(5.4, 'SHUT UP', 'red', 'record_scratch', 0.45),
           note(9.0, 'SHUT YOUR MOUTH x4', 'red', 'bruh', 0.5), note(14.7, 'NOW: THE TERMS', 'purple', 'drum_roll', 0.35), note(17.4, 'OH MY GOD', 'yellow', 'what', 0.45),
           note(20.4, 'SHUT UP x6', 'red', 'oh_no', 0.45), note(27.3, 'HOW DO I TURN IT OFF', 'yellow', 'uh', 0.5)],
    stickers=[emo(4.0, '🗣️'), gif(6.6, 'troll2', BR), emo(12.0, '🤬', BR), gif(16.0, 'cheems_cry', BR), emo(22.5, '😤', BR), gif(27.6, 'look_at_this', BR)],
    fxs=[fx(5.5, 'tint_r'), fx(6.8, 'punch'), fx(9.0, 'shake'), fx(11.4, 'punch'), fx(13.0, 'punch'), fx(14.8, 'punch'), fx(17.5, 'tint_y'), fx(19.2, 'punch'),
         fx(20.5, 'shake'), fx(22.8, 'punch'), fx(24.9, 'shake'), fx(27.4, 'punch')])
P['jynxzi_gator'] = short('jynxzi_game', 'jynxzi_gator', 'Jynxzi Met A GTA 6 Alligator 🐊😭', 'JYNXZI VS THE EVERGLADES',
    [[3.5, 19.0], [28.4, 32.5], [37.2, 38.6]], teaser=[37.2, 38.6], music=('funny/quirky_dog.mp3', 0.08, 0),
    notes=[note(3.8, 'WOW', 'green', 'wow_2', 0.4), note(6.3, 'THE EVERGLADES', 'white', 'birds', 0.3), note(8.0, 'ALLIGATOR', 'red', 'oh_no', 0.45),
           note(12.0, 'HE HIT IT', 'red', 'record_scratch', 0.45), note(16.0, "I'M SO SORRY", 'yellow', 'sad_trombone', 0.4), note(29.0, 'CAR STUCK', 'red', 'bruh', 0.5),
           note(37.4, 'RIP', 'purple', 'pop', 0.4)],
    stickers=[emo(6.6, '🌴', BL), emo(8.4, '🐊'), gif(12.4, 'cheems_cry', BL), emo(16.4, '🙏'), gif(30.0, 'troll2'), emo(37.6, '💀', BL)],
    fxs=[fx(4.0, 'tint'), fx(6.2, 'punch'), fx(8.0, 'shake'), fx(10.2, 'punch'), fx(12.0, 'tint_r'), fx(14.2, 'punch'), fx(16.1, 'punch'), fx(18.0, 'punch'), fx(29.0, 'shake'), fx(31.8, 'punch'), fx(37.4, 'tint_y')])
P['ronaldo_30fps'] = short('ronaldo', 'ronaldo_30fps', 'StableRonaldo Felt GTA 6\'s 30 FPS 😭', '"I FEEL THE 30 FPS"',
    [[3.8, 14.5], [19.3, 20.7], [23.3, 24.6], [29.3, 31.0], [34.1, 36.5]], teaser=[6.2, 7.9], music=('trap_hiphop/what_is_love.mp3', 0.08, 0),
    rep={23.6: 'ass'},
    notes=[note(4.2, 'WAIT A MINUTE', 'yellow', 'uh', 0.45), note(6.4, '30 FPS', 'red', 'record_scratch', 0.45), note(9.8, '$1,800 SETUP', 'purple', 'cash_register', 0.4),
           note(19.4, 'A BUG?', 'yellow', 'what', 0.45), note(29.4, 'INPUT DELAY TOO?', 'red', 'oh_no', 0.45), note(34.2, '13 YEARS FOR THIS?', 'purple', 'sad_trombone', 0.4)],
    stickers=[emo(6.8, '😬'), emo(10.5, '💸', BL), gif(13.0, 'cheems_cry'), emo(19.8, '🐛', BL), gif(30.0, 'troll2'), emo(35.0, '😭', BL)],
    fxs=[fx(4.2, 'punch'), fx(6.4, 'tint_r'), fx(8.4, 'punch'), fx(9.9, 'shake'), fx(12.4, 'punch'), fx(19.5, 'tint_y'), fx(23.4, 'punch'), fx(29.5, 'tint_r'), fx(34.2, 'shake')],
    sfx=[{'src_t': 6.5, 'name': 'boom', 'gain': 0.35}])
P['caseoh'] = short('caseoh', 'case_combo', 'CaseOh\'s First Hour Of GTA 6 😭', "CASEOH'S FIRST HOUR",
    [[0.8, 7.6], [26.1, 29.2], [33.0, 38.4], [59.5, 73.1]], teaser=[65.3, 68.0], music=('vice_city_80s/miami_viceroy.mp3', 0.08, 6),
    rep={3.4: '', 3.7: '', 28.6: 'Weeknd.', 37.3: 'Weeknd'},
    notes=[note(1.0, 'GRANDPA ON A SCOOTER', 'white', 'pop', 0.4), note(2.2, 'BLOW A HIP OUT', 'yellow', 'what', 0.45), note(6.6, 'HE CALLED IT', 'red', 'record_scratch', 0.45),
           note(26.3, 'HE ROBBED THE WEEKND', 'purple', 'cash_register', 0.4), note(33.2, "I'M A BIG FAN", 'green', 'pop', 0.4), note(36.0, 'BLINDING LIGHTS', 'yellow', 'sparkling', 0.35),
           note(60.0, 'THE PLANE', 'white', 'drum_roll', 0.35), note(65.5, "DON'T QUESTION IT", 'yellow', 'uh', 0.45), note(70.6, 'JUST ACCEPT IT', 'green', 'ding_correct', 0.4)],
    stickers=[emo(1.6, '🦽'), gif(6.8, 'troll1', BL), emo(26.6, '🎤'), emo(34.0, '🕶️', BL), gif(61.5, 'look_at_this'), emo(66.0, '🤷', BL), gif(71.0, 'cat_applause')],
    fxs=[fx(1.2, 'punch'), fx(4.4, 'punch'), fx(6.7, 'shake'), fx(26.4, 'tint_y'), fx(28.0, 'punch'), fx(33.4, 'punch'), fx(36.1, 'tint'), fx(60.2, 'punch'),
         fx(62.6, 'punch'), fx(65.6, 'shake'), fx(68.0, 'punch'), fx(70.7, 'tint')])
for k, p in P.items(): json.dump(p, open(OUT + f'plan_{k}.json', 'w'), indent=1, ensure_ascii=False)
print(len(P), 'plans')
P2 = {}
P2['kai_settings'] = short('kai', 'kaivod_810', "Kai Cenat's GTA 6 Settings Arc 😭", "KAI'S GTA 6 SETTINGS ARC",
    [[5.4, 21.0], [25.3, 36.2], [36.4, 44.6]], teaser=[39.5, 43.5], music=('chill/chillin_hard.mp3', 0.08, 0),
    notes=[note(5.8, 'LOCKED IN', 'green', 'pop', 0.4), note(7.2, 'MAX BRIGHTNESS', 'yellow', 'sparkling', 0.35), note(11.4, 'BLACK LEVELS?', 'white', 'uh', 0.45),
           note(20.3, 'OH MY GOD', 'green', 'wow_2', 0.4), note(27.1, 'TONE IT DOWN, POPPY', 'red', 'record_scratch', 0.45), note(34.6, 'PERFECT', 'green', 'ding_correct', 0.4),
           note(39.6, 'A MONSTER IN THE OCEAN?', 'purple', 'mystery', 0.4, 2.0), note(43.6, "HE'S NOT PLAYING", 'yellow', 'pop', 0.4)],
    stickers=[emo(6.0, '🔒'), emo(11.8, '⚫', BL), gif(20.6, 'cat_applause'), emo(27.4, '🙅', BL), emo(35.0, '👌'), emo(40.4, '🦈', BL), gif(43.8, 'look_at_this')],
    fxs=[fx(5.8, 'punch'), fx(8.6, 'punch'), fx(11.4, 'punch'), fx(14.4, 'punch'), fx(17.6, 'punch'), fx(20.3, 'tint'), fx(25.6, 'punch'), fx(27.2, 'shake'),
         fx(30.4, 'punch'), fx(33.4, 'punch'), fx(36.6, 'punch'), fx(39.7, 'tint_y'), fx(42.4, 'shake')])
for k, p in P2.items(): json.dump(p, open(OUT + f'plan_{k}.json', 'w'), indent=1, ensure_ascii=False)
print(len(P2), 'more')
