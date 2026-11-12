#!/usr/bin/env python3
"""Clip-channel thumbnail builder (1280x720): the most expressive streamer faces, cut out, on the game moment, with 3D text.

usage: python thumb.py spec.json out.jpg
spec.json:
{
  "people": [{"src": "a.mp4", "from": 1860, "to": 1880, "crop": [x, y, w, h], "side": "left", "height": 0.95, "prefer": "shock"|"laugh"}],
      # 1-2 people. A gameplay facecam box is too small to cut out: take the face from a full-screen cam moment of the same stream.
  "bg": {"src": "a.mp4", "t": 437.5, "crop": [x, y, w, h]},      # the game moment (or {"color": "#1b1f3a"})
  "text": "HE DID WHAT", "accent": 2,                               # 2-4 words; word index in gold-red
  "text_side": "right"
}
Faces: MediaPipe FaceLandmarker blendshapes (jaw open, wide eyes, raised brows, big smile) x sharpness -> best frame.
Cutout: rembg isnet-general-use. Checks: writes out.jpg (<2 MB) and out_320.jpg to check readability at phone size.
"""
import io, json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1280, 720
FONT = os.path.expanduser('~/.fonts/Anton-Regular.ttf')

def grab(src, t, crop=None):
    vf = f"crop={crop[2]}:{crop[3]}:{crop[0]}:{crop[1]}" if crop else 'null'
    png = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', src, '-frames:v', '1', '-vf', vf, '-f', 'image2pipe', '-vcodec', 'png', '-'],
                         capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert('RGB')

def best_face(p):
    import mediapipe as mp
    from mediapipe.tasks.python import vision, BaseOptions
    lm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=os.path.join(HERE, 'models', 'face_landmarker.task')),
        output_face_blendshapes=True, num_faces=1))
    best, bt, fbox = -1, p['from'], None
    n = int(min(60, max(4, (p['to'] - p['from']) / 0.25)))
    for t in np.linspace(p['from'], p['to'], n):
        im = grab(p['src'], t, p.get('crop')); a = np.asarray(im)
        r = lm.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(a)))
        if not r.face_blendshapes: continue
        b = {c.category_name: c.score for c in r.face_blendshapes[0]}
        smile = (b.get('mouthSmileLeft', 0) + b.get('mouthSmileRight', 0)) / 2
        if p.get('prefer') == 'laugh':     # big open laugh: jaw open + smile
            expr = 1.0 * b.get('jawOpen', 0) + 1.4 * smile + 0.2 * b.get('browInnerUp', 0)
        else:                              # shock: jaw open, wide eyes, raised brows
            expr = 1.2 * b.get('jawOpen', 0) + 0.5 * (b.get('eyeWideLeft', 0) + b.get('eyeWideRight', 0)) + 0.6 * b.get('browInnerUp', 0) + 0.4 * smile
        g = np.asarray(im.convert('L'), dtype=np.float32)
        sharp = float(np.var(g[1:, :] - g[:-1, :]) + np.var(g[:, 1:] - g[:, :-1])) ** 0.5
        score = expr * (0.6 + 0.4 * min(1.0, sharp / 25))
        if score > best:
            xs = [l.x for l in r.face_landmarks[0]]; ys = [l.y for l in r.face_landmarks[0]]; iw, ih = im.size
            best, bt, fbox = score, float(t), (min(xs) * iw, min(ys) * ih, max(xs) * iw, max(ys) * ih)
    lm.close()
    return bt, best, fbox

def cutout(im):
    from rembg import remove, new_session
    out = remove(im, session=new_session('isnet-general-use'))
    r, g, b, a = out.split(); a = a.point(lambda v: 0 if v < 70 else min(255, int(v * 1.15)))   # drop the faint halo rembg leaves
    out = Image.merge('RGBA', (r, g, b, a)); bb = a.getbbox(); return out.crop(bb) if bb else out

def sticker(rgba, border=9, shadow=18):
    a = rgba.split()[-1]
    big = Image.new('RGBA', (rgba.width + 4 * border, rgba.height + 4 * border), (0, 0, 0, 0))
    m = Image.new('L', big.size, 0); m.paste(a, (2 * border, 2 * border))
    outline = m.filter(ImageFilter.MaxFilter(2 * border + 1))
    sh = outline.filter(ImageFilter.GaussianBlur(shadow / 2)).point(lambda v: int(v * 0.7))
    canvas = Image.new('RGBA', (big.width + shadow, big.height + shadow), (0, 0, 0, 0))
    canvas.paste(Image.new('RGBA', big.size, (0, 0, 0, 255)), (shadow, shadow), sh)
    canvas.paste(Image.new('RGBA', big.size, (255, 255, 255, 255)), (0, 0), outline)
    canvas.paste(rgba, (2 * border, 2 * border), a)
    return canvas

def text3d(img, txt, box, accent=-1):
    """yellow gradient words, black stroke, dark extrude, white outer line; fits the box."""
    x0, y0, x1, y1 = box; words = txt.upper().split(); lines = [' '.join(words[:2]), ' '.join(words[2:])] if len(words) > 2 else [' '.join(words)]
    lines = [l for l in lines if l]
    size = 200
    while size > 40:
        f = ImageFont.truetype(FONT, size); hs = [f.getbbox(l) for l in lines]
        if max(b[2] - b[0] for b in hs) <= x1 - x0 and sum(b[3] - b[1] for b in hs) * 1.12 <= y1 - y0: break
        size -= 6
    f = ImageFont.truetype(FONT, size); d = ImageDraw.Draw(img); y = y0; wi = 0
    for l in lines:
        bb = f.getbbox(l); lw, lh = bb[2] - bb[0], bb[3] - bb[1]; x = x0 + (x1 - x0 - lw) // 2
        for k in range(14, 0, -2): d.text((x + k, y + k - bb[1]), l, font=f, fill=(40, 20, 0), stroke_width=12, stroke_fill=(15, 8, 0))
        d.text((x, y - bb[1]), l, font=f, fill=(255, 255, 255), stroke_width=18, stroke_fill=(255, 255, 255))
        d.text((x, y - bb[1]), l, font=f, fill=(0, 0, 0), stroke_width=11, stroke_fill=(0, 0, 0))
        # per-word colour: gold gradient, the accent word red-orange
        cx = x
        for w in l.split():
            ww = f.getbbox(w + ' ')[2]; wb = f.getbbox(w)
            mask = Image.new('L', img.size, 0); ImageDraw.Draw(mask).text((cx, y - bb[1]), w, font=f, fill=255)
            top, bot = ((255, 236, 120), (255, 170, 20)) if wi != accent else ((255, 120, 80), (230, 30, 30))
            grad = Image.new('RGB', img.size); gd = ImageDraw.Draw(grad)
            for yy in range(int(y), int(y + lh) + 2):
                u = (yy - y) / max(1, lh); gd.line([(0, yy), (W, yy)], fill=tuple(int(top[i] * (1 - u) + bot[i] * u) for i in range(3)))
            img.paste(grad, (0, 0), mask); cx += ww; wi += 1
        y += int(lh * 1.12)

def main():
    spec = json.load(open(sys.argv[1])); out = sys.argv[2]
    bg = spec.get('bg', {})
    if bg.get('src'):
        im = grab(bg['src'], bg['t'], bg.get('crop'))
        s = max(W / im.width, H / im.height); im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.LANCZOS)
        im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
        im = ImageEnhance.Color(ImageEnhance.Contrast(im).enhance(1.25)).enhance(1.35).filter(ImageFilter.GaussianBlur(1.2))
    else:
        im = Image.new('RGB', (W, H), bg.get('color', '#1b1f3a'))
    vig = Image.new('L', (W, H), 0); ImageDraw.Draw(vig).ellipse((-200, -150, W + 200, H + 150), fill=255)
    im = Image.composite(im, ImageEnhance.Brightness(im).enhance(0.45), vig.filter(ImageFilter.GaussianBlur(120))).convert('RGBA')
    for p in spec.get('people', []):
        t, sc, fb = best_face(p); print(f"best face for {os.path.basename(p['src'])}: t={t:.2f} score={sc:.2f}")
        fr = grab(p['src'], t, p.get('crop'))
        if fb:   # head-and-shoulders window around the face, so chairs, desks and overlays don't widen the cutout
            fx0, fy0, fx1, fy1 = fb; fw, fh = fx1 - fx0, fy1 - fy0; cx = (fx0 + fx1) / 2
            fr = fr.crop((int(max(0, cx - 1.9 * fw)), int(max(0, fy0 - 0.9 * fh)), int(min(fr.width, cx + 1.9 * fw)), fr.height))
        cut = sticker(cutout(fr))
        h = int(H * float(p.get('height', 0.95))); w = int(cut.width * h / cut.height); cut = cut.resize((w, h), Image.LANCZOS)
        side = p.get('side', 'left'); x = {'left': -int(w * 0.06), 'right': W - w + int(w * 0.06), 'center': (W - w) // 2}[side]
        im.alpha_composite(cut, (x, H - h + 30))
    side = spec.get('text_side', 'right')
    box = {'right': (W // 2 - 20, 30, W - 30, 330), 'left': (30, 30, W // 2 + 20, 330), 'top': (60, 20, W - 60, 260)}[side]
    text3d(im, spec.get('text', ''), box, int(spec.get('accent', -1)))
    im = im.convert('RGB'); im.save(out, quality=90, optimize=True)
    im.resize((320, 180), Image.LANCZOS).save(out.replace('.jpg', '_320.jpg'), quality=90)
    print(out, os.path.getsize(out) // 1024, 'KB')

if __name__ == '__main__':
    main()
