#!/usr/bin/env python3
"""Hero thumbnail for the long video (owner 24 Nov: catchy, clear photo, GTA 6 badge, clickbait).
One bright, sharp gameplay frame of the most-viewed / most visual moment, a big GTA 6 badge (own typography, NOT the
Rockstar logo artwork), the streamer pill, a red ring on the action and 1-2 huge words at the bottom.
Follows anthropic-skills:youtube-thumbnail-design (glance test at 160 px, <=3 elements, safe zones, text 200-320 px).
Pick the frame first: compare 6-8 timestamps (edge variance + brightness) and take the sharpest bright one.

usage: python3 thumb_hero.py spec.json out.jpg     (also writes out_qa.jpg)
spec = {"src": "$WORK/clips/x.mp4", "t": 7.6, "crop": [x, y, w, h] (source px, 16:9, no webcam/chat/minimap),
        "ring": [cx, cy, r] (source px), "name": "CASEOH", "words": ["NO *WAY?!*"], "accent": "yellow",
        "badge": "GTA 6"}"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import thumb as T

W, H = 1920, 1080

def gta_badge(img, x, y, text='GTA 6', size=150):
    """rounded Vice-City gradient badge (pink -> orange) with white text; our own design, not the official logo"""
    f = T.font('LilitaOne-Regular.ttf', size); d = ImageDraw.Draw(img); tw = d.textlength(text, font=f)
    w, h = int(tw + size * 0.7), int(size * 1.25)
    g = Image.new('RGBA', (w, h)); gd = ImageDraw.Draw(g)
    for i in range(w):
        k = i / max(1, w - 1); gd.line([(i, 0), (i, h)], fill=(int(255), int(46 + (150 - 46) * k), int(136 - 120 * k), 255))
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], h // 4, fill=255)
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([x + 8, y + 10, x + w + 8, y + h + 10], h // 4, fill=(0, 0, 0, 170))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    d.rounded_rectangle([x - 7, y - 7, x + w + 7, y + h + 7], h // 4 + 6, fill=(255, 255, 255))
    img.paste(g, (x, y), m)
    d = ImageDraw.Draw(img); d.text((x + (w - tw) / 2, y + (h - size) / 2 - size * 0.08), text, font=f, fill=(255, 255, 255),
                                    stroke_width=max(6, size // 16), stroke_fill=(40, 0, 40))
    return x + w, y + h

def make(spec, out):
    acc = T.ACC[spec.get('accent', 'yellow')]
    im = T.grab(spec); x, y, cw, ch = spec['crop']; im = T.grade(im.crop((x, y, x + cw, y + ch)))
    s = W / cw; img = im.resize((W, int(ch * s)), Image.LANCZOS).crop((0, 0, W, H))
    img = T.vignette(img, 0.3).convert('RGBA')
    # bottom gradient so the words read
    band = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(band)
    for i in range(380): bd.line([(0, H - 380 + i), (W, H - 380 + i)], fill=(0, 0, 0, int(215 * i / 380)))
    img.alpha_composite(band)
    if spec.get('ring'):
        cx, cy, r = spec['ring']; T.ring(img, int((cx - x) * s), int((cy - y) * s), int(r * s), accent=T.ACC['red'])
    side = spec.get('badge_side', 'left'); bx0 = 110 if side == 'left' else W - 620
    bx, by = gta_badge(img, bx0, 190 if side == 'right' else 80, spec.get('badge', 'GTA 6'), 150)
    T.pill(img, bx0, by + 34, [spec['name']], 72)
    n = len(spec['words']); T.text_lines(img, spec['words'], (110, H - 70 - 250 * n, 1420, 250 * n), acc, 300, rot=-3)
    T.brand(img, W - 360 if side == 'left' else 110, 60, 46)
    final = img.convert('RGB').resize((1280, 720), Image.LANCZOS); final.save(out, quality=93)
    T.qa(final, out.replace('.jpg', '_qa.jpg'), 'long'); print(out, os.path.getsize(out) // 1024, 'KB')

if __name__ == '__main__':
    make(json.load(open(sys.argv[1])), sys.argv[2])
