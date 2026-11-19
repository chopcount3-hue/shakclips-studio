import subprocess, os, concurrent.futures as cf
TD = '/home/claude/clipper/bin/TwitchDownloaderCLI'; D = '/home/claude/untrusted/day2/'
rows = [l.split() for l in open('/home/claude/day2/clips.txt') if l.strip()]
def get(r):
    name, user, slug = r; out = D + name + '.mp4'
    if os.path.exists(out): return name + ' exists'
    for q in ('1080p60', '1080p', '720p60'):
        p = subprocess.run([TD, 'clipdownload', '--id', slug, '-q', q, '-o', out + '.tmp.mp4', '--collision', 'Overwrite'], capture_output=True, text=True)
        if p.returncode == 0 and os.path.exists(out + '.tmp.mp4'):
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out + '.tmp.mp4', '-map', '0:v:0', '-map', '0:a:0', '-c', 'copy', '-movflags', '+faststart', out]); os.remove(out + '.tmp.mp4')
            return f'{name} ok {q}'
    return f'{name} FAILED {p.stdout[-150:]}'
with cf.ThreadPoolExecutor(6) as ex:
    for r in ex.map(get, rows): print(r, flush=True)
print('CLIPS_DONE')
