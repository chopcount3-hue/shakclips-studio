# Clipper: GTA 6 streamer clips → Shorts and 5-minute long-forms

Built 2026-11-12 for the owner's new clip channel (YouTube + Facebook), launching with GTA 6 on 19 Nov 2026.
Target per day: **10 Shorts (under 60 s) + 2 long-forms (about 5 min)** from GTA 6 streams.

## Rules (read first)
- **Only creators who allow clipping.** The owner confirmed (2026-11-12) that he only picks streamers who have said their
  streams may be clipped (clipping programs or a written OK). Credit the creator and link the original stream in every description.
- **Rockstar's policy** (support.rockstargames.com, updated 10 Jan 2025): gameplay uploads are allowed for *non-commercial* use;
  no pre-release or leaked footage; no endings, cutscene compilations or major story reveals. Monetized clips are a tolerated risk, not a right.
- **YouTube reused-content rules (and the 1 Oct 2026 reach change):** plain reposts lose reach and can't be monetized.
  Every upload needs our own edit: cold open, jump cuts, captions, SFX, VFX, replay, and in long-forms a narrated intro and
  bridges in the house voice (Chatterbox Turbo, `../tts/chatterbox_tts.py`).
- **Ads:** no graphic violence in the first 7 s; swear words are masked in captions automatically.
- **SFX:** `sfx/user/index.md` flags 30 sounds (branded game/TV/Microsoft sounds, music, other creators' voice clips) that can
  trigger Content ID. Don't use those on monetized uploads.

## Sources
| Link | How | Notes |
|---|---|---|
| `twitch.tv/videos/<id>` | TwitchDownloaderCLI | video (any part) + **chat replay**, the best highlight signal |
| `twitch.tv/<channel>` | Streamlink | records live until the stream ends; fetch the VOD's chat afterwards |
| Twitch clips, Kick | yt-dlp | |
| YouTube | **owner uploads the file** | YouTube refuses downloads to this cloud server (HTTP 403); don't try to get around it |

## Pipeline
```bash
./setup.sh                                                   # once per fresh workspace (about 3 min)
PY=/home/claude/venvs/cbx/bin/python
$PY fetch.py https://www.twitch.tv/videos/2924282282 W --from 34:31:00 --to 35:07:00   # video + chat.json
$PY analyze.py W/source.mp4 W/work --n 12                    # transcript + loudness + chat spikes -> W/work/candidates.md
$PY facecam.py W/source.mp4                                  # webcam box (small cams: set it by hand from a frame)
# read candidates.md + the chat around each peak (laughs: KEKW LUL LMAO 💀 ICANT; hype: W AURA EZ), look at frames,
# then write plan.json (see edit.py docstring): start/end, teaser, replay, hook, fx, sfx
$PY edit.py plan.json out/                                   # finished Shorts + metadata.md
```
`thumb.py spec.json out.jpg`: thumbnails (most expressive face via MediaPipe blendshapes, rembg cutout, sticker outline, 3D text).
`templates/contentid-dispute.md`: fair-use dispute text, filled from the originality numbers.

`render.py` is the simple v1 renderer (one continuous cut). `edit.py` is the v2 editor:
- cold-open teaser of the payoff, then a white-flash transition
- jump cuts on dead air, with alternating punch-ins
- impacts: `shake`, `flash`, `punch`
- slow-motion `REPLAY`
- **narration** in the house voice, with the stream audio ducked under it, plus red arrow and circle `marks`
- an **originality gate**: our voice must cover at least 25% of the Short, and no stretch over 8 s may pass untouched
- captions re-transcribed per clip with Whisper small.en, low-confidence words dropped
- SFX at exact source times
- always under 60 s

Layouts:
- `facecam`: cam on top, gameplay below on a blurred fill (`game_zoom` 0.8)
- `blur`: full frame over a blurred background (`zoom` 1.0–1.3)
- `crop`: a 9:16 crop

## Measured speed (2 cores)
- Download: 36 min of 720p60 plus chat in 54 s.
- Analysis: 36 min of stream in about 100 s.
- Editing: a 25–30 s Short in about 60–120 s.
- So about 3–5 min per Short, and a 3-hour stream yields 8–10 Shorts in about 40 min.
- Never run the Chatterbox voice at the same time as edits: together they exceed the 7 GB RAM and the kernel kills the voice.

## Tools and licences
- yt-dlp (Unlicense)
- Streamlink (BSD-2)
- TwitchDownloaderCLI (MIT)
- faster-whisper (MIT)
- MediaPipe (Apache-2.0)
- RapidOCR (Apache-2.0)
- PySceneDetect (BSD-3)
- auto-editor (Unlicense)
- Fonts: Luckiest Guy and Anton (Apache-2.0 / OFL)

Rejected:
- AGPL tools (YOLO/ultralytics, ViralMint, clips-studio)
- apps that need paid keys: OpenShorts (Gemini / fal / ElevenLabs), OpusClip

## News-post cards and the channel outro (GTA 6 myths video)
- `post` shots in longform.py: a white news card (outlet, date, real headline, yellow highlight) slides up over blurred footage. Use real headlines from real articles only, never made-up tweets.
- `templates/remotion/Root.tsx` has the `Outro` composition (12 s, 1920x1080): logo pop, SHAK REPLAY, subscribe click and two WATCH NEXT frames placed where YouTube's end-screen video boxes go.
- `templates/brand/outro_shakreplay.mp4` is the finished outro with music and SFX (-14 LUFS). Append it to every long video with ffmpeg concat (fps=30, yuv420p, 48 kHz stereo on both inputs), then set the end screen to "2 videos, 1 subscribe" over the last 12 seconds.
- `examples/gta6myths/` is the full plan for "13 GTA 6 Gameplay Myths" (4:17, 13 myths, post cards, word-timed SFX, verdict stamps).

## No-voiceover Shorts (GTA 6 pre-order Shorts, Nov 2026)
`edit.py` additions:
- `ranges`: hand-picked source spans
- `notes`: written joke pop-ups in coloured boxes, placed on source words
- `stickers`: Giphy GIFs or emoji
- `cap_y` / `cap_size` / `hook_size` / `note_size`
- `crop_zoom` / `crop_y` for the crop layout

The report counts notes and stickers as edits, and names any pop-up whose time fell in a jump cut.

How the moments were found (`examples/preorder_shorts/`):
1. `scan.py` checks clip and VOD titles.
2. TwitchDownloader chat replays plus `spikes.py` find minutes where chat spams "pre-order / preload / download".
3. `tx_search.py` / `tx_words.py` transcribe just those windows.

Watch out for:
- Twitch-muted VOD stretches: the audio is digital silence (-180 dB).
- One-frame GIFs (prayer, mona_laugh, aura, cat_applause) used to vanish after one frame. Stickers are now held with `fps,tpad,trim`.
