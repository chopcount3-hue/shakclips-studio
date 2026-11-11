#!/usr/bin/env python3
"""Find a streamer's webcam box automatically (MediaPipe face detector, Apache-2.0).

usage: python facecam.py source.mp4 [--samples 30]   -> prints JSON {"facecam": [x, y, w, h] or null, "hits": n}
A face that sits in the same place in most sampled frames is the facecam; the box around it is grown to a
4:3-ish webcam crop and clamped to the frame. Use the result as "facecam" in clips.json with "layout": "facecam".
"""
import argparse, json, os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))

def frames(src, n):
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
    p = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', src],
                                  capture_output=True, text=True).stdout)['streams'][0]
    W, H = p['width'], p['height']
    for k in range(n):
        t = dur * (k + 0.5) / n
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', src, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                             capture_output=True).stdout
        if len(raw) == W * H * 3: yield np.frombuffer(raw, np.uint8).reshape(H, W, 3), W, H

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('--samples', type=int, default=30); a = ap.parse_args()
    import mediapipe as mp
    from mediapipe.tasks.python import vision, BaseOptions
    det = vision.FaceDetector.create_from_options(vision.FaceDetectorOptions(
        base_options=BaseOptions(model_asset_path=os.path.join(HERE, 'models', 'blaze_face_short_range.tflite')), min_detection_confidence=0.6))
    boxes, W, H, n = [], 0, 0, 0
    for img, W, H in frames(a.src, a.samples):
        n += 1
        for d in det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(img))).detections:
            b = d.bounding_box; boxes.append((b.origin_x + b.width / 2, b.origin_y + b.height / 2, b.width, b.height))
    det.close()
    if not boxes: print(json.dumps({'facecam': None, 'hits': 0, 'frames': n})); return
    B = np.array(boxes); best, cnt = None, 0
    for cx, cy, w, h in B:                                  # the most repeated face position wins
        c = int(((np.abs(B[:, 0] - cx) < w * 0.5) & (np.abs(B[:, 1] - cy) < h * 0.5)).sum())
        if c > cnt: best, cnt = (cx, cy, w, h), c
    if cnt < 0.5 * n: print(json.dumps({'facecam': None, 'hits': cnt, 'frames': n, 'note': 'no steady webcam face'})); return
    sel = B[(np.abs(B[:, 0] - best[0]) < best[2] * 0.5) & (np.abs(B[:, 1] - best[1]) < best[3] * 0.5)]
    cx, cy, fw, fh = np.median(sel, axis=0)
    w = min(W, fw * 3.2); h = min(H, w * 0.75)              # webcam framing: head and shoulders, 4:3
    x = int(np.clip(cx - w / 2, 0, W - w)); y = int(np.clip(cy - h * 0.42, 0, H - h))
    print(json.dumps({'facecam': [x, y, int(w) // 2 * 2, int(h) // 2 * 2], 'hits': cnt, 'frames': n}))

if __name__ == '__main__':
    main()
