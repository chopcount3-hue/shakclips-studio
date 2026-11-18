# join several HQ windows of one streamer (same layout) into one source, with merged word timings
import json, subprocess, sys
H = '/home/claude/untrusted/launch/hq/'; name, parts = sys.argv[1], sys.argv[2:]
lst = f'/home/claude/launch/{name}.txt'; open(lst, 'w').write(''.join(f"file '{H}{p}.mp4'\n" for p in parts))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', H + name + '.mp4'], check=True)
off = 0; ws = []
for p in parts:
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', H + p + '.mp4'], capture_output=True, text=True).stdout)
    ws += [dict(w, s=round(w['s'] + off, 2), e=round(w['e'] + off, 2)) for w in json.load(open(H + p + '.words.json'))['segments'][0]['words']]
    print(name, p, 'offset', round(off, 2)); off += d
json.dump({'segments': [{'s': 0, 'e': off, 't': '', 'words': ws}]}, open(H + name + '.words.json', 'w'))
