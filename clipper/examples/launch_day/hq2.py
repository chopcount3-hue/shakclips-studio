# 1080p60 windows from the second stretch (VOD time = meta.w2_a + t)
import json, os, subprocess, sys, concurrent.futures as cf
W = [tuple(x.split(':')[:1]) + tuple(float(v) for v in x.split(':')[1:]) for x in sys.argv[1:]]
TD = '/home/claude/clipper/bin/TwitchDownloaderCLI'
def get(w):
    u, t0, t1 = w; m = json.load(open(f'/home/claude/launch/{u}.meta.json')); out = f'/home/claude/untrusted/launch/hq/{u}_w2_{int(t0)}.mp4'
    if os.path.exists(out): return f'{out} exists'
    raw = out + '.raw.mp4'
    r = subprocess.run([TD, 'videodownload', '--id', m['vod'], '-q', '1080p60', '-b', str(int(m['w2_a'] + t0)), '-e', str(int(m['w2_a'] + t1)), '-o', raw, '--collision', 'Overwrite'], capture_output=True, text=True)
    if r.returncode: return f'{out} FAILED {r.stdout[-200:]}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-map', '0:v:0', '-map', '0:a:0', '-c', 'copy', '-dn', '-map_chapters', '-1', '-map_metadata', '-1', '-movflags', '+faststart', out], check=True)
    os.remove(raw); return f'{out} ok'
with cf.ThreadPoolExecutor(5) as ex:
    for res in ex.map(get, W): print(res, flush=True)
print('HQ2_DONE')
