#!/usr/bin/env python3
"""Today's GTA VI clip pool: the most-viewed Twitch clips of the last N hours, minus anything already used.
usage: python3 find.py [--hours 30] [--top 40] [--shorts-hours 168]  -> $WORK/cands.json (ranked), printed table
Clips from shorts_creators.txt come first (7-day lookback) with "shorts_ok": true. SHORTS may use ONLY those.
GQL needs no key (public web client id). Game-level clips only return the first 100 (later pages fail an integrity check),
so the pool is widened with user.clips for every login in streamers.txt plus whoever is live in the category now."""
import argparse, concurrent.futures as cf, datetime as dt, json, os, re, sys, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__)); WORK = os.environ.get('WORK', '/home/claude/gtaday')
GAME = 'Grand Theft Auto VI'
F = 'slug title viewCount durationSeconds createdAt language videoOffsetSeconds broadcaster { login displayName } game { name }'

def gql(q):
    req = urllib.request.Request('https://gql.twitch.tv/gql', json.dumps({'query': q}).encode(),
                                 {'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko', 'Content-Type': 'application/json'})
    for _ in range(3):
        try: return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception: pass
    return {}

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--hours', type=float, default=30); ap.add_argument('--top', type=int, default=30)
    ap.add_argument('--shorts-hours', type=float, default=168)   # lookback for shorts_creators.txt (their newest Twitch clips can be days old)
    a = ap.parse_args(); os.makedirs(WORK, exist_ok=True)
    used = set(json.load(open(os.path.join(HERE, 'used.json')))) if os.path.exists(os.path.join(HERE, 'used.json')) else set()
    users = [u for l in open(os.path.join(HERE, 'streamers.txt')) if not l.startswith('#') for u in l.split()]
    r = gql('{ game(name: "%s") { streams(first: 100) { edges { node { broadcaster { login } } } } } }' % GAME)
    live = [e['node']['broadcaster']['login'] for e in (((r.get('data') or {}).get('game') or {}).get('streams') or {}).get('edges', []) if e['node']['broadcaster']]
    users = list(dict.fromkeys(live + users))
    pool = {}
    def add(nodes):
        for n in nodes or []:
            if n and n.get('game') and n['game']['name'] == GAME: pool[n['slug']] = n
    for crit in ('period: LAST_DAY, sort: VIEWS_DESC', 'period: LAST_DAY, sort: VIEWS_DESC, languages: [EN]', 'period: LAST_DAY, sort: TRENDING'):
        r = gql('{ game(name: "%s") { clips(first: 100, criteria: {%s}) { edges { node { %s } } } } }' % (GAME, crit, F))
        add([e['node'] for e in ((((r.get('data') or {}).get('game') or {}).get('clips') or {}).get('edges') or [])])
    def uc(login):
        r = gql('{ user(login: "%s") { clips(first: 100, criteria: {period: LAST_DAY, sort: VIEWS_DESC}) { edges { node { %s } } } } }' % (login, F))
        try: return [e['node'] for e in r['data']['user']['clips']['edges']]
        except Exception: return []
    with cf.ThreadPoolExecutor(8) as ex:
        for nodes in ex.map(uc, users): add(nodes)
    SF = os.path.join(HERE, 'shorts_creators.txt')
    SC = [l.strip().lower() for l in open(SF) if l.strip() and not l.startswith('#')] if os.path.exists(SF) else []
    def ucw(login):
        out = []
        for crit in ('period: LAST_WEEK, sort: VIEWS_DESC', 'period: LAST_WEEK, sort: TRENDING'):
            r = gql('{ user(login: "%s") { clips(first: 100, criteria: {%s}) { edges { node { %s } } } } }' % (login, crit, F))
            try: out += [e['node'] for e in r['data']['user']['clips']['edges']]
            except Exception: pass
        return out
    with cf.ThreadPoolExecutor(8) as ex:
        for nodes in ex.map(ucw, SC): add(nodes)
    cut = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=a.hours)).isoformat()
    NSFW = re.compile(r'porn|goon|jiggl|gya+t|freaky|bricked|nsfw|strip|naked|nude|boob|tits|thirst|sex|horny|onlyfans|steamy|shaft|thicc|booty|n[i1]gg|slur|violen|gore|blood', re.I)
    scut = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=a.shorts_hours)).isoformat()
    for n in pool.values(): n['shorts_ok'] = n['broadcaster']['login'].lower() in SC
    xs = [n for n in pool.values() if n['createdAt'] >= (scut if n['shorts_ok'] else cut)[:19] and n['slug'] not in used
          and n['durationSeconds'] >= 12 and not NSFW.search(n['title'] or '')]
    # rank: English first (the channel's audience), then views; at most 4 per streamer so one stream can't fill the day
    # Popular creators only (owner, 22 Nov: "no one watches low popular creators"): keep clips from popular.txt; fall back
    # to other streamers only when fewer than 12 popular clips exist. English first, then most-viewed.
    PF = os.path.join(HERE, 'popular.txt')
    POP = {l.strip().lower() for l in open(PF) if l.strip() and not l.startswith('#')} if os.path.exists(PF) else set()
    for n in xs: n['popular'] = n['broadcaster']['login'].lower() in POP
    if sum(n['popular'] for n in xs) >= 12: xs = [n for n in xs if n['popular']]
    for n in xs: n['popular'] = n['popular'] or n['shorts_ok']
    xs.sort(key=lambda n: (not n['shorts_ok'], (n['language'] or '').lower() != 'en', not n['popular'], -n['viewCount']))
    per, out = {}, []
    for n in xs:
        u = n['broadcaster']['login']
        if per.get(u, 0) >= (5 if n['shorts_ok'] else 4): continue
        per[u] = per.get(u, 0) + 1; out.append(n)
        if len(out) >= a.top: break
    for k, n in enumerate(out): n['name'] = f"{n['broadcaster']['login']}_{k:02d}"
    json.dump(out, open(os.path.join(WORK, 'cands.json'), 'w'), indent=1, ensure_ascii=False)
    print(f'{len(users)} streamers ({len(live)} live), pool {len(pool)}, fresh unused {len(xs)}, kept {len(out)}')
    for n in out:
        print(f"{'S' if n['shorts_ok'] else ' '} {n['name']:<22} {n['viewCount']:>7} views {n['durationSeconds']:>3.0f}s {n['language']} {n['createdAt'][5:10]} | {n['title'][:60]}")

if __name__ == '__main__':
    main()
