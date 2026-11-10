---
name: video-editing-polish
description: Final assembly and polish for Shak Clips renders with ffmpeg. Covers deterministic segment encodes and lossless concat, pacing and still-frame checks, captions built from timing.json, sound design and SFX hit timing, music ducking, two-pass loudnorm to -14 LUFS, the 9:16 Short export, chapters, and a pre-upload QC report. Use after the Canvas/Playwright frames exist and before upload, or whenever a finished video needs new sound, captions or a fix.
---

# Video editing polish (ffmpeg)

Pipeline: explainer-video-direction (shotlist.json) -> Canvas/Playwright frames -> **this skill** -> upload.
Keep the existing house numbers from shak-voiceover: music ducked about 6 dB under the voice, SFX at -10 to -12 dB,
and the final mix at I = -14 LUFS, TP = -1.5 dBTP.

Distilled from: browser-use/video-use (MIT: hard rules for fades, subtitle order, SFX attack alignment,
ebur128 measurement, self-eval at cut boundaries); digitalsamba/claude-code-video-toolkit `ffmpeg` skill and
loudness notes (MIT); coreyhaines31/marketingskills `video/references/code-rendered-product-films.md` (MIT:
render purity, sub-range renders, contact-sheet review); heygen-com/hyperframes `captions-overlay` (Apache-2.0).

## Hard rules (correctness, not taste)
1. **Pure renders**: every frame is a function of t. No `Date.now()`, no unseeded randomness, no state carried
   between frames. This lets any act or sub-range be re-rendered alone, in parallel.
2. Encode each act as a segment with **identical** settings, then join with the concat demuxer and `-c copy`.
   Re-encode any trim. Stream-copy trims drop frames when the cut isn't on a keyframe.
3. Write to `name.tmp.mp4` and rename only when ffmpeg exits 0.
4. Build **one** PCM WAV mix of the whole timeline (voice + music + SFX), normalise it, then mux it once.
5. Put a 30 ms fade at every audio edit (music loop points, trims): `afade=t=in:d=0.03` / `afade=t=out:st=END-0.03:d=0.03`.
6. Burned-in captions go **last** in the filter chain, after every overlay, or overlays will hide them.
7. Stop only your own processes, by PID, and run heavy encodes with `nice -n 10`.

## Delivery specs
| | Long-form | Short |
|---|---|---|
| Size / fps | 1920x1080 / 30 | 1080x1920 / 30 |
| Video | H.264, yuv420p, CRF 18, preset veryfast (house default: slower presets triple render time), `-tune animation` optional | same |
| Audio | AAC-LC 48 kHz stereo 192k (house default) | same |
| Container | mp4, `-movflags +faststart` | same |
| Length | 8-10 min | 15-60 s |
```bash
ffmpeg -framerate 30 -i frames/act2/%06d.jpg -c:v libx264 -profile:v high -preset slow -crf 18 \
  -tune animation -pix_fmt yuv420p -g 15 -bf 2 -an seg_act2.tmp.mp4 && mv seg_act2.tmp.mp4 seg_act2.mp4
ffmpeg -f concat -safe 0 -i segs.txt -i mix_norm.wav -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 384k -ar 48000 -movflags +faststart -shortest final.tmp.mp4
```

## Pacing checks (from the render, not the plan)
- Average shot length should sit at 3-5 s for long-form and 1.5-3 s for the Short. That works out to roughly 12-20 shot changes per minute long-form
  and 20-40 in the Short. Compare against shotlist.json.
- Still stretches: `ffmpeg -i final.mp4 -vf freezedetect=n=-60dB:d=3 -an -f null -`. Every hit must be a shot
  marked `hold` in the shotlist. Otherwise add a staged reveal or the next action.
- Black frames: `blackdetect=d=0.3:pix_th=0.10`. Long silences: `-af silencedetect=noise=-45dB:d=2`.
  The intended exception is the 1.5 s guess-beat music, which isn't silence.
- The scene detector (`select='gt(scene,0.25)'`) misses cuts between flat fields of equal lightness. Treat a
  low count as a hint to check the colours, not as proof that there are no cuts.

## Captions from timing.json
- Caption the **display text**, not the voiced text. Voiced respellings ("zhu-twa-see") and spelled-out numbers
  map back to the real spelling and digits. Keep a `display_sentences` list with the same count as `sentences`.
- Long-form: cues of 4-7 words, at most 2 lines of 42 characters or fewer, 1.0-6.0 s on screen, and a reading speed of at most 17 characters/s.
  Upload the .srt as the caption track rather than burning it in, so it's indexable and can be toggled off.
- Short: burn in 1-3 word chunks, bold with an outline. Never flash a cue under 0.35 s; grow the chunk to 3 words instead.
- Word times inside a sentence span: interpolate by character position, as shak-voiceover does.
- Snap cue edges to sentence spans, then pad them +-0.05 s.
```bash
ffmpeg -i short_nocap.mp4 -vf "subtitles=short.srt:fontsdir=fonts:force_style='FontName=Inter,Bold=1,\
FontSize=16,Outline=3,Shadow=0,Alignment=2,MarginV=60'" -c:a copy short.tmp.mp4
```
libass sizes SRT text against a 288-line canvas, so FontSize 16 comes out at about 107 px in a 1920-tall frame.
Check a frame. Fonts fail silently: confirm the face in a still before the full burn.

## Sound design
- **Fewer, tied effects.** Each SFX belongs to something visible (a landing, an impact, a page turn, a map pin).
  Use about 4-8 per minute in long-form and never one on every cut. Keep a small house library (10-15 sounds,
  self-made or with clear CC0/royalty-free licences stored in the project).
- **Hit on the frame.** Measure each SFX's attack (the first sample within 30 dB of its peak) and start the file that
  much **before** the contact frame: `adelay=delays=<ms>:all=1`.
- **Silence is an effect.** Drop the music for 0.5-1 s before the biggest reveal, then bring it back on the reveal word.
  Ramp the music out before the end screen instead of letting its tail decay under the last line.
- **Music**: one bed per act at most, with changes at act boundaries. Loop at phrase boundaries with 30 ms fades.
  Only use licensed tracks (the licence file goes in the project). A Content ID claim diverts the revenue.
- **Ducking** (house default):
```bash
ffmpeg -i voice.wav -i music.wav -i sfx_bus.wav -filter_complex \
 "[0:a]asplit=2[vo][key];[1:a]volume=-6dB[mu];[mu][key]sidechaincompress=threshold=0.04:ratio=5:attack=20:release=300[duck];\
  [2:a]volume=-11dB[fx];[vo][duck][fx]amix=inputs=3:duration=first:normalize=0[m]" -map "[m]" -c:a pcm_s16le mix.wav
```

## Loudness (two passes on the PCM mix)
```bash
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2> ln1.txt
# read input_i, input_tp, input_lra, input_thresh, target_offset from ln1.txt, then:
ffmpeg -i mix.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=..:measured_TP=..:measured_LRA=..:\
measured_thresh=..:offset=..:linear=true,aresample=48000" -c:a pcm_s16le mix_norm.wav
```
- YouTube turns loud uploads down but never turns quiet ones up, so a mix at -20 LUFS ships quiet.
- Measure the result with `ffmpeg -i final.mp4 -af ebur128=peak=true -f null -`. Pass means I = -14 +-1 and TP <= -1.5.
- Also check per section: voice-only vs music-only vs end card. An end card more than 10 dB under the
  dialogue, or SFX peaking above the speech, is a bug.
- You can't listen. Report the numbers and flag music loop points and the ending for a human ear-check.

## The Short export
1. Render the 9:16 storyboard natively from shotlist.json `short` (recomposed, not cropped).
2. Voice: trim the hook up to the end of its last sentence span + 0.25 s (`atrim`, 30 ms fades), then append the
   separately voiced `short_tail`. Start on the first word, with no fade-in.
3. Mix and loudnorm the Short on its own (-14 LUFS). Burn captions last. Make the last frame match the first for the loop.

## Chapters and description
Take the section title-card sentence starts from timing.json and format them as `0:00 Title`. The first chapter must be 0:00,
with at least 3 chapters of 10 s or more. Paste them into the description after the 2-line opener.

## QC report before upload (max 3 fix passes, then flag to the user)
- [ ] `ffprobe`: h264 / yuv420p / 1920x1080 / 30 fps / AAC 48 kHz stereo. The duration matches timing.json total +-0.1 s.
- [ ] No unintended freezes, black frames or silences, per the pacing checks above.
- [ ] Loudness I = -14 +-1 and TP <= -1.5, per-section levels sane, no clipping.
- [ ] A contact sheet at every act boundary (+-1.5 s) shows no flash, jump or wrong frame.
- [ ] Captions in sync at 3 spot checks (start, middle, end), using display spelling. The .srt is uploaded.
- [ ] Short: 30-55 s, 1080x1920, captions in the safe area, the loop works, and it has its own payoff.
- [ ] Chapters valid. Music and SFX licences stored in the project.
- [ ] A one-line summary of the numbers goes in the project log for the daily automation record.
