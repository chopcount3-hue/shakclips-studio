#!/usr/bin/env python3
"""One frame of a clip with a 100 px grid, to read off the webcam box [x, y, w, h] (1920x1080 coordinates).
usage: python3 frame.py <name> <seconds>   -> $WORK/frames/<name>_<t>.jpg"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
WORK = os.environ.get('WORK', '/home/claude/gtaday'); name, t = sys.argv[1], float(sys.argv[2])
os.makedirs(os.path.join(WORK, 'frames'), exist_ok=True); o = os.path.join(WORK, 'frames', f'{name}_{t:.0f}.jpg')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', os.path.join(WORK, 'clips', name + '.mp4'), '-frames:v', '1', '-vf', 'scale=1920:1080', o], check=True)
im = Image.open(o).convert('RGB'); d = ImageDraw.Draw(im); F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
for x in range(0, 1920, 100): d.line([(x, 0), (x, 1080)], fill=(255, 255, 0), width=1); d.text((x + 2, 2), str(x), fill='yellow', font=F, stroke_width=2, stroke_fill='black')
for y in range(0, 1080, 100): d.line([(0, y), (1920, y)], fill=(0, 255, 255), width=1); d.text((2, y + 2), str(y), fill='cyan', font=F, stroke_width=2, stroke_fill='black')
im.resize((1440, 810)).save(o, quality=85); print(o)
