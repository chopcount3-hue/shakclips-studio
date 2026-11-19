import os, subprocess, concurrent.futures as cf
TD = '/home/claude/clipper/bin/TwitchDownloaderCLI'; D = '/home/claude/untrusted/day2/'
W = [(810, 930), (1440, 1530), (1818, 1950), (1968, 2040), (2700, 2760), (5010, 5076), (6138, 6198), (10398, 10530)]
def get(w):
    a, b = w; out = f'{D}kaivod_{a}.mp4'
    if os.path.exists(out): return out + ' exists'
    r = subprocess.run([TD, 'videodownload', '--id', '2932305259', '-q', '1080p60', '-b', str(a), '-e', str(b), '-o', out + '.raw.mp4', '--collision', 'Overwrite'], capture_output=True, text=True)
    if r.returncode: return f'{out} FAILED {r.stdout[-200:]}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out + '.raw.mp4', '-map', '0:v:0', '-map', '0:a:0', '-c', 'copy', '-dn', '-map_chapters', '-1', '-movflags', '+faststart', out], check=True)
    os.remove(out + '.raw.mp4'); return out + ' ok'
with cf.ThreadPoolExecutor(4) as ex:
    for r in ex.map(get, W): print(r, flush=True)
print('KAI_DONE')
