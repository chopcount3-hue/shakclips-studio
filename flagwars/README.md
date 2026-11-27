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

## Going live (Contabo Cloud VPS 20, Ubuntu 24.04)
On the server, as root (Termius on the phone):
```bash
bash <(curl -fsSL https://raw.githubusercontent.com/chopcount3-hue/shakclips-studio/flag-wars/flagwars/server/setup.sh)
```
It installs Chrome, Xvfb, PulseAudio and ffmpeg, downloads `dist/index.html` and `server/run.sh`, asks for the YouTube
stream key on the server (saved in /etc/flagwars.env, root-only; never sent anywhere else) and starts the systemd service
`flagwars`, which restarts itself if Chrome or ffmpeg stops. Running the command again updates the game.
`dist/index.html` is the built page (voice clips inlined as base64); rebuild it with `python3 build.py` after changes.
Tested 28 Nov: 1080x1920 at 30 fps with the voice in the audio used about 1.8 CPU cores.

Live chat (the SAVE YOUR COUNTRY powers) is not connected yet: it should use the official YouTube Data API
(liveChatMessages), not scraping. The page already reads `chat.json` ({"msgs": [{id, user, text}]}) every 1.5 s in
`#stream` mode.
