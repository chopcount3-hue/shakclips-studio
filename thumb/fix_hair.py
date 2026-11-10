# Restore the top of the hair the first cutout lost (cutout-only fix; the face is untouched).
import numpy as np, cv2
from PIL import Image
rgb = np.array(Image.open('elon.webp').convert('RGB')); H, W = rgb.shape[:2]
old = np.array(Image.open('elon_full.png'))[..., 3]
x0, x1, y0, y1 = 1040, 1960, 20, 620
C = rgb[y0:y1, x0:x1].astype(np.int32); A = old[y0:y1, x0:x1]
BR = C[..., 2] - C[..., 0]; lum = C.mean(-1)
gc = np.full(A.shape, cv2.GC_PR_BGD, np.uint8)
gc[(BR < 2) & (lum < 200)] = cv2.GC_PR_FGD
gc[(BR > 30) & (A < 30)] = cv2.GC_BGD
gc[cv2.erode((A > 200).astype(np.uint8), np.ones((15, 15), np.uint8)) > 0] = cv2.GC_FGD
gc[:, :25] = cv2.GC_BGD; gc[:25, :] = cv2.GC_BGD; gc[:, -25:] = cv2.GC_BGD
bgm, fgm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(np.ascontiguousarray(rgb[y0:y1, x0:x1][..., ::-1]), gc, None, bgm, fgm, 6, cv2.GC_INIT_WITH_MASK)
hard = ((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(hard, 8)
hard = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
hard = cv2.morphologyEx(hard, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
# soft hair matte in a band around the edge, from the blue-vs-brown separation
band = cv2.dilate(hard, np.ones((13, 13), np.uint8)) - cv2.erode(hard, np.ones((9, 9), np.uint8))
f = np.clip((24 - BR) / 26.0, 0, 1) * np.clip((215 - lum) / 40.0, 0, 1)
soft = np.where(band > 0, np.minimum(f, cv2.GaussianBlur(cv2.dilate(hard, np.ones((9, 9), np.uint8)).astype(np.float32), (0, 0), 2)), hard.astype(np.float32))
soft = cv2.GaussianBlur(soft, (0, 0), 1.0)
newA = old.astype(np.float32) / 255
newA[y0:y1, x0:x1] = np.maximum(newA[y0:y1, x0:x1], soft)
oldf = old.astype(np.float32) / 255
newA[520:620, 1040:1185] = oldf[520:620, 1040:1185]            # car scrap left of the ear
n, lab, st, _ = cv2.connectedComponentsWithStats((newA > 0.5).astype(np.uint8), 8)
keep = cv2.dilate((lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8), np.ones((7, 7), np.uint8))
newA *= keep
# defringe the restored edge: pull colour from inside the hair
Af = newA[y0:y1, x0:x1]; inner = cv2.erode((Af > 0.9).astype(np.uint8), np.ones((7, 7), np.uint8))
s = cv2.blur((C * inner[..., None]).astype(np.float32), (21, 21)); w = cv2.blur(inner.astype(np.float32), (21, 21))[..., None]
fill = np.where(w > 0.05, s / np.maximum(w, 1e-3), C)
edge = ((Af > 0.02) & (inner == 0))[..., None]
src = np.array(Image.open('elon_full.png'))[..., :3].astype(np.float32)
patch = np.where(edge, 0.3 * C + 0.7 * fill, src[y0:y1, x0:x1])
src[y0:y1, x0:x1] = patch
out = np.dstack([np.clip(src, 0, 255).astype(np.uint8), (np.clip(newA, 0, 1) * 255).astype(np.uint8)])
Image.fromarray(out).save('elon_full2.png')
sp = '/tmp/claude-0/-home-claude/37fc447b-0e2e-5961-ad6b-3e3f925800ef/scratchpad/'
im = Image.fromarray(out)
for name, c in [('mag', (255, 0, 255, 255)), ('navy', (14, 24, 56, 255))]:
    bg = Image.new('RGBA', im.size, c); bg.alpha_composite(im); bg.convert('RGB').crop((1000, 0, 2200, 800)).resize((900, 600)).save(sp + f'hair_{name}.jpg')
