# download chosen windows at 1080p60 (VOD time = meta.a + source t), strip chapters, run in parallel per user
import json, os, subprocess, sys, concurrent.futures as cf
W = [('clix', 225, 305), ('clix', 800, 868), ('quin69', 208, 268), ('quin69', 795, 845), ('hutchmf', 100, 152), ('hutchmf', 212, 302),
     ('lacy', 40, 108), ('lacy', 198, 258), ('lacy', 338, 396), ('lacy', 712, 744), ('xqc', 0, 50), ('xqc', 245, 262), ('xqc', 398, 412), ('xqc', 598, 614), ('xqc', 790, 818),
     ('darkviperau', 230, 302), ('darkviperau', 830, 882), ('tgg_gta', 148, 192), ('tgg_gta', 220, 292), ('jasontheween', 130, 192), ('jasontheween', 203, 247),
     ('jasontheween', 700, 737), ('jasontheween', 808, 838)]
TD = '/home/claude/clipper/bin/TwitchDownloaderCLI'
def get(w):
    u, t0, t1 = w; m = json.load(open(f'/home/claude/launch/{u}.meta.json')); out = f'/home/claude/untrusted/launch/hq/{u}_{t0}.mp4'
    if os.path.exists(out): return f'{out} exists'
    raw = out + '.raw.mp4'
    r = subprocess.run([TD, 'videodownload', '--id', m['vod'], '-q', '1080p60', '-b', str(m['a'] + t0), '-e', str(m['a'] + t1), '-o', raw, '--collision', 'Overwrite'], capture_output=True, text=True)
    if r.returncode: return f'{out} FAILED {r.stdout[-200:]}'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-map', '0:v:0', '-map', '0:a:0', '-c', 'copy', '-dn', '-map_chapters', '-1', '-map_metadata', '-1', '-movflags', '+faststart', out], check=True)
    os.remove(raw); return f'{out} ok'
with cf.ThreadPoolExecutor(6) as ex:
    for res in ex.map(get, W): print(res, flush=True)
print('HQ_DONE')
