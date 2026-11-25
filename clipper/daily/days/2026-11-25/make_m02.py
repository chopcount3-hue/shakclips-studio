import sys; sys.path.insert(0, '/home/claude/clipper/daily')
from lib import *
KAI = (0.060, 0.398); SPEED = (0.921, 0.319)          # webcam faces in Kai's stream layout (source 0-1)
S = lambda t, n, g=0.7: {'src_t': t, 'name': n, 'gain': g}
P = {}
P['kai_speed_rage'] = short('kaicenat_m02', "Speed Lost It on Kai During Their $1M Race 😭 #kaicenat #ishowspeed #shorts",
    'SPEED LOST IT', [[2.0, 7.4], [29.6, 32.6], [38.3, 43.3], [44.0, 53.2], [76.0, 80.0]],
    notes=[note(3.0, 'KAI IS TROLLING', 'yellow', 'poink', 0.4), note(38.6, 'SPEED IS HEATED', 'red', 'what', 0.5),
           note(48.4, 'COOL YOUR CAR?!', 'yellow', 'poink', 0.4), note(50.6, 'SHUT UP BRO', 'red', 'bruh', 0.6), note(77.0, "HE'S BROKE", 'yellow', 'ba_dum_tss', 0.5)],
    stickers=[emo(4.0, '😂', BR), emo(31.0, '🚗', BL), emo(41.0, '😤', BL), emo(47.2, '🤣', BL), emo(52.0, '💀', BR), emo(78.6, '😭', BR)],
    fxs=[zoomto(2.2, *KAI, z=2.4, dur=2.2), zoomto(30.0, *KAI, z=2.2, dur=2.0), zoomto(38.5, *SPEED, z=3.0, dur=2.6),
         fx(40.4, 'punch'), zoomto(44.1, *KAI, z=2.3, dur=2.6), zoomto(50.1, *SPEED, z=3.0, dur=2.8), fx(52.7, 'shake'), zoomto(76.1, *KAI, z=2.4, dur=3.2), fx(79.3, 'punch')],
    teaser=[50.0, 53.1], music=('funny/sneaky_snitch.mp3', 0.06, 0),
    sfx=[S(45.2, 'audience_laughing', 0.35), S(79.4, 'audience_laughing', 0.45)],
    context="Speed *LOST IT* on Kai in their race to $1,000,000")
save(P)
