#!/usr/bin/env python3
"""Fixed title box for stream-clip Shorts (the viral 'fit + blurred background' style; owner, 25 Nov: no frame, "fit it ...
keep the background as motion blur type"). A white rounded box with bold black text that says what the clip is about,
sitting just above the video for the whole Short. *word* = red highlight. 1-2 lines, auto-sized.
usage: python3 titlebox.py "Speed RAGES at *Kai* mid race 😭" [bottom_y] [out.png]"""
import hashlib, os, re, sys
from PIL import Image, ImageDraw, ImageFont
W, H = 1080, 1920
HERE = os.path.dirname(os.path.abspath(__file__)); FONTS = [os.path.join(os.path.dirname(HERE), 'fonts'), os.path.expanduser('~/.fonts')]
RED = (230, 20, 40)

def font(size):
    for d in FONTS:
        p = os.path.join(d, 'LilitaOne-Regular.ttf')
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def make(text, bottom=566, out=None):
    text = re.sub(r'[^\x20-\x7E’‘]', '', text or '').strip()            # PIL can't draw emoji: keep words only
    key = hashlib.sha1(f'{text}|{bottom}|v1'.encode()).hexdigest()[:10]
    out = out or os.path.join(os.environ.get('WORK', '/home/claude/gtaday'), 'titles', f'title_{key}.png')
    if os.path.exists(out): return out
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    words = [(w.strip('*'), w.startswith('*') or w.endswith('*')) for w in text.split()]
    maxw = W - 2 * 70 - 2 * 34
    for size in range(84, 40, -2):
        f = font(size); lines, cur = [], []
        for w in words:
            t = ' '.join(x for x, _ in cur + [w])
            if cur and d.textlength(t, font=f) > maxw: lines.append(cur); cur = [w]
            else: cur.append(w)
        lines += [cur] if cur else []
        if len(lines) <= 2: break
    lh = int(size * 1.12); bw = int(max(d.textlength(' '.join(x for x, _ in l), font=f) for l in lines)) + 2 * 34
    bh = lh * len(lines) + 2 * 22; x0 = (W - bw) // 2; y0 = bottom - bh
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([x0 + 4, y0 + 8, x0 + bw + 4, y0 + bh + 8], 26, fill=(0, 0, 0, 120))
    from PIL import ImageFilter
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10))); d = ImageDraw.Draw(img)
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], 26, fill=(255, 255, 255, 255))
    for i, l in enumerate(lines):
        lw = d.textlength(' '.join(x for x, _ in l), font=f); cx = (W - lw) / 2; yy = y0 + 22 + i * lh - int(size * 0.06)
        for w, hi in l:
            d.text((cx, yy), w, font=f, fill=RED if hi else (12, 12, 12)); cx += d.textlength(w + ' ', font=f)
    img.save(out); return out

if __name__ == '__main__':
    a = sys.argv[1:]; print(make(a[0], int(a[1]) if len(a) > 1 else 566, a[2] if len(a) > 2 else None))
