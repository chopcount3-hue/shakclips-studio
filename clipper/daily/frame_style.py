#!/usr/bin/env python3
"""Shak Replay branded split frame for Shorts (owner, 21 Nov: "custom frame ... upper side for webcam and lower for
gameplay, dashing best edited frame" + "a text context that gives idea [what] each video is about"). Renders a 1080x1920
RGBA overlay: dark Vice-City backdrop, SHAK REPLAY brand row, a CONTEXT title (1-2 lines, *starred* words in yellow) that
stays on screen the whole video, two rounded neon-bordered windows (webcam on top, gameplay below; transparent so the
video shows through), a caption lane between them and a streamer tag. render.py layout "framed" puts the video under it.
usage: python3 frame_style.py <twitch_login> "<Display Name>" "<context text>" [out.png]   (cached in $WORK/frames_style/)"""
import os, sys, re, hashlib
from PIL import Image, ImageDraw, ImageFilter, ImageFont
W, H = 1080, 1920
CAM = (30, 206, 1020, 680)     # x, y, w, h of the webcam window   (aspect 1.5)
GAME = (30, 1006, 1020, 796)   # gameplay window                    (aspect 1.28)
CAP_Y = 946                    # caption lane centre (between the windows)
R = 38                         # corner radius
PINK, CYAN, PURPLE = (255, 46, 136), (34, 211, 238), (145, 70, 255)
HERE = os.path.dirname(os.path.abspath(__file__)); FONTS = [os.path.join(os.path.dirname(HERE), 'fonts'), os.path.expanduser('~/.fonts')]

def font(name, size):
    for d in FONTS:
        p = os.path.join(d, name)
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def rr(box, r, fill=255, size=(W, H)):
    m = Image.new('L', size, 0); x, y, w, h = box
    ImageDraw.Draw(m).rounded_rectangle([x, y, x + w - 1, y + h - 1], r, fill=fill); return m

def hgrad(c1, c2, size=(W, H)):
    g = Image.new('RGB', (size[0], 1)); px = g.load()
    for x in range(size[0]):
        t = x / (size[0] - 1); px[x, 0] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return g.resize(size)

def backdrop():
    bg = Image.new('RGB', (W, H)); px = bg.load()
    top, mid, bot = (22, 10, 44), (9, 12, 30), (30, 9, 34)
    for y in range(H):
        t = y / (H - 1); a, b, u = (top, mid, t * 2) if t < 0.5 else (mid, bot, (t - 0.5) * 2)
        c = tuple(int(a[i] + (b[i] - a[i]) * u) for i in range(3))
        for x in range(W): px[x, y] = c
    bg = bg.convert('RGBA'); d = ImageDraw.Draw(over := Image.new('RGBA', (W, H), (0, 0, 0, 0)))
    for k in range(-H, W + H, 46):            # faint diagonal speed stripes
        d.line([(k, 0), (k + H * 0.55, H)], fill=(255, 255, 255, 9), width=14)
    for yy in range(14, H, 28):              # dot grid
        for xx in range(14, W, 28): d.point((xx, yy), fill=(255, 255, 255, 22))
    bg = Image.alpha_composite(bg, over)
    sun = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sun)   # sunset glow behind the caption lane
    ds.ellipse([W / 2 - 520, CAP_Y - 120, W / 2 + 520, CAP_Y + 120], fill=PINK + (70,))
    return Image.alpha_composite(bg, sun.filter(ImageFilter.GaussianBlur(70)))

def window(img, box):
    """neon glow + pink->cyan stroke around a window, then punch the window transparent"""
    x, y, w, h = box
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); grad = hgrad(PINK, CYAN).convert('RGBA')
    ring = rr((x - 9, y - 9, w + 18, h + 18), R + 9); ring.paste(0, mask=rr(box, R))
    g = Image.composite(grad, glow, ring.filter(ImageFilter.MaxFilter(9))).filter(ImageFilter.GaussianBlur(22))
    img = Image.alpha_composite(img, g); img = Image.alpha_composite(img, g)
    stroke = rr((x - 7, y - 7, w + 14, h + 14), R + 7); stroke.paste(0, mask=rr(box, R))
    img = Image.composite(grad, img, stroke)
    hole = rr(box, R); a = img.getchannel('A'); a.paste(0, mask=hole); img.putalpha(a)
    # corner ticks (viewfinder) just inside the window
    d = ImageDraw.Draw(img); L, t = 46, 5
    for cx, cy, sx, sy in ((x + 22, y + 22, 1, 1), (x + w - 23, y + 22, -1, 1), (x + 22, y + h - 23, 1, -1), (x + w - 23, y + h - 23, -1, -1)):
        d.line([(cx, cy), (cx + sx * L, cy)], fill=(255, 255, 255, 150), width=t); d.line([(cx, cy), (cx, cy + sy * L)], fill=(255, 255, 255, 150), width=t)
    return img

def wrap(d, words, f, maxw):
    lines, cur = [], []
    for w in words:
        t = ' '.join(x for x, _ in cur + [w])
        if cur and d.textlength(t, font=f) > maxw: lines.append(cur); cur = [w]
        else: cur.append(w)
    return lines + ([cur] if cur else [])

def header(img, context=''):
    d = ImageDraw.Draw(img); f = font('LilitaOne-Regular.ttf', 44); y = 16; x = 44
    sw = d.textlength('SHAK ', font=f)
    d.text((x + 3, y + 4), 'SHAK REPLAY', font=f, fill=(0, 0, 0, 170))
    d.text((x, y), 'SHAK ', font=f, fill=(255, 255, 255, 255)); d.text((x + sw, y), 'REPLAY', font=f, fill=PINK + (255,))
    rx = x + d.textlength('SHAK REPLAY', font=f) + 12; d.ellipse([rx, y + 20, rx + 12, y + 32], fill=(255, 59, 59, 255))
    fb = font('BebasNeue-Regular.ttf', 34); t = 'GTA VI  CLIPS'; tw = d.textlength(t, font=fb)
    bx1 = W - 44; bx0 = bx1 - tw - 34
    d.rounded_rectangle([bx0, 18, bx1, 62], 13, fill=PINK + (255,)); d.text((bx0 + 17, 22), t, font=fb, fill=(255, 255, 255, 255))
    # context title: what this video is about; *word* = yellow highlight; auto-fits 1-2 lines
    ctx = re.sub(r'[^\x20-\x7E\u2019\u2018]', '', context or '').strip()
    if not ctx: return img
    words, on = [], False   # *multi word spans*, also when punctuation follows the closing star ("*this exit*...")
    for w in ctx.upper().split():
        st = w.startswith('*'); en = w.rstrip('.,!?:;…').endswith('*') and (len(w.strip('.,!?:;…')) > 1)
        words.append((w.replace('*', ''), on or st or en)); on = (on or st) and not en
    box_top, box_bot, maxw = 74, 192, W - 100
    for size in range(64, 33, -2):
        fc = font('LilitaOne-Regular.ttf', size); lines = wrap(d, words, fc, maxw)
        if len(lines) <= 2 and len(lines) * size * 1.08 <= box_bot - box_top - 8: break
    lh = int(size * 1.08); y0 = box_top + (box_bot - box_top - lh * len(lines)) // 2 - 2
    plate = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dp = ImageDraw.Draw(plate)
    dp.rounded_rectangle([30, box_top, W - 30, box_bot], 22, fill=(0, 0, 0, 120)); img = Image.alpha_composite(img, plate); d = ImageDraw.Draw(img)
    for i, ln in enumerate(lines):
        lw = d.textlength(' '.join(w for w, _ in ln), font=fc); cx = (W - lw) / 2; yy = y0 + i * lh
        for w, hi in ln:
            d.text((cx, yy), w, font=fc, fill=(255, 212, 0, 255) if hi else (255, 255, 255, 255), stroke_width=4, stroke_fill=(0, 0, 0, 255))
            cx += d.textlength(w + ' ', font=fc)
    return img

def tag(img, login, name):
    """streamer name tag sitting on the webcam window's bottom-left corner"""
    x, y, w, h = CAM; f = font('LilitaOne-Regular.ttf', 40); fs = font('BebasNeue-Regular.ttf', 30)
    d0 = ImageDraw.Draw(img); tw = max(d0.textlength(name.upper(), font=f), d0.textlength('TWITCH.TV/' + login.upper(), font=fs))
    px0, py1 = x + 24, y + h - 24; pw, ph = int(tw) + 118, 100; py0 = py1 - ph
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([px0 + 4, py0 + 6, px0 + pw + 4, py1 + 6], 24, fill=(0, 0, 0, 150))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(8))); d = ImageDraw.Draw(img)
    d.rounded_rectangle([px0, py0, px0 + pw, py1], 24, fill=(12, 8, 26, 225), outline=PURPLE + (255,), width=4)
    ix, iy = px0 + 18, py0 + 20; d.rounded_rectangle([ix, iy, ix + 60, iy + 60], 14, fill=PURPLE + (255,))
    d.rectangle([ix + 22, iy + 16, ix + 28, iy + 38], fill=(255, 255, 255, 255)); d.rectangle([ix + 36, iy + 16, ix + 42, iy + 38], fill=(255, 255, 255, 255))
    d.text((ix + 78, py0 + 10), name.upper(), font=f, fill=(255, 255, 255, 255))
    d.text((ix + 79, py0 + 58), 'TWITCH.TV/' + login.upper(), font=fs, fill=(196, 170, 255, 255))
    return img

def make(login, name=None, context='', out=None):
    name = name or login
    key = hashlib.sha1(f'{login}|{name}|{context}|v2'.encode()).hexdigest()[:10]
    out = out or os.path.join(os.environ.get('WORK', '/home/claude/gtaday'), 'frames_style', f'{login.lower()}_{key}.png')
    if os.path.exists(out): return out
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img = backdrop(); img = window(img, CAM); img = window(img, GAME); img = header(img, context); img = tag(img, login, name)
    img.save(out); return out

if __name__ == '__main__':
    a = sys.argv[1:]; print(make(a[0], a[1] if len(a) > 1 else None, a[2] if len(a) > 2 else '', a[3] if len(a) > 3 else None))
