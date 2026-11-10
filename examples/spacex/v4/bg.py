# Cinematic background + Elon composite for the Starship catch thumbnail (v4, from scratch).
# Output: comp.png (1920x1080). Text is added in catch4.html.
import numpy as np, cv2
from PIL import Image

W, H, S = 1920, 1080, 2
WW, HH = W * S, H * S
R = np.random.default_rng(13)

def sm(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def fbm(w, h, cell, octs=5, seed=0, sx=1.0):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp, tot = 1.0, 0.0
    for o in range(octs):
        gw = max(2, int(w / (cell * sx) * 2 ** o)); gh = max(2, int(h / cell * 2 ** o))
        out += amp * cv2.resize(r.random((gh, gw)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC)
        tot += amp; amp *= 0.5
    return out / tot

def col(*c): return np.array(c, np.float32) / 255.0

yy, xx = np.mgrid[0:HH, 0:WW].astype(np.float32) / S   # 1x coordinates on the 2x grid

# ---------- 1. sky ----------
stops = [(0.00, col(5, 9, 24)), (0.30, col(12, 24, 56)), (0.52, col(30, 40, 84)), (0.66, col(78, 48, 92)),
         (0.78, col(176, 72, 72)), (0.88, col(236, 118, 54)), (1.00, col(255, 168, 92))]
fy = yy[:, :1] / H
sky = np.zeros((HH, 1, 3), np.float32)
for (a, ca), (b, cb) in zip(stops[:-1], stops[1:]):
    t = np.clip((fy - a) / (b - a), 0, 1)[..., None]; m = ((fy >= a) & (fy <= b))[..., None]
    sky = np.where(m, ca * (1 - t) + cb * t, sky)
img = np.repeat(sky, WW, axis=1)

def glow(cx, cy, sig, c, k, sy=None):
    sy = sy or sig
    return (np.exp(-(((xx - cx) / sig) ** 2 + ((yy - cy) / sy) ** 2) / 2) * k)[..., None] * c

img += glow(1500, 1010, 520, col(255, 120, 40), 0.55, 300)     # flame light on the sky
img += glow(420, 230, 330, col(70, 120, 230), 0.32)              # cool backlight behind the head

# stars
st = np.zeros((HH, WW), np.float32)
for _ in range(420):
    x, y = R.uniform(0, WW), R.uniform(0, HH * 0.5)
    st[int(y), int(x)] = R.uniform(0.3, 1.0) * (1 - y / (HH * 0.5)) ** 1.5
st = cv2.GaussianBlur(st, (0, 0), 1.2) * 6
img += np.clip(st, 0, 1)[..., None] * col(220, 230, 255)

# thin dusk clouds
cl = fbm(W, H, 180, 5, seed=3, sx=4.0)
cm = sm(0.56, 0.74, cl) * sm(540, 640, np.arange(H)[:, None]) * (1 - sm(820, 900, np.arange(H)[:, None]))
cm = cv2.resize(cm, (WW, HH))[..., None]
warm = sm(560, 860, yy)[..., None]
img = img * (1 - cm * 0.55) + cm * 0.55 * (col(48, 34, 70) * (1 - warm) + col(250, 128, 78) * warm)

# ---------- helpers for crisp shapes (2x supersampled) ----------
def mask(): return np.zeros((HH, WW), np.uint8)
def P(pts): return (np.array(pts, np.float32) * S * 16).astype(np.int32)   # 4-bit subpixel
def poly(m, pts): cv2.fillPoly(m, [P(pts)], 255, cv2.LINE_AA, 4)
def line(m, a, b, t): cv2.line(m, tuple(P([a])[0]), tuple(P([b])[0]), 255, max(1, int(t * S)), cv2.LINE_AA, 4)
def paint(m, c, a=1.0):
    global img; k = (m.astype(np.float32) / 255 * a)[..., None]
    img = img * (1 - k) + (c if np.ndim(c) == 3 else np.array(c, np.float32)) * k

# distant ground + tank farm
g = mask(); poly(g, [(0, 990), (W, 982), (W, H), (0, H)])
for x0, w, h in [(930, 70, 48), (1010, 46, 70), (1065, 80, 40), (1170, 36, 92), (1215, 90, 52), (1330, 28, 120)]:
    poly(g, [(x0, 990 - h), (x0 + w, 990 - h), (x0 + w, 992), (x0, 992)])
paint(g, col(20, 12, 18))

# ---------- 2. tower (Mechazilla), right edge ----------
TL, TR = 1752, 1872
def tower_face(dx, c, legw, memw):
    m = mask()
    for x in (TL + dx, TR + dx): poly(m, [(x - legw / 2, 26), (x + legw / 2, 26), (x + legw / 2, H), (x - legw / 2, H)])
    y = 60
    while y < H:
        line(m, (TL + dx, y), (TR + dx, y), memw)
        line(m, (TL + dx, y), (TR + dx, y + 66), memw * 0.75); line(m, (TR + dx, y), (TL + dx, y + 66), memw * 0.75)
        y += 66
    poly(m, [(TL + dx - 26, 20), (TR + dx + 26, 20), (TR + dx + 26, 44), (TL + dx - 26, 44)])
    paint(m, c)
tower_face(18, col(34, 30, 44), 14, 6)        # back face (hazier)
tower_face(0, col(9, 9, 13), 20, 8)           # front face
m = mask(); line(m, (TL + 60, 20), (TL + 60, 0), 6); paint(m, col(9, 9, 13))
# warm rim on the left leg, stronger toward the flame
m = mask(); line(m, (TL - 10, 300), (TL - 10, H), 3)
rim = (m.astype(np.float32) / 255 * sm(300, 1000, yy))[..., None]
img += rim * col(255, 150, 70) * 0.9
# carriage
m = mask(); poly(m, [(TL - 18, 372), (TR + 22, 372), (TR + 22, 512), (TL - 18, 512)]); paint(m, col(12, 11, 16))

# ---------- 3. chopstick arms ----------
def arm(y, x_tip, t_root, t_tip, c, web):
    m = mask()
    top = [(TL - 10, y - t_root / 2), (x_tip, y - t_tip / 2)]; bot = [(TL - 10, y + t_root / 2), (x_tip, y + t_tip / 2)]
    line(m, *top, 9); line(m, *bot, 9)
    n = 9
    for i in range(n):
        f0, f1 = i / n, (i + 1) / n
        xa = TL - 10 + (x_tip - TL + 10) * f0; xb = TL - 10 + (x_tip - TL + 10) * f1
        ta = t_root + (t_tip - t_root) * f0; tb = t_root + (t_tip - t_root) * f1
        line(m, (xa, y - ta / 2), (xb, y + tb / 2) if i % 2 == 0 else (xb, y - tb / 2), web)
        if i % 2: line(m, (xa, y + ta / 2), (xb, y - tb / 2), web)
    poly(m, [(x_tip - 6, y - t_tip / 2 - 4), (x_tip + 14, y - t_tip / 2 - 4), (x_tip + 14, y + t_tip / 2 + 4), (x_tip - 6, y + t_tip / 2 + 4)])
    paint(m, c); return m

arm(420, 1392, 44, 30, col(30, 27, 38), 5)    # back arm (behind the ship)

# ---------- 4. the ship ----------
cx, r, ytip, ybase, yend = 1500.0, 76.0, 120.0, 400.0, 946.0
def rr(y):
    t = np.clip((ybase - y) / (ybase - ytip), 0, 1)
    return np.where(y < ybase, r * np.power(np.clip(1 - t ** 2.2, 0, 1), 0.5), r)
x0, x1, y0, y1 = int((cx - r - 90) * S), int((cx + r + 90) * S), int(ytip * S) - 4, int(yend * S) + 4
X, Y = xx[y0:y1, x0:x1], yy[y0:y1, x0:x1]
RR = rr(Y); inside = (np.abs(X - cx) <= RR) & (Y >= ytip) & (Y <= yend)
u = np.clip((X - cx) / np.maximum(RR, 1e-3), -1, 1); nz = np.sqrt(1 - u * u)
s_arc = np.arcsin(u) * r                                  # arc length -> tiles compress toward the edges
flame = sm(620, yend, Y)[..., None]
# stainless steel: dim sky reflection, warm sunset/flame highlight band, dark limb
steel = (col(92, 102, 124) * (0.30 + 0.70 * nz[..., None])
         + col(255, 196, 150) * (np.exp(-((u - 0.42) / 0.13) ** 2) * 0.95)[..., None]
         + col(140, 170, 230) * (np.exp(-((u - 0.05) / 0.18) ** 2) * 0.22)[..., None])
streak = cv2.resize(R.random((1, x1 - x0)).astype(np.float32), (x1 - x0, y1 - y0))
steel *= (0.92 + 0.08 * streak)[..., None]
# heat-shield tiles (windward side): staggered hex-ish tiles
row = np.floor((Y - ytip) / 7.0); colx = (s_arc + (row % 2) * 4.0) / 8.0
edge = np.minimum(np.abs((Y - ytip) / 9.0 - row - 0.5), np.abs(colx - np.floor(colx) - 0.5))
tl = (0.30 - edge).clip(0, None) * 0  # placeholder to keep shapes aligned
grout = (np.abs((Y - ytip) / 7.0 - np.round((Y - ytip) / 7.0)) < 0.08) | (np.abs(colx - np.round(colx)) < 0.07)
tvar = cv2.resize(R.random((60, 40)).astype(np.float32), (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
tiles = col(16, 16, 20) * (0.9 + 0.2 * tvar[..., None]) * (0.55 + 0.45 * nz[..., None])
tiles = np.where(grout[..., None], tiles * 0.6 + col(22, 22, 27) * 0.4, tiles)
tiles += col(255, 170, 110) * (np.exp(-((u + 0.62) / 0.12) ** 2) * 0.12)[..., None]
shade = np.where((u < -0.12)[..., None], tiles, steel)
# weld rings
ring = (np.abs(((Y - ybase) / 31.0) - np.round((Y - ybase) / 31.0)) * 31.0) < 0.8
shade = np.where(ring[..., None], shade * 0.78, shade)
# flame light from below + limb darkening
shade = shade + flame * col(255, 120, 50) * (0.25 + 0.55 * nz[..., None]) * 0.9
shade *= (1 - 0.7 * sm(0.80, 1.0, np.abs(u)))[..., None]
a = inside.astype(np.float32)[..., None]
img[y0:y1, x0:x1] = img[y0:y1, x0:x1] * (1 - a) + shade * a

# flaps (forward small, aft large) as dark tiled silhouettes with warm rim
for sgn in (1, -1):
    fx = lambda d: cx + sgn * d
    m = mask()
    poly(m, [(fx(r * 0.70), 262), (fx(r + 30), 338), (fx(r + 32), 384), (fx(r - 2), 396)])
    poly(m, [(fx(r - 2), 780), (fx(r + 58), 826), (fx(r + 64), 926), (fx(r - 2), 936)])
    paint(m, col(44, 44, 54))
    m2 = mask(); line(m2, (fx(r + 32), 384), (fx(r - 2), 396), 3); line(m2, (fx(r + 64), 926), (fx(r - 2), 936), 3)
    img += (m2.astype(np.float32) / 255)[..., None] * col(255, 150, 80) * 0.8
# engine skirt
m = mask(); poly(m, [(cx - r + 4, 944), (cx + r - 4, 944), (cx + r - 14, 962), (cx - r + 14, 962)]); paint(m, col(20, 16, 18))

arm(456, 1378, 50, 34, col(8, 8, 12), 6)      # front arm (in front of the ship)
m = mask(); line(m, (TL - 10, 456 + 25), (1378, 456 + 17), 3)
img += (m.astype(np.float32) / 255)[..., None] * col(255, 150, 70) * 0.65   # flame-lit underside

# ---------- 5. smoke ----------
SW, SH = W, H
sy_, sx_ = np.mgrid[0:SH, 0:SW].astype(np.float32)
D = np.zeros((SH, SW), np.float32)
for _ in range(150):
    bx = R.uniform(800, 2000)
    near = np.exp(-((bx - 1500) / 260) ** 2)
    by = H - R.uniform(-20, 140 + 90 * near)
    br = R.uniform(40, 130) * (0.8 + 0.5 * near)
    D = np.maximum(D, np.clip(1 - np.hypot(sx_ - bx, sy_ - by) / br, 0, 1) ** 0.5 + 0.0)
D = D + 0.35 * (fbm(SW, SH, 26, 5, seed=9) - 0.5)
Ds = cv2.GaussianBlur(D, (0, 0), 4)
gy, gx = np.gradient(Ds)
lx, ly = 1500 - sx_, 1000 - sy_; ln = np.hypot(lx, ly) + 1e-3
lam = np.clip(-(gx * lx + gy * ly) / ln * 22 + 0.3, 0, 1)
ao = np.clip((Ds - cv2.GaussianBlur(D, (0, 0), 24)) * 3.5 + 0.6, 0, 1)
dist = np.hypot((sx_ - 1500) / 1.35, sy_ - 990)
illum = np.exp(-dist / 300)
up = np.clip(-gy * 18, 0, 1)
smoke = (col(30, 18, 24) * (0.5 + 0.5 * ao[..., None]) + col(255, 120, 50) * (illum * (0.15 + 1.1 * lam) * ao)[..., None]
         + col(255, 214, 160) * (np.exp(-dist / 110) * 0.9)[..., None] + col(90, 80, 130) * (up * 0.22 * (1 - illum))[..., None])
SM = sm(0.40, 0.48, D) * sm(770, 860, sy_)
SM = cv2.resize(SM, (WW, HH))[..., None]; smoke = cv2.resize(smoke, (WW, HH))
img = img * (1 - SM) + smoke * SM

# ---------- 6. flame (additive, with bloom) ----------
E = np.zeros((HH, WW, 3), np.float32)
def emit(pts, c, k, blur):
    m = mask(); poly(m, pts); f = m.astype(np.float32) / 255
    if blur: f = cv2.GaussianBlur(f, (0, 0), blur * S)
    E[:] += f[..., None] * c * k
emit([(cx - 62, 958), (cx + 62, 958), (cx + 150, 1080), (cx - 150, 1080)], col(255, 110, 40), 1.3, 26)
emit([(cx - 54, 958), (cx + 54, 958), (cx + 70, 1060), (cx - 70, 1060)], col(255, 170, 70), 1.4, 10)
for ex in (-34, 0, 34):
    emit([(cx + ex - 14, 958), (cx + ex + 14, 958), (cx + ex + 4, 1036), (cx + ex - 4, 1036)], col(255, 246, 225), 2.2, 3)
    for dy in (982, 1012):
        m = mask(); cv2.ellipse(m, (int((cx + ex) * S), int(dy * S)), (int(7 * S), int(9 * S)), 0, 0, 360, 255, -1, cv2.LINE_AA)
        E[:] += cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 2)[..., None] * col(255, 255, 240) * 1.5
img += E

# ---------- 7. bloom, vignette, downsample ----------
img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
br = np.clip(img - 0.72, 0, None)
img += cv2.GaussianBlur(br, (0, 0), 18) * 0.9 + cv2.GaussianBlur(br, (0, 0), 70) * 0.8
vy, vx = np.mgrid[0:H, 0:W].astype(np.float32)
vig = 1 - 0.38 * sm(0.55, 1.25, np.hypot((vx - 1000) / 1100, (vy - 500) / 760))
img *= vig[..., None]
img = 1 - np.exp(-img * 1.25)                      # soft filmic shoulder
img = img / (1 - np.exp(-1.25))
Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save('bg.png')

# ---------- 8. Elon (owner photo; real face unedited: cutout, uniform scale, position, one global exposure) ----------
el = Image.open('../elon_full.png'); s = 0.45
ew, eh = int(el.width * s), int(el.height * s)
el = np.array(el.resize((ew, eh), Image.LANCZOS)).astype(np.float32) / 255
ox, oy = -232, -6
canvas_a = np.zeros((H, W), np.float32); canvas_rgb = np.zeros((H, W, 3), np.float32)
xa, ya = max(0, ox), max(0, oy); xb, yb = min(W, ox + ew), min(H, oy + eh)
canvas_a[ya:yb, xa:xb] = el[ya - oy:yb - oy, xa - ox:xb - ox, 3]
canvas_rgb[ya:yb, xa:xb] = el[ya - oy:yb - oy, xa - ox:xb - ox, :3]
canvas_rgb = np.clip(canvas_rgb * 0.97, 0, 1)                      # one global exposure match
bgf = np.array(Image.open('bg.png')).astype(np.float32) / 255
# light wrap behind the subject: warm on the rocket side, cool on the left
halo = cv2.GaussianBlur(canvas_a, (0, 0), 16)
warm_side = sm(250, 900, vx)
bgf += ((halo - canvas_a).clip(0, 1) * (0.38 * warm_side))[..., None] * col(255, 150, 80)
bgf += ((halo - canvas_a).clip(0, 1) * (0.2 * (1 - warm_side)))[..., None] * col(120, 170, 255)
A = canvas_a[..., None]
out = bgf * (1 - A) + canvas_rgb * A
Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save('comp.png')
print('ok')
