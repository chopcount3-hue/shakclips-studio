#!/usr/bin/env python3
"""Get a stream or video into workdir/source.mp4 (+ workdir/chat.json when chat replay exists).
Only use streams whose owner allows clipping (their clipping program or a written OK).

usage: python fetch.py <url-or-file> workdir [--from 1:20:00] [--to 2:05:00] [--max-hours 8] [--quality 1080p60]
  twitch.tv/videos/<id>   VOD (or part of it) via TwitchDownloaderCLI + its chat replay (JSON)
  twitch.tv/<channel>     LIVE: records with Streamlink until the stream ends (or --max-hours), then fetch the VOD's chat later
  twitch.tv/.../clip/...  a Twitch clip (yt-dlp)
  kick.com/...            Kick VOD or clip (yt-dlp)
  youtube.com / youtu.be  tried with yt-dlp, but YouTube refuses downloads to this cloud server (HTTP 403):
                          the owner uploads YouTube recordings as files instead
  /path/file.mp4          a file the owner uploaded
Tools: yt-dlp (Unlicense), Streamlink (BSD-2), TwitchDownloaderCLI (MIT).
"""
import argparse, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VENV = '/home/claude/venvs/cbx/bin'
TD = os.environ.get('TWITCHDOWNLOADER', os.path.join(HERE, 'bin', 'TwitchDownloaderCLI'))

def run(cmd, **kw):
    print('$', ' '.join(cmd)[:200], flush=True); r = subprocess.run(cmd, **kw)
    if r.returncode: sys.exit(f'failed ({r.returncode}): {cmd[0]}')

def secs(t):
    if t is None: return None
    p = [float(x) for x in str(t).split(':')]; v = 0
    for x in p: v = v * 60 + x
    return v

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('work')
    ap.add_argument('--from', dest='t0'); ap.add_argument('--to', dest='t1')
    ap.add_argument('--max-hours', type=float, default=8); ap.add_argument('--quality', default='1080p60')
    a = ap.parse_args(); os.makedirs(a.work, exist_ok=True); out = os.path.join(a.work, 'source.mp4')
    t0, t1 = secs(a.t0), secs(a.t1); s = a.src

    if os.path.isfile(s):                                                  # uploaded file
        if s.lower().endswith('.mp4'): shutil.copy(s, out)
        else: run(['ffmpeg', '-v', 'error', '-y', '-i', s, '-c', 'copy', out])
    elif m := re.search(r'twitch\.tv/videos/(\d+)', s):                   # Twitch VOD + chat replay
        vid = m.group(1); rng = (['-b', str(int(t0))] if t0 else []) + (['-e', str(int(t1))] if t1 else [])
        run([TD, 'videodownload', '--id', vid, '-q', a.quality, *rng, '-o', out, '--collision', 'Overwrite'])
        run([TD, 'chatdownload', '--id', vid, *rng, '-o', os.path.join(a.work, 'chat.json'), '--collision', 'Overwrite'])
        if t0: open(os.path.join(a.work, 'chat_offset.txt'), 'w').write(str(t0))   # chat times are VOD times
    elif re.search(r'twitch\.tv/[^/]+/clip/|clips\.twitch\.tv|kick\.com', s):
        run([f'{VENV}/yt-dlp', '-f', 'bv*[height<=1080]+ba/b', '--merge-output-format', 'mp4', '-o', out, '--force-overwrites', s])
    elif m := re.search(r'twitch\.tv/([A-Za-z0-9_]+)/?$', s):              # live channel
        ts = os.path.join(a.work, 'live.ts')
        print(f'Recording {m.group(1)} live (stops when the stream ends or after {a.max_hours} h)...', flush=True)
        run([f'{VENV}/streamlink', '--twitch-disable-ads', '--hls-duration', str(int(a.max_hours * 3600)),
             '--retry-open', '3', '-o', ts, '--force', s, f'{a.quality},1080p,best'])
        run(['ffmpeg', '-v', 'error', '-y', '-i', ts, '-c', 'copy', '-movflags', '+faststart', out]); os.remove(ts)
        print('Live recorded. For chat-spike scoring, run fetch.py again on the VOD link (twitch.tv/videos/...) once Twitch publishes it.')
    elif re.search(r'youtube\.com|youtu\.be', s):
        r = subprocess.run([f'{VENV}/yt-dlp', '--js-runtimes', 'node', '-f', 'bv*[height<=1080]+ba/b', '--merge-output-format', 'mp4',
                            '-o', out, '--force-overwrites', *(['--download-sections', f'*{t0 or 0}-{t1 or "inf"}'] if (t0 or t1) else []), s])
        if r.returncode:
            sys.exit('YouTube refused the download (it blocks cloud servers). Ask the owner to upload the recording as a file.')
    else:
        sys.exit('unknown source: ' + s)
    d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip()
    print(f'OK {out}  {float(d) / 60:.1f} min' + ('  + chat.json' if os.path.exists(os.path.join(a.work, 'chat.json')) else ''))

if __name__ == '__main__':
    main()
