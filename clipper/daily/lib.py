# Plan helpers for the daily GTA 6 Shorts (edit.py reference style). Import from a plan script:
#   import sys; sys.path.insert(0, '/home/claude/clipper/daily'); from lib import *
import json, os, re
WORK = os.environ.get('WORK', '/home/claude/gtaday'); CL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HQ = WORK + '/clips/'; TX = WORK + '/tx/'; G = CL + '/stickers/'; BGM = CL + '/bgm/'
BOXF = WORK + '/boxes.json'
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

def note(t, text, color='yellow', sfx='pop', gain=0.45, dur=1.5, y=0.12, rot=-3):
    return dict(src_t=t, text=text, color=color, sfx=sfx, gain=gain, dur=dur, y=y, rot=rot)
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

def short(f, title, hook, ranges, notes, stickers, fxs, box=None, teaser=None, music=None, sfx=(), extra_bleep=(), rep=None, **k):
    """one Short from clip f. box = key in $WORK/boxes.json ({"top": [x,y,w,h] webcam, "bottom": [x,y,w,h] game, 1920x1080
    coords, bottom box kept above y=1000 because Twitch burns a caption pill there}); box=None -> 'blur' layout (no webcam)."""
    b = boxes().get(box) if box else None
    p = {'source': HQ + f + '.mp4', 'transcript': fixed(f, rep), 'asr': '', 'min_word_prob': 0.5, 'min_narration': 0,
         'cap_mode': 'single', 'cap_size': 132, 'cap_colors': COLS, 'hook_size': 80, 'note_size': 92,
         'sfx_dirs': [CL + '/sfx/made', CL + '/sfx/drive', CL + '/sfx/cc0'],
         'cut_sfx': {'name': 'swipe_swoosh_transition', 'gain': 0.22, 'every': 3}}
    if b: p.update(layout='split', top=b['top'], bottom=b['bottom'])
    else: p.update(layout='blur')
    if music: p['music'] = {'file': BGM + music[0], 'gain': music[1], 'from': music[2]}
    c = dict(title=title, hook=hook, ranges=ranges, notes=notes, stickers=stickers, fx=fxs, sfx=list(sfx),
             bleep=bleeps(f, ranges) + list(extra_bleep), max_len=59, min_len=6, max_untouched=4.0, jump_cuts=False, **k)
    if teaser: c['teaser'] = teaser
    p['clips'] = [c]; return p

def save(plans, outdir=WORK + '/plans'):
    os.makedirs(outdir, exist_ok=True)
    for k, p in plans.items(): json.dump(p, open(f'{outdir}/plan_{k}.json', 'w'), indent=1, ensure_ascii=False)
    print(len(plans), 'plans ->', outdir)
