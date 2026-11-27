import sys; sys.path.insert(0, '/home/claude/studio/clipper/daily')
from lib import *
KAI = (0.057, 0.410); SPEED = (0.938, 0.400)      # webcam faces, Kai's stream 24 Nov, 2:03 h segment (frame.py m08 @70, frames @50/@76)
S = lambda t, n, g=0.7: {'src_t': t, 'name': n, 'gain': g}
P = {}
P['speed_crash'] = short('kaicenat_m08', "Speed's PlayStation Crashed in His $1M Race vs Kai 😭 #ishowspeed #kaicenat #shorts",
    'SPEED CRASHED', [[45.8, 46.6], [48.8, 49.6], [53.1, 54.8], [60.4, 62.0], [64.6, 73.7], [74.2, 77.5], [86.9, 88.0]],
    notes=[note(46.0, 'KAI CRASHED FIRST 💥', 'yellow', 'bamboo_hit', 0.4, dur=0.6), note(53.3, 'CAR IS COOKED', 'red', 'bruh', 0.4),
           note(64.8, 'SPEED CALLS IN 📞', 'yellow', 'poink', 0.4), note(68.0, 'ALL HIS MONEY?!', 'red', 'oh_no', 0.45),
           note(71.9, 'GONE 💀', 'red', 'wah_wah_wah', 0.45, dur=1.3), note(75.3, 'HIS GAME CRASHED 🎮', 'yellow', 'wrong', 0.45, dur=1.5)],
    stickers=[emo(49.0, '😳', BL), emo(61.0, '📞', BR), emo(66.0, '😱', BR), emo(73.0, '💀', BL), emo(76.0, '🎮', BR), emo(87.0, '😂', BL)],
    fxs=[fx(46.0, 'punch'), zoomto(48.9, *KAI, z=2.6, dur=0.7), zoomto(53.2, *KAI, z=2.4, dur=1.5), zoomto(60.5, *SPEED, z=2.8, dur=1.5),
         zoomto(64.7, *SPEED, z=3.0, dur=3.0), zoomto(68.0, *KAI, z=2.6, dur=2.0), fx(71.9, 'shake'), zoomto(74.3, *SPEED, z=3.0, dur=3.0),
         fx(75.1, 'punch'), zoomto(87.0, *KAI, z=2.8, dur=1.0)],
    teaser=[74.9, 77.4], music=('funny/sneaky_snitch.mp3', 0.06, 0),
    sfx=[S(75.2, 'what', 0.4), S(87.1, 'audience_laughing', 0.35)],
    rep={76.3: 'Screened', 87.8: '', 87.9: '', 88.5: '', 88.6: ''}, context="Speed's *PLAYSTATION CRASHED* in his $1M race vs Kai")

KAI3 = (0.076, 0.444); SPEED3 = (0.934, 0.410)   # Kai's stream 24 Nov, 1:24 h segment (frame.py m03 @53)
P['kai_bag'] = short('kaicenat_m03', "Kai Cashed In One Bag in His $1M Race vs Speed 😭 #kaicenat #ishowspeed #shorts",
    'ONE BAG', [[27.4, 30.0], [35.8, 37.0], [44.2, 49.1], [50.1, 54.3], [57.4, 61.0], [70.1, 72.0]],
    notes=[note(27.6, 'HOW MUCH?!', 'yellow', 'drum_roll', 0.35, dur=1.3), note(36.0, 'THE BAG 💰', 'yellow', 'poink', 0.4, dur=1.0),
           note(44.4, '$108,000', 'red', 'cash_register', 0.45), note(51.6, '+ THE JEWELRY 💎', 'yellow', 'bloop', 0.4, dur=1.2),
           note(57.6, '$183K TOTAL', 'red', 'tadaa', 0.45), note(70.2, 'SPEED HAS $13K 💀', 'yellow', 'ba_dum_tss', 0.4, dur=1.6)],
    stickers=[emo(29.0, '🤔', BL), emo(46.0, '😱', BR), emo(53.6, '💥', BL), emo(59.0, '🤑', BR), emo(71.0, '😂', BL)],
    fxs=[zoomto(27.5, *KAI3, z=2.8, dur=2.4), zoomto(44.3, *KAI3, z=2.6, dur=2.6), fx(53.6, 'flash'), fx(53.7, 'shake'),
         zoomto(57.5, *KAI3, z=3.0, dur=2.0), zoomto(60.0, *SPEED3, z=2.8, dur=1.0), zoomto(70.2, *KAI3, z=2.6, dur=1.8)],
    teaser=[52.0, 54.3], music=('funny/run_amok.mp3', 0.06, 0),
    sfx=[S(53.6, 'punch', 0.45), S(44.5, 'what', 0.35)],
    context="Kai cashed in *ONE BAG* in his $1M race vs Speed")

save(P)
