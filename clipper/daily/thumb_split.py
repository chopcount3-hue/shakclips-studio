#!/usr/bin/env python3
"""Split-panel long-video thumbnail (owner 24 Nov: "thumbnails are not catchy"). Two gameplay frames side by side with a
slanted yellow divider, one streamer pill per panel, 2-3 HUGE words across the bottom, optional ring on panel 1.
Bright, simple, readable at phone size. Gameplay only: never a streamer's face.

usage: python3 thumb_split.py spec.json out.jpg   (also writes out_qa.jpg)
spec = {"panels": [{"src": "$WORK/clips/a.mp4", "t": 15, "crop": [x, y, w, h], "name": "KAI CENAT", "circle": [cx, cy, r]},
                   {"src": "$WORK/clips/b.mp4", "t": 7.6, "crop": [x, y, w, h], "name": "CASEOH"}],
        "split": 0.58,                      # panel-1 width share
        "lines": ["IT'S *REAL?!*"],         # 1-2 short lines; *x* = accent
        "accent": "yellow"}
crop / circle are source px on a 1920x1080 frame."""
import json, os, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import thumb as T

W, H = 1920, 1080

def panel(p, w, h):
    im = T.grab(p); x, y, cw, ch = p['crop']; im = T.grade(im.crop((x, y, x + cw, y + ch)))
    out, s, ox, oy = T.cover(im, w, h, tuple(p.get('focus', (0.5, 0.5))))
    circ = None
    if p.get('circle'):
        cx, cy, r = p['circle']; circ = (int((cx - x) * s - ox), int((cy - y) * s - oy), int(r * s))
    return out, circ

def make(spec, out):
    acc = T.ACC[spec.get('accent', 'yellow')]; sp = int(W * spec.get('split', 0.58)); slant = 90
    a, ca = panel(spec['panels'][0], sp + slant, H); b, cb = panel(spec['panels'][1], W - sp + slant, H)
    img = Image.new('RGBA', (W, H), (0, 0, 0, 255)); img.paste(b.convert('RGBA'), (sp - slant, 0))
    m = Image.new('L', (sp + slant, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (sp + slant, 0), (sp - slant, H), (0, H)], fill=255)
    img.paste(a.convert('RGBA'), (0, 0), m)
    d = ImageDraw.Draw(img)
    d.line([(sp + slant, 0), (sp - slant, H)], fill=(0, 0, 0), width=34); d.line([(sp + slant, 0), (sp - slant, H)], fill=acc, width=20)
    img = T.vignette(img.convert('RGB'), 0.35).convert('RGBA')
    if ca: T.ring(img, *ca, accent=T.ACC['red'])
    # bottom band so the words always read
    band = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(band)
    for i in range(260): bd.line([(0, H - 260 + i), (W, H - 260 + i)], fill=(0, 0, 0, int(200 * i / 260)))
    img.alpha_composite(band)
    T.text_lines(img, spec['lines'], (90, H - 120 - 200 * len(spec['lines']) - 40, W - 180, 200 * len(spec['lines']) + 40), acc, 230, rot=-2, align='center')
    T.pill(img, 40, 36, [spec['panels'][0]['name']], 64)
    d = ImageDraw.Draw(img); f = T.font('LilitaOne-Regular.ttf', 64); n = spec['panels'][1]['name']
    tw = d.textlength(n, font=f); T.pill(img, int(W - tw - 64 * 2.4 - 40), 36, [n], 64)
    T.brand(img, W - 330, H - 70, 44)
    final = img.convert('RGB').resize((1280, 720), Image.LANCZOS); final.save(out, quality=92)
    T.qa(final, out.replace('.jpg', '_qa.jpg'), 'long'); print(out, os.path.getsize(out) // 1024, 'KB')

if __name__ == '__main__':
    make(json.load(open(sys.argv[1])), sys.argv[2])
