#!/bin/bash
# usage: render_shorts.sh key1 key2 ...   -> $WORK/shorts/<key>/*.mp4 (edit.py prints the originality line; it must say PASS)
WORK=${WORK:-/home/claude/gtaday}; cd "$(dirname "$0")/.."
for k in "$@"; do
  python3 edit.py $WORK/plans/plan_$k.json $WORK/shorts/$k 2>&1 | grep -E "originality|s  \(|Traceback|Error" | sed "s/^/[$k] /"
done
echo "RENDER_DONE $*"
