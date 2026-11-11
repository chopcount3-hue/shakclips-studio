---
name: tts-voice-casting
description: Choose and lock the Shak Clips narrator voice in Kokoro-82M. Official grades, blend recipes, a two-minute blind phone A/B, male/female and US/UK trade-offs, and how to keep one house voice.
---

# TTS voice casting (Kokoro-82M)

Use when picking, challenging or re-confirming the narrator voice — not for per-line delivery (see tts-prosody-control, tts-emotional-delivery).

Legend: **[V]** verified on an official source or measured locally in this repo · **[H]** heuristic, ear-check it.

## 1. The house voice is already decided

| Field | Value |
|---|---|
| Voice | `am_michael` |
| Speed | `1.0` |
| Polish chain | the one already in `engine/voice.sh` (highpass 70, +2 dB at 3.5 kHz, de-ess, 2.2:1 comp, short aecho) |
| Call | `./engine/voice.sh am_michael 1.0` |

The owner picked this in a blind listen against three challengers. **[V]** Do not change the voice or the speed to fix
"robotic" or "not soothing" — those are pause, beat and delivery problems. The other four `tts-*` skills own them.
Measured on am_michael at 1.0 (pre-polish, 24 kHz): median F0 **118–122 Hz**, pitch spread (10th–90th percentile)
**8.4–8.9 semitones**, spectral centroid **≈2790 Hz**, articulation rate **≈198 wpm**, effective **157–171 wpm**
depending on how much silence the script asks for. **[V]**

## 2. Official voice list and grades [V]

54 voices ship in `voices-v1.0.bin`, each a `(510, 1, 256)` float32 array — one style row per phoneme-count. **[V]**
Grades below are from Kokoro-82M's own VOICES.md, which calls them "estimates of the quality and quantity of its
associated training data". American English and the British voices that matter here:

| Voice | Sex | Target quality | Training data | Overall grade |
|---|---|---|---|---|
| `af_heart` | F | — | — | **A** |
| `af_bella` | F | A | 10–100 h | A- |
| `af_nicole` | F | B | 10–100 h | B- |
| `bf_emma` | F | B | 10–100 h | B- |
| `af_aoede` `af_kore` `af_sarah` | F | B | 1–10 h | C+ |
| `am_fenrir` `am_michael` `am_puck` | M | B | 1–10 h | **C+** |
| `bm_fable` `bm_george` | M | B | ~10 min | C |
| `am_echo` `am_eric` `am_liam` `am_onyx` | M | C | ~10 min | D |
| `bm_lewis` | M | C | 1–10 h | D+ |
| `am_adam` | M | D | 1–10 h | F+ — never use |

Two limits from the same page, both of which bite on explainer scripts: voices "perform best on a goldilocks range
of 100-200 tokens out of ~500 possible", are weak on "short utterances, especially less than 10-20 tokens", and may
rush on utterances "over 400 tokens". **[V]** Our paragraphs run 70–190 phoneme tokens, which is the right band.

Measured consequence: `Then, silence.` rendered alone (15 tokens) is **1.05 s** with a 7.3-semitone pitch spread;
the identical words rendered inside their paragraph are **1.23 s** with a **10.5**-semitone spread. **[V]**
Short lines always ride inside a paragraph.

## 3. Blending, and what a blend can and cannot change

A blend is a weighted sum of style rows: `"am_michael:0.6+am_fenrir:0.4"`. `kokoro_tts.py` already parses it. **[V]**

The 256-dim style vector is split inside the model: dims **0–127** feed the decoder (timbre), dims **128–255** feed
the duration / F0 / energy predictor (prosody). **[V]** (`hexgrad/kokoro`, `model.py`: `s = ref_s[:, 128:]`,
`audio = self.decoder(..., ref_s[:, :128])`.) So a full blend moves both halves, which is why every blend sounds like
a different person. Measured with timbre pinned to `am_michael` and only the prosody half blended:

| Prosody half | Median F0 | Pitch spread | Centroid | Read |
|---|---|---|---|---|
| `am_michael` (house) | 121.8 Hz | 8.75 st | 2837 Hz | baseline **[V]** |
| `+am_fenrir:0.2` | 124.7 Hz | 9.12 st | 2833 Hz | +7% movement, same timbre — best "less flat" nudge **[V]** |
| `+am_puck:0.2` | 119.4 Hz | 8.75 st | 2815 Hz | no measurable gain **[V]** |
| `+bm_george:0.3` | 128.3 Hz | 8.73 st | 2820 Hz | +6 Hz, reads as a different man **[H]** |
| `+af_heart:0.2` | 134.8 Hz | 9.07 st | 2821 Hz | +13 Hz, clearly a different voice **[H]** |

The prosody-only split is **not** wired into `kokoro_tts.py` today. It needs a one-line change to `load_voice`
(concatenate `timbre[:, :128]` with `blend[:, 128:]`). Treat it as a proposal for the owner, not a default.

## 4. Candidate recipes (challengers only — the house voice stays)

| # | Recipe | Speed | Why you would try it |
|---|---|---|---|
| A | `am_michael` | **1.0** | **Current house voice.** 157–171 wpm. Keep as the control in every A/B. |
| B | `am_michael:0.6+am_fenrir:0.4` | 0.94 | Deeper, slower. Measured 158.7 wpm. Lost the blind test once already. |
| C | `af_heart` | 0.94 | The only A-grade voice. Measured 169.9 wpm, so needs 0.90 to match A's pace. |
| D | `bm_george:0.7+bm_fable:0.3` | 0.94 | UK storyteller. Measured 162.3 wpm. Both halves are C-grade, ~10 min of data. |

Every challenger must be rendered through the *same* `engine/voice.sh` chain as A, or you are testing EQ, not voice.

## 5. Two-minute blind A/B on a phone

1. Pick **one** 40–50 word paragraph from a real upcoming script, with a comma, an ellipsis and a question in it.
2. Render each candidate with `./engine/voice.sh <voice> <speed>` and the identical script.json. Keep the chain fixed.
3. Normalise all candidates to the same loudness before export, or the loudest wins on volume alone. **[H]**
4. Export MP3s named `Voice_A.mp3` … `Voice_D.mp3` — never the voice name. Shuffle which letter is which per round.
5. Owner listens **on phone speaker, not headphones** (most watch time is phone speaker) **[H]**, twice through,
   and answers two questions only: *which one would you listen to for ten minutes?* and *which one sounds like a person?*
6. If the answer is not the same letter twice, the difference is below the noise floor — keep the incumbent.
7. Log the winner, the date and the sample path in the project. A voice change is a channel-identity change.

## 6. Male vs female, US vs UK, for this content

| Axis | Trade-off |
|---|---|
| Male (`am_*`) | Lower median F0 (118–122 Hz measured) survives phone speakers and ducked music better. **[H]** All am_* voices cap at C+. **[V]** |
| Female (`af_*`) | The only A / A- grades exist here. **[V]** Higher F0 competes with the 2–4 kHz band where our music sits. **[H]** |
| US (`am_*`/`af_*`) | Matches the US audience and the espeak `en-us` phonemes the pipeline already uses. Default. |
| UK (`bm_*`/`bf_*`) | Reads as "documentary", but needs `lang='en-gb'` phonemes for rhotics; mixing `en-us` IPA with a UK voice is a mismatch. **[H]** |
| True history | A UK voice flatters it; news and what-if do not. Avoid per-format voices — one channel, one narrator. **[H]** |

## 7. Keeping it consistent across videos

- [ ] Voice and speed are read from one place, not typed per run. `engine/voice.sh` already defaults them.
- [ ] `timing.json` records `voice` and `speed` on every render **[V]** — spot-check it in the daily log.
- [ ] A blend string is a literal recipe: store it verbatim, including weights, and never re-derive it by ear.
- [ ] Model and voice files are pinned (`kokoro-v1.0.onnx`, `voices-v1.0.bin`, Apache-2.0, trained only on
      permissive / non-copyrighted audio **[V]**). Re-downloading a different release re-casts the channel.
- [ ] Changing the polish chain changes the voice as much as a blend does. Treat chain edits as a casting decision.
- [ ] If the voice ever has to change, re-record the channel trailer and the first 10 s of the top videos the same week. **[H]**

## Sources
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/README.md
- https://github.com/hexgrad/kokoro
- https://github.com/thewh1teagle/kokoro-onnx
- https://github.com/espeak-ng/espeak-ng
