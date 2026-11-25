# Plan helpers for the daily GTA 6 Shorts (edit.py reference style). Import from a plan script:
#   import sys; sys.path.insert(0, '/home/claude/clipper/daily'); from lib import *
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
WORK = os.environ.get('WORK', '/home/claude/gtaday'); CL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HQ = WORK + '/clips/'; TX = WORK + '/tx/'; G = CL + '/stickers/'; BGM = CL + '/bgm/'
BOXF = WORK + '/boxes.json'
# The owner's own SFX pack (owner, 21 Nov: "you are not using the sfx i gave you"). Its 148 low-risk sounds come FIRST;
# the 30 marked "avoid" in sfx/user/index.md (branded game sounds, music, creator voice clips) are left out (Content ID).
USER_SAFE = WORK + '/sfx_user_safe'
def _user_safe():
    os.makedirs(USER_SAFE, exist_ok=True)
    for l in open(CL + '/sfx/user/index.md'):
        c = [x.strip() for x in l.strip().strip('|').split('|')]
        if len(c) >= 5 and c[0].endswith('.ogg') and c[4] == 'low':
            d = os.path.join(USER_SAFE, c[0])
            if not os.path.exists(d): os.symlink(CL + '/sfx/user/' + c[0], d)
_user_safe()
SFX_DIRS = [USER_SAFE, CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0']
# old synthetic names -> the owner's sound for the same job (so older plans and habits still pick his pack)
OWN = {'pop': 'poink', 'riser': 'rising', 'record_scratch': 'dj_scratch', 'boom': 'bass_boosted', 'bonk': 'bamboo_hit',
       'sad_trombone': 'wah_wah_wah', 'airhorn': 'air_r_horn', 'buzzer_wrong': 'wrong', 'ding_correct': 'correct',
       'cha_ching': 'cash_register', 'rimshot': 'ba_dum_tss', 'drumroll_crash': 'drum_roll', 'dun_dun_duun': 'dun_dun_dunnn',
       'tick_tock': 'ticking_clock', 'boing': 'spring_cartoon', 'slide_up': 'slide_whistle', 'slide_down': 'cartoon_deflate',
       'zip_away': 'goofy_cartoon_dash_1', 'clown_honk': 'bike_horn', 'wow_choir': 'wow_1', 'glitch': 'tape_rewind',
       'whoosh': 'whoosh_transition', 'swoosh': 'swipe_swoosh_transition', 'laugh': 'audience_laughing', 'fail': 'fail_titanic'}
def own(name): return OWN.get(name, name)
SWEAR = re.compile(r"^(fuck|fucking|fucked|fuckin|motherfuck|motherfucker|motherfucking|bitch|nigga|nigger|dick|pussy|cunt|faggot|retard)\W*$", re.I)
GREEN = ['GTA', 'SIX', '6', 'VI', 'GOOD', 'INSANE', 'CRAZY', 'PLAYING', 'GAME', 'FINALLY', 'YES', 'GRAPHICS', 'BEAUTIFUL', 'GO', 'FIRE', 'REAL', 'WE', 'W']
YELLOW = ['OH', 'MY', 'GOSH', 'GOD', 'WOW', 'BRO', 'CHAT', 'WAIT', 'WHAT', 'YO', 'HOLY', 'BRUH', 'HUH']
RED = ['NO', 'NAH', "CAN'T", 'PLEASE', 'STOP', 'RUN', 'COPS', 'POLICE', 'DEAD', 'DIED']
COLS = {**{k: 'yellow' for k in YELLOW}, **{k: 'green' for k in GREEN}, **{k: 'red' for k in RED}}
BR, BL = [0.74, 0.33], [0.03, 0.33]

def boxes():
    return json.load(open(BOXF)) if os.path.exists(BOXF) else {}

def words(f): return json.load(open(TX + f + '.json'))['segments'][0]['words']

def bleeps(f, ranges):
    """strong swears and slurs inside the kept ranges -> censor-beep spans (mild words like 'shit' stay)"""
    out = []
    for w in words(f):
        if SWEAR.match(w['w'].strip(" ,.!?'\"")) and any(a <= w['s'] < b for a, b in ranges):
            out.append([round(w['s'] - 0.03, 2), round(w['e'] + 0.03, 2)])
    return out

def note(t, text, color='yellow', sfx='poink', gain=0.45, dur=1.5, y=0.12, rot=-3):
    return dict(src_t=t, text=text, color=color, sfx=own(sfx), gain=gain, dur=dur, y=y, rot=rot)
def gif(t, name, pos=BR, size=250, dur=1.6): return dict(src_t=t, gif=G + name + '.gif', pos=pos, size=size, dur=dur)
def emo(t, ch, pos=BR, size=210, dur=1.4): return dict(src_t=t, emoji=ch, pos=pos, size=size, dur=dur)
def fx(t, kind): return {'src_t': t, 'type': kind}   # punch | shake | flash | tint | tint_y | tint_r

def fixed(f, rep=None):
    """captions you have READ: every word trusted (p=1); rep = {round(start, 1): 'word' or ''} fixes or drops words"""
    rep = rep or {}; out = []
    for w in words(f):
        k = round(w['s'], 1)
        if k in rep:
            if not rep[k]: continue
            w = dict(w, w=rep[k])
        out.append(dict(w, p=1.0))
    path = TX + f + '.fixed.json'; json.dump({'segments': [{'s': 0, 'e': 9999, 't': '', 'words': out}]}, open(path, 'w')); return path

def streamer_name(f):
    """display name for clip f (login_NN) from $WORK/cands.json, else the login"""
    try:
        for c in json.load(open(WORK + '/cands.json')):
            if c.get('name') == f: return c['broadcaster'].get('displayName') or c['broadcaster']['login']
    except Exception: pass
    return f.rsplit('_', 1)[0]

def zoomto(t, x, y, z=1.9, dur=2.2):
    """push into a point of the SOURCE picture (x, y = 0-1, e.g. a streamer's webcam face) at source time t, hold, ease out"""
    return {'src_t': t, 'type': f'zoomto:{x:.3f}:{y:.3f}:{z:.2f}:{dur:.2f}'}

def short(f, title, hook, ranges, notes, stickers, fxs, box=None, teaser=None, music=None, sfx=(), extra_bleep=(), rep=None, frame=False, context=None, zoom=1.0, **k):
    """one Short from clip f. box = key in $WORK/boxes.json ({"top": [x,y,w,h] webcam, "bottom": [x,y,w,h] game, 1920x1080
    coords, bottom box kept above y=1000 because Twitch burns a caption pill there}); box=None -> 'blur' layout (no webcam).
    With a box the Short uses the branded frame (frame_style.py): aim the top box at aspect ~1.5 (cam window 1020x680)
    and the bottom box at ~1.28 (game window 1020x796); other aspects are centre-cropped. frame=False -> plain split.
    context = the frame's title bar, on screen the whole video: what the clip is about in 4-9 words, no punchline,
    *stars* make a word yellow, e.g. "SQUEEX SAID WATCH THIS *COOL TRICK*...". Default: the title without hashtags.
    DEFAULT NOW (owner, 25 Nov: no frame): the 'fit' style. The whole stream picture is fit to the width (zoom > 1 trims
    the sides) on a blurred copy of itself, with a fixed white title box above it (context = its text, *word* = red).
    Use zoomto(...) fxs to push into a streamer's face on reactions. frame=True brings the old branded frame back
    (needs box); frame='split' gives the plain cam/game split."""
    b = boxes().get(box) if box else None
    p = {'source': HQ + f + '.mp4', 'transcript': fixed(f, rep), 'asr': '', 'min_word_prob': 0.5, 'min_narration': 0,
         'cap_mode': 'single', 'cap_size': 132, 'cap_colors': COLS, 'hook_size': 80, 'note_size': 92,
         'sfx_dirs': SFX_DIRS,
         'cut_sfx': {'name': 'swipe_swoosh_transition', 'gain': 0.22, 'every': 3}}
    if b and frame is True:   # old branded Shak Replay frame (only when asked)
        import frame_style as FS
        login = f.rsplit('_', 1)[0]; name = streamer_name(f)
        p.update(layout='framed', top=b['top'], bottom=b['bottom'],
                 frame={'png': FS.make(login, name, context if context is not None else re.sub(r'#\S+', '', title).strip()), 'cam': list(FS.CAM), 'game': list(FS.GAME), 'cap_y': FS.CAP_Y})
    elif b and frame == 'split': p.update(layout='split', top=b['top'], bottom=b['bottom'])
    else:                     # fit + blurred background + fixed title box
        import titlebox as TB
        p.update(layout='blur', zoom=zoom)
        fh = int(int(1080 * zoom) // 2 * 2 * 9 / 16) // 2 * 2; yc = (1920 - fh) // 2 - 60
        tb = context if context is not None else re.sub(r'#\S+', '', title).strip()
        if tb: p['title_png'] = TB.make(tb, bottom=yc - 26); hook = ''
        notes = [dict(n, y=0.37) if abs(n.get('y', 0.12) - 0.12) < 1e-6 else n for n in notes]   # notes over the video, not the title
    if music: p['music'] = {'file': BGM + music[0], 'gain': music[1], 'from': music[2]}
    c = dict(title=title, hook=hook, ranges=ranges, notes=notes, stickers=stickers, fx=fxs, sfx=[dict(x, name=own(x['name'])) if isinstance(x, dict) and 'name' in x else x for x in sfx],
             bleep=bleeps(f, ranges) + list(extra_bleep), max_len=59, min_len=6, max_untouched=4.0, jump_cuts=False, **k)
    if teaser: c['teaser'] = teaser
    p['clips'] = [c]; return p

def save(plans, outdir=WORK + '/plans'):
    os.makedirs(outdir, exist_ok=True)
    for k, p in plans.items(): json.dump(p, open(f'{outdir}/plan_{k}.json', 'w'), indent=1, ensure_ascii=False)
    print(len(plans), 'plans ->', outdir)
