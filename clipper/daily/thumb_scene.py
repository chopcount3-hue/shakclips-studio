#!/usr/bin/env python3
"""'Scene' thumbnails for long videos, the style of the viral "Top 10 FUNNIEST IShowSpeed Moments" videos (owner, 26 Nov
sent examples: one huge cinematic action scene, a big red arrow on the action, the streamer's shocked face cut out on the
side, little or no text). Free version (owner chose it 26 Nov; Higgsfield/vidIQ have no credits): the REAL frame of the
video's best moment, graded hard into that hyper-real look (clarity, saturation, warm/teal split, highlight bloom,
vignette). The face is ONLY an owner-supplied photo from photos/ (never a face from a clip or the web).

usage: python3 thumb_scene.py spec.json out.jpg [--4k]   (also writes out_qa.jpg: read it)
  --4k (YouTube's recommended 3840x2160, up to 50 MB from a computer): drawn natively at 4K, the scene AI-upscaled with
  upscale.py (Real-ESRGAN, needs torch: run with $PY). Also writes out_phone.jpg (< 2 MB, the phone-app limit).
spec = {"src": "$WORK/clips/x.mp4", "t": 9.0,            # or "image": an AI scene / still (when credits exist)
        "crop": [x, y, w, h],                             # source px in 1920x1080, 16:9, NO webcam / chat / HUD
        "arrow": {"to": [x, y], "from": [x, y]},          # source px; "from" optional (default: up-right of "to")
        "face": "photos/ishowspeed-shock.jpg", "face_side": "left",   # optional owner photo
        "name": "KAI CENAT",                              # optional small name chip (top-left; use when no face)
        "words": ["HE DID *WHAT?!*"]}                     # optional, 0-1 line; the examples use none"""
import json, math, os, sys
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import thumb as T
W, H, K = 1920, 1080, 1          # K = 2 for 4K: every pixel size below is multiplied by K
RED = (232, 28, 36)

def cinematic(im):
    im = ImageOps.autocontrast(im, cutoff=0.6)
    im = im.filter(ImageFilter.UnsharpMask(radius=40 * K, percent=40, threshold=0))       # local contrast ("clarity")
    im = ImageEnhance.Color(im).enhance(1.55); im = ImageEnhance.Contrast(im).enhance(1.12)
    lum = ImageOps.grayscale(im)
    warm = Image.new('RGB', im.size, (255, 170, 90)); teal = Image.new('RGB', im.size, (20, 110, 140))
    im = Image.composite(Image.blend(im, warm, 0.10), im, lum.point(lambda v: max(0, v - 120) * 2))   # warm highlights
    im = Image.composite(Image.blend(im, teal, 0.12), im, lum.point(lambda v: max(0, 110 - v) * 2))   # teal shadows
    g = ImageOps.grayscale(im).resize((64, 36)); mean = sum(g.getpixel((x, y)) for x in range(64) for y in range(36)) / 2304
    thr, amt = (232, 0.30) if mean > 125 else (205, 0.55)          # bright daylight frames: only the hottest highlights glow
    hi = im.convert('L').point(lambda v: 255 if v > thr else 0).filter(ImageFilter.GaussianBlur(28 * K))
    bloom = Image.composite(im.filter(ImageFilter.GaussianBlur(28 * K)), Image.new('RGB', im.size), hi)
    im = ImageChops.screen(im, Image.blend(Image.new('RGB', im.size), bloom, amt))
    if mean > 125: im = ImageEnhance.Brightness(im).enhance(0.93)
    im = T.vignette(im, 0.38)
    return im.filter(ImageFilter.UnsharpMask(radius=2 * K, percent=120 if K == 1 else 60, threshold=2))   # 4K: the upscaler already sharpened

def red_arrow(img, p0, p1, w=34):
    """the examples' arrow: solid red, slightly curved, thin dark edge, head at p1"""
    d = ImageDraw.Draw(img); mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
    nx, ny = -(p1[1] - p0[1]), p1[0] - p0[0]; L = math.hypot(nx, ny) or 1; c = (mx + nx / L * 40 * K, my + ny / L * 40 * K)
    pts = [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]) for t in [i / 40 for i in range(41)]]
    ang = math.atan2(p1[1] - pts[-6][1], p1[0] - pts[-6][0]); hl = w * 2.4
    base = (p1[0] - hl * math.cos(ang), p1[1] - hl * math.sin(ang))
    head = [p1, (base[0] + hl * 0.62 * math.cos(ang + math.pi / 2), base[1] + hl * 0.62 * math.sin(ang + math.pi / 2)),
            (base[0] + hl * 0.62 * math.cos(ang - math.pi / 2), base[1] + hl * 0.62 * math.sin(ang - math.pi / 2))]
    body = [p for p in pts if math.dist(p, p1) > hl * 0.8]
    for col, ww in (((90, 0, 0), w + w * 8 // 34), (RED, w)):
        d.line(body, fill=col, width=ww, joint='curve')
    d.polygon(head, fill=(90, 0, 0)); d.polygon([(x + (p1[0] - x) * 0.0, y) for x, y in head], fill=RED)
    shrink = [(base[0] + (x - base[0]) * 0.86, base[1] + (y - base[1]) * 0.86) for x, y in head]; d.polygon(shrink, fill=RED)

def _dilate(a, k):
    """white sticker edge: grow the alpha by k px (cv2 is fast at 4K; PIL MaxFilter is not)"""
    import cv2, numpy as np
    k |= 1; return Image.fromarray(cv2.dilate(np.asarray(a), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))))

def add_person(img, path, side='left', hfrac=0.9):
    """owner-supplied reaction photo, already cut out as photos/<name>_cut.png (RGBA; make it once per photo, check it on
    magenta). Unedited face; only scaled. White sticker edge + soft shadow, bottom-anchored, bleeding off the side."""
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    p = path if os.path.isabs(path) else os.path.join(root, path)
    if not p.endswith('_cut.png'): p = os.path.splitext(p)[0] + '_cut.png'
    cut = Image.open(p).convert('RGBA'); fh = int(H * hfrac); fw = int(cut.width * fh / cut.height)
    cut = cut.resize((fw, fh), Image.LANCZOS); a = cut.getchannel('A')
    edge = _dilate(a, 19 * K); sticker = Image.new('RGBA', cut.size, (255, 255, 255, 0)); sticker.putalpha(edge)
    shadow = Image.new('RGBA', cut.size, (0, 0, 0, 0)); shadow.putalpha(edge.point(lambda v: int(v * 0.55))); shadow = shadow.filter(ImageFilter.GaussianBlur(26 * K))
    x0 = -int(fw * 0.10) if side == 'left' else W - fw + int(fw * 0.10); y0 = H - fh
    for layer, dx in ((shadow, 14 * K), (sticker, 0), (cut, 0)): img.alpha_composite(layer, (x0 + dx, y0)) if x0 + dx >= 0 else img.alpha_composite(layer.crop((-(x0 + dx), 0, fw, fh)), (0, y0))
    return img

def make(spec, out, k=1):
    global W, H, K
    K = k; W, H = 1920 * K, 1080 * K
    src = T.grab(spec); x0, y0, cw, ch = spec.get('crop') or [0, 0, src.width, src.height]
    scene = src.crop((x0, y0, x0 + cw, y0 + ch))
    if K > 1:                                   # real detail for 4K: AI-upscale the GAME frame only (never a face)
        import upscale; scene = upscale.x4(scene)
    img = cinematic(scene.resize((W, H), Image.LANCZOS)).convert('RGBA')
    s = W / cw; P = lambda p: (int((p[0] - x0) * s), int((p[1] - y0) * s))
    if spec.get('face'):
        img = add_person(img, os.path.expandvars(spec['face']), spec.get('face_side', 'left'), spec.get('face_h', 0.9))
    if spec.get('arrow'):
        a = spec['arrow']; p1 = P(a['to']); p0 = P(a['from']) if a.get('from') else (p1[0] + 230 * K, p1[1] - 260 * K)
        red_arrow(img, p0, p1, 34 * K)
    if spec.get('words'):
        T.text_lines(img, spec['words'][:1], (110 * K, 70 * K, 1100 * K, 260 * K), (255, 214, 0), 210 * K)
    if spec.get('name') and not spec.get('face'): T.pill(img, 60 * K, 50 * K, [spec['name'].upper()], 56 * K)
    final = img.convert('RGB')
    if K == 1: final = final.resize((1280, 720), Image.LANCZOS)
    def save(path, limit):
        q = 95 if K > 1 else 92
        while True:
            final.save(path, quality=q, optimize=True, subsampling=0 if K > 1 and limit > 2e6 else 2)
            if os.path.getsize(path) < limit or q <= 60: return
            q -= 4
    save(out, 45_000_000 if K > 1 else 1_900_000)
    if K > 1: save(os.path.splitext(out)[0] + '_phone.jpg', 1_900_000)
    T.qa(final.resize((1280, 720), Image.LANCZOS), out, 'long'); return out

if __name__ == '__main__':
    print(make(json.load(open(sys.argv[1])), sys.argv[2], 2 if '--4k' in sys.argv else 1), os.path.getsize(sys.argv[2]) // 1024, 'KB')
