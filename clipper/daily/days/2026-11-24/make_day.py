import sys; sys.path.insert(0, '/home/claude/studio/clipper/daily')
from lib import *
P = {}
_n = note
def note(*a, **k): k.setdefault('y', 0.175); return _n(*a, **k)   # 2-line context title: notes below it
# S1 (experiment 2026-11-24, variant A = MUSIC BED): CaseOh seaplane flips on landing and survives. 0 Short copies.
# 0-3.0 cut: burned-in NPC subtitle "Always gotta fuckin' push it!".
P['caseoh_plane'] = short('caseoh__08', "CaseOh Tried to Land a Seaplane in GTA 6 ✈️ #gta6 #shorts", "LANDING IT ✈️",
    [[3.0, 10.5], [11.5, 16.5], [26.5, 34.8]],
    notes=[note(3.1, 'TIME TO LAND ✈️', 'white', 'whoosh_transition', 0.35),
           note(5.0, 'A LITTLE FAST...', 'yellow', 'ticking_clock', 0.35),
           note(6.6, 'WAIT', 'red', 'what', 0.45, dur=1.0),
           note(7.9, 'IT FLIPPED 💀', 'red', 'bone_crack', 0.45, dur=1.3),
           note(9.6, 'GG?', 'white', 'wah_wah_wah', 0.35, dur=0.7),
           note(11.6, 'HOLD ON...', 'yellow', 'mystery', 0.35),
           note(13.3, 'IT\'S... FINE?? 😳', 'yellow', 'nani', 0.4, dur=1.4),
           note(15.2, 'NOT A SCRATCH', 'green', 'tadaa', 0.4, dur=0.7),
           note(26.6, 'HOW DID IT SURVIVE?', 'yellow', 'drum_roll', 0.35),
           note(28.6, '"DON\'T QUESTION IT"', 'white', 'ba_dum_tss', 0.4, dur=1.6),
           note(30.8, '"JUST ACCEPT IT" 😭', 'green', 'audience_laughing', 0.3, dur=1.6),
           note(32.9, 'ROCKSTAR PHYSICS 🧠', 'yellow', 'correct', 0.4, dur=1.2)],
    stickers=[emo(4.0, '✈️'), gif(6.8, 'look_at_this', BL), emo(8.6, '💀'), gif(12.2, 'troll1', BL), emo(14.2, '😳'),
              gif(27.5, 'mona_laugh'), emo(31.5, '🧠', BL), gif(33.6, 'cat_applause')],
    fxs=[fx(3.1, 'punch'), fx(6.6, 'punch'), fx(7.9, 'shake'), fx(9.6, 'tint'), fx(11.6, 'punch'), fx(13.3, 'flash'),
         fx(26.6, 'punch'), fx(28.6, 'punch'), fx(30.8, 'shake'), fx(32.9, 'punch')],
    box='caseoh', context="CASEOH tries to *land a seaplane*...", teaser=[7.2, 9.4],
    music=('funny/fluffing_a_duck.mp3', 0.07, 0))
def note(*a, **k): k['y'] = 0.135; return _n(*a, **k)   # 1-line context: notes higher, off Jynxzi's eyes
# S2 (variant B = NO MUSIC: game audio + owner SFX only): Jynxzi's first sight of the GTA VI logo. 1 Short copy.
P['jynxzi_logo'] = short('jynxzi_15', "Jynxzi Saw GTA 6 Start for the First Time 😭 #gta6 #shorts", "FIRST TIME 🎮",
    [[0.0, 15.0]],
    notes=[note(0.1, 'DAY ONE 🎮', 'yellow', 'poink', 0.4, dur=1.4),
           note(2.0, 'THE INTRO...', 'white', 'drum_roll', 0.35, dur=1.3),
           note(3.5, 'HERE IT COMES', 'yellow', 'heartbeat', 0.35, dur=1.3),
           note(5.0, 'THE LOGO 😭', 'red', 'wow_1', 0.45, dur=1.4),
           note(6.7, '12 YEARS OF WAITING', 'yellow', 'celebration', 0.35, dur=1.6),
           note(8.6, 'HE CAN\'T BELIEVE IT', 'white', 'nani', 0.35, dur=1.4),
           note(10.3, 'AND WE\'RE IN 🔥', 'green', 'tadaa', 0.35, dur=1.4),
           note(12.2, '"NOT MY CAR" 💀', 'yellow', 'ba_dum_tss', 0.4, dur=1.4),
           note(13.9, 'ICONIC', 'green', 'bloop', 0.35, dur=0.7)],
    stickers=[emo(1.0, '🎮'), gif(4.2, 'look_at_this', BL), emo(6.0, '😭'), gif(8.0, 'cat_applause'), emo(11.0, '🔥', BL),
              gif(12.8, 'troll2')],
    fxs=[fx(0.1, 'punch'), fx(3.5, 'tint'), fx(5.0, 'punch'), fx(6.7, 'flash'), fx(8.6, 'shake'), fx(10.3, 'punch'), fx(12.2, 'punch')],
    box='jynxzi', rep={0.1: '', 0.2: '', 1.6: '', 1.7: '', 1.9: '', 5.2: '', 5.3: '', 5.7: ''}, context="JYNXZI sees GTA 6 *for the first time*...", teaser=[5.0, 7.3])
save(P)
