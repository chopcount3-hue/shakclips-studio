#!/usr/bin/env python3
"""Stream moments: find the best moments of recent marathon / collab / AMP streams (owner, 25 Nov: "don't only post GTA6
videos ... clip the videos from Kai Cenat and IShowSpeed marathon type, mafia[thon] marathon type, AMP type streams. See
the chat hypes and best moments ... clip them and make long form and short form videos").

  python3 streams.py pick [--days 4]                -> ranked recent VODs of stream_creators.txt (not yet used)
  python3 streams.py moments <vod_id> [--top 16]    -> full chat replay + community clips -> scored 5 s bins -> top windows
        writes $WORK/streams/<vod>/moments.md (read it) and ADDS the windows to $WORK/cands.json as
        <login>_m<NN> (vod, a, b, ...), so pull.py downloads just those windows and the rest of the pipeline is unchanged.
        streams_done.json = {vod_id: [window start seconds already posted]}: those windows are skipped.

Signals per 5 s bin (chat shifted back 8 s: chat reacts after the moment):
  chat rate, laugh emotes (KEKW, LUL, OMEGALUL, ICANT, 💀, 😭, LMAO ...), hype (W, POG, AURA, 🔥, CINEMA ...),
  shock (WTF, ???, NAH, BRO), "CLIP IT" requests; each as a z-score against a rolling 10-min baseline, plus
  community clips (viewers clip the moments they love; weighted by log views) over the clip's span."""
import argparse, collections, datetime as dt, json, math, os, re, subprocess, sys, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__)); WORK = os.environ.get('WORK', '/home/claude/gtaday')
TD = '/home/claude/clipper/bin/TwitchDownloaderCLI'; CID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'
LAUGH = re.compile(r'KEKW|KEKL|\bLUL|OMEGALUL|LMA+O|LMFAO|ICANT|💀|😭|😂|🤣|\bLOL\b|HAHA|pepeLaugh|xdd|\bxd\b|dead+\b|crying', re.I)
HYPE = re.compile(r'^\s*W+\s*$|\bW\b|POG|AURA|🔥|GOAT|CINEMA|LETS+ GO+|HYPE|\bOMG\b|PEAK|INSANE|GOATED|🐐', re.I)
SHOCK = re.compile(r'WTF|\?\?\?|^\s*\?+\s*$|\bNAH+\b|\bBRO+\b|HOLY|WHAT THE|monkaS|SHEESH|🤯|😳|😱', re.I)
CLIPREQ = re.compile(r'\bCLIP\b|CLIP IT|CLIPPED', re.I)
BAD = re.compile(r'porn|nsfw|naked|nude|boob|tits|sex|horny|onlyfans|gyat|thicc|booty|strip|n[i1]gg|slur', re.I)
MARATHON = re.compile(r'MAFIATHON|MARATHON|SUBATHON|NOT ENDING|DAY \d+|\d+ ?HOURS?|24 ?HR|ALL NIGHT|FINALE', re.I)
COLLAB = re.compile(r'\bVS\b|\bAMP\b|\bX\b|\bFT\.?\b|\bWITH\b|&|\+', re.I)
BIG = ('kaicenat', 'ishowspeed')
ALIAS = {'kaicenat': r'\bKAI\b', 'ishowspeed': r'\bSPEED\b|ISHOWSPEED', 'fanum': r'FANUM', 'agent00': r'\bAGENT', 'chrisnxtdoor': r'\bCHRIS\b',
         'dukedennis': r'\bDUKE\b', 'rakai': r'RAKAI', 'adinross': r'\bADIN\b'}
GTA = re.compile(r'GTA|GRAND THEFT', re.I)   # owner, 25 Nov: "fuck gta 6" -> non-GTA streams get a bonus

def gql(q):
    req = urllib.request.Request('https://gql.twitch.tv/gql', data=json.dumps(q).encode(), headers={'Client-Id': CID, 'Content-Type': 'application/json'})
    for _ in range(3):
        try: return json.load(urllib.request.urlopen(req, timeout=40))
        except Exception as e: err = e
    raise err

def creators():
    return [l.split('#')[0].strip().lower() for l in open(os.path.join(HERE, 'stream_creators.txt')) if l.split('#')[0].strip()]

def done():
    p = os.path.join(HERE, 'streams_done.json'); return json.load(open(p)) if os.path.exists(p) else {}

def pick(days):
    cut = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)).isoformat()[:19]; dn = done(); names = creators(); rows = []
    q = [{"query": "query($l:String!){user(login:$l){login displayName videos(first:10,type:ARCHIVE,sort:TIME){edges{node{id title lengthSeconds createdAt viewCount game{name}}}}}}", "variables": {"l": l}} for l in names]
    for r in gql(q):
        u = (r.get('data') or {}).get('user')
        if not u: continue
        for e in u['videos']['edges']:
            n = e['node']
            if n['createdAt'] < cut or n['lengthSeconds'] < 2 * 3600: continue
            others = [x for x, pat in ALIAS.items() if x != u['login'] and re.search(pat, n['title'], re.I)]
            age = (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(n['createdAt'].replace('Z', '+00:00'))).total_seconds() / 86400
            sc = math.log10(n['viewCount'] + 10) + 0.8 * bool(MARATHON.search(n['title'])) + 0.8 * bool(COLLAB.search(n['title'])) \
                 + 0.8 * len(others) + 0.7 * (u['login'] in BIG) + 0.2 * min(n['lengthSeconds'] / 3600, 12) / 12 \
                 + 0.9 * max(0.0, 1 - age / days) - 0.5 * bool(GTA.search(n['title'])) - 0.12 * len(dn.get(n['id'], [])) - 5 * (len(dn.get(n['id'], [])) >= 12)
            rows.append((sc, u['login'], u['displayName'], n))
    rows.sort(key=lambda x: -x[0])
    for sc, login, name, n in rows:
        used = ' (used: %d moments)' % len(dn[n['id']]) if n['id'] in dn else ''
        print(f"{sc:5.2f} {n['id']} {login:13} {n['createdAt'][:16]} {n['lengthSeconds'] / 3600:5.1f}h {n['viewCount']:>9} views | {n['title'][:80]}{used}")
    return rows

def clips_for(login, vod):
    out = {}
    for crit in ('period: LAST_WEEK, sort: VIEWS_DESC', 'period: LAST_WEEK, sort: TRENDING', 'period: LAST_DAY, sort: VIEWS_DESC', 'period: ALL_TIME, sort: TRENDING'):
        r = gql({"query": '{ user(login: "%s") { clips(first: 100, criteria: {%s}) { edges { node { slug title viewCount durationSeconds videoOffsetSeconds createdAt video { id } } } } } }' % (login, crit)})
        try: es = r['data']['user']['clips']['edges']
        except Exception: continue
        for e in es:
            n = e['node']
            if n.get('video') and n['video']['id'] == str(vod) and n.get('videoOffsetSeconds') is not None: out[n['slug']] = n
    return list(out.values())

def moments(vod, top, win_pre, win_post):
    r = gql({"query": '{ video(id: "%s") { id title lengthSeconds createdAt viewCount owner { login displayName } game { name } } }' % vod})
    v = r['data']['video']; login = v['owner']['login']; L = v['lengthSeconds']; B = 5; nb = L // B + 1
    d = os.path.join(WORK, 'streams', str(vod)); os.makedirs(d, exist_ok=True); cp = os.path.join(d, 'chat.json')
    if not os.path.exists(cp):
        print(f'chat replay for {v["title"][:60]} ({L / 3600:.1f} h)...', flush=True)
        subprocess.run([TD, 'chatdownload', '--id', str(vod), '-o', cp, '--collision', 'Overwrite', '-t', '8'], capture_output=True)
    cs = json.load(open(cp)).get('comments', []) if os.path.exists(cp) else []
    S = {k: [0.0] * nb for k in ('rate', 'laugh', 'hype', 'shock', 'clipreq')}; samples = collections.defaultdict(list)
    for c in cs:
        t = c.get('content_offset_seconds', 0) - 8; b = int(t // B)
        if not 0 <= b < nb: continue
        m = c.get('message') or {}; body = m.get('body') or ''.join(f.get('text', '') for f in m.get('fragments', []) or [])
        S['rate'][b] += 1; S['laugh'][b] += bool(LAUGH.search(body)); S['hype'][b] += bool(HYPE.search(body))
        S['shock'][b] += bool(SHOCK.search(body)); S['clipreq'][b] += bool(CLIPREQ.search(body))
        if len(samples[b]) < 40 and 1 < len(body) < 60 and not BAD.search(body): samples[b].append(body)
    def z(xs, w=120):   # against a rolling 10-min median baseline (chat speed drifts over a stream)
        out = []
        for i in range(len(xs)):
            lo = xs[max(0, i - w):i + w]; srt = sorted(lo); med = srt[len(srt) // 2]; mad = sorted(abs(x - med) for x in lo)[len(lo) // 2] or 1
            out.append(max(0.0, (xs[i] - med) / (1.4826 * mad)))
        return out
    def smooth(xs, k=3): return [sum(xs[max(0, i - k):i + k + 1]) / len(xs[max(0, i - k):i + k + 1]) for i in range(len(xs))]
    Z = {k: smooth(z(S[k])) for k in S}
    cl = clips_for(login, vod); C = [0.0] * nb; cl_at = collections.defaultdict(list)
    for c in cl:
        a = int(c['videoOffsetSeconds'] // B); bb = int((c['videoOffsetSeconds'] + c['durationSeconds']) // B)
        for b in range(max(0, a), min(nb, bb + 1)): C[b] += math.log10(c['viewCount'] + 10); cl_at[b].append(c)
    cmax = max(C) or 1
    score = [Z['rate'][i] + 1.6 * Z['laugh'][i] + 1.0 * Z['hype'][i] + 0.7 * Z['shock'][i] + 0.6 * Z['clipreq'][i] + 6.0 * C[i] / cmax for i in range(nb)]
    taken, out = [False] * nb, []
    for ua in done().get(str(vod), []):          # windows already posted (start seconds): never again
        for k in range(max(0, int((ua - 60) // B)), min(nb, int((ua + 150) // B))): taken[k] = True
    for i in sorted(range(nb), key=lambda i: -score[i]):
        if len(out) >= top or score[i] <= 0: break
        if taken[i]: continue
        a = max(0, i * B - win_pre); b = min(L, i * B + win_post)
        clips_here = sorted({c['slug']: c for k in range(max(0, i - 9), min(nb, i + 7)) for c in cl_at[k]}.values(), key=lambda c: -c['viewCount'])
        if any(BAD.search(c['title'] or '') for c in clips_here[:2]): continue
        for k in range(max(0, i - 90 // B), min(nb, i + 90 // B)): taken[k] = True
        chat = collections.Counter(s.strip().upper() for k in range(i - 2, i + 4) for s in samples.get(k, []))
        out.append(dict(peak=i * B, a=a, b=b, score=round(score[i], 2), laugh=round(Z['laugh'][i], 1), hype=round(Z['hype'][i], 1),
                        rate=S['rate'][i], clips=[(c['viewCount'], c['title']) for c in clips_here[:3]], chat=[m for m, _ in chat.most_common(6)]))
    out.sort(key=lambda m: m['a'])
    # write moments.md + add to cands.json (pull.py downloads the windows)
    hh = lambda s: f'{int(s // 3600)}:{int(s % 3600 // 60):02d}:{int(s % 60):02d}'
    lines = [f"# {v['owner']['displayName']}: {v['title']}", f"vod {vod}, {L / 3600:.1f} h, {v['viewCount']:,} views, {len(cs):,} chat msgs, {len(cl)} community clips in this VOD", '',
             '| name | window | score | laugh | hype | msgs/5s | top community clips | chat |', '|---|---|---|---|---|---|---|---|']
    cp_ = os.path.join(WORK, 'cands.json'); cands = json.load(open(cp_)) if os.path.exists(cp_) else []
    cands = [c for c in cands if c.get('vod') != str(vod)]
    for k, m in enumerate(out):
        name = f'{login}_m{k:02d}'; m['name'] = name
        best = m['clips'][0][1] if m['clips'] else 'chat peak'
        lines.append(f"| {name} | {hh(m['a'])}–{hh(m['b'])} | {m['score']} | {m['laugh']} | {m['hype']} | {m['rate']} | "
                     + '; '.join(f'{t[:40]} ({n})' for n, t in m['clips']) + ' | ' + ' / '.join(x[:20] for x in m['chat'][:5]).replace('|', '') + ' |')
        cands.append({'name': name, 'slug': None, 'vod': str(vod), 'a': m['a'], 'b': m['b'], 'title': best, 'viewCount': sum(n for n, _ in m['clips']),
                      'durationSeconds': m['b'] - m['a'], 'language': 'en', 'createdAt': v['createdAt'], 'shorts_ok': True, 'popular': True,
                      'broadcaster': {'login': login, 'displayName': v['owner']['displayName']}, 'stream_title': v['title'], 'peak': m['peak']})
    json.dump(cands, open(cp_, 'w'), indent=1, ensure_ascii=False)
    json.dump(out, open(os.path.join(d, 'moments.json'), 'w'), indent=1, ensure_ascii=False)
    open(os.path.join(d, 'moments.md'), 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('cmd'); ap.add_argument('vod', nargs='?'); ap.add_argument('--days', type=float, default=4)
    ap.add_argument('--top', type=int, default=16); ap.add_argument('--pre', type=int, default=55); ap.add_argument('--post', type=int, default=35)
    a = ap.parse_args()
    if a.cmd == 'pick': pick(a.days)
    elif a.cmd == 'moments': moments(a.vod, a.top, a.pre, a.post)
