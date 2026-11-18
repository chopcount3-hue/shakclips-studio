# helpers for the GTA 6 launch-day Shorts plans (edit.py reference style)
import json, re
HQ = '/home/claude/untrusted/launch/hq/'; G = '/home/claude/gta6vid/gifs/'; BGM = '/home/claude/clipper/bgm/'
BOX = json.load(open('/home/claude/launch/boxes.json'))
SWEAR = re.compile(r"^(fuck|fucking|fucked|fuckin|motherfuck|motherfucker|motherfucking|shit|bullshit|bitch|nigga|nigger|dick|pussy)\W*$", re.I)
GREEN = ['GTA', 'SIX', '6', 'VI', 'GOOD', 'INSANE', 'CRAZY', 'GENERATIONAL', 'PLAYING', 'PLAY', 'GAME', 'FINALLY', 'TIME', 'READY', 'YES', 'GRAPHICS', 'BEAUTIFUL', 'IN', 'GO', 'FIRE', 'HYPE', 'REAL', 'HAPPENED', 'WE', 'MADE', 'IT']
YELLOW = ['OH', 'MY', 'GOSH', 'GOD', 'WOW', 'BRO', 'CHAT', 'WAIT', 'WHAT', 'YO', 'HOLY', 'YEARS', 'MINUTES', 'MINUTE', 'SECONDS', 'TEN', 'TWO', 'ONE', 'THREE', 'FIVE', 'FOUR', 'NINE', 'EIGHT', 'SEVEN', '13', '30', 'FPS']
RED = ['NO', 'NAH', 'MISTAKE', 'CLUNKY', 'DEPRESSED', 'FIRE?', "CAN'T", 'WORK', 'PLEASE']
COLS = {**{k: 'yellow' for k in YELLOW}, **{k: 'green' for k in GREEN}, **{k: 'red' for k in RED}}

def words(f):
    return json.load(open(HQ + f + '.words.json'))['segments'][0]['words']

def bleeps(f, ranges):
    """audio spans of strong swears inside the kept ranges"""
    out = []
    for w in words(f):
        if SWEAR.match(w['w'].strip(" ,.!?'\"")) and w['w'].lower().strip(" ,.!?'\"") not in ('shit',):
            if any(a <= w['s'] < b for a, b in ranges): out.append([round(w['s'] - 0.03, 2), round(w['e'] + 0.03, 2)])
    return out

def note(t, text, color='yellow', sfx='pop', gain=0.45, dur=1.5, y=0.12, rot=-3):
    return dict(src_t=t, text=text, color=color, sfx=sfx, gain=gain, dur=dur, y=y, rot=rot)

BR, BL = [0.74, 0.33], [0.03, 0.33]
def gif(t, name, pos=BR, size=250, dur=1.6): return dict(src_t=t, gif=G + name + '.gif', pos=pos, size=size, dur=dur)
def emo(t, ch, pos=BR, size=210, dur=1.4): return dict(src_t=t, emoji=ch, pos=pos, size=size, dur=dur)
def fx(t, kind): return {'src_t': t, 'type': kind}

def base(user, f, music=None, bottom=None):
    b = BOX[user]
    return {'source': HQ + f + '.mp4', 'transcript': HQ + f + '.words.json', 'asr': '', 'min_word_prob': 0.5, 'min_narration': 0,
            'layout': 'split', 'top': b['top'], 'bottom': bottom or b['bottom'],
            'cap_mode': 'single', 'cap_size': 132, 'cap_colors': COLS, 'hook_size': 80, 'note_size': 92,
            'sfx_dirs': ['/home/claude/clipper/sfx/drive', '/home/claude/clipper/sfx/made', '/home/claude/clipper/sfx/cc0'],
            'cut_sfx': {'name': 'swipe_swoosh_transition', 'gain': 0.22, 'every': 3},
            **({'music': {'file': BGM + music[0], 'gain': music[1], 'from': music[2]}} if music else {})}

DROP = {'cuckery'}
def fixed(f, rep=None):
    """captions I have read: trust every word (p=1), apply replacements {time: 'word' or ''}, drop junk; returns the path"""
    rep = rep or {}; out = []
    for w in words(f):
        k = round(w['s'], 1)
        if k in rep:
            if not rep[k]: continue
            w = dict(w, w=rep[k])
        if w['w'].lower().strip('?') in DROP: continue
        out.append(dict(w, p=1.0))
    path = HQ + f + '.fixed.json'; json.dump({'segments': [{'s': 0, 'e': 9999, 't': '', 'words': out}]}, open(path, 'w')); return path

def short(user, f, title, hook, ranges, notes, stickers, fxs, teaser=None, music=None, sfx=(), bottom=None, extra_bleep=(), rep=None, **k):
    p = base(user, f, music, bottom); p['transcript'] = fixed(f, rep)
    c = dict(title=title, hook=hook, ranges=ranges, notes=notes, stickers=stickers, fx=fxs, sfx=list(sfx),
             bleep=bleeps(f, ranges) + list(extra_bleep), max_len=59, min_len=6, max_untouched=4.0, jump_cuts=False, **k)
    if teaser: c['teaser'] = teaser
    p['clips'] = [c]; return p
