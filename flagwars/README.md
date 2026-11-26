# Flag Wars (vertical 9:16 live game)

64 countries drop through pegs, spinners and saws into +1 / OUT gates every round; points pile up and the top country
after 10 hours wins. Commentary by "Prof. Flagenstein" (pre-made voice clips stitched live), captions on screen, and a
chat panel: 20 chats = SHIELD, 40 chats for a knocked-out country = REVIVE (`onChat(user, text)` is the hook a YouTube
live-chat reader calls). The preview page simulates chat (DEMO CHAT); `#stream` mode never does.

Preview: https://claude.ai/artifact/GTmwp8c7Y2wmo65fakJ4S3 (owner-only until shared)

## Build
```bash
cd build && npm pack matter-js@0.20.0 flag-icons@7 @fontsource/bungee@5 @fontsource/rubik@5 && mkdir -p m f fs \
  && tar -xzf matter-js-*.tgz -C m && tar -xzf flag-icons-*.tgz -C f && for t in fontsource-*.tgz; do tar -xzf $t -C fs --one-top-level=${t%.tgz}; done
python3 build.py        # -> index.html (one file: Matter.js MIT + flag-icons MIT + voice clips inlined)
python3 shoot.py 4 5,12 # screenshots;  python3 rec.py 50 -> preview video with the voice mixed in
```
Paths in the scripts are /home/claude/flagwars; voice mp3s are not committed (binary rule): regenerate with
`voice/gen.py` (Chatterbox, exaggeration 1.25, base voice = Kokoro bm_george, ~18 s/line on CPU) for the acted lines,
`voice/kok_names.py` for the "Team <country>!" names, then `voice/process.py` (+5% pitch, lab echo, -15 LUFS) and
`voice/qa.py` (Whisper check that each clip says its line).

## Going live (not set up yet)
Needs a machine that stays on for the whole stream (own PC, or a ~$5-10/month server): headless Chrome with
`--autoplay-policy=no-user-gesture-required` opening `index.html#stream` at 1080x1920, captured by ffmpeg to the
YouTube stream key; plus a small reader that polls the live chat and calls `FW.onChat(user, text)`.
