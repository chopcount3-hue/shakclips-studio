#!/usr/bin/env python3
"""Gemini (Nano Banana) image generation for long-video thumbnail SCENES (owner, 26 Nov: "gemini to create ... clickbait
game play screenshots and add ishowspeed reaction photo on side"). Generates only the SCENE: a hyper-real, dramatic
version of a moment that REALLY happens in the video. Never generate or edit a real person's face or likeness (the
streamer's face is added afterwards from an owner-supplied photo in photos/). No game logos or brand marks in the prompt.

usage: python3 gem_image.py "<prompt>" out.png [--model gemini-3.1-flash-image] [--ref frame.jpg ...]
key: GEMINI_API_KEY from the environment or ~/.config/watch/.env (never print it, never commit it)."""
import argparse, base64, json, os, sys, urllib.request

def key():
    k = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not k and os.path.exists(os.path.expanduser('~/.config/watch/.env')):
        for l in open(os.path.expanduser('~/.config/watch/.env')):
            if l.strip().startswith(('GEMINI_API_KEY=', 'GOOGLE_API_KEY=')): k = l.split('=', 1)[1].strip().strip('"\'')
    if not k: sys.exit('no GEMINI_API_KEY')
    return k

def generate(prompt, out, model='gemini-3.1-flash-image', refs=(), aspect='16:9'):
    parts = [{'text': prompt}]
    for r in refs:
        mt = 'image/png' if r.lower().endswith('.png') else 'image/jpeg'
        parts.append({'inline_data': {'mime_type': mt, 'data': base64.b64encode(open(r, 'rb').read()).decode()}})
    body = {'contents': [{'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspect}}}
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
                                 data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': key()})
    try: d = json.load(urllib.request.urlopen(req, timeout=180))
    except urllib.error.HTTPError as e: sys.exit(f'HTTP {e.code}: {e.read().decode()[:300]}')
    for c in d.get('candidates', []):
        for p in c.get('content', {}).get('parts', []):
            b = p.get('inline_data') or p.get('inlineData')
            if b: open(out, 'wb').write(base64.b64decode(b['data'])); return out
    sys.exit('no image returned: ' + json.dumps(d)[:300])

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('prompt'); ap.add_argument('out'); ap.add_argument('--model', default='gemini-3.1-flash-image')
    ap.add_argument('--ref', action='append', default=[]); ap.add_argument('--aspect', default='16:9'); a = ap.parse_args()
    print(generate(a.prompt, a.out, a.model, a.ref, a.aspect))
