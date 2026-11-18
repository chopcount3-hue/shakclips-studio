# fetch the next stretch of each launch stream (from where the last window ended to now) at 480p + chat
import json, subprocess, sys
from gq import gql
u, tag = sys.argv[1], sys.argv[2]
m = json.load(open(f'/home/claude/launch/{u}.meta.json'))
v = gql('query { video(id:"%s") { lengthSeconds status } }' % m['vod'])['data']['video']
a = m.get('b_' + tag, m['b']) if False else m['b']
b = int(v['lengthSeconds']) - 60
work = f'/home/claude/untrusted/launch/{u}_{tag}'
print(u, tag, 'from', a, 'to', b, f'({(b - a) / 60:.1f} min)', v['status'], flush=True)
r = subprocess.run(['/home/claude/venvs/cbx/bin/python', '/home/claude/clipper/fetch.py', f'https://www.twitch.tv/videos/{m["vod"]}', work, '--from', str(a), '--to', str(b), '--quality', '480p30'], capture_output=True, text=True)
m[f'{tag}_a'], m[f'{tag}_b'] = a, b; json.dump(m, open(f'/home/claude/launch/{u}.meta.json', 'w'))
print(u, 'rc', r.returncode, (r.stdout + r.stderr).strip().splitlines()[-1:] if (r.stdout + r.stderr).strip() else '', flush=True)
