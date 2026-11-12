import json, re, sys, urllib.request, concurrent.futures as cf
def gql(q):
    req = urllib.request.Request('https://gql.twitch.tv/gql', data=json.dumps({'query': q}).encode(), headers={'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req, timeout=60))
PAT = re.compile(r'pre.?order|pre.?load|preload|preorder|bought gta|buy(ing|s)? gta|gta.{0,12}(download|install)|download(ing)? gta|purchas', re.I)
def scan(u):
    out = []
    try:
        for per in ('LAST_WEEK', 'LAST_MONTH', 'ALL_TIME'):
            d = gql('query { user(login:"%s") { clips(first:100, criteria:{period:%s, sort:VIEWS_DESC}) { edges { node { slug title createdAt viewCount durationSeconds } } } } }' % (u, per))
            for e in ((((d.get('data') or {}).get('user') or {}).get('clips') or {}).get('edges') or []):
                n = e['node']
                if PAT.search(n['title']): out.append(('clip', n['createdAt'][:10], n['viewCount'], n['durationSeconds'], n['slug'], n['title']))
        for typ in ('ARCHIVE', 'HIGHLIGHT'):
            d = gql('query { user(login:"%s") { videos(first:100, type:%s, sort:TIME) { edges { node { id title createdAt lengthSeconds viewCount } } } } }' % (u, typ))
            for e in ((((d.get('data') or {}).get('user') or {}).get('videos') or {}).get('edges') or []):
                n = e['node']
                if PAT.search(n['title']): out.append((typ.lower(), n['createdAt'][:10], n['viewCount'], n['lengthSeconds'], n['id'], n['title']))
    except Exception as ex: out.append(('err', str(ex)[:80]))
    return u, out
users = sys.argv[1].split(',')
with cf.ThreadPoolExecutor(6) as ex:
    for u, out in ex.map(scan, users):
        seen = set()
        for o in out:
            if o[-2] in seen: continue
            seen.add(o[-2]); print(u, *o[:4], o[-2][:30], str(o[-1])[:80])
