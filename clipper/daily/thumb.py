#!/usr/bin/env python3
"""Shak Replay thumbnails (owner, 22 Nov: "make also thumbnails professional level and interesting").
Long video -> 1280x720 JPEG; Short -> 1080x1920 JPEG (9:16; YouTube often shows Shorts cropped to ~3:2, so the words,
subject and badge stay inside the middle band y 600-1320; set focus so the circled subject lands at y~1050-1250). Gameplay frames only: no streamer faces or photos of people.

usage: python3 thumb.py spec.json out.jpg        (also writes out_qa.jpg: small sizes + greyscale, Read it before posting)
spec = {
  "kind": "long" | "short",
  "src": "$WORK/clips/<name>.mp4", "t": 33.8,          # the frame: the peak moment or just before it (or "image": path)
  "crop": [x, y, w, h],                                  # source px (1920x1080); leave out webcam, chat, minimap
  "lines": ["THE TRUCK", "*SAW IT*"],                    # 1-2 lines, 1-3 words each, NOT words from the title; *x* = accent
  "badge": "SQUEEX" or ["LIRIK", "JERMA"],               # streamer name(s) on a Twitch-purple pill
  "circle": [cx, cy, r],                                 # optional, source px: ring the key detail
  "arrow": true,                                         # optional: arrow from the words to the circle
  "number": "#1",                                        # optional (long countdowns): big badge
  "zoom": {"src": [cx, cy], "factor": 3, "at": [x, y], "r": 240},   # optional (long): magnifier bubble of a tiny detail,
                                                         #   src in source px, at/r on the 1920x1080 canvas; ring on src
  "accent": "yellow" | "red" | "cyan" | "pink" | "green"
}"""
import json, os, subprocess, sys, math, tempfile
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); FONTS = [os.path.join(os.path.dirname(HERE), 'fonts'), os.path.expanduser('~/.fonts')]
ACC = {'yellow': (255, 214, 0), 'red': (255, 48, 64), 'cyan': (40, 220, 255), 'pink': (255, 46, 136), 'green': (60, 235, 110)}
PURPLE, PINK = (145, 70, 255), (255, 46, 136)

def font(name, size):
    for d in FONTS:
        p = os.path.join(d, name)
        if os.path.exists(p): return ImageFont.truetype(p, size)
    raise SystemExit(f'font missing: {name}')

def grab(spec):
    if spec.get('image'): return Image.open(os.path.expandvars(spec['image'])).convert('RGB')
    src = os.path.expandvars(spec['src']); out = tempfile.mktemp(suffix='.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(spec['t']), '-i', src, '-frames:v', '1', '-vf', 'scale=1920:1080', out], check=True)   # 720p clips too: spec coords are 1920x1080
    return Image.open(out).convert('RGB')

def grade(im):
    g = ImageOps.grayscale(im).resize((64, 36)); lum = sum(g.getpixel((x, y)) for x in range(64) for y in range(36)) / (64 * 36)
    if lum < 120:                                                         # only dusk / night frames get lifted
        im = ImageOps.autocontrast(im, cutoff=1)
        im = ImageEnhance.Brightness(im).enhance(min(1.3, max(1.0, 112 / max(lum, 1))))
    im = ImageEnhance.Color(im).enhance(1.4); im = ImageEnhance.Contrast(im).enhance(1.14)
    return im.filter(ImageFilter.UnsharpMask(radius=2, percent=110, threshold=2))

def cover(im, w, h, focus=(0.5, 0.5)):
    s = max(w / im.width, h / im.height); im = im.resize((math.ceil(im.width * s), math.ceil(im.height * s)), Image.LANCZOS)
    x = int(min(max(focus[0] * im.width - w / 2, 0), im.width - w)); y = int(min(max(focus[1] * im.height - h / 2, 0), im.height - h))
    return im.crop((x, y, x + w, y + h)), s, x, y

def vignette(im, strength=0.55):
    w, h = im.size; m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
    d.ellipse([-w * 0.25, -h * 0.25, w * 1.25, h * 1.25], fill=255); m = m.filter(ImageFilter.GaussianBlur(min(w, h) // 5))
    dark = Image.new('RGB', (w, h), (0, 0, 0)); return Image.composite(im, Image.blend(im, dark, strength), m)

def text_lines(canvas, lines, box, accent, max_size, rot=-3, align='left'):
    """lines inside box (x, y, w, h); auto-size; white + accent words; thick black stroke + shadow; slight tilt"""
    x0, y0, bw, bh = box; probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    for size in range(max_size, 40, -6):
        f = font('LilitaOne-Regular.ttf', size)
        widths = [probe.textlength(l.replace('*', ''), font=f) for l in lines]
        if max(widths) <= bw - 2 * (size // 9) and len(lines) * size * 1.0 <= bh: break
    sw = max(10, size // 9); lh = int(size * 1.0)
    layer = Image.new('RGBA', (bw + 4 * sw, len(lines) * lh + 4 * sw), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    for i, l in enumerate(lines):
        segs, hi = [], False
        for part in l.split('*'):
            if part: segs.append((part, hi))
            hi = not hi
        tw = sum(d.textlength(p, font=f) for p, _ in segs); cx = 2 * sw + (0 if align == 'left' else (bw - tw) / 2); yy = 2 * sw + i * lh - int(size * 0.08)
        for p, h in segs:
            d.text((cx, yy), p, font=f, fill=accent if h else (255, 255, 255), stroke_width=sw, stroke_fill=(0, 0, 0))
            cx += d.textlength(p, font=f)
    sh = Image.new('RGBA', layer.size, (0, 0, 0, 0)); sh.putalpha(layer.getchannel('A').point(lambda a: int(a * 0.75)))
    sh = sh.filter(ImageFilter.GaussianBlur(sw))
    layer = layer.rotate(rot, resample=Image.BICUBIC, expand=True); sh = sh.rotate(rot, resample=Image.BICUBIC, expand=True)
    px, py = x0 - 2 * sw, y0 - 2 * sw
    canvas.alpha_composite(sh, (px + sw, py + sw)); canvas.alpha_composite(layer, (px, py))
    return (x0, y0, x0 + bw, y0 + len(lines) * lh), size

def ring(canvas, cx, cy, r, accent=(255, 48, 64)):
    d = ImageDraw.Draw(canvas); t = max(10, r // 9)
    g = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); ImageDraw.Draw(g).ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent + (255,), width=t * 2)
    g = g.filter(ImageFilter.GaussianBlur(t)); inside = Image.new('L', canvas.size, 0)
    ImageDraw.Draw(inside).ellipse([cx - r + t, cy - r + t, cx + r - t, cy + r - t], fill=255)
    a = g.getchannel('A'); a.paste(0, mask=inside); g.putalpha(a)            # glow outside only: the subject stays clean
    canvas.alpha_composite(g)
    d.ellipse([cx - r - t // 2, cy - r - t // 2, cx + r + t // 2, cy + r + t // 2], outline=(255, 255, 255), width=t // 2 + 2)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent, width=t)

def arrow(canvas, p0, p1, color=(255, 48, 64), w=26):
    """thick arrow p0 -> p1 with dark outline; head at p1"""
    d = ImageDraw.Draw(canvas); ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0]); hl = w * 2.6
    base = (p1[0] - hl * math.cos(ang), p1[1] - hl * math.sin(ang))
    head = [p1, (base[0] + hl * 0.6 * math.cos(ang + math.pi / 2), base[1] + hl * 0.6 * math.sin(ang + math.pi / 2)),
            (base[0] + hl * 0.6 * math.cos(ang - math.pi / 2), base[1] + hl * 0.6 * math.sin(ang - math.pi / 2))]
    for col, extra in (((0, 0, 0), 10), (color, 0)):
        d.line([p0, base], fill=col, width=w + extra)
        hh = [(x + (extra / 2) * math.cos(math.atan2(y - base[1], x - base[0])), y + (extra / 2) * math.sin(math.atan2(y - base[1], x - base[0]))) for x, y in head]
        d.polygon(hh if extra else head, fill=col)

def pill(canvas, x, y, names, size):
    d = ImageDraw.Draw(canvas); f = font('LilitaOne-Regular.ttf', size)
    for n in names:
        tw = d.textlength(n, font=f); h = int(size * 1.35); ic = int(h * 0.62); w = int(tw + ic + size * 1.3)
        sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).rounded_rectangle([x + 5, y + 7, x + w + 5, y + h + 7], h // 3, fill=(0, 0, 0, 160))
        canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
        d.rounded_rectangle([x, y, x + w, y + h], h // 3, fill=PURPLE, outline=(255, 255, 255), width=max(3, size // 14))
        ix, iy = x + int(size * 0.35), y + (h - ic) // 2
        d.rounded_rectangle([ix, iy, ix + ic, iy + ic], ic // 4, fill=(255, 255, 255))
        bw_ = max(3, ic // 7); d.rectangle([ix + ic * 0.36 - bw_ / 2, iy + ic * 0.25, ix + ic * 0.36 + bw_ / 2, iy + ic * 0.6], fill=PURPLE)
        d.rectangle([ix + ic * 0.64 - bw_ / 2, iy + ic * 0.25, ix + ic * 0.64 + bw_ / 2, iy + ic * 0.6], fill=PURPLE)
        d.text((ix + ic + int(size * 0.35), y + (h - size) // 2 - int(size * 0.06)), n, font=f, fill=(255, 255, 255))
        x += w + int(size * 0.4)
    return x

def number_badge(canvas, text, cx, cy, r, accent):
    d = ImageDraw.Draw(canvas); d.ellipse([cx - r - 8, cy - r - 8, cx + r + 8, cy + r + 8], fill=(0, 0, 0)); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=accent)
    f = font('LilitaOne-Regular.ttf', int(r * 1.05)); tw = d.textlength(text, font=f)
    d.text((cx - tw / 2, cy - r * 0.62), text, font=f, fill=(255, 255, 255), stroke_width=max(4, r // 12), stroke_fill=(0, 0, 0))

def brand(canvas, x, y, size):
    d = ImageDraw.Draw(canvas); f = font('LilitaOne-Regular.ttf', size); sw = d.textlength('SHAK ', font=f)
    d.text((x, y), 'SHAK ', font=f, fill=(255, 255, 255), stroke_width=max(3, size // 12), stroke_fill=(0, 0, 0))
    d.text((x + sw, y), 'REPLAY', font=f, fill=PINK, stroke_width=max(3, size // 12), stroke_fill=(0, 0, 0))

def make(spec, out):
    acc = ACC.get(spec.get('accent', 'yellow'), ACC['yellow']); src = grab(spec)
    cx0, cy0, cw0, ch0 = spec.get('crop') or [0, 0, src.width, src.height]
    frame = grade(src.crop((cx0, cy0, cx0 + cw0, cy0 + ch0)))
    names = spec.get('badge') or []; names = [names] if isinstance(names, str) else names
    names = [n.upper() for n in names]
    def to_canvas(p, s, ox, oy, dx=0, dy=0): return (int((p[0] - cx0) * s - ox + dx), int((p[1] - cy0) * s - oy + dy))
    if spec['kind'] == 'long':
        W, H = 1920, 1080; focus = spec.get('focus', [0.6, 0.5])
        img, s, ox, oy = cover(frame, W, H, focus); img = vignette(img, 0.45).convert('RGBA')
        g = Image.new('L', (W, H)); gp = g.load()
        for xx in range(W):
            a = int(max(0, 235 * (1 - (xx / 1150) ** 1.6)));
            for yy in range(0, H, 1): gp[xx, yy] = a
        img.alpha_composite(Image.merge('RGBA', (*Image.new('RGB', (W, H), (0, 0, 0)).split(), g)))
        top = 70
        if names: pill(img, 110, 60, names[:3], 54); top = 175
        tb, size = text_lines(img, spec['lines'], (110, top, 980, 1000 - top - 120), acc, 250)
        if spec.get('circle'):
            c = spec['circle']; p = to_canvas(c, s, ox, oy); r = int(c[2] * s); ring(img, p[0], p[1], r)
            if spec.get('arrow', True):
                a0 = (min(tb[2] - 60, p[0] - r - 40) if p[0] > tb[0] + 200 else tb[0] + 200, tb[3] + 50); ang = math.atan2(p[1] - a0[1], p[0] - a0[0])
                a1 = (p[0] - (r + 26) * math.cos(ang), p[1] - (r + 26) * math.sin(ang))
                if math.dist(a0, a1) > 140: arrow(img, a0, a1)
        if spec.get('number'): number_badge(img, spec['number'], 1720, 260, 130, acc)
        if spec.get('zoom'):   # magnifier: small ring on the detail, a thick connector, a big bubble with the detail enlarged
            z = spec['zoom']; zc = to_canvas(z['src'], s, ox, oy); R = z.get('r', 240); bx, by = z['at']; f = z.get('factor', 3)
            half = R / (s * f); g = grade(src)
            patch = g.crop((int(z['src'][0] - half), int(z['src'][1] - half), int(z['src'][0] + half), int(z['src'][1] + half))).resize((2 * R, 2 * R), Image.LANCZOS)
            patch = ImageEnhance.Sharpness(patch).enhance(1.6)
            mask = Image.new('L', (2 * R, 2 * R), 0); ImageDraw.Draw(mask).ellipse([0, 0, 2 * R - 1, 2 * R - 1], fill=255)
            d = ImageDraw.Draw(img); sr = z.get('ring', 60)
            for col, w_ in (((0, 0, 0), 30), ((255, 255, 255), 16)): d.line([zc, (bx, by)], fill=col, width=w_)
            sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse([bx - R - 6, by - R + 10, bx + R + 18, by + R + 26], fill=(0, 0, 0, 170))
            img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(16)))
            d = ImageDraw.Draw(img); d.ellipse([bx - R - 16, by - R - 16, bx + R + 16, by + R + 16], fill=(255, 255, 255))
            img.paste(patch, (bx - R, by - R), mask); ImageDraw.Draw(img).ellipse([bx - R, by - R, bx + R, by + R], outline=(0, 0, 0), width=6)
            ring(img, zc[0], zc[1], sr)
        brand(img, 1490, 40, 52) if not spec.get('no_brand') else None
        final = img.convert('RGB').resize((1280, 720), Image.LANCZOS)
    else:
        W, H = 1080, 1920; BAND = (600, 1320)
        bg, _, _, _ = cover(frame, W, H); bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(36))).enhance(0.55)
        img = bg.convert('RGBA'); HY0, HH = 300, 1320                 # hero: 1080x1320, centred on the 3:2 band
        hero, s, ox, oy = cover(frame, W, HH, spec.get('focus', [0.5, 0.5])); hero = vignette(hero, 0.35)
        m = Image.new('L', (W, HH), 255); md = ImageDraw.Draw(m)
        for i in range(150): md.line([(0, i), (W, i)], fill=int(255 * (i / 150) ** 1.5)); md.line([(0, HH - 1 - i), (W, HH - 1 - i)], fill=int(255 * (i / 150) ** 1.5))
        img.paste(hero, (0, HY0), m)
        dark = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(dark).ellipse([-80, BAND[0] - 40, W + 80, BAND[0] + 460], fill=(0, 0, 0, 165))
        img.alpha_composite(dark.filter(ImageFilter.GaussianBlur(60)))     # soft shade behind the words
        if names:
            d = ImageDraw.Draw(img); f = font('LilitaOne-Regular.ttf', 56); tw = sum(d.textlength(n, font=f) + 145 for n in names[:2])
            pill(img, int((W - tw) / 2), BAND[0] + 14, names[:2], 56)
        tb, size = text_lines(img, spec['lines'], (70, BAND[0] + 120, 940, 300), acc, 200, align='center')
        if spec.get('circle'):
            c = spec['circle']; p = to_canvas(c, s, ox, oy, 0, HY0); r = int(c[2] * s); ring(img, p[0], p[1], r)
            if spec.get('arrow', True):
                a0 = ((tb[0] + tb[2]) // 2 + 120, tb[3] + 10); ang = math.atan2(p[1] - a0[1], p[0] - a0[0])
                a1 = (p[0] - (r + 22) * math.cos(ang), p[1] - (r + 22) * math.sin(ang))
                if math.dist(a0, a1) > 110: arrow(img, a0, a1, w=22)
        brand(img, (W - 420) // 2, 170, 76)                          # visible on the 9:16 shelf card, outside the band
        d = ImageDraw.Draw(img); fb = font('BebasNeue-Regular.ttf', 60); t = 'GTA VI CLIPS'; tw = d.textlength(t, font=fb)
        d.rounded_rectangle([(W - tw) / 2 - 26, 1660, (W + tw) / 2 + 26, 1740], 18, fill=PINK); d.text(((W - tw) / 2, 1666), t, font=fb, fill=(255, 255, 255))
        final = img.convert('RGB')
    q = 92
    while True:
        final.save(out, quality=q, optimize=True)
        if os.path.getsize(out) < 1_900_000 or q <= 60: break
        q -= 6
    qa(final, out, spec['kind'])
    return out

def qa(img, out, kind):
    """small sizes on white and dark feed backgrounds + greyscale (the glance test)"""
    ws = [160, 240, 360] if kind == 'long' else [120, 180, 270]
    rows = []
    for bgc in ((255, 255, 255), (15, 15, 15)):
        tiles = [img.resize((w, int(w * img.height / img.width)), Image.LANCZOS) for w in ws] + [ImageOps.grayscale(img.resize((ws[-1], int(ws[-1] * img.height / img.width)))).convert('RGB')]
        if kind == 'short':
            band = img.crop((0, 600, 1080, 1320)).resize((360, 240), Image.LANCZOS); tiles.append(band)
        hh = max(t.height for t in tiles) + 20; row = Image.new('RGB', (sum(t.width for t in tiles) + 20 * (len(tiles) + 1), hh), bgc); x = 20
        for t in tiles: row.paste(t, (x, 10)); x += t.width + 20
        rows.append(row)
    sheet = Image.new('RGB', (max(r.width for r in rows), sum(r.height for r in rows)), (128, 128, 128)); y = 0
    for r in rows: sheet.paste(r, (0, y)); y += r.height
    sheet.save(out.replace('.jpg', '_qa.jpg'), quality=85)

if __name__ == '__main__':
    spec = json.load(open(sys.argv[1])); print(make(spec, sys.argv[2]), os.path.getsize(sys.argv[2]) // 1024, 'KB')
