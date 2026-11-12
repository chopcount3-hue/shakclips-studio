# list a Twitch channel's clips (public GQL), filter titles by keywords
import json, sys, urllib.request
login, period = sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'ALL_TIME'
kw = [k.lower() for k in (sys.argv[3].split(',') if len(sys.argv) > 3 else ['pre', 'order', 'buy', 'bought', 'gta'])]
out, cursor = [], None
for page in range(10):
    after = f', after:"{cursor}"' if cursor else ''
    q = 'query { user(login:"%s") { clips(first:100%s, criteria:{period:%s, sort:VIEWS_DESC}) { edges { cursor node { slug title viewCount createdAt durationSeconds game{name} } } pageInfo{hasNextPage} } } }' % (login, after, period)
    req = urllib.request.Request('https://gql.twitch.tv/gql', data=json.dumps({'query': q}).encode(),
                                 headers={'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko', 'Content-Type': 'application/json'})
    d = json.load(urllib.request.urlopen(req, timeout=60))
    c = ((d.get('data') or {}).get('user') or {}).get('clips')
    if not c: print('  stop at page', page, str(d)[:200]); break
    out += [e['node'] for e in c['edges']]
    if not c['pageInfo']['hasNextPage'] or not c['edges']: break
    cursor = c['edges'][-1]['cursor']
json.dump(out, open(f'clips_{login}_{period}.json', 'w'), indent=1)
hits = [x for x in out if any(k in x['title'].lower() for k in kw)]
print(login, period, len(out), 'clips,', len(hits), 'matching')
for x in hits[:60]:
    print(f"{x['createdAt'][:10]} {x['viewCount']:>8} {x['durationSeconds']:>3}s {(x['game'] or {}).get('name','')[:14]:14} {x['slug'][:40]:40} {x['title'][:80]}")
