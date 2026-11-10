import cv2, numpy as np
from PIL import Image
def cut(img, rect, bg_boxes=(), fg_boxes=(), work=700, iters=6, fg_polys=(), bg_polys=()):
    H, W = img.shape[:2]; k = work / max(H, W); sm = cv2.resize(img, (int(W * k), int(H * k)), interpolation=cv2.INTER_AREA)
    mask = np.zeros(sm.shape[:2], np.uint8); r = [int(v * k) for v in rect]
    bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(sm, mask, tuple(r), bgd, fgd, 3, cv2.GC_INIT_WITH_RECT)
    for (x0, y0, x1, y1) in bg_boxes: mask[int(y0 * k):int(y1 * k), int(x0 * k):int(x1 * k)] = cv2.GC_BGD
    for (x0, y0, x1, y1) in fg_boxes: mask[int(y0 * k):int(y1 * k), int(x0 * k):int(x1 * k)] = cv2.GC_FGD
    for p in bg_polys: cv2.fillPoly(mask, [np.array([[x * k, y * k] for x, y in p], np.int32)], cv2.GC_BGD)
    for p in fg_polys: cv2.fillPoly(mask, [np.array([[x * k, y * k] for x, y in p], np.int32)], cv2.GC_FGD)
    cv2.grabCut(sm, mask, None, bgd, fgd, iters, cv2.GC_INIT_WITH_MASK)
    m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
    # keep the largest blob, fill holes
    n, lab, st, _ = cv2.connectedComponentsWithStats(m); 
    if n > 1: big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = np.where(lab == big, 255, 0).astype(np.uint8)
    inv = 255 - m; n2, lab2, st2, _ = cv2.connectedComponentsWithStats(inv)
    for i in range(1, n2):
        x, y, w, h, a = st2[i]
        if x > 0 and y > 0 and x + w < m.shape[1] and y + h < m.shape[0]: m[lab2 == i] = 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    big = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    big = cv2.GaussianBlur(big, (0, 0), 1.6 / k * 0.5)
    big = np.clip((big.astype(np.float32) - 128) * 2.2 + 128, 0, 255).astype(np.uint8)
    rgba = np.dstack([cv2.cvtColor(img, cv2.COLOR_BGR2RGB), big]); return rgba
t = cv2.cvtColor(np.array(Image.open('trump.webp').convert('RGB')), cv2.COLOR_RGB2BGR)
rt = cut(t, (20, 40, 940, 1160), bg_boxes=[(0, 0, 960, 30), (0, 0, 120, 600), (880, 0, 960, 600)], fg_boxes=[(330, 400, 650, 760), (40, 950, 920, 1200)], fg_polys=[[(0, 725), (100, 697), (200, 662), (262, 652), (320, 720), (320, 1200), (0, 1200)]], bg_polys=[[(0, 0), (120, 0), (120, 450), (165, 520), (172, 598), (100, 633), (0, 662)]])
Image.fromarray(rt).save('trump_cut.png')
e = cv2.imread('elsayed.jpg')[0:1300, 870:2460]
re = cut(e, (20, 20, 1570, 1300), bg_boxes=[(820, 780, 930, 885), (900, 500, 1590, 880), (1200, 880, 1590, 1000), (1440, 1000, 1590, 1180), (0, 0, 60, 1300), (0, 0, 1590, 20)], fg_boxes=[(270, 300, 560, 700), (420, 950, 900, 1300)], bg_polys=[[(728, 838), (910, 838), (910, 918), (862, 906), (800, 882), (752, 862)]])
Image.fromarray(re).save('elsayed_cut.png')
for f in ['trump_cut.png', 'elsayed_cut.png']:
    im = Image.open(f); bg = Image.new('RGBA', im.size, (255, 0, 255, 255)); bg.alpha_composite(im); bg.convert('RGB').resize((im.width // 3, im.height // 3)).save('chk_' + f.replace('.png', '.jpg'))
print('ok')
