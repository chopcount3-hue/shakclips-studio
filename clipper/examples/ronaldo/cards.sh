#!/bin/bash
# section title cards (#1-#10) and the cold-open word card, rendered with Remotion one at a time
cd /home/claude/remotion
R=/home/claude/ronaldo/cards; mkdir -p $R
python3 - <<'PY' > /tmp/cards.txt
import json
S = json.load(open('/home/claude/ronaldo/script.json'))['sections']
for n, s in enumerate(S[1:], 1):
    rank, title, sub = s['card']
    print(json.dumps({'n': n, 'props': {'rank': rank, 'streamer': sub, 'title': title}}, ensure_ascii=False))
PY
while read -r row; do
  n=$(python3 -c "import json,sys; print('%02d' % json.loads(sys.argv[1])['n'])" "$row")
  props=$(python3 -c "import json,sys; print(json.dumps(json.loads(sys.argv[1])['props'], ensure_ascii=False))" "$row")
  [ -s $R/$n.mp4 ] || npx remotion render src/index.ts TitleCard $R/$n.mp4 --props="$props" --concurrency=1 --log=error || exit 1
done < /tmp/cards.txt
[ -s $R/hook.mp4 ] || npx remotion render src/index.ts WordCard $R/hook.mp4 --props='{"text":"EVERY TIME HE SNAPPED","accent":3}' --concurrency=1 --log=error
ls -la $R
