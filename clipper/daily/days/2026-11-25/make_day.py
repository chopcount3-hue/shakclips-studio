import sys; sys.path.insert(0, '/home/claude/studio/clipper/daily')
from lib import *
P = {}
_n = note
def note(*a, **k): k.setdefault('y', 0.175); return _n(*a, **k)   # 2-line context title: notes below it
# S1 (experiment 2026-11-25, variant B = 20-24 s): Agent00 customises a brand-new SF90, wrecks it into a taxi seconds later. 0 Short copies.
P['agent00_sf90'] = short('agent00_28', "Agent00 Bought a Brand New Supercar in GTA 6 🏎️ #gta6 #shorts", "BRAND NEW 🏎️",
    [[0.0, 4.2], [7.4, 11.0], [14.2, 26.2]],
    notes=[note(0.1, 'NEW CAR DAY 🏎️', 'yellow', 'cash_register', 0.4),
           note(2.0, 'FULL CUSTOM', 'white', 'poink', 0.35, dur=1.4),
           note(7.5, 'THE SF90 😍', 'green', 'wow_1', 0.4, dur=1.4),
           note(9.2, 'FIRST DRIVE', 'yellow', 'whoosh_transition', 0.35, dur=1.0),
           note(14.3, 'NOT A SCRATCH...', 'white', 'ting', 0.35, dur=1.4),
           note(16.0, 'YET', 'red', 'dun_dun_dunnn', 0.45, dur=1.0),
           note(17.2, 'A LITTLE FAST 😬', 'yellow', 'ticking_clock', 0.35, dur=1.3),
           note(18.6, 'TAXI!!', 'red', 'what', 0.45, dur=1.0),
           note(19.8, 'BRAND NEW 💀', 'red', 'bone_crack', 0.45, dur=1.3),
           note(21.6, 'INTO THE BUSHES', 'yellow', 'slide_whistle', 0.35, dur=1.4),
           note(23.5, 'ENGINE DAMAGED', 'red', 'wah_wah_wah', 0.35, dur=1.4),
           note(25.2, 'STILL DRIVES 😭', 'green', 'audience_laughing', 0.3, dur=0.9)],
    stickers=[emo(1.0, '🏎️'), gif(3.0, 'aura'), emo(8.2, '✨', BL), gif(15.0, 'look_at_this', BL), emo(20.2, '💀'),
              gif(22.2, 'cheems_cry'), emo(24.2, '😭', BL), gif(25.4, 'troll1', dur=0.8)],
    fxs=[fx(0.1, 'punch'), fx(2.0, 'punch'), fx(7.5, 'flash'), fx(9.2, 'punch'), fx(14.3, 'punch'), fx(16.0, 'tint'), fx(18.6, 'punch'),
         fx(19.8, 'shake'), fx(21.6, 'punch'), fx(23.5, 'tint_r'), fx(25.2, 'punch')],
    box='agent00', rep={7.9: 'SF90.'}, context="AGENT00 takes his *brand new supercar* for a spin...", teaser=[18.3, 20.6],
    music=('funny/run_amok.mp3', 0.07, 0))
# S2 (variant A = 14-17 s): Jynxzi brakes just in time for a biker, screams "greatest brake of all time". 0 Short copies.
P['jynxzi_brake'] = short('jynxzi_18', "Jynxzi Almost Hit a Biker in GTA 6 😭 #gta6 #shorts", "WATCH THE BIKE 🏍️",
    [[0.4, 12.6], [16.0, 19.0]],
    notes=[note(0.5, 'JUST A CHILL DRIVE', 'white', 'poink', 0.35, dur=1.4),
           note(2.2, 'WAIT', 'yellow', 'ticking_clock', 0.35, dur=0.9),
           note(3.2, 'THE BIKER 😳', 'red', 'scream', 0.35, dur=1.3),
           note(5.0, 'BRAKES!!', 'red', 'punch', 0.45, dur=1.0),
           note(6.6, '"BRO HAS NO IDEA"', 'yellow', 'ba_dum_tss', 0.35, dur=1.5),
           note(8.6, 'GREATEST BRAKE EVER?', 'green', 'tadaa', 0.35, dur=1.5),
           note(11.0, 'HE\'S SHAKING 😂', 'yellow', 'audience_laughing', 0.3, dur=1.4),
           note(16.2, 'HIS REACTION 💀', 'red', 'nani', 0.4, dur=1.4)],
    stickers=[emo(0.8, '🚗'), gif(3.4, 'look_at_this', BL), emo(5.2, '😱', BL), gif(8.9, 'cat_applause', BL), emo(11.2, '😂', BL),
              gif(17.0, 'mona_laugh', BL)],
    fxs=[fx(0.5, 'punch'), fx(3.2, 'shake'), fx(5.0, 'punch'), fx(6.6, 'tint_y'), fx(8.6, 'flash'), fx(10.6, 'punch'), fx(16.2, 'shake')],
    box='jynxzi', rep={10.0: 'brake'}, context="JYNXZI takes a *calm drive* through Vice City...", teaser=[2.6, 4.8],
    music=('funny/sneaky_snitch.mp3', 0.07, 0))
save(P)
