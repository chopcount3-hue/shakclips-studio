import json, re, sys, collections
LAUGH = re.compile(r'KEKW|LUL|OMEGALUL|LMAO|LMFAO|ICANT|💀|😭|😂|\bLOL\b|xqcL+UL|KEKL|pepeLaugh|ahaha|HAHA', re.I)
HYPE = re.compile(r'^W+$|\bW\b|AURA|POG|🔥|GOAT|CINEMA|PogU|LETS GO|LETSGO|Pog|HYPE|GTA 6|GTA6|GTAVI|VI\b', re.I)
for u in sys.argv[1:]:
    p = f'/home/claude/untrusted/launch/{u}/chat.json'
    try: cs = json.load(open(p))['comments']
    except Exception as e: print(u, 'no chat', e); continue
    off = float(open(f'/home/claude/untrusted/launch/{u}/chat_offset.txt').read()) if __import__('os').path.exists(f'/home/claude/untrusted/launch/{u}/chat_offset.txt') else 0
    meta = json.load(open(f'/home/claude/launch/{u}.meta.json')); unl = meta['unlock_off'] - meta['a']
    B = 10; n = collections.Counter(); la = collections.Counter(); hy = collections.Counter()
    for c in cs:
        t = c['content_offset_seconds'] - off - 5; b = int(t // B)
        body = ''.join(f.get('text', '') for f in c['message'].get('fragments', [])) if isinstance(c.get('message'), dict) else ''
        n[b] += 1; la[b] += bool(LAUGH.search(body)); hy[b] += bool(HYPE.search(body))
    tot = len(cs); dur = max(n) * B if n else 0
    print(f'== {u}: {tot} msgs over {dur/60:.0f} min, unlock at source t={unl}s')
    for name, ctr in (('LAUGH', la), ('HYPE', hy), ('RATE', n)):
        top = sorted(ctr.items(), key=lambda x: -x[1])[:7]
        print(f'  {name}:', '  '.join(f'{b*B}s:{v}' for b, v in sorted(top)))
