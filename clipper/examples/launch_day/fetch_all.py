# Fetch each launch stream from the NZ unlock (11:00 UTC) to now at low quality + chat, for picking moments
import datetime as dt, json, subprocess, sys
from gq import gql
UNLOCK = dt.datetime(2026, 11, 18, 11, 0, 0, tzinfo=dt.timezone.utc)
users = sys.argv[1].split(','); q = sys.argv[2] if len(sys.argv) > 2 else '480p30'; pre = 240
for u in users:
    v = gql('query { user(login:"%s") { videos(first:1, type:ARCHIVE, sort:TIME) { edges { node { id createdAt lengthSeconds status } } } } }' % u)['data']['user']['videos']['edges'][0]['node']
    st = dt.datetime.fromisoformat(v['createdAt'].replace('Z', '+00:00'))
    a = max(0, int((UNLOCK - st).total_seconds()) - pre); b = int(v['lengthSeconds']) - 60
    work = f'/home/claude/untrusted/launch/{u}'
    json.dump(dict(user=u, vod=v['id'], created=v['createdAt'], a=a, b=b, unlock_off=int((UNLOCK - st).total_seconds())), open(f'/home/claude/launch/{u}.meta.json', 'w'))
    print(u, v['id'], 'from', a, 'to', b, f'({(b - a) / 60:.1f} min)', flush=True)
    r = subprocess.run(['/home/claude/venvs/cbx/bin/python', '/home/claude/clipper/fetch.py', f'https://www.twitch.tv/videos/{v["id"]}', work, '--from', str(a), '--to', str(b), '--quality', q], capture_output=True, text=True)
    print(u, 'rc', r.returncode, (r.stdout + r.stderr).strip().splitlines()[-1:] if (r.stdout + r.stderr).strip() else '', flush=True)
