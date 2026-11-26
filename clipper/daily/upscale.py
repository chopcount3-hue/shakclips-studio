#!/usr/bin/env python3
"""Free AI upscaling of GAMEPLAY / scene frames for 4K thumbnails: Real-ESRGAN realesr-general-x4v3 (BSD-3, xinntao) on CPU
with plain torch (no basicsr). Weights (4.9 MB) are fetched once from the Real-ESRGAN GitHub release into
~/.cache/realesrgan/. A 1150x647 crop takes ~1 min on 2 CPU cores.

NEVER run this on a real person's face or photo (house rule: owner photos are only cut out and uniformly scaled; AI
upscaling invents facial detail). thumb_scene.py uses it for the scene only; the face cutout is scaled with Lanczos.

usage: $PY upscale.py in.png out.png        (x4)      or in code: upscale.x4(pil_image) -> pil_image"""
import os, subprocess, sys
import numpy as np
from PIL import Image

URL = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth'
PTH = os.path.expanduser('~/.cache/realesrgan/realesr-general-x4v3.pth')

def _net():
    import torch, torch.nn as nn, torch.nn.functional as F
    class SRVGGNetCompact(nn.Module):
        def __init__(s, nf=64, nc=32, up=4):
            super().__init__(); s.up = up
            L = [nn.Conv2d(3, nf, 3, 1, 1), nn.PReLU(nf)]
            for _ in range(nc): L += [nn.Conv2d(nf, nf, 3, 1, 1), nn.PReLU(nf)]
            s.body = nn.ModuleList(L + [nn.Conv2d(nf, 3 * up * up, 3, 1, 1)]); s.ups = nn.PixelShuffle(up)
        def forward(s, x):
            o = x
            for l in s.body: o = l(o)
            return s.ups(o) + F.interpolate(x, scale_factor=s.up, mode='nearest')
    if not os.path.exists(PTH):
        os.makedirs(os.path.dirname(PTH), exist_ok=True); subprocess.run(['curl', '-fsSL', '-o', PTH, URL], check=True)
    sd = torch.load(PTH, map_location='cpu', weights_only=True); sd = sd.get('params_ema', sd.get('params', sd))
    net = SRVGGNetCompact(); net.load_state_dict(sd, strict=True); net.eval(); return net, torch

def x4(im, tile=320, pad=12):
    """PIL RGB -> PIL RGB at 4x, tiled so memory stays small"""
    net, torch = _net(); torch.set_num_threads(os.cpu_count() or 2)
    a = np.asarray(im.convert('RGB'), dtype=np.float32) / 255.0; h, w, _ = a.shape; out = np.zeros((h * 4, w * 4, 3), np.float32)
    with torch.inference_mode():
        for y in range(0, h, tile):
            for x in range(0, w, tile):
                y0, x0, y1, x1 = max(0, y - pad), max(0, x - pad), min(h, y + tile + pad), min(w, x + tile + pad)
                t = torch.from_numpy(a[y0:y1, x0:x1].transpose(2, 0, 1).copy())[None]
                r = net(t)[0].clamp(0, 1).numpy().transpose(1, 2, 0)
                ty, tx = (y - y0) * 4, (x - x0) * 4; th, tw = min(tile, h - y) * 4, min(tile, w - x) * 4
                out[y * 4:y * 4 + th, x * 4:x * 4 + tw] = r[ty:ty + th, tx:tx + tw]
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8))

if __name__ == '__main__':
    x4(Image.open(sys.argv[1])).save(sys.argv[2]); print(sys.argv[2], Image.open(sys.argv[2]).size)
