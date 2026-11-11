---
name: tts-character-voices
description: "Give Shak Clips stick figures distinct Kokoro voices: casting and blends, a character bible, speaker-tagged script JSON, narrator and character levels, dialogue timing, and quoting real people."
---

# Character voices for stick-figure dialogue

Use when a script has two or more speaking figures, a mini-scene, an interview bit, or a "two guys argue about it" beat.
Legend: **[V]** = checked here or on an official page (see Sources). **[H]** = heuristic, unverified.
The narrator's own voice and the house chain are not this skill's business: narrator casting is `tts-voice-casting`,
delivery is `tts-emotional-delivery`, the audio chain is `tts-voice-mastering`. Default narrator stays am_michael at speed 1.0.

## 1. When dialogue is worth it
Dialogue costs a synthesis pass per speaker and a sync pass per line. Use it where it earns retention:
the skepticism beat ("You're probably thinking..."), a two-sided disagreement, a short re-enactment, a Short's cold open.
**Cap: 2 speaking characters per long video plus the narrator, 1 plus the narrator in a Short [H].** More voices in an
8-minute explainer reads as a radio play, not an explainer. Never give a voice to a figure the viewer sees once.

## 2. Casting from the Kokoro voice bank
54 voices ship in `voices-v1.0.bin` **[V]**: `am_*`/`af_*` (US male/female), `bm_*`/`bf_*` (British), plus other
languages. Grades carried over from `shak-voiceover` **[V]**: af_heart A, af_bella A-, am_michael / am_fenrir / am_puck
C+, bm_george / bm_fable C; avoid am_adam (F+). Blends work as `am_michael:0.6+am_fenrir:0.4`.

Cast on **separation**, not on taste. Measured pitch here: am_michael median F0 119 Hz, af_heart 194 Hz **[V]**
(use the F0 tracker in `tts-artifact-qa` on a 10-second sample of each candidate).

| Role | Suggested cast | Why |
|---|---|---|
| Narrator | `am_michael`, speed 1.0 | the owner's chosen voice; never reassign it to a character |
| Character A ("the skeptic") | `am_fenrir` or `am_michael:0.35+am_fenrir:0.65`, speed 0.98 | same register family, clearly not the narrator **[H]** |
| Character B ("the explainer") | `af_heart`, speed 1.0 | top-graded voice, far from the narrator in pitch **[V]** |
| Third voice, rare | `bm_george` or `bf_emma`, speed 0.98 | accent does the separating when pitch cannot **[H]** |
| Crowd / aside, one line | narrator voice at speed 1.04 | cheaper than a new cast member **[H]** |

Casting checks, all required:
- [ ] Median F0 of any two speaking voices differs by **>= 2.5 semitones** (about 15%) **[H]**; narrator vs character by more.
- [ ] No character voice is a blend that lands within 1 semitone of the narrator: the viewer will hear a glitch, not a character.
- [ ] Every voice used is from Kokoro (Apache-2.0 weights, commercial use fine) **[V]**. No other engine enters the
      daily run without `tts-engine-evaluation`.
- [ ] Send the owner one 20-second two-line sample before the full render, as `shak-voiceover` requires **[V]**.

## 3. The character bible (one file, `characters.json`, in the project)
Cast once, then never drift. A character keeps its voice across every video it appears in.
```json
{"narrator": {"voice": "am_michael", "speed": 1.0, "gain_db": 0.0, "note": "owner-chosen; do not change"},
 "skeptic":  {"voice": "am_michael:0.35+am_fenrir:0.65", "speed": 0.98, "gain_db": -2.0,
              "f0_hz": 112, "look": "round head, arms crossed", "first_used": "2026-11-11", "catchphrase": "Sure. And?"},
 "scientist": {"voice": "af_heart", "speed": 1.0, "gain_db": -1.5, "f0_hz": 194, "look": "glasses, clipboard"}}
```
Rules: one entry per character; `f0_hz` measured, not guessed; the visual look lives in the same entry so the drawing and
the voice are cast together; a character is retired, never re-voiced. If two characters end up sounding alike in a render,
change the **newer** one and note the date.

## 4. Script format with speaker tags
Extend the existing script JSON. Unlabelled paragraphs stay the narrator's, so old scripts keep working.
```json
{"paragraphs": [
   {"speaker": "narrator", "text": "Two people look at the same chart and see opposite things."},
   {"speaker": "skeptic",  "text": "That line is going up. Case closed."},
   {"speaker": "scientist","text": "It is going up. Look at what is on the bottom axis."},
   {"speaker": "narrator", "text": "And that is where most of the argument actually lives."}],
 "sentences": ["...", "..."],
 "pause_after_paragraph": [0.45, 0.30, 0.55, 0.6],
 "labels": [{"sentence": 2, "word": "axis", "text": "x-axis: log scale"}]}
```
- One speaker per paragraph. Never mix speakers inside a paragraph: paragraph-level synthesis is what keeps prosody
  flowing **[V]**, and a mid-paragraph switch would need a split anyway.
- `sentences` stays flat and in order so `timing.json` spans and captions keep working unchanged **[V]**.
- Attributions ("she said", "he argued") go in the **narrator's** paragraph, not the character's line.
- No stage directions in voiced text. Put them in `labels` or the shot list.

## 5. Rendering (wrapper around the existing script, nothing modified)
`tts/kokoro_tts.py` takes one voice per run **[V]**, so a dialogue render is one run per speaker block:
1. Group consecutive paragraphs by speaker into blocks, preserving order.
2. For each block write a temporary script JSON and call
   `THREADS=2 nice python3 tts/kokoro_tts.py block.json out/blockN <voice> <speed>`.
3. Concatenate the block wavs in order with the inter-paragraph pauses, applying each character's `gain_db` to its own
   block **before** concatenation, and a 20 ms fade at every join.
4. Rebuild one `timing.json`: offset each block's spans by the running start time, keep the flat `sentences` list, and
   add a parallel `speakers` array (one entry per span) for the animator.
5. Then run the normal path: `tts-artifact-qa`, the `voice.sh` chain, the `tts-voice-mastering` tail, `mix.sh`.
Keep the wrapper in `tools/`, never inside a downloaded repo, and write to a temp name before renaming.

## 6. Levels (characters sit under the narrator)
The narrator is the spine of the video, so it stays the loudest voice.

| | Target | Check |
|---|---|---|
| Narrator | the stem target, -25.0 LUFS integrated **[V]** | `ebur128` on the narrator-only blocks |
| Character | **1.5-3.0 dB under** the narrator **[H]** | per-sentence mean level from `tts-artifact-qa` check 5 |
| Max spread | no voice more than 4 dB from the narrator | a bigger gap reads as a mix error, not a character |
| Music under dialogue | duck an extra 1.5-2 dB vs narration **[H]** | two voices trading lines need more room than one |
| Pan | **mono, dead centre, always** | a panned voice disappears on a phone speaker |
Set these with `gain_db` per block, not with the compressor, and never with a second limiter. `tts-artifact-qa` check 5
flags a boundary step over 2.5 dB: an intended character step will trip it, so record the intended steps in the log so
the scan's warnings stay meaningful.

## 7. Quoting real people: paraphrase, never imitate
- **Never clone, imitate or approximate a real person's voice**, living or dead, named or recognisable, and never cast a
  Kokoro voice *because* it sounds like someone real. That includes politicians, CEOs, scientists and other YouTubers.
- Quote them in the **narrator's** voice, as reported speech, with the name on screen: *"The lead author's own summary
  was blunt: the data had been misread for twenty years."* Put the exact wording and the source in `facts`.
- Do not introduce a character as a real person ("here's Einstein") even in a generic voice. A stick figure labelled with
  a real name saying invented lines is a fabricated statement, whatever voice reads it.
- YouTube's privacy process lets a person request removal of realistic synthetic audio that makes them appear to say
  something they did not say, and reviewers weigh whether viewers were told it was synthetic **[V]**. Likeness detection
  covers faces today, with audio planned for 2026 **[V]**.
- Content that makes a real person appear to say something they did not say requires the **altered or synthetic content**
  disclosure **[V]**. Fictional stick-figure characters in a clearly animated explainer do not: non-realistic and
  animated content is exempt **[V]**. Keep characters obviously fictional and the question never arises.

## 8. Timing dialogue to the animation
- Drive every cue from `timing.json` spans plus the new `speakers` array; interpolate word positions by character
  offset inside a span, as `shak-voiceover` does **[V]**.
- **Beat between speakers: 0.25-0.40 s** (`pause_after_paragraph`) **[H]**. Under 0.15 s the lines tread on each other;
  over 0.6 s the scene goes dead. Never overlap two voices.
- Cut to the speaker **0.1-0.2 s before** their first word, so the viewer knows who is talking before they hear it **[H]**.
- Mouth or body motion runs for the span's full duration, stopping on the span's end time, not on the next cut.
- A reaction shot of the listener belongs in the beat, not under a line.
- Captions: prefix a character line with the speaker name once per exchange (`SKEPTIC: Sure. And?`), then drop it.
  Caption the display text, not the voiced text **[V]**.
- QC: at 3 spot checks, the figure that is animated is the figure that is speaking, and no line starts before its cut.

## Sources
- Kokoro-82M, Apache-2.0 weights and voice bank: https://huggingface.co/hexgrad/Kokoro-82M and https://github.com/hexgrad/kokoro
- ONNX weights and `voices-v1.0.bin` used here: https://github.com/thewh1teagle/kokoro-onnx
- YouTube altered or synthetic content disclosure (what needs a label, what is exempt): https://support.google.com/youtube/answer/14328491
- YouTube privacy guidelines, simulated voice complaints: https://support.google.com/youtube/answer/7671399
- Likeness detection, face now and audio planned: https://support.google.com/youtube/answer/16440338
- In-repo: `tts/kokoro_tts.py`, `engine/voice.sh`, `engine/mix.sh`, `skills/video-editing-polish/SKILL.md`; sibling skills `shak-voiceover`, `tts-script-writing`
