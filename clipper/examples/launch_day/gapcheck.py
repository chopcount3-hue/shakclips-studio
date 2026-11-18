import json, sys, os
D = os.environ.get('PD', 'plans1')
for k in sys.argv[1:]:
    c = json.load(open(f'{D}/plan_{k}.json'))['clips'][0]
    tl = []; t = (c['teaser'][1] - c['teaser'][0] + 0.0) if c.get('teaser') else 0
    for a, b in c['ranges']: tl.append((a, b, t)); t += b - a
    ev = [x['src_t'] for x in c['notes'] + c['stickers'] + c['fx'] + c.get('sfx', [])]
    out = sorted([t0 + (e - a) for e in ev for a, b, t0 in tl if a <= e < b] + [t0 for a, b, t0 in tl])
    out = [0] + out + [t]; gaps = sorted(((out[i + 1] - out[i], out[i]) for i in range(len(out) - 1)), reverse=True)[:3]
    srcmap = lambda o: next((a + o - t0 for a, b, t0 in tl if t0 <= o < t0 + b - a), None)
    print(k, f'{t:.1f}s', [(round(g, 1), round(o, 1), round(srcmap(o) or 0, 1)) for g, o in gaps])
