"""Record the preview at normal speed (720x1280) and lay the commentator's voice under it from the page's SAYLOG."""
import glob, json, os, subprocess, sys, time
sys.path.insert(0, '/home/claude/flagwars'); from shoot import CSS
from playwright.sync_api import sync_playwright
D = '/home/claude/flagwars'; SECS = float(sys.argv[1]) if len(sys.argv) > 1 else 45
dur = json.load(open(f'{D}/voice/dur.json'))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-gpu'])
    ctx = b.new_context(viewport={'width': 720, 'height': 1280}, record_video_dir=f'{D}/shots/vid', record_video_size={'width': 720, 'height': 1280})
    pg = ctx.new_page(); t_page = time.time()
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS)); pg.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    pg.goto(f'file://{D}/index.html#stream'); pg.wait_for_function('window.FW && FW.S'); pg.evaluate('window.SAYLOG = []')
    t_start = pg.evaluate('(performance.timeOrigin + performance.now()) / 1000')
    pg.wait_for_timeout(int(SECS * 1000)); log = pg.evaluate('SAYLOG'); origin = pg.evaluate('performance.timeOrigin') / 1000
    ctx.close(); b.close()
v = sorted(glob.glob(f'{D}/shots/vid/*.webm'), key=os.path.getmtime)[-1]
cut = max(0, t_start - t_page)                      # drop the page-load seconds at the front
ins, flt, n = [], [], 0
for e in log:
    at = origin + e['t'] / 1000 - t_start
    for k in e['keys']:
        if k in dur and at < SECS:
            ins += ['-i', f'{D}/voice/mp3/{k}.mp3']; flt.append(f'[{n + 1}:a]adelay={int(at * 1000)}|{int(at * 1000)}[a{n}]'); n += 1
        at += dur.get(k, 1.3) + .1
mix = ';'.join(flt) + ';' + ''.join(f'[a{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad,atrim=0:{SECS}[aout]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{cut:.2f}', '-i', v, *ins, '-filter_complex', mix, '-map', '0:v', '-map', '[aout]',
                '-t', str(SECS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k',
                '-movflags', '+faststart', f'{D}/shots/flag_wars_preview_voice.mp4'], check=True)
print(n, 'voice clips placed;', [' + '.join(e['keys']) for e in log][:12])
