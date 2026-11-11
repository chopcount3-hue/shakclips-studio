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
`render.py` is the simple v1 renderer (one continuous cut). `edit.py` is the v2 editor:
- cold-open teaser of the payoff, then a white-flash transition
- jump cuts on dead air, with alternating punch-ins
- impacts: `shake`, `flash`, `punch`
- slow-motion `REPLAY`
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
