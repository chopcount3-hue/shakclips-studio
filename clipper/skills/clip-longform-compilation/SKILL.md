---
name: clip-longform-compilation
description: Build the daily 5-minute GTA 6 streamer compilation - segment order, narrated intro and bridges in the house voice for originality, title cards, transitions, chapters and credits.
---

# Long-form compilation (about 5 min, 2 per day)

Reposted clips stitched together are what YouTube demonetizes ("reused content"). The long-form is ours because of
**the narration, the ranking and the edit**.

## Structure (16:9, 1920×1080, 30 fps)
1. **0:00–0:15 cold open:** the 3 best payoffs back to back (2–4 s each) with whoosh transitions, then the title card.
2. **Narrated intro (10–15 s)**, in the house voice (`../tts/chatterbox_tts.py`): what happened on GTA 6 streams today and why it's
   worth watching. Write it like a sports recap, not a news read.
3. **5–7 segments of 40–90 s**, each with:
   - a title card ("#5 · KAI CENAT · THE MOUNTAIN WON", 1.5 s)
   - the clip (same jump cuts, SFX and VFX as Shorts, but full-frame 16:9 with the facecam kept where the streamer put it)
   - a 1–2 sentence narrated bridge after it: context, a joke, or a "Shak's take" style opinion. Real commentary, not a summary.
4. **Ranking order:** build to the best moment last. An open loop at the start ("…and number one broke chat") keeps people watching.
5. **Outro (≤10 s):** "Which one was the best? Comment." End screen with 2 videos.

## Rules
- Mix creators: at least 3 different streamers per video, never more than 2 segments from one stream.
- No story spoilers, nothing pre-release (Rockstar policy). Gameplay plus reactions only.
- **Credit every creator in the description** with a link to the original stream. On screen, the creator's name goes on the title card.
- Chapters in the description match the title cards (0:00 Intro, 0:18 #5 Kai Cenat…).
- Loudness −14 LUFS; narration ducks the clip audio by 10 dB; music beds are original (ours) only.

## Building it
- Cut each segment with `edit.py`, using a `layout` that keeps 16:9 (render at 1920×1080: set `"W": 1920, "H": 1080` in the plan
  when long-form support lands in edit.py; until then, export segments with ffmpeg cuts plus the same SFX and FX times).
- Narration: write `script.json` (intro + bridges) → `chatterbox_tts.py` → place each line between segments.
- Run the voice step alone (RAM). Assemble with xfade transitions (`fadewhite`, `zoomin`, `slideleft`) between segments.

## Lessons from a channel that monetized on streamer clips in 21 days (owner's reference video, 12 Nov 2026)
- **It monetized through long-form, with only 3 videos.** Video 1 (streamers' cars: weak topic, weak edit) flopped. Video 2,
  "IShowSpeed's best moments at the 2026 World Cup", went viral and carried the channel. Video 3 (Speed with footballers) did well.
- **Angle first.** Every video is one specific topic with its own script and narration, never random clips. Good angles:
  arguments, the funniest moments, fan reactions, "streamer + celebrity", one event (World Cup → for us: GTA 6 launch week).
- **A custom hook in the first 10 s**: a "What if Speed met Shakira?" scene they made themselves, then straight into the story.
- **Thumbnail:** two instantly recognisable people together, on a trending topic. That was the CTR jump.
- **Pacing:** about 140 cuts in 5 min (one every 2.2 s). Full-screen single words in heavy white type for emphasis
  ("USED", "IMPORTANT", "SCRIPT"), blurred "?" grids to tease what's coming, screen recordings as B-roll.
- **Copyright:** IShowSpeed's content is managed by **Thumbs Media**, which issued a Content ID claim. It was released after a
  fair-use dispute citing the creator's commentary and transformation. Expect claims on Speed footage. Answer with a polite,
  specific dispute (what we added: script, narration, edit, structure), never by re-uploading.
- **Don't copy their meme inserts** (The Rock, Jim Carrey and other film/TV clips are copyrighted). Our replacement: short
  original stick-figure reaction inserts from the Shak Clips engine (`engine/acting.js` poses: shock, facepalm, celebrate),
  which are ours and set the channel apart.
- **Avoid reused content:** no long uninterrupted clips (keep each run under about 8–10 s before a cut, a word card or narration),
  our script around every clip, and our own presentation.

## Commentary long-forms with `longform.py` (built for the Ronaldo video, 12 Nov 2026)
Narrated, topic-based long-forms (60–70% commentary, real clips, no animation) are built from a `plan.json`
(see the docstring of `clipper/longform.py`; a full example is `ronaldo/make_plan.py`).
- **Narration first.** Script → Chatterbox Turbo lines (`synth_range.py A B`, ≤12 lines per process: the model leaks about
  70 MB per line and was OOM-killed at 6 GB after 29 lines). Every line is Whisper-checked; `lines.json` keeps word times.
- **Items:** `line` (narration over `shots`, or the section `pool`), `moment` (original audio, ≤8 s, with flash/shake/red
  hits, a label and an optional 2× `replay`), `info` (a headline card over blurred red-tinted footage, for incidents with
  no downloadable footage; never put footage of a different match under a caption that names this one), `file`
  (Remotion TitleCard / WordCard).
- **Retention:** cold open of the 4–5 worst moments with no narration → word card → hook line that promises the ending
  ("the last one didn't happen on a pitch") → countdown title cards #1–#10 → a re-hook line at the end of every section
  that teases the next one, with a sting (`dun_dun_dunnn`) and a 1 s `hold` → a "halfway, pick your worst" line → a fast
  recap montage → an end card asking for a number in the comments.
- **Stamps** (red-box Anton text, top centre) carry the facts: scores, bans, fines, dates. Quotes only when the person
  really said those words; otherwise write it as a fact ("NOT STARTING VS DENMARK"), not a quote.
- **Clip audio:** b-roll under narration is silent. Moments keep their audio only after a Whisper check: mute fan clips
  that swear (advertiser-friendly), news packages with a voice-over, and anything with a music bed (Content ID).
- **Sound:** music bed from `music.py` at −22 LUFS between lines and 14 dB lower under narration (falls 1.0 s before a line,
  rises 1.2 s after); whooshes/risers are aligned on their loudest point, other SFX on their onset; master −14 LUFS,
  limiter −1.5 dBFS, AAC 320k.
- **Captions** use the script's spelling timed by Whisper's words (names come out right), years and numbers as digits.
- **Crop** burned-in captions, tickers and logos per clip in `clipopts`; vertical clips get `fit` (blurred fill).
