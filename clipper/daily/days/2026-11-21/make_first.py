import sys; sys.path.insert(0, '/home/claude/clipper/daily')
from lib import *
P = {}
P['squeex_trick'] = short('squeex_15', "His 'Cool Trick' in GTA 6 Went Wrong 💀 #gta6", "HIS 'COOL TRICK' 🏍️",
    [[1.3, 5.0], [9.0, 12.0], [14.8, 18.0], [22.5, 26.0], [30.0, 41.0]],
    notes=[note(1.6, 'COOL TRICK INCOMING', 'white', 'pop', 0.4), note(9.2, 'WHEELIE MODE', 'yellow', 'whoosh_transition', 0.35),
           note(15.2, 'MAX SPEED', 'green', 'riser', 0.35), note(23.0, 'CHAT IS WATCHING 👀', 'yellow', 'pop', 0.4),
           note(31.0, 'WAIT...', 'yellow', 'what', 0.45), note(34.3, 'THE TRUCK 💀', 'red', 'record_scratch', 0.5),
           note(38.0, 'CLIP THAT 😭', 'white', 'pop', 0.4)],
    stickers=[emo(2.0, '🏍️'), gif(10.0, 'this_is_it'), emo(16.0, '🔥', BL), gif(24.0, 'look_at_this'),
              gif(35.0, 'troll1'), emo(39.4, '💀', BL)],
    fxs=[fx(9.0, 'punch'), fx(15.2, 'punch'), fx(22.6, 'punch'), fx(28.0 + 2.5, 'punch'), fx(34.3, 'shake'), fx(34.5, 'flash'), fx(39.3, 'tint_r')],
    box='squeex', teaser=[34.0, 36.4], music=('funny/sneaky_snitch.mp3', 0.08, 0))
save(P)
