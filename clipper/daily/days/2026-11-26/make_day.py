import sys; sys.path.insert(0, '/home/claude/studio/clipper/daily')
from lib import *
KAI = (0.060, 0.400); SPEED = (0.925, 0.405)      # webcam faces, Kai's stream 24 Nov, 1:32 h segment (frame.py m13 @58)
S = lambda t, n, g=0.7: {'src_t': t, 'name': n, 'gain': g}
P = {}
P['kai_wasted'] = short('kaicenat_m13', "Kai Got Wasted With $524K in His $1M Race vs Speed 😭 #kaicenat #ishowspeed #shorts",
    'KAI GOT WASTED', [[44.0, 46.6], [52.5, 55.2], [57.8, 58.6], [59.4, 61.3], [62.1, 63.4], [64.4, 65.4], [70.6, 72.5], [74.5, 75.5], [80.3, 81.4]],
    notes=[note(44.3, 'KAI HAS $524K', 'yellow', 'cash_register', 0.4), note(52.8, '5 STARS 🚔', 'red', 'dun_dun_dunnn', 0.45),
           note(59.6, 'SPEED IS UP NOW', 'yellow', 'poink', 0.4), note(64.5, 'ALL MONEY RESETS', 'red', 'wrong', 0.45, dur=0.8),
           note(70.8, 'PLAY THE SAVE?!', 'yellow', 'what', 0.45, dur=1.5), note(80.4, "HE'S AT $7 💀", 'red', 'wah_wah_wah', 0.5, dur=1.0)],
    stickers=[emo(45.0, '🏃', BL), emo(54.0, '💀', BR), emo(58.4, '😱', BL), emo(62.2, '😂', BR), emo(71.6, '🙏', BL), emo(74.7, '😭', BR)],
    fxs=[fx(52.6, 'flash'), zoomto(53.0, *KAI, z=2.6, dur=2.0), fx(54.6, 'punch'), zoomto(57.9, *KAI, z=3.0, dur=0.7),
         zoomto(59.5, *SPEED, z=3.0, dur=1.7), zoomto(62.2, *SPEED, z=3.0, dur=1.1), fx(64.6, 'shake'), zoomto(70.7, *KAI, z=3.0, dur=1.7), zoomto(74.6, *SPEED, z=3.0, dur=0.9),
         zoomto(80.4, *KAI, z=2.8, dur=1.0), fx(81.0, 'punch')],
    teaser=[53.0, 55.2], music=('funny/sneaky_snitch.mp3', 0.06, 0),
    sfx=[S(53.0, 'oh_no', 0.4), S(62.3, 'audience_laughing', 0.35), S(75.0, 'funny_laugh_2', 0.35)],
    rep={62.3: ""}, context="Kai got *WASTED* with $524K in his race vs Speed")
save(P)
