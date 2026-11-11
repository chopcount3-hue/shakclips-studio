---
name: tts-breath-and-pacing
description: Soothing storyteller pacing for Shak Clips without changing the voice. Target wpm bands, a computable pause budget, non-metronome gaps, room tone instead of digital silence, and safe breaths.
---

# TTS breath and pacing

Use when a render is accurate but feels rushed, airless or mechanically even — after tts-prosody-control, before the mix.

Legend: **[V]** verified on an official source or measured locally on am_michael @ 1.0 · **[H]** heuristic, ear-check it.

## 1. Pace comes from silence, not from speed

The voice is fixed at `am_michael` speed 1.0. That fixes the **articulation rate** at ≈**198 wpm** (words divided by
frames above −40 dB). **[V]** The *effective* wpm — what a viewer feels — is words divided by total runtime, and it is
entirely yours to set by how much silence the script asks for. Measured on one 65-word two-paragraph sample: **[V]**

| Paragraph gap | Runtime | Effective wpm | Articulation wpm |
|---|---|---|---|
| none (single call) | 23.5 s | 168.6 | 211 |
| 0.6 s (house default) | 24.8 s | 157.3 | 198 |
| 1.1 s | 25.3 s | 154.2 | 198 |
| 1.3 s | 25.5 s | 153.0 | 198 |

Past full renders agree: `am_michael` @ 1.0 has landed at 159.7 and 171.1 wpm, and @ 0.96 at 148.0 wpm. **[V]**
So at speed 1.0 the script's own pause structure moves effective pace by **more than 15 wpm** — more than a
0.04 speed change does. Pacing is a silence-budget problem.

## 2. Target bands

All **[H]** — these are ear targets for this channel, not measurements of anything:

| Register | Effective wpm | Where |
|---|---|---|
| Calm storyteller | **145–152** | true history, what-if, space, the hook of any video |
| House default | **152–160** | top-5, explainer body — matches tts-script-writing's 150–160 |
| News / urgency | **160–170** | trending-news openers, the stakes paragraph, never a whole video |
| Too fast | above 172 | reachable at speed 1.0 with no paragraph gaps **[V]** — always a bug |
| Too slow | below 140 | reads as a slideshow; the retention curve punishes it **[H]** |

## 3. Computing the pause budget

Extra silence needed to move from a current to a target effective wpm, for a script of `W` words:

```
extra_seconds = W * 60 * (1/target_wpm - 1/current_wpm)
```

Worked example, a 1,550-word long-form at the measured 157 wpm, aiming for 150: **[V]** arithmetic
`1550 * 60 * (1/150 - 1/157)` = **27.6 s** of extra silence. Where to spend it:

| Spend it on | Count in a 10 min video | Per instance | Total |
|---|---|---|---|
| Paragraph gaps (`pause_after_paragraph`) | ~22 | +0.3 s over the 0.6 house default | 6.6 s |
| Sentence ends inside paragraphs | ~100 | +0.15 s on ~70 of them | 10.5 s |
| Section title cards | 4–5 | 1.2–1.6 s each, up from ~0.6 | 4.5 s |
| Reveals and the guess beat | 3–4 | 1.0–1.5 s each | 4.0 s |
| Last line | 1 | 2.0 s tail | 2.0 s |

That totals ≈27.6 s without any one pause feeling long. **Spreading the budget is the whole trick.** Dumping all
28 s into 22 paragraph gaps would need +1.3 s each, which reads as hesitation. **[H]**

## 4. Non-metronome pauses

Equal gaps are what the ear identifies as a machine. Vary every category: **[H]**

| Boundary | Centre | Allowed range | Rule |
|---|---|---|---|
| Sentence, mid-paragraph | 0.44 s native **[V]** | 0.44–0.75 s | Insert 0 / 0.15 / 0.30 s, cycling by content, not by position. Leave commas (0.30 s native) alone |
| Paragraph | 0.80 s | 0.60–1.10 s | Longer at an idea change, shorter inside a run of related facts |
| Before a reveal | 1.20 s | 1.00–1.40 s | Pair with the music drop from video-editing-polish |
| Section title card | 1.40 s | 1.20–1.60 s | |
| Guess beat | 1.50 s | fixed | House number, already set |
| After the last word | 2.00 s | 1.60–2.40 s | Let the music ramp finish, not the voice |

Checks: no two consecutive paragraph gaps within 0.05 s of each other, and a standard deviation of at least
**0.12 s** across the video. **[H]** `pause_after_paragraph` is already a per-paragraph list in `script.json`, so
this needs no code change — the nvidia example already alternates 0.5/0.6/0.9. **[V]**

## 5. Room tone, not digital silence

Kokoro writes true zeros between paragraphs and `trim()` cuts to a hard edge. **[V]** A render that alternates
speech and absolute silence reads as cuts, not breaths, and the compressor in `engine/voice.sh` makes the
transition more audible, not less. **[H]**

Lay one continuous bed of **synthesised** room tone under the whole voice track, before the mix: pink-ish noise,
40 Hz–5 kHz with a `1/sqrt(f)` tilt, from a seeded RNG so no sample pack is involved **[V]**, at **−62 dBFS RMS**
(measured — sits under the voice and survives loudnorm) **[V]**, unbroken from 0 s to the end, with the seed fixed
per channel. A bed that stops *is* the artefact you were hiding.

```python
def room_tone(sec, sr=24000, dbfs=-62, seed=11):           # described, not applied
    g = np.random.default_rng(seed); n = int(sec * sr) + 1
    w = g.standard_normal(n + 8192); f = np.fft.rfftfreq(len(w), 1 / sr)
    W = np.fft.rfft(w) / np.sqrt(np.maximum(f, 20)) * (f > 40) * (f < 5000)
    return (lambda x: (x / np.sqrt((x ** 2).mean()) * 10 ** (dbfs / 20)).astype(np.float32))(np.fft.irfft(W, len(w))[:n])
```
It goes on `voice_raw.wav` **before** the `engine/voice.sh` ffmpeg chain, so the highpass and compressor treat it as
part of the voice. Re-check the final mix still measures I = −14 ±1 LUFS (video-editing-polish §Loudness). **[V]**

## 6. Breaths — only self-made, never from a pack

**Never** use a breath from a sample library, stock pack or another creator's track. Two licence-clean sources:

| Source | How | Measured |
|---|---|---|
| **From the voice itself** (preferred) | synthesise the phoneme string `h` or `hə` with the same voice and style, then trim to 0.25–0.40 s | `h`: 0.50 s, 9% voiced, centroid 2045 Hz · `hə`: 0.88 s, 13% voiced, 1936 Hz **[V]** |
| Synthesised noise (fallback) | Gaussian noise shaped by a 1.6 kHz formant + 450 Hz chest bump, `sin^1.6` swell | 0.38 s inhale **[V]** |

Placement, all **[H]** except the level: **−32 dB** under the speech peak **[V]** (above −28 dB is distracting);
only before a paragraph that starts a new idea and only where the gap is ≥0.8 s; end it **0.10–0.15 s before** the
next word; at most **one per 45–60 s**; never after the last word of the video; 30 ms fades both edges, per
video-editing-polish rule 5. Skip breaths entirely if the owner's ear-check calls them a hiss — room tone does most
of the work.

## 7. Rhythm: paragraphs, reveals, and the last line

- **Paragraph shape**: 2–4 sentences, and vary the *count* between neighbours — a 4-sentence paragraph then a
  2-sentence one. Equal paragraph lengths produce equal breathing, which is the metronome again. **[H]**
- **Slowing into a reveal**: three moves together. (1) shorten the two sentences before it; (2) a 1.0–1.4 s gap;
  (3) the reveal word spliced at 0.90 per tts-prosody-control §5 — measured 0.48 s, 10.0 st spread. **[V]** The music
  drop belongs to video-editing-polish; do not also stretch the pause past 1.4 s. Give the next sentence a 0.75 s run-up.
- **The last line**: one sentence, 6–10 words, speed 0.94, a 0.60 s gap before it, 2.0 s of room tone after it, and
  no breath. It is the line people hear while deciding to subscribe. **[H]**
- **The Short**: do not apply any of this. A Short runs at the news band (160–170 wpm) with 0.25–0.40 s gaps; the
  hook has to land inside two seconds. **[H]**

## 8. Pacing QC

- [ ] Effective wpm from `timing.json` (`words / total * 60`) is inside the band for the format (§2), and
      articulation wpm is still ≈198 — if that moved, someone changed the voice or speed; stop and check.
- [ ] Standard deviation of `pause_after_paragraph` is ≥0.12 s, and no two adjacent gaps match within 0.05 s.
- [ ] Room tone is continuous end to end at −62 dBFS, with no gap at a splice point.
- [ ] Breath count ≤ runtime_minutes × 1.3, none in the last 15 s.
- [ ] `silencedetect=noise=-45dB:d=2` finds only the guess beat and the title cards **[V]**, and the final mix is
      still I = −14 ±1 LUFS, TP ≤ −1.5 after the bed and breaths were added. (video-editing-polish)
- [ ] One 30 s sample goes to the owner before any pacing change ships channel-wide.

## Sources
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- https://github.com/hexgrad/kokoro
- https://github.com/thewh1teagle/kokoro-onnx
- https://github.com/espeak-ng/espeak-ng
- https://ffmpeg.org/ffmpeg-filters.html
