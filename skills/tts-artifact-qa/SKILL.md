---
name: tts-artifact-qa
description: "Catch Kokoro narration glitches without ASR: clicks, metallic edge, cut word endings, level jumps, bad gaps, rushed sentences, flat pitch, plus thresholds, a numpy scanner and a re-render policy."
---

# TTS artifact QA (no ASR, CPU only)

Use after every synthesis run, before the voice stem is mastered and mixed, and whenever a render "sounds off" but nobody can say where.
Legend: **[V]** = measured on real Kokoro output here. **[H]** = heuristic, unverified.
No whisper, librosa or soundfile in this environment: everything below is ffmpeg + numpy + `timing.json`.
This skill **finds and locates** faults. Fixing pacing, pauses, pronunciation or emotion belongs to
`tts-breath-and-pacing`, `tts-pronunciation-lexicon`, `tts-prosody-control` and `tts-emotional-delivery`.

## 1. Inputs and the one-line scan
Needs `voice/voice_raw.wav` (24 kHz float mono from `kokoro_tts.py`) **and** `voice/timing.json`
(`times`, `sentences`, `total`). Run it on the **raw** file, before the mastering tail, so faults are not hidden by
the limiter. Decode with ffmpeg to raw floats, never with a library:
```python
raw = subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar','24000','-f','f32le','-'],
                     capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.float32)
```
A full 10-minute render scans in a few seconds on 2 cores **[V]** (0.4 s for a 37 s render, 1.0 s with the click pass).

## 2. Checks, each with a tested threshold

| # | Fault | Measure | Fail threshold | Measured on good renders **[V]** |
|---|---|---|---|---|
| 1 | Click / pop | in regions whose 10 ms context RMS is under -45 dBFS, flag any sample where the first difference exceeds 8x the local difference-RMS plus 0.004 | any event | 2-14 events per render (all low-level), so treat under 15 as noise and inspect the list |
| 2 | Chunk-join step | audio meets exact digital zero with either side above -50 dBFS | any | 0 (`trim()` fades are clean) |
| 3 | Metallic / sibilant sentence | per sentence, 4-8 kHz energy over 0.3-4 kHz energy ("tilt") | more than 6 dB above the render median | median -10.0 dB (am_michael), -14.4 dB (af_heart); worst sentence +4.0 dB |
| 4 | Cut word ending | last 20 ms frame level minus the sentence's median active level | above -8 dB (the tail has not decayed) | -14.3 to -50 dB across 15 sentences |
| 5 | Level jump | per-sentence mean active level vs the render median; and the step across each paragraph boundary | more than 3.0 dB from the median, or a boundary step over 2.5 dB | sentences -22.3 to -27.3 dBFS, median -26.3; boundary steps under 1.5 dB |
| 6 | Unnatural gap | `times[i+1][0] - times[i][1]` | over 1.2 s, or under 0.15 s between sentences | 0.41-0.67 s with `pause_after_paragraph` 0.6 |
| 7 | Rushed sentence | words / in-span duration (gaps excluded) | over 230 wpm, or under 110 wpm for a sentence of 5+ words | median 195 wpm in-span at speed 1.0 (whole-render 163 wpm including gaps) |
| 8 | Dense sentence | in-span seconds per character | under 45 ms/char | 53-61 ms/char typical; a one-word line read 82 ms/char |
| 9 | Pitch monotony | F0 by autocorrelation; per sentence the p90/p10 spread in semitones | render p10-p90 under 5 st, or 3+ consecutive sentences under 4 st | am_michael 8.2 st median, F0 119 Hz; af_heart 7.8 st, 194 Hz |
| 10 | Span mismatch | `len(times)` vs `len(sentences)` | not equal | equal on all test renders |

F0 that works on CPU **[V]**: 40 ms frames, 10 ms hop, mean-removed, FFT autocorrelation
(`np.fft.irfft(abs(rfft(f,2048))**2)`), normalised by lag 0, search lags 80-400 Hz..60 Hz, accept the peak only when
the normalised value is above 0.5, skip frames more than 30 dB under the loudest frame.

## 3. What the automatic checks cannot do **[V]**
A buzz injected as 120 Hz harmonics across 4-8 kHz at 0.18x the local RMS moved the band ratio by only **1.3 dB**
(-24.0 to -22.7 dB), well inside sentence-to-sentence spread. The same holds for a click dropped inside loud speech:
sweeping a first-difference detector over speech found 1 of 6 injected clicks while raising 10 false alarms, whereas the
same clicks placed in pauses were found **9 of 9 at an amplitude of 0.01** with 2-14 false alarms.
So: **clicks are only reliably detectable in quiet regions, and buzz is not reliably detectable at all.**
Report checks 3 and 9 as *ranked suspects for a human ear*, never as a pass or fail on their own.

## 4. Scanner design (one file, no new dependencies)
`tools/tts_qa.py voice/voice_raw.wav voice/timing.json [--json report.json]`
1. Load floats with ffmpeg. Build a 10 ms frame-RMS array once and reuse it for every level test.
2. Quiet-region pass -> check 1 and 2, output a list of times with each event's context level.
3. Per-sentence loop over `times` -> checks 3, 4, 5, 7, 8 and the F0 track for 9.
4. Gap loop over consecutive spans -> check 6. Compare against `pause_after_paragraph` from the script.
5. Print one line per sentence (`index, words, wpm, ms/char, level, tilt, tail, F0, range`) plus render medians, then a
   verdict block: `PASS`, `WARN` (suspects only) or `FAIL` (any hard threshold).
6. Exit 0 on PASS/WARN and 1 on FAIL, and append one summary line to the project log for the daily run record.
Keep the script outside any downloaded repo and pass paths as arguments. Thresholds live in one dict at the top so the
owner can tune them without touching the logic.

## 5. Re-render policy (which sentence, what to change)
Re-render **one paragraph**, never one sentence: paragraph-level synthesis is what makes the prosody flow, and a
sentence rendered alone will not match. Re-synthesise the paragraph that contains the flagged sentence, splice it on a
paragraph boundary where the gap is silent, then re-run this scan and rebuild `timing.json`.

| Flag | First fix | If it survives two attempts |
|---|---|---|
| Click in a gap (1, 2) | re-render the paragraph; Kokoro is non-deterministic enough that a repeat usually clears it **[H]** | shorten the paragraph by splitting it at a sentence end |
| Metallic / sibilant (3) | rewrite the sentence to lose a sibilant cluster, or swap a word | drop the sentence's lead-in clause; do not add more de-essing |
| Cut ending (4) | add a comma or a full stop; make sure the sentence ends in punctuation | re-render with `speed` 0.97 for that paragraph |
| Level jump (5) | re-render the paragraph; if two paragraphs disagree, re-render both in one call | leave it: the mastering tail's limiter absorbs 3 dB |
| Bad gap (6) | correct `pause_after_paragraph`, do not pad the wav | split the paragraph |
| Rushed / dense (7, 8) | split the sentence in the script (hand to `tts-breath-and-pacing`) | lower `speed` by 0.03 for the whole render and re-check wpm |
| Monotony (9) | hand to `tts-prosody-control` / `tts-emotional-delivery`: it is a script fault, not an audio fault | consider a voice A/B via `tts-voice-casting` |
| Span mismatch (10) | adjust `min_gap` in `sentence_spans`; confirm the `sentences` list matches the paragraphs | fall back to character-proportional spans and flag captions for a spot check |

Hard stop: **at most 3 re-render passes per video.** After that, write the remaining flags into the project log and
ask the owner, with the 30-second clip attached. A daily automated run must never loop on re-renders.

## 6. The 60-second human listen (phone + wired earbuds)
Automatic checks cannot hear "soothing". Do this on the finished stem, on a phone, with earbuds, at a normal volume.

| Seconds | Listen for | Fail |
|---|---|---|
| 0-10 | first sentence: does it start clean, no clipped first word, no pop | re-render paragraph 1 |
| 10-20 | one mid-video paragraph boundary: does the pause feel like a breath or a dropout | fix `pause_after_paragraph` |
| 20-30 | the loudest sentence (highest level from check 5) | harsh -> re-render; squashed -> limiter too low |
| 30-40 | a sentence with numbers or a name | wrong reading -> `tts-pronunciation-lexicon` |
| 40-50 | the last paragraph and the final word | the tail must decay, not stop |
| 50-60 | phone speaker, no earbuds, arm's length | voice must stay in front of the music |
Write the six answers into the log. Two fails of the same type on two days in a row is a chain or voice problem, not a
sentence problem: escalate to `tts-voice-mastering` or `tts-engine-evaluation`.

## Sources
- ffmpeg filters used for decode and measurement (`ebur128`, `astats`, `silencedetect`): https://ffmpeg.org/ffmpeg-filters.html
- numpy FFT and sliding-window views: https://numpy.org/doc/stable/reference/routines.fft.html
- EBU R 128 (loudness and LRA definitions): https://tech.ebu.ch/docs/r/r128.pdf
- Kokoro-82M model card (24 kHz output, Apache-2.0 weights): https://huggingface.co/hexgrad/Kokoro-82M
- In-repo: `tts/kokoro_tts.py` (`timing.json`, `sentence_spans`, `trim`), `skills/video-editing-polish/SKILL.md`
- Thresholds in sections 2-3 were derived from measurements on am_michael and af_heart renders made here.
