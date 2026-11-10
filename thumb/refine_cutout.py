# usage: python3 refine_cutout.py <original photo> <first-pass cutout.png from cutout.py> <out_hq.png>
# Second-pass GrabCut at high resolution in a narrow band around the first mask, then smooth + de-fringe the edge.
import cv2, numpy as np
from PIL import Image
im = Image.open(__import__('sys').argv[1]).convert('RGB'); rgb = np.array(im); H, W = rgb.shape[:2]
a0 = np.array(Image.open(__import__('sys').argv[2]))[..., 3]
sc = 2000 / W; w2, h2 = 2000, int(H * sc)
img = cv2.cvtColor(cv2.resize(rgb, (w2, h2), interpolation=cv2.INTER_AREA), cv2.COLOR_RGB2BGR)
m0 = cv2.resize(a0, (w2, h2), interpolation=cv2.INTER_AREA) > 127
mask = np.full((h2, w2), cv2.GC_BGD, np.uint8)
fg = cv2.erode(m0.astype(np.uint8), np.ones((15, 15), np.uint8)); band = cv2.dilate(m0.astype(np.uint8), np.ones((15, 15), np.uint8))
mask[band > 0] = cv2.GC_PR_BGD; mask[m0] = cv2.GC_PR_FGD; mask[fg > 0] = cv2.GC_FGD
bgd = np.zeros((1, 65)); fgd = np.zeros((1, 65))
cv2.grabCut(img, mask, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)
m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(m); big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = np.where(lab == big, 255, 0).astype(np.uint8)
inv = 255 - m; n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv)
for i in range(1, n2):
    x, y, w, h, ar = st2[i]
    if ar < 3000 and x > 0 and y > 0 and x + w < w2 and y + h < h2: m[lab2 == i] = 255
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
# smooth contour: blur then re-threshold, then a soft 1.5px edge
m = (cv2.GaussianBlur(m, (0, 0), 3) > 127).astype(np.uint8) * 255
alpha = cv2.GaussianBlur(m, (0, 0), 1.2)
# de-fringe: pull edge colours toward the inside colours
out = cv2.resize(rgb, (w2, h2), interpolation=cv2.INTER_AREA)
inner = cv2.erode(m, np.ones((7, 7), np.uint8)); edge = (alpha > 0) & (inner == 0)
blur_in = cv2.blur(out * (inner[..., None] > 0), (15, 15)).astype(np.float32); wts = cv2.blur((inner > 0).astype(np.float32), (15, 15))[..., None]
fill = np.where(wts > 0.05, blur_in / np.maximum(wts, 1e-3), out).astype(np.uint8)
out[edge] = (0.45 * out[edge] + 0.55 * fill[edge]).astype(np.uint8)
Image.fromarray(np.dstack([out, alpha])).save(__import__('sys').argv[3]); print(w2, h2)
