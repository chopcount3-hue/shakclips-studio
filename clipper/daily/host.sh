#!/bin/bash
# Publish today's upload files on the repo's gta-media branch (orphan, force-pushed daily) and print their public URLs.
# usage: host.sh file1 [file2 ...]    every file must be under 100 MB (use fit100.sh for the long video)
set -e; REPO=${REPO:-chopcount3-hue/shakclips-studio}; M=/home/claude/gta-media; D=$(date -u +%Y-%m-%d)
rm -rf $M && mkdir -p $M/daily && cd $M && git init -q -b gta-media && git remote add origin https://github.com/$REPO.git
for f in "$@"; do
  s=$(du -m "$f" | cut -f1); [ "$s" -lt 100 ] || { echo "TOO BIG ($s MB): $f"; exit 1; }
  cp "$f" daily/
done
git add -A && git -c user.name="Shak Replay Bot" -c user.email="chopcount3-hue@users.noreply.github.com" commit -qm "gta media $D" && git push -qf origin gta-media
for f in "$@"; do echo "https://raw.githubusercontent.com/$REPO/gta-media/daily/$(basename "$f")"; done
