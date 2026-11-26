#!/usr/bin/env python3
"""Free AI images for thumbnail SCENES (owner, 26 Nov: "use any free ai for creating gta 6 clickbait gameplay screenshot").
Backends, tried in order (--backend picks one):
  hf           FLUX.1-schnell on Black Forest Labs' free Hugging Face Space (best free quality). Needs a free Hugging Face
               READ token in HF_TOKEN (env, or HF_TOKEN=... in ~/.config/watch/.env). Anonymous use runs out fast.
  gemini       gem_image.py (Gemini image models). Needs billing enabled on the Gemini key (free tier has no image quota).
  pollinations free, no key, but 1024x576 max, 1 image / 45 s per IP and a pollinations.ai mark bottom-right (leave it:
               never strip a service's watermark). Last resort only.
Then `upscale.py` (Real-ESRGAN) brings the scene to 4K in thumb_scene.py ("image": path in the spec).

RULES: the scene shows a REAL moment of the video, re-imagined (police standoff, crash, explosion...). Never a real person:
no streamer faces or likenesses in prompts (faces come only from the owner's photos, composited by thumb_scene.py).
Never put logos or text in the prompt (our own GTA VI title is drawn by thumb_scene.py). Keys are never printed.

usage: python3 ai_image.py "prompt" out.png [--n 3] [--seed 7] [--backend hf|gemini|pollinations] [--w 1360 --h 768]
       writes out.png (and out_2.png, out_3.png ... for --n > 1); Read them and pick the best."""
import argparse, os, shutil, subprocess, sys, time, urllib.parse

def secret(name):
    if os.environ.get(name): return os.environ[name]
    p = os.path.expanduser('~/.config/watch/.env')
    if os.path.exists(p):
        for line in open(p):
            if line.startswith(name + '='): return line.split('=', 1)[1].strip().strip('"\'')
    return None

def to_png(src, out):
    from PIL import Image
    Image.open(src).convert('RGB').save(out); return out

def hf(prompt, out, seed, w, h):
    from gradio_client import Client                     # pip install --break-system-packages gradio_client
    tok = secret('HF_TOKEN')
    c = Client('black-forest-labs/FLUX.1-schnell', token=tok, verbose=False) if tok else Client('black-forest-labs/FLUX.1-schnell', verbose=False)
    r, _ = c.predict(prompt, seed, False, w, h, 4, api_name='/infer')
    return to_png(r if isinstance(r, str) else r['path'], out)

def gemini(prompt, out, seed, w, h):
    here = os.path.dirname(os.path.abspath(__file__))
    subprocess.run([sys.executable, os.path.join(here, 'gem_image.py'), prompt, out, '--aspect', '16:9'], check=True)
    return out

def pollinations(prompt, out, seed, w, h):
    url = (f'https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width={min(w, 1024)}&height={min(h, 576)}'
           f'&model=flux&seed={seed}&nologo=true')
    for _ in range(3):
        r = subprocess.run(['curl', '-s', '-o', out + '.jpg', '-w', '%{http_code}', '--max-time', '180', url], capture_output=True, text=True)
        if r.stdout == '200': return to_png(out + '.jpg', out)
        time.sleep(48)                                     # free limit: 1 image / 45 s
    raise RuntimeError(f'pollinations HTTP {r.stdout}')

BACKENDS = {'hf': hf, 'gemini': gemini, 'pollinations': pollinations}

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('prompt'); ap.add_argument('out')
    ap.add_argument('--n', type=int, default=1); ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--backend'); ap.add_argument('--w', type=int, default=1360); ap.add_argument('--h', type=int, default=768)
    a = ap.parse_args(); order = [a.backend] if a.backend else ['hf', 'gemini', 'pollinations']
    for i in range(a.n):
        out = a.out if i == 0 else a.out.replace('.png', f'_{i + 1}.png'); seed = a.seed + i * 1009
        for b in order:
            try:
                BACKENDS[b](a.prompt, out, seed, a.w, a.h); print(out, 'via', b); break
            except Exception as e:
                msg = str(e).replace(secret('HF_TOKEN') or '\0', '***')[:160]; print(f'{b} failed: {msg}', file=sys.stderr)
        else:
            sys.exit('no backend worked (HF token missing/used up? Gemini billing off? Pollinations limit?)')
