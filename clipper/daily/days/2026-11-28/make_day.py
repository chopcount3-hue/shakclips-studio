import sys; sys.path.insert(0, '/home/claude/studio/clipper/daily')
from lib import *
S = lambda t, n, g=0.7: {'src_t': t, 'name': n, 'gain': g}
P = {}
KAIF = (0.486, 0.49)      # m03 = just-chatting full-cam (frame.py m03 @60): Kai's face centre
P['speed_early'] = short('kaicenat_m03', "Kai Cenat Caught Speed CHEATING Before Their $1M Race 😭 #kaicenat #ishowspeed #shorts",
    'SPEED STARTED', [[14.2, 16.2], [18.6, 19.8], [42.4, 45.4], [46.7, 48.0], [54.8, 56.3], [56.4, 59.4], [60.3, 62.0], [65.0, 67.0]],
    notes=[note(14.4, 'KAI: "HE\'S NOT READY"', 'yellow', 'poink', 0.4), note(18.7, 'CHAT: HE\'S ALREADY PLAYING 👀', 'red', 'bloop', 0.4, dur=1.0),
           note(42.6, 'KAI STILL DOESN\'T BELIEVE IT', 'yellow', 'drum_roll', 0.35, dur=2.6), note(46.8, 'HE CHECKS SPEED\'S STREAM', 'yellow', 'whoosh_transition', 0.4, dur=1.2),
           note(56.5, 'SPEED STARTED EARLY 💀', 'red', 'oh_no', 0.45, dur=2.6), note(60.4, 'CHEATING?!', 'red', 'what', 0.45, dur=1.5),
           note(65.1, 'KAI IS HURT 😭', 'yellow', 'ba_dum_tss', 0.4, dur=1.8)],
    stickers=[emo(15.0, '🤨', BR), emo(44.0, '😤', BL), emo(55.2, '👀', BR), emo(58.0, '😱', BL), emo(61.0, '🚨', BR), emo(66.0, '😭', BL)],
    fxs=[zoomto(14.3, *KAIF, z=1.7, dur=1.8), zoomto(43.0, *KAIF, z=1.6, dur=2.2), fx(56.5, 'punch'), zoomto(57.9, *KAIF, z=1.9, dur=1.4),
         fx(60.4, 'shake'), zoomto(60.5, *KAIF, z=2.0, dur=1.4), zoomto(65.1, *KAIF, z=1.8, dur=1.8)],
    teaser=[60.3, 62.0], music=('funny/sneaky_snitch.mp3', 0.06, 0),
    sfx=[S(58.9, 'nani', 0.35), S(66.4, 'audience_laughing', 0.3)],
    context="Speed *STARTED EARLY* while Kai was still talking")

KAI = (0.042, 0.438); SPEED = (0.927, 0.395)   # m27 (frame.py @30): Kai cam top-left, Speed cam right
P['kai_chase'] = short('kaicenat_m27', "Kai's Last Police Chase in His $1M Race vs Speed 🚔 #kaicenat #ishowspeed #shorts",
    '5 STARS', [[9.8, 13.9], [27.8, 31.2], [45.5, 51.8], [62.0, 63.6], [75.2, 76.6]],
    notes=[note(10.0, 'KAI STOLE A COP CAR 🚔', 'yellow', 'whoosh_transition', 0.4, dur=1.8), note(12.3, 'SPEED $402K · KAI $193K', 'red', 'cash_register', 0.4, dur=1.5),
           note(28.0, '12 MINUTES LEFT ⏱️', 'yellow', 'drum_roll', 0.35, dur=1.6), note(30.0, '5 STARS', 'red', 'poink', 0.4, dur=1.1),
           note(46.0, 'CHAT: YOU CAN\'T DRIVE', 'yellow', 'bloop', 0.4, dur=2.2), note(49.6, 'WALL 💥', 'red', 'bamboo_hit', 0.5, dur=2.0),
           note(62.1, 'RUN!!', 'yellow', 'fast_swish_transition', 0.4, dur=1.4), note(75.3, 'GG 💀', 'red', 'wah_wah_wah', 0.45, dur=1.2)],
    stickers=[emo(11.0, '🚔', BR), emo(29.0, '⏱️', BL), emo(48.0, '😳', BR), emo(50.5, '💥', BL), emo(63.0, '🏃', BR), emo(76.0, '💀', BL)],
    fxs=[zoomto(10.0, *KAI, z=2.6, dur=1.8), zoomto(12.3, *SPEED, z=2.6, dur=1.5), zoomto(28.0, *KAI, z=2.4, dur=1.5),
         fx(49.8, 'punch'), fx(49.9, 'shake'), zoomto(50.2, *KAI, z=3.0, dur=1.6), zoomto(62.0, *SPEED, z=2.6, dur=1.5), zoomto(75.2, *KAI, z=2.8, dur=1.4)],
    teaser=[49.4, 51.6], music=('funny/run_amok.mp3', 0.06, 0),
    sfx=[S(50.0, 'oh_no', 0.4), S(76.2, 'audience_laughing', 0.3)],
    rep={75.5: ''}, context="Kai's *5-STAR CHASE* with 12 minutes left vs Speed")
save(P)
