#!/usr/bin/env python3
"""Test harness: open index.html in headless Chrome (Google Fonts served locally from @fontsource), take canvas screenshots.
usage: python3 shoot.py <speed> <seconds,...> [--final]  -> /home/claude/flagwars/shots/s_<sec>.png
       python3 shoot.py video <seconds> <speed>          -> /home/claude/flagwars/shots/preview.webm"""
import base64, glob, os, sys, time
from playwright.sync_api import sync_playwright
D = '/home/claude/flagwars'; FS = glob.glob(f'{D}/build/fs/*/package/files')
def woff(name): return base64.b64encode(open([f'{d}/{name}' for d in FS if os.path.exists(f'{d}/{name}')][0], 'rb').read()).decode()
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(data:font/woff2;base64,{woff(f)}) format('woff2')}}"
              for fam, w, f in [('Bungee', 400, 'bungee-latin-400-normal.woff2'), ('Rubik', 600, 'rubik-latin-600-normal.woff2'),
                                ('Rubik', 800, 'rubik-latin-800-normal.woff2')])
if __name__ == '__main__':
    os.makedirs(f'{D}/shots', exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-gpu'])
        video = sys.argv[1] == 'video'
        ctx = b.new_context(viewport={'width': 540, 'height': 960}, device_scale_factor=1,
                            **({'record_video_dir': f'{D}/shots/vid', 'record_video_size': {'width': 540, 'height': 960}} if video else {}))
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
        pg.route('**/fonts.gstatic.com/**', lambda r: r.abort())
        pg.goto(f'file://{D}/index.html#stream'); pg.wait_for_timeout(1500)
        if video:
            secs, speed = float(sys.argv[2]), int(sys.argv[3])
            pg.evaluate(f'FW.S.speed = {speed}'); pg.wait_for_timeout(int(secs * 1000)); ctx.close()
            v = sorted(glob.glob(f'{D}/shots/vid/*.webm'), key=os.path.getmtime)[-1]; os.replace(v, f'{D}/shots/preview.webm'); print('video ok')
        else:
            pg.evaluate(f'FW.S.speed = {int(sys.argv[1])}'); t0 = time.time()
            for s in [float(x) for x in sys.argv[2].split(',')]:
                pg.wait_for_timeout(max(0, int((t0 + s - time.time()) * 1000))); pg.locator('#cv').screenshot(path=f'{D}/shots/s_{int(s)}.png')
                print(s, pg.evaluate('JSON.stringify({t: FW.S.t.toFixed(1), round: FW.S.round, phase: FW.S.phase, won: FW.S.won.length, lost: FW.S.lost.length})'))
            if '--final' in sys.argv:
                pg.evaluate('FW.finale()'); pg.wait_for_timeout(1500); pg.locator('#cv').screenshot(path=f'{D}/shots/final.png'); print('final shot')
        print('errors:', errs[:5]); b.close()
