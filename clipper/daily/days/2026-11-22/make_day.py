import sys; sys.path.insert(0, '/home/claude/studio/clipper/daily')
from lib import *
P = {}
_n = note
def note(*a, **k): k.setdefault('y', 0.175); return _n(*a, **k)   # 2-line context title: notes below it
# S1 (experiment 2026-11-22, variant A = short 18-25 s): jshrobz swamp -> game crash. Passed competition check (0 copies).
P['jshrobz_crash'] = short('jshrobz_08', "Jshrobz Found Something Strange in the GTA 6 Swamp 😳 #gta6 #shorts", "WAIT FOR IT 😳",
    [[0.0, 2.2], [14.5, 18.0], [21.0, 23.2], [24.5, 29.5], [30.5, 33.6], [35.8, 40.8]],
    notes=[note(0.2, 'WHO IS THAT? 👀', 'yellow', 'mystery', 0.4),
           note(14.7, 'ALBINO GATOR?!', 'white', 'wow_1', 0.4),
           note(16.6, 'ZOOM IN...', 'yellow', 'ting', 0.35, dur=1.2),
           note(21.1, 'OH NO', 'red', 'dun_dun_dunnn', 0.4, dur=1.2),
           note(24.6, 'THEY SAW HIM', 'yellow', 'heartbeat', 0.4),
           note(27.4, 'TOO CLOSE 😬', 'red', 'poink', 0.4, dur=1.2),
           note(30.6, 'WHY ARE THEY WALKING AT HIM', 'yellow', 'ticking_clock', 0.35),
           note(32.6, '...', 'white', 'bloop', 0.35, dur=0.7),
           note(36.0, 'GAME: NOPE 💀', 'red', 'bruh', 0.5),
           note(38.6, 'ERROR REPORT 😭', 'white', 'wah_wah_wah', 0.4)],
    stickers=[emo(1.0, '🔭'), emo(15.5, '🐊', BL), gif(22.0, 'look_at_this'), emo(26.5, '😳', BL), gif(31.5, 'black_cat'),
              gif(37.0, 'cheems_cry'), emo(40.0, '💀', BL)],
    fxs=[fx(14.6, 'punch'), fx(21.2, 'tint_r'), fx(24.6, 'punch'), fx(28.0, 'shake'), fx(30.6, 'punch'), fx(36.1, 'flash'),
         fx(36.3, 'shake'), fx(39.0, 'punch')],
    box='jshrobz', context="JSHROBZ spotted something *weird* in the GTA 6 swamp...", teaser=[36.0, 38.3],
    music=('mystery/investigations.mp3', 0.07, 0))
# S2 (variant B = long 32-40 s): dunc and the bicycle. Passed competition check (1 copy, 0 views).
P['dunc_bike'] = short('dunc_18', "Dunc Tried to Save His Bike in GTA 6... 🚲 #gta6 #shorts", "HIS NEW BIKE 🚲",
    [[0.0, 3.3], [4.7, 9.0], [10.3, 13.9], [22.7, 26.4], [27.7, 30.8], [36.5, 38.5], [40.6, 44.2], [49.8, 56.3]],
    notes=[note(0.3, 'HOW DO YOU SAVE A BIKE?', 'yellow', 'poink', 0.4),
           note(4.8, 'GARAGE??', 'white', 'bloop', 0.35, dur=1.2),
           note(7.2, 'CHAT HELP 🙏', 'yellow', 'ting', 0.35, dur=1.2),
           note(10.4, 'IT BELONGS TO HIM NOW', 'green', 'cash_register', 0.4),
           note(12.8, 'FAIR AND SQUARE 😤', 'yellow', 'ba_dum_tss', 0.4, dur=1.0),
           note(22.8, 'HE WENT TO HER HOUSE', 'white', 'poink', 0.35),
           note(25.2, '🤨', 'yellow', 'bloop', 0.3, dur=1.0),
           note(27.8, 'WAIT...', 'yellow', 'what', 0.45),
           note(29.6, 'TWO BIKES?!', 'red', 'dun_dun_dunnn', 0.4, dur=1.1),
           note(36.6, 'EMBARRASSING 💀', 'red', 'wah_wah_wah', 0.4, dur=1.2),
           note(40.7, 'NOT HIS BIKE', 'red', 'wrong', 0.45),
           note(42.9, 'SOMEONE ELSE\'S 😭', 'yellow', 'audience_laughing', 0.3, dur=1.2),
           note(49.9, 'THE EXCUSE:', 'white', 'drum_roll', 0.35),
           note(52.6, 'HE DID IT AGAIN', 'red', 'bike_horn', 0.4),
           note(55.0, 'BIKE THIEF ARC 🚲', 'yellow', 'ba_dum_tss', 0.4, dur=1.2)],
    stickers=[emo(1.5, '🚲'), gif(6.0, 'prayer', BL), emo(11.5, '😤'), gif(24.0, 'look_at_this'), emo(29.8, '😳', BL),
              gif(37.0, 'troll1'), gif(42.0, 'mona_laugh', BL), gif(51.0, 'cat_applause'), emo(55.5, '💀', BL)],
    fxs=[fx(0.1, 'punch'), fx(10.4, 'punch'), fx(22.8, 'punch'), fx(27.8, 'punch'), fx(29.7, 'shake'), fx(36.6, 'tint_r'),
         fx(40.7, 'punch'), fx(43.0, 'shake'), fx(52.6, 'flash'), fx(53.0, 'punch')],
    box='dunc', context="DUNC wants to *keep* the bike he just found...", teaser=[52.6, 54.9],
    music=('funny/fluffing_a_duck.mp3', 0.07, 0))
save(P)
