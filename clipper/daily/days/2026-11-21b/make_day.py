import sys; sys.path.insert(0, '/home/claude/clipper/daily')
from lib import *
P = {}
# s1 (A: name) Speed picks the wrong save
P['speed_save'] = short('ishowspeed_34', "Speed Picked the WRONG Save in GTA 6 😭 #gta6", "SPEED'S 98% SAVE 😳",
    [[0.0, 2.6], [6.4, 8.6], [9.0, 11.2], [12.8, 16.5], [17.4, 23.0]],
    notes=[note(0.3, 'WHICH SAVE?? 🤔', 'yellow', 'pop', 0.4), note(6.6, 'END OF THE ROAD 57%', 'white', 'whoosh_transition', 0.35),
           note(9.3, 'HE WANTS TO START OVER', 'yellow', 'pop', 0.4), note(13.0, '98% COMPLETE 😳', 'green', 'riser', 0.35),
           note(15.5, 'LOAD THAT ONE...', 'yellow', 'tick_tock', 0.35), note(17.6, 'OVERWRITE?!', 'red', 'record_scratch', 0.5),
           note(20.5, 'IT\'S GONE 💀', 'red', 'sad_trombone', 0.45)],
    stickers=[emo(1.2, '🎮'), gif(7.5, 'look_at_this'), emo(11.0, '🤔', BL), gif(14.0, 'this_is_it'), gif(18.6, 'cheems_cry'), emo(21.6, '💀', BL)],
    fxs=[fx(6.4, 'punch'), fx(9.0, 'punch'), fx(12.8, 'punch'), fx(17.6, 'shake'), fx(17.8, 'flash'), fx(20.5, 'tint_r')],
    box='speed', teaser=[17.5, 19.6], music=('funny/sneaky_snitch.mp3', 0.07, 0))
# s2 (B: no name) "not gonna crash once"
P['pixel_crash'] = short('ohnepixel_16', "He Promised He Wouldn't Crash in GTA 6 💀 #gta6", "\"I WON'T CRASH ONCE\"",
    [[0.0, 4.2], [12.4, 14.2], [16.0, 19.0], [21.5, 24.5], [26.5, 29.5], [29.6, 33.2], [35.0, 45.0]],
    notes=[note(0.4, 'LOCKED IN 🔒', 'green', 'pop', 0.4), note(2.2, 'NOT ONE CRASH?', 'yellow', 'what', 0.4),
           note(12.5, '3... 2... 1...', 'white', 'tick_tock', 0.35), note(16.3, 'SO FAR SO GOOD', 'green', 'pop', 0.35),
           note(21.8, 'CAREFUL...', 'yellow', 'heartbeat', 0.35), note(26.8, 'TOO FAST 😬', 'red', 'riser', 0.35),
           note(31.1, '"NOT MY FAULT"', 'yellow', 'record_scratch', 0.5), note(35.5, 'ON THE WALL 💀', 'red', 'bonk', 0.45),
           note(40.0, 'CLEAN DRIVING 10/10', 'white', 'rimshot', 0.4)],
    stickers=[emo(1.0, '🚗'), gif(13.0, 'prayer'), emo(18.0, '😎', BL), gif(23.0, 'look_at_this'), emo(28.5, '😬', BL),
              gif(32.0, 'troll1'), gif(37.0, 'mona_laugh'), emo(42.0, '💀', BL)],
    fxs=[fx(12.4, 'punch'), fx(16.0, 'punch'), fx(21.5, 'punch'), fx(26.5, 'punch'), fx(30.0, 'shake'), fx(30.2, 'flash'), fx(35.0, 'shake'), fx(41.0, 'tint_y')],
    box='pixel', teaser=[29.8, 32.4], music=('funny/quirky_dog.mp3', 0.07, 0))
# s3 (B) gas station glitch, no cam -> blur. Cut 4.0-8.4 (crude NPC subtitle + strong swear).
P['zoreee_glitch'] = short('zoreee_07', "This GTA 6 Gas Station Glitch Makes No Sense 😭 #gta6", "GAS STATION GLITCH ⛽",
    [[0.4, 3.0], [8.4, 15.0]],
    notes=[note(0.5, 'JUST GETTING GAS ⛽', 'white', 'pop', 0.4), note(1.6, 'WAIT WHAT', 'yellow', 'glitch', 0.45),
           note(2.3, 'INSIDE THE CAR?? 😳', 'yellow', 'what', 0.4, dur=0.7), note(8.6, 'HOW 😭', 'red', 'record_scratch', 0.5),
           note(10.8, 'MY CAR!', 'red', 'bonk', 0.4), note(13.0, 'ROCKSTAR PLS', 'white', 'rimshot', 0.4)],
    stickers=[emo(0.9, '⛽'), gif(2.2, 'black_cat'), gif(9.4, 'anim3', BL), emo(12.0, '💀'), gif(14.0, 'troll2', BL)],
    fxs=[fx(1.5, 'shake'), fx(8.4, 'punch'), fx(9.0, 'flash'), fx(11.5, 'punch'), fx(13.5, 'tint_y')],
    teaser=[8.6, 10.6], music=('funny/pixelland.mp3', 0.08, 0))
# s4 (A: name) Lacy and the furry
P['lacy_furry'] = short('lacy_14', "Lacy Found a FURRY Loose in GTA 6 💀 #gta6", "A FURRY IS LOOSE 🦊",
    [[3.0, 9.2], [9.8, 13.8], [14.6, 17.4], [22.6, 24.6], [32.7, 36.0]],
    notes=[note(3.2, 'POLICE RADIO 🚨', 'white', 'pop', 0.4), note(6.2, 'CHECK YOUR PETS 😭', 'yellow', 'what', 0.4),
           note(9.9, 'THERE IT IS', 'yellow', 'pop', 0.4), note(12.0, 'SURROUNDED 🚔', 'red', 'riser', 0.35),
           note(14.8, '"PAWS IN THE AIR"', 'yellow', 'record_scratch', 0.45), note(22.8, 'FREE THE FUR ✊', 'green', 'airhorn', 0.35),
           note(33.0, 'NO SURRENDER 💀', 'red', 'dun_dun_duun', 0.45)],
    stickers=[emo(4.5, '🚨'), gif(7.5, 'black_cat', BL), gif(11.0, 'look_at_this'), emo(16.0, '🦊', BL),
              gif(23.5, 'cat_applause'), gif(34.3, 'mona_laugh', BL)],
    fxs=[fx(9.8, 'punch'), fx(14.6, 'shake'), fx(22.6, 'punch'), fx(22.8, 'flash'), fx(32.7, 'punch'), fx(34.0, 'tint_r')],
    box='lacy', teaser=[22.7, 24.6], music=('funny/scheming_weasel_faster_version.mp3', 0.07, 0),
    rep={15.4: 'fox!', 16.8: 'ground!'})
# s5 (B) NPC rides into the car door; drop 'you asshole' from captions and bleep it
P['zoreee_bike'] = short('zoreee_10', "He Didn't Even Move... GTA 6 NPCs Are Wild 💀 #gta6", "HE DIDN'T MOVE 😭",
    [[0.0, 3.8], [5.4, 8.4], [13.0, 16.0], [17.8, 21.2]],
    notes=[note(0.2, 'NEW TO PLAYSTATION 🎮', 'white', 'pop', 0.4), note(2.4, 'WHAT IS L3??', 'yellow', 'what', 0.4),
           note(5.6, 'BIKE INCOMING 🚲', 'red', 'bonk', 0.45), note(7.2, 'HE\'S MAD 😡', 'red', 'record_scratch', 0.45), note(13.3, 'WHAT IS HE DOING', 'yellow', 'what', 0.4),
           note(18.0, 'HE DID IT HIMSELF 💀', 'green', 'rimshot', 0.4)],
    stickers=[emo(1.0, '🎮'), gif(6.5, 'anim3', BL), emo(14.5, '😳', BL), gif(16.0, 'black_cat'), gif(19.5, 'troll1', BL)],
    fxs=[fx(5.4, 'punch'), fx(6.0, 'shake'), fx(7.2, 'punch'), fx(13.0, 'punch'), fx(17.8, 'punch'), fx(19.0, 'tint_y')],
    teaser=[5.2, 7.4], music=('funny/run_amok.mp3', 0.07, 0), extra_bleep=[[8.25, 8.95]], rep={8.3: ''})
save(P)
