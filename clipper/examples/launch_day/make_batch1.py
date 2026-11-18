# Batch 1 of the GTA 6 launch-day Shorts (NZ unlock, 18 Nov 2026): 7 single-streamer Shorts + 3 multi-streamer compilations
import json, os
from lib import short, note, gif, emo, fx, BR, BL, BGM
OUT = '/home/claude/launch/plans1/'; os.makedirs(OUT, exist_ok=True)
P = {}
P['clix'] = short('clix', 'clix_225', 'Clix Lost His Mind When GTA 6 Unlocked', 'CLIX WHEN GTA 6 UNLOCKED',
    [[8.4, 20.3], [32.7, 48.3], [62.0, 67.0]], teaser=[42.7, 45.0], music=('vice_city_80s/eighties_action.mp3', 0.10, 12),
    notes=[note(9.0, 'HE WAS HERE', 'white', 'pop', 0.4), note(13.8, 'THE FINAL COUNTDOWN', 'purple', 'drum_roll', 0.35, 2.2),
           note(19.8, 'GTA 6 IS OUT', 'green', 'airhorn', 0.3), note(37.3, '100% OFF?!', 'yellow', 'what', 0.5),
           note(43.4, 'OH MY GOSH x10', 'red', 'wow_2', 0.4), note(62.4, 'NO RUSHING IT', 'white', 'pop', 0.4)],
    stickers=[emo(20.0, '🔥'), gif(38.4, 'look_at_this', BL), gif(45.6, 'cat_applause'), emo(63.4, '🐢', BL)],
    fxs=[fx(19.8, 'tint'), fx(37.6, 'punch'), fx(43.0, 'shake'), fx(45.5, 'tint_y'), fx(63.0, 'punch'), fx(15.5, 'punch')],
    sfx=[{'src_t': 19.9, 'name': 'boom', 'gain': 0.4}])
P['hutch'] = short('hutchmf', 'hutchmf_212', "HutchMF Skipped Every Warning To Play GTA 6", 'HUTCH SKIPPED EVERYTHING',
    [[3.5, 8.3], [27.0, 31.6], [40.2, 45.2], [65.0, 73.2], [77.3, 87.0]], teaser=[83.6, 86.9], music=('funny/sneaky_snitch.mp3', 0.10, 3),
    bottom=[700, 120, 1080, 960],
    notes=[note(5.0, '30 SECONDS LEFT', 'purple', 'clock_ticking', 0.35), note(28.0, 'COME ON...', 'white', 'pop', 0.4),
           note(44.4, "HE'S IN", 'green', 'airhorn', 0.3), note(66.0, 'SKIPPING EVERYTHING', 'yellow', 'fast_swish_transition', 0.4),
           note(81.3, 'TERMS & CONDITIONS?', 'red', 'buzzer_wrong', 0.4), note(84.5, 'SPEED READER', 'green', 'ding_correct', 0.4)],
    stickers=[emo(44.8, '🎮'), gif(69.5, 'troll1', BL), emo(81.6, '📜'), gif(85.0, 'cat_applause')],
    fxs=[fx(28.5, 'punch'), fx(44.6, 'tint'), fx(68.3, 'punch'), fx(72.6, 'punch'), fx(81.5, 'tint_y'), fx(84.5, 'shake')],
    sfx=[{'src_t': 44.6, 'name': 'boom', 'gain': 0.4}])
P['quin'] = short('quin69', 'quin69_208', "Quin69's GTA 6 Countdown Went Too Fast", "QUIN'S GTA 6 COUNTDOWN",
    [[11.6, 14.4], [24.0, 37.0], [41.7, 50.0]], teaser=[41.7, 43.8], music=('trap_hiphop/laser_groove.mp3', 0.10, 0),
    bottom=[840, 120, 1080, 960],
    notes=[note(12.0, 'THE TIMER IS FLYING', 'yellow', 'what', 0.45), note(28.0, '10 SECONDS', 'purple', 'clock_ticking', 0.35),
           note(33.4, 'FINAL 4', 'red', 'drum_roll', 0.35), note(36.5, 'GTA 6!!!', 'green', 'airhorn', 0.3),
           note(43.3, 'PLAY GAME!', 'green', 'ding_correct', 0.4), note(47.0, 'HE IS SPAMMING IT', 'red', 'bruh', 0.5)],
    stickers=[emo(12.4, '⏱️'), emo(36.7, '🔥'), gif(44.0, 'troll2', BL), gif(48.5, 'cat_applause')],
    fxs=[fx(26.0, 'punch'), fx(30.2, 'punch'), fx(33.5, 'punch'), fx(36.5, 'tint'), fx(42.0, 'shake'), fx(45.8, 'tint_y')],
    sfx=[{'src_t': 36.6, 'name': 'boom', 'gain': 0.4}])
P['lacy'] = short('lacy', 'lacy_338', 'Lacy Saw Lucia For The First Time', 'LACY MEETS LUCIA',
    [[6.8, 8.4], [14.4, 17.3], [22.3, 25.8], [32.7, 39.0], [50.6, 58.5]], teaser=[55.0, 58.2], music=('chill/chill_wave.mp3', 0.12, 8),
    notes=[note(7.2, 'LACY MEETS LUCIA', 'purple', 'sparkling', 0.4), note(15.0, 'HE IS IN LOVE', 'red', 'pop', 0.4),
           note(23.0, 'ARRESTED ALREADY?', 'yellow', 'oh_no', 0.45), note(36.6, '"THAT\'S MY GIRL"', 'green', 'ding_correct', 0.4),
           note(55.0, 'BOYFRIEND???', 'red', 'record_scratch', 0.45), note(57.2, 'HEARTBROKEN', 'red', 'sad_trombone', 0.45)],
    stickers=[gif(15.2, 'flirt'), emo(34.5, '😍', BL), gif(57.4, 'cheems_cry')],
    fxs=[fx(7.3, 'tint'), fx(15.2, 'punch'), fx(23.0, 'tint_y'), fx(35.0, 'punch'), fx(53.0, 'punch'), fx(57.0, 'shake'), fx(57.1, 'tint_r')])
P['dv'] = short('darkviperau', 'darkviperau_230', 'DarkViperAU: "After 13 Years, It Finally Happened"', 'AFTER 13 YEARS...',
    [[5.2, 24.8], [30.4, 36.2], [56.3, 61.6]], teaser=[18.4, 21.5], music=('vice_city_80s/miami_viceroy.mp3', 0.11, 10),
    bottom=[840, 120, 1080, 960],
    notes=[note(6.0, 'THE FINAL 10 SECONDS', 'purple', 'clock_ticking', 0.35), note(15.6, 'GTA 6 IS HERE', 'green', 'airhorn', 0.3),
           note(19.0, '13 YEARS', 'yellow', 'wow_choir', 0.35), note(31.0, 'ON OR OFF?', 'white', 'uh', 0.5),
           note(60.2, 'FIRST MISTAKE', 'red', 'buzzer_wrong', 0.4)],
    stickers=[emo(16.0, '🔥'), gif(21.6, 'prayer'), emo(33.5, '🤔', BL), gif(60.8, 'troll2')],
    fxs=[fx(9.8, 'punch'), fx(12.3, 'punch'), fx(15.6, 'tint'), fx(18.6, 'punch'), fx(24.0, 'tint_y'), fx(33.0, 'punch'), fx(60.3, 'tint_r')],
    sfx=[{'src_t': 15.6, 'name': 'boom', 'gain': 0.4}])
P['tgg'] = short('tgg_gta', 'tgg_gta_220', 'TGG Begged GTA 6 To Work', '"PLEASE WORK"',
    [[1.5, 13.6], [14.0, 31.5], [36.1, 36.9], [61.0, 63.9]], teaser=[27.6, 31.4], music=('vice_city_80s/neon_laser_horizon.mp3', 0.10, 6),
    notes=[note(2.0, 'HISTORY IN 20 SECONDS', 'purple', 'clock_ticking', 0.35), note(11.9, "IT DOESN'T FEEL REAL", 'white', 'sparkling', 0.4),
           note(20.4, 'COUNTDOWN', 'yellow', 'drum_roll', 0.35, 2.0), note(25.2, 'GTA 6 IS OUT', 'green', 'airhorn', 0.3),
           note(36.1, 'PLEASE WORK', 'red', 'oh_no', 0.45), note(61.4, 'SO MANY ANIMATIONS', 'green', 'wow_2', 0.4)],
    stickers=[emo(3.4, '👋'), emo(25.5, '🔥'), gif(36.4, 'prayer'), emo(62.0, '🤯', BL)],
    fxs=[fx(7.4, 'punch'), fx(12.0, 'punch'), fx(22.9, 'punch'), fx(25.3, 'tint'), fx(28.0, 'punch'), fx(36.2, 'tint_r'), fx(61.5, 'tint')],
    sfx=[{'src_t': 25.3, 'name': 'boom', 'gain': 0.4}])
P['xqc'] = short('xqc', 'xqc_combo', "xQc's First Reaction To GTA 6", "XQC'S FIRST REACTION",
    [[16.1, 21.0], [24.1, 34.0], [37.0, 41.2], [57.6, 60.8], [73.9, 78.2], [83.0, 84.9]], teaser=[57.8, 60.6], music=('trap_hiphop/hitman.mp3', 0.10, 0),
    notes=[note(16.4, "WHAT IF IT'S TERRIBLE?", 'red', 'suspicious', 0.4), note(19.6, 'OR REALLY GOOD?', 'green', 'pop', 0.4),
           note(29.6, "IT'S TIME", 'purple', 'drum_roll', 0.35), note(38.6, 'WELCOME TO THE JUNGLE', 'yellow', 'pop', 0.4),
           note(58.0, 'FIRST IMPRESSION: GOOD', 'green', 'ding_correct', 0.4), note(75.2, '...BUT CLUNKY?', 'red', 'uh', 0.5),
           note(83.2, 'CATCHING ON FIRE', 'red', 'oh_no', 0.45)],
    stickers=[emo(17.0, '😬'), gif(30.4, 'this_is_it'), emo(58.4, '😍'), emo(76.0, '🐢', BL), emo(83.6, '🔥')],
    fxs=[fx(16.5, 'tint_r'), fx(19.8, 'tint'), fx(29.7, 'punch'), fx(33.3, 'punch'), fx(58.0, 'tint'), fx(76.0, 'tint_r'), fx(83.4, 'shake')],
    sfx=[{'src_t': 29.8, 'name': 'boom', 'gain': 0.35}])

# compilation segments: no hook, no teaser, no music (compile_short.py adds them); the streamer's name as the first pop-up
SEG = {
 'unlock': ('STREAMERS WHEN GTA 6 FINALLY UNLOCKED', ('vice_city_80s/miami_nights_extended_theme.mp3', 0.11, 6), [
   ('tgg_gta', 'tgg_gta_220', [[22.7, 31.5]], 'TGG', None), ('lacy', 'lacy_198', [[42.4, 52.0]], 'LACY', [840, 120, 1080, 960]),
   ('darkviperau', 'darkviperau_230', [[11.4, 21.6]], 'DARKVIPERAU', [840, 120, 1080, 960]), ('jasontheween', 'jasontheween_203', [[27.5, 37.0]], 'JASONTHEWEEN', None),
   ('clix', 'clix_225', [[42.6, 48.2]], 'CLIX', None), ('hutchmf', 'hutchmf_212', [[40.2, 45.2]], 'HUTCHMF', [700, 120, 1080, 960]),
   ('quin69', 'quin69_208', [[33.3, 37.0], [41.7, 44.0]], 'QUIN69', [840, 120, 1080, 960])]),
 'fps': ('STREAMERS NOTICED GTA 6 IS 30 FPS', ('trap_hiphop/what_is_love.mp3', 0.10, 0), [
   ('clix', 'clix_800', [[29.8, 36.1]], 'CLIX', None), ('jasontheween', 'jasontheween_700', [[20.4, 21.4], [28.8, 35.0]], 'JASONTHEWEEN', None),
   ('xqc', 'xqc_790', [[7.9, 12.2], [17.0, 18.8]], 'XQC', None), ('jasontheween', 'jasontheween_808', [[5.7, 7.3], [21.9, 25.2]], 'JASON AGAIN', None),
   ('quin69', 'quin69_795', [[4.7, 8.7], [24.2, 25.5]], 'QUIN69', None)]),
 'last': ('STREAMERS IN THE LAST MINUTES BEFORE GTA 6', ('chill/hypnothis.mp3', 0.11, 4), [
   ('lacy', 'lacy_40', [[17.5, 21.6], [63.0, 67.9]], 'LACY', None), ('hutchmf', 'hutchmf_100', [[33.6, 41.4]], 'HUTCHMF', None),
   ('jasontheween', 'jasontheween_130', [[44.0, 45.9], [50.6, 55.4]], 'JASONTHEWEEN', None), ('tgg_gta', 'tgg_gta_148', [[19.6, 28.9]], 'TGG', None),
   ('xqc', 'xqc_0', [[16.1, 21.0], [29.4, 31.4]], 'XQC', None)]),
}
REP = {'jasontheween_130': {44.4: 'flipped'}, 'tgg_gta_148': {23.9: 'We'}}
for k, p in P.items(): json.dump(p, open(OUT + f'plan_{k}.json', 'w'), indent=1, ensure_ascii=False)
comp = {}
for name, (hook, mu, segs) in SEG.items():
    files = []
    for i, (u, f, rng, label, bottom) in enumerate(segs):
        a = rng[0][0]
        p = short(u, f, f'{name}_{i}', '', rng, notes=[note(a + 0.1, label, 'purple', 'pop', 0.35, 1.6, 0.2, 0)], stickers=[],
                  fxs=[fx(a + 0.05, 'punch')], bottom=bottom, rep=REP.get(f))
        c = p['clips'][0]; c.update(min_len=1, max_untouched=99); p['cut_sfx'] = None
        json.dump(p, open(OUT + f'seg_{name}_{i}.json', 'w'), indent=1, ensure_ascii=False); files.append(f'{name}_{i}')
    comp[name] = dict(hook=hook, music=dict(file=BGM + mu[0], gain=mu[1], **{'from': mu[2]}), segs=files)
json.dump(comp, open(OUT + 'compilations.json', 'w'), indent=1)
print(len(P), 'singles;', {k: len(v['segs']) for k, v in comp.items()}, 'segments')
