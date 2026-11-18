# Batch 2 of the GTA 6 launch-day Shorts: first gameplay (planes, fails, first impressions) + three combos from the unlock window
import json, os
from lib import short, note, gif, emo, fx, BR, BL, BGM, BOX
OUT = '/home/claude/launch/plans2/'; os.makedirs(OUT, exist_ok=True)
DV_G = [1600, 160, 236, 210]; JG = BOX['jason_game']; CG = BOX['clix_game']
P = {}
P['dv_tutorial'] = short('darkviperau', 'darkviperau_w2_250', 'DarkViperAU Ended GTA 6 In 5 Minutes', 'GOOD GAME GTA 6?',
    [[4.6, 10.6], [19.0, 28.0], [35.2, 43.5], [52.2, 54.3]], teaser=[40.8, 43.5], music=('funny/scheming_weasel_faster_version.mp3', 0.09, 0),
    notes=[note(5.0, 'PLAN: CRASH THROUGH THE WALL', 'white', 'pop', 0.4, 1.8), note(9.5, 'NO NO NO', 'red', 'oh_no', 0.45),
           note(21.4, 'GO GO GO', 'yellow', 'fast_swish_transition', 0.4), note(26.4, 'MAKING IT WORSE', 'red', 'bruh', 0.5),
           note(37.2, 'HE DITCHED HIS GUN', 'red', 'record_scratch', 0.45), note(41.0, 'GG, GTA 6', 'purple', 'sad_trombone', 0.45),
           note(52.6, 'FAILED THE TUTORIAL', 'red', 'buzzer_wrong', 0.4)],
    stickers=[emo(9.8, '😱'), emo(22.0, '🚔', BL), gif(37.6, 'cheems_cry'), gif(42.0, 'troll1', BL), emo(53.3, '💀')],
    fxs=[fx(7.2, 'punch'), fx(9.6, 'tint_r'), fx(21.5, 'punch'), fx(24.3, 'shake'), fx(37.3, 'punch'), fx(41.0, 'tint_y'), fx(52.8, 'tint_r')])
P['dv_tutorial']['top'] = DV_G
P['quin_gun'] = short('quin69', 'quin69_w2_1118', 'Quin69 Said "It\'s Gun Time" In GTA 6…', '"IT\'S GUN TIME!"',
    [[0.0, 5.2], [13.8, 23.5], [39.7, 45.6], [54.8, 62.5]], teaser=[55.0, 57.9], music=('action_epic/exit_the_premises.mp3', 0.09, 5),
    notes=[note(0.8, 'STEALTH MODE', 'green', 'sneaky', 0.45), note(14.0, 'GUN TIME', 'red', 'airhorn', 0.3),
           note(16.6, 'ROLL ROLL ROLL', 'yellow', 'fast_swish_transition', 0.4), note(40.0, 'NON-LETHAL?', 'yellow', 'uh', 0.5),
           note(55.2, "HE'S OUT OF AMMO", 'red', 'buzzer_wrong', 0.4), note(57.6, 'CHANGE WEAPONS!', 'yellow', 'pop', 0.45),
           note(61.0, 'DROP THE GUN', 'red', 'record_scratch', 0.45)],
    stickers=[emo(2.5, '🥷'), emo(14.6, '💥', BL), emo(41.0, '🤔'), gif(56.0, 'troll2', BL), emo(61.5, '💀')],
    fxs=[fx(3.9, 'punch'), fx(14.1, 'tint_r'), fx(16.4, 'shake'), fx(21.8, 'punch'), fx(41.3, 'punch'), fx(55.0, 'tint_r'), fx(57.5, 'punch'), fx(60.9, 'shake')])
P['jason_plane'] = short('jasontheween', 'jason_plane', "JasonTheWeen vs GTA 6's First Plane", "JASON CAN'T FLY",
    [[29.5, 34.0], [39.2, 40.6], [42.5, 49.3], [60.4, 68.0], [72.8, 74.7], [92.4, 99.5]], teaser=[73.0, 74.7], music=('action_epic/go_cart_loop_mix.mp3', 0.09, 0),
    rep={32.7: 'behind.', 67.4: 'plane,', 71.7: '', 72.1: ''}, bottom=JG['bottom'],
    notes=[note(30.0, 'JASON IS THE PILOT', 'white', 'pop', 0.4), note(39.4, 'FIRST TIME FLYING', 'yellow', 'uh', 0.45),
           note(43.0, 'OH GOD x3', 'red', 'oh_no', 0.45), note(60.6, 'NO NO NO NO', 'red', 'record_scratch', 0.45),
           note(66.0, 'NEVER AGAIN', 'purple', 'pop', 0.4), note(73.0, '"HARDEST GAME OF ALL TIME"', 'yellow', 'what', 0.45),
           note(92.6, 'IT GOT WORSE', 'red', 'drum_roll', 0.35), note(96.5, 'MAYDAY', 'red', 'airhorn', 0.3)],
    stickers=[emo(30.4, '✈️'), emo(43.4, '😱', BL), gif(61.2, 'cheems_cry'), gif(73.4, 'troll2', BL), emo(97.0, '💥')],
    fxs=[fx(32.0, 'punch'), fx(39.6, 'punch'), fx(43.0, 'shake'), fx(47.6, 'tint_r'), fx(60.6, 'shake'), fx(64.0, 'punch'), fx(73.0, 'tint_y'), fx(93.0, 'shake'), fx(96.6, 'tint_r')])
P['jason_plane']['top'] = JG['top']
P['clix_combo'] = short('clix', 'clix_combo', "Clix Has Never Played Controller Before 😭", "CLIX VS CONTROLLER",
    [[21.2, 32.4], [59.7, 63.0], [76.0, 81.4], [84.8, 93.0], [113.9, 121.0]], teaser=[115.1, 116.6], music=('funny/quirky_dog.mp3', 0.09, 0),
    bottom=CG['bottom'],
    notes=[note(21.5, "I'M TRYING TO FLY", 'red', 'oh_no', 0.45), note(28.6, 'PAUSE THE GAME', 'yellow', 'record_scratch', 0.45),
           note(60.0, 'WE MADE IT?', 'green', 'ding_correct', 0.4), note(76.3, 'NOW: THE BOAT', 'white', 'pop', 0.4),
           note(85.0, 'RELAX x9', 'yellow', 'uh', 0.5), note(89.4, 'SLOW x8', 'red', 'pop', 0.45),
           note(114.2, 'FIRST TIME ON CONTROLLER', 'purple', 'what', 0.45), note(119.0, 'MY BAD x3', 'red', 'bruh', 0.5)],
    stickers=[emo(22.0, '✈️'), gif(29.0, 'cheems_cry', BL), emo(61.0, '🎉'), emo(76.6, '🚤', BL), gif(86.0, 'prayer'), emo(115.0, '🎮', BL), gif(119.4, 'troll1')],
    fxs=[fx(21.4, 'tint_r'), fx(24.0, 'punch'), fx(28.8, 'shake'), fx(31.0, 'punch'), fx(60.2, 'tint'), fx(78.6, 'punch'), fx(85.2, 'punch'), fx(89.4, 'shake'), fx(114.2, 'tint_y'), fx(119.2, 'punch')])
P['clix_combo']['top'] = CG['top']
P['jason_candle'] = short('jasontheween', 'jason_candle', 'JasonTheWeen Lit A Candle For Lucia 🕯️', 'HE LIT A CANDLE FOR LUCIA',
    [[32.6, 33.6], [44.0, 45.9], [50.6, 55.4], [57.6, 62.0], [62.5, 68.0], [74.4, 77.4], [82.9, 83.5], [89.6, 99.0]], teaser=[57.6, 60.0],
    music=('chill/slow_jam.mp3', 0.10, 4), rep={44.4: 'flipped'},
    notes=[note(32.7, 'ONE MINUTE LEFT', 'purple', 'clock_ticking', 0.35), note(44.2, 'HE SWITCHED TO NEW ZEALAND', 'yellow', 'pop', 0.4, 1.8),
           note(50.8, 'FINALLY', 'green', 'ding_correct', 0.4), note(58.0, 'A CANDLE FOR LUCIA', 'purple', 'sparkling', 0.4),
           note(63.0, 'HE IS READY x6', 'green', 'pop', 0.4), note(74.6, 'LIGHTS OFF?', 'yellow', 'suspicious', 0.45),
           note(90.0, 'WE MADE IT', 'green', 'airhorn', 0.3)],
    stickers=[emo(44.6, '🇳🇿'), gif(51.4, 'cat_applause', BL), emo(58.4, '🕯️'), emo(75.0, '💡', BL), emo(91.0, '🔥')],
    fxs=[fx(44.3, 'punch'), fx(50.8, 'tint'), fx(53.9, 'punch'), fx(58.0, 'tint_y'), fx(64.0, 'punch'), fx(74.6, 'punch'), fx(83.0, 'tint_r'), fx(90.0, 'tint'), fx(93.0, 'shake')])
P['lacy_combo'] = short('lacy', 'lacy_combo', "Lacy's First Minutes Of GTA 6", '"THIS IS GENERATIONAL"',
    [[17.5, 21.6], [54.6, 61.0], [62.9, 68.0], [82.7, 87.2], [99.2, 120.0], [137.1, 139.2], [141.8, 144.5]], teaser=[141.8, 144.5],
    music=('vice_city_80s/newer_wave.mp3', 0.09, 6), rep={99.4: 'Grand', 99.6: 'Theft', 99.8: 'Auto'}, bottom=[840, 120, 1080, 960],
    notes=[note(17.8, 'GENERATIONAL', 'green', 'wow_choir', 0.35), note(55.0, 'TWO MINUTES', 'purple', 'clock_ticking', 0.35),
           note(63.2, 'FIRST TIME EVER', 'yellow', 'pop', 0.4), note(83.0, '30 SECONDS', 'red', 'drum_roll', 0.35),
           note(105.0, 'COUNTDOWN', 'yellow', 'clock_ticking', 0.35, 2.0), note(115.0, '13 YEARS OF WAITING', 'purple', 'sparkling', 0.4),
           note(137.3, "HE'S PLAYING", 'green', 'airhorn', 0.3), note(142.2, 'OFFICIALLY', 'green', 'ding_correct', 0.4)],
    stickers=[emo(18.5, '🥹'), emo(58.0, '⏳', BL), gif(64.5, 'prayer'), emo(108.0, '⏱️', BL), gif(115.6, 'cat_applause'), emo(138.0, '🎮', BL), emo(143.0, '🔥')],
    fxs=[fx(18.0, 'tint'), fx(56.0, 'punch'), fx(59.8, 'shake'), fx(63.5, 'punch'), fx(66.0, 'punch'), fx(84.5, 'punch'), fx(101.5, 'punch'),
         fx(108.6, 'punch'), fx(111.8, 'punch'), fx(115.2, 'tint_y'), fx(118.0, 'punch'), fx(137.3, 'tint'), fx(142.2, 'shake')])
P['quin_toilet'] = short('quin69', 'quin69_795', 'Quin69 Tried To Make Lucia Use The Toilet 😭', 'FIRST THING HE DID IN GTA 6',
    [[3.3, 8.7], [13.0, 14.0], [24.2, 25.6], [33.8, 36.3], [38.7, 39.5], [42.4, 49.5]], teaser=[42.4, 44.0], music=('funny/fluffing_a_duck.mp3', 0.09, 0),
    notes=[note(4.8, 'THE GRAPHICS', 'green', 'wow_2', 0.4), note(7.5, "HE'S PLAYING", 'green', 'pop', 0.4), note(24.4, 'FRAME RATE?', 'yellow', 'uh', 0.45),
           note(34.0, 'FIRST MISSION: ...', 'purple', 'drum_roll', 0.35), note(42.6, 'THE TOILET', 'yellow', 'what', 0.45), note(46.0, 'SHE DOES NOT NEED TO GO', 'red', 'bruh', 0.5)],
    stickers=[emo(5.2, '😍'), emo(25.0, '🎞️', BL), gif(38.9, 'look_at_this'), emo(43.0, '🚽', BL), gif(46.5, 'troll2')],
    fxs=[fx(4.9, 'tint'), fx(7.6, 'punch'), fx(13.1, 'shake'), fx(34.2, 'punch'), fx(42.6, 'tint_y'), fx(46.0, 'shake')])

SEG = {
 'plane': ('STREAMERS TRIED TO FLY A PLANE IN GTA 6', ('action_epic/cut_and_run.mp3', 0.09, 0), [
   ('jasontheween', 'jasontheween_w2_1100', [[39.2, 40.6], [42.5, 49.3]], 'JASONTHEWEEN', JG, None),
   ('clix', 'clix_w2_1316', [[21.2, 32.4]], 'CLIX', CG, None),
   ('tgg_gta', 'tgg_gta_w2_1332', [[4.3, 12.1]], 'TGG', None, None),
   ('lacy', 'lacy_w2_500', [[37.0, 40.0]], 'LACY', None, {38.7: 'W', 39.5: 'BUMP!'}),
   ('jasontheween', 'jasontheween_w2_1195', [[22.8, 24.7]], 'JASON AFTER LANDING', JG, None)]),
 'fails': ('GTA 6 IS ALREADY HUMBLING STREAMERS', ('funny/run_amok.mp3', 0.09, 0), [
   ('darkviperau', 'darkviperau_w2_250', [[35.2, 43.5]], 'DARKVIPERAU', {'top': DV_G, 'bottom': None}, None),
   ('quin69', 'quin69_w2_1118', [[54.8, 59.9]], 'QUIN69', None, None),
   ('clix', 'clix_w2_1508', [[45.9, 52.4]], 'CLIX', CG, None),
   ('darkviperau', 'darkviperau_w2_1322', [[11.0, 16.0]], 'DARKVIPERAU', {'top': DV_G, 'bottom': None}, None),
   ('quin69', 'quin69_w2_660', [[24.2, 33.3]], 'QUIN69', None, None),
   ('jasontheween', 'jasontheween_w2_1256', [[11.3, 18.4]], 'JASONTHEWEEN', JG, None)]),
 'looks': ("STREAMERS' FIRST LOOK AT GTA 6 GAMEPLAY", ('vice_city_80s/voltaic.mp3', 0.09, 8), [
   ('xqc', 'xqc_598', [[7.7, 10.6]], 'XQC', None, None),
   ('quin69', 'quin69_795', [[3.3, 8.7]], 'QUIN69', None, None),
   ('lacy', 'lacy_712', [[9.0, 11.1], [13.7, 16.4]], 'LACY', None, None),
   ('tgg_gta', 'tgg_gta_220', [[61.0, 63.9]], 'TGG', None, None),
   ('darkviperau', 'darkviperau_830', [[2.8, 6.6], [14.7, 15.5]], 'DARKVIPERAU', None, None)]),
}
for k, p in P.items(): json.dump(p, open(OUT + f'plan_{k}.json', 'w'), indent=1, ensure_ascii=False)
comp = {}
for name, (hook, mu, segs) in SEG.items():
    files = []
    for i, (u, f, rng, label, box, rep) in enumerate(segs):
        a = rng[0][0]
        p = short(u, f, f'{name}_{i}', '', rng, notes=[note(a + 0.1, label, 'purple', 'pop', 0.35, 1.6, 0.2, 0)], stickers=[],
                  fxs=[fx(a + 0.05, 'punch')], bottom=(box or {}).get('bottom'), rep=rep)
        if box and box.get('top'): p['top'] = box['top']
        c = p['clips'][0]; c.update(min_len=1, max_untouched=99); p['cut_sfx'] = None
        json.dump(p, open(OUT + f'seg_{name}_{i}.json', 'w'), indent=1, ensure_ascii=False); files.append(f'seg_{name}_{i}')
    comp[name] = dict(hook=hook, music=dict(file=BGM + mu[0], gain=mu[1], **{'from': mu[2]}), segs=files)
json.dump(comp, open(OUT + 'compilations.json', 'w'), indent=1)
print(len(P), 'singles;', {k: len(v['segs']) for k, v in comp.items()}, 'segments')
