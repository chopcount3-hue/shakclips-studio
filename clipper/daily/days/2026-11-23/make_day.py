import sys; sys.path.insert(0, '/home/claude/studio/clipper/daily')
from lib import *
P = {}
_n = note
def note(*a, **k): k.setdefault('y', 0.175); return _n(*a, **k)   # 2-line context title: notes below it
# S1 (experiment 2026-11-23, variant A = QUESTION title): DarkViperAU highway exit -> tanker off the overpass. 1 copy (9.9k).
P['darkviper_exit'] = short('darkviperau_32', "Why Did DarkViperAU Say 'It's My Bad' in GTA 6? 😭 #gta6 #shorts", "HE NEEDS THIS EXIT 🚚",
    [[0.0, 1.8], [3.6, 20.0]],
    notes=[note(0.1, 'BLENDING IN 😎', 'yellow', 'poink', 0.4, dur=1.4),
           note(3.7, 'EXIT COMING UP...', 'white', 'ticking_clock', 0.35),
           note(5.2, 'HE NEEDS IT', 'yellow', 'what', 0.4, dur=1.2),
           note(7.0, 'GO GO GO', 'red', 'goofy_cartoon_dash_1', 0.4, dur=1.2),
           note(9.0, 'THE TANKER 👀', 'yellow', 'dun_dun_dunnn', 0.4, dur=1.3),
           note(11.0, 'NOOO', 'red', 'scream', 0.35, dur=1.2),
           note(13.2, 'OFF THE OVERPASS 💀', 'red', 'bone_crack', 0.45, dur=1.3),
           note(15.1, '"IT\'S MY BAD"', 'white', 'ba_dum_tss', 0.45, dur=1.4),
           note(17.0, 'MADE THE EXIT THO ✅', 'green', 'correct', 0.4, dur=1.4),
           note(18.8, 'FINAL DESTINATION 😭', 'yellow', 'audience_laughing', 0.3, dur=1.0)],
    stickers=[emo(1.0, '😎'), gif(6.0, 'look_at_this', BL), emo(9.5, '😳'), gif(12.0, 'troll1', BL), emo(14.5, '💀'),
              gif(17.2, 'cat_applause', BL)],
    fxs=[fx(0.1, 'punch'), fx(5.2, 'punch'), fx(7.0, 'shake'), fx(11.0, 'tint_r'), fx(12.4, 'shake'), fx(13.2, 'punch'),
         fx(15.1, 'flash'), fx(17.0, 'punch')],
    box='darkviper', context="DARKVIPERAU really needs to take *this exit*...", teaser=[11.4, 13.6],
    music=('funny/run_amok.mp3', 0.07, 0))
# S2 (variant B = STATEMENT title): moistcr1tikal 4-star chase -> hides the car in a pool. 1 copy (500 views).
# 2.4-3.8 cut: the burned-in game subtitle says "fuckin'".
P['moist_pool'] = short('moistcr1tikal_69', "MoistCr1TiKaL Found the PERFECT Hiding Spot in GTA 6 🚔 #gta6 #shorts", "4 STARS 🚔",
    [[0.0, 2.4], [3.9, 9.5], [10.0, 13.5], [15.0, 20.2], [21.0, 26.4], [26.8, 30.0]],
    notes=[note(0.1, '4 STARS ⭐⭐⭐⭐', 'red', 'ticking_clock', 0.4),
           note(1.6, 'NEED A PLAN', 'yellow', 'poink', 0.4, dur=0.7),
           note(4.0, '"WE\'RE GONNA SEE!"', 'white', 'drum_roll', 0.35),
           note(5.9, 'WAIT WHAT', 'yellow', 'what', 0.45, dur=1.2),
           note(7.4, 'INTO THE POOL 💦', 'red', 'cartoon_bounce', 0.45, dur=1.5),
           note(10.2, 'SINKING...', 'white', 'slide_whistle', 0.35),
           note(12.0, 'COPS: ???', 'yellow', 'quack', 0.4, dur=1.2),
           note(15.2, 'STAY UNDER 🤫', 'yellow', 'heartbeat', 0.35),
           note(18.3, '"THEY\'LL NEVER EXPECT THIS"', 'green', 'ba_dum_tss', 0.4, dur=1.6),
           note(21.1, 'ESCAPE ROUTE 🏊', 'yellow', 'whoosh_transition', 0.35),
           note(23.6, 'NOBODY SAW 👀', 'white', 'bloop', 0.35, dur=1.3),
           note(25.8, '"OH JEEZ!"', 'red', 'wow_1', 0.4, dur=0.6),
           note(27.0, 'GENIUS? 🧠', 'green', 'tadaa', 0.4, dur=1.5)],
    stickers=[emo(1.0, '🚔'), gif(5.0, 'look_at_this', BL), emo(8.5, '💦'), gif(11.0, 'troll2'), emo(16.5, '🤫', BL),
              gif(19.0, 'mona_laugh'), emo(22.5, '🏊', BL), gif(28.0, 'cat_applause')],
    fxs=[fx(0.1, 'punch'), fx(5.9, 'punch'), fx(7.3, 'shake'), fx(10.2, 'tint'), fx(15.2, 'punch'), fx(18.3, 'flash'),
         fx(21.1, 'punch'), fx(25.8, 'shake'), fx(27.0, 'punch')],
    box='moist', context="MOIST has 4 stars and needs a *hiding spot*...", teaser=[6.0, 8.3],
    music=('funny/sneaky_snitch.mp3', 0.07, 0))
save(P)
