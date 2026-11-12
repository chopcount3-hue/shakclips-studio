import json, re, sys, glob, collections
PAT = re.compile(r'pre.?load|preload|pre.?order|preorder|download|\b2[01]\d ?gb|installing|bought (gta|it)|buy (gta|it)', re.I)
for f in sorted(glob.glob(sys.argv[1] if len(sys.argv) > 1 else 'schat/*.json')):
    try: d = json.load(open(f))
    except Exception as e: print(f, 'bad', e); continue
    cm = d['comments']; hits = collections.Counter(); ex = {}
    for c in cm:
        t = c['content_offset_seconds']; m = ' '.join(x.get('text', '') for x in c['message']['fragments'])
        if PAT.search(m): k = int(t // 60); hits[k] += 1; ex.setdefault(k, []).append(m[:60])
    top = sorted(hits.items(), key=lambda kv: -kv[1])[:5]
    print('==', f.split('/')[-1], len(cm), 'msgs; top minutes:', [(f'{k // 60}:{k % 60:02d}', v) for k, v in top])
    for k, v in top[:3]:
        if v >= 5: print(f'     {k // 60}:{k % 60:02d} x{v}: ' + ' | '.join(ex[k][:4]))
