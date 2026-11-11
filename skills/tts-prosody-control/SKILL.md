---
name: tts-prosody-control
description: Make Kokoro's am_michael sound less robotic without changing the voice. Chunking, per-sentence speed by role, measured pause lengths, emphasis splicing, question shapes and melody variety.
---

# TTS prosody control (am_michael, speed 1.0)

Use when a render is intelligible but flat, sing-song or metronomic — after tts-script-writing, before tts-breath-and-pacing.

Legend: **[V]** verified on an official source or measured locally on am_michael @ 1.0 · **[H]** heuristic, ear-check it.

## 1. What levers actually exist

Kokoro takes three inputs: `tokens` int64 [1,N], `style` float [1,256], `speed` float [1]. There is no SSML, no
pitch input, no emphasis tag. **[V]** Inside the model, predicted duration is `sigmoid(...).sum(-1) / speed` — so
`speed` scales **all** durations linearly and never touches the F0 prediction. **[V]** (`hexgrad/kokoro`, `model.py`.)
Everything expressive therefore comes from four places: **where you cut the text**, **what speed each cut gets**,
**what punctuation the text carries**, and **silence you splice in yourself**.

## 2. Chunking: paragraph, not sentence

| Unit | Effect | Verdict |
|---|---|---|
| Whole paragraph, 2–4 sentences, 70–190 tokens | Melody carries across sentences; the model's goldilocks band is 100–200 tokens **[V]** | **Default.** |
| One sentence per call | `Then, silence.` alone: 15 tokens, 1.05 s, 7.26 st pitch spread. Same words inside their paragraph: 1.23 s, **10.5 st** **[V]** | Only for a deliberate splice. |
| Over 400 tokens in one call | The model "may rush" **[V]** | Split at a sentence boundary. |

Counter-intuitive measurement: rendering the five sentences of a paragraph **separately** gave *less* melody
similarity (mean pairwise F0-contour correlation **0.12**) than splitting the single paragraph render (**0.18**). **[V]**
So separate renders do not cause the sing-song — they cause the *short-utterance* weakness above. Chunk by paragraph.

Also measured: the espeak IPA the pipeline feeds in (`oʊ eɪ aɪ dʒ tʃ ɚ ɜː ː`) versus the misaki training alphabet
(`O A I ʤ ʧ əɹ ɜɹ`, no `ː`) produced **identical** duration (23.48 s), median F0 (117.1 Hz) and pitch spread
(3.29 vs 3.30 st SD) on the same paragraph. **[V]** Do not rewrite the phonemizer chasing naturalness; the gain is zero.

## 3. Speed per sentence, by role

Speed is per synthesis call, so a per-sentence speed means a per-sentence call — which costs you the paragraph
melody above. Use it on **one or two sentences per video**, spliced back in (section 5), never across the board.
The house baseline stays 1.0. **[H]** on all offsets; they are ear-tuned, not measured:

| Sentence role | Speed | Why |
|---|---|---|
| Hook, first line | 0.96 | Buys authority on the line that decides the retention curve. |
| Plain fact / connective | **1.0** | House baseline. Most of the video. |
| Aside, parenthetical | 1.04 | Faster = lower stakes, the way a person throws an aside away. |
| Payoff / reveal | 0.90–0.92 | Measured: the word `fire.` at 0.90 lands 0.48 s with a **10.0 st** spread. **[V]** |
| Question / guess beat | 0.98 | Slightly held, so the 1.5 s music beat after it does not feel abrupt. |
| Last line of the video | 0.94 | See tts-breath-and-pacing §7. |

## 4. Pause lengths: the model gives you exactly two

Measured native pause after each mark, mid-sentence, am_michael @ 1.0, two carrier sentences each: **[V]**

| Mark | Native pause | Mark | Native pause |
|---|---|---|---|
| `,` | **0.30 s** | `;` | 0.37–0.39 s |
| `.` | 0.44 s | `:` | 0.39–0.41 s |
| `?` | 0.42–0.44 s | `—` | 0.41 s |
| `!` | 0.41–0.42 s | `…` | 0.38–0.41 s |
| no mark | 0.04–0.38 s (unreliable) | | |

**This is the single most important number in this skill.** Punctuation is effectively a binary switch:
≈0.30 s for a comma, ≈0.40 s for everything else. An ellipsis does **not** give you a longer beat than a period.
Every pause longer than 0.44 s has to be inserted as silence by the pipeline. Target beats:

| Beat | Total silence | How |
|---|---|---|
| Clause breath | 0.30 s | comma, native |
| Sentence end, inside a paragraph | 0.44 s | period, native |
| Sentence end you want to land | 0.60–0.75 s | period + 0.2–0.3 s inserted |
| Paragraph / idea change | 0.80–1.10 s | `pause_after_paragraph` (house range 0.5–0.9 today) |
| Before a reveal | 1.00–1.40 s | inserted, plus the music drop from video-editing-polish |
| Guess beat | 1.50 s | already the house number |
| Section title card | 1.20–1.60 s | inserted |

Never write `...` or `. .` runs to buy time — they collapse to ≈0.40 s. **[V]**

## 5. Emphasis by splicing

To stress a word, render it slower in its own call and splice it after the lead-in. The trap: a 2–6 token call hits
the short-utterance weakness. Pull the word out of a **carrier sentence** instead. Measured on
`And the thing that saved them was… fire.`: **[V]**

| Version | Duration | Reveal |
|---|---|---|
| Whole line at 1.0 | 2.12 s | ellipsis gap only **0.06 s** at −35 dB — no beat at all |
| Lead-in at 1.0 + `fire.` cut from `It was fire. That was the answer.` at 0.90, 0.45 s gap | 2.72 s | 0.48 s, 10.0 st spread |

Recipe, as pseudocode against `kokoro_tts.py`'s structure (not applied — propose it to the owner):

```python
# lead-in and reveal are separate synth() calls on the same voice
lead, _  = k.synth("And the thing that saved them was", voice, 1.0)
car,  _  = k.synth("It was fire. That was the answer.", voice, 0.90)   # carrier keeps the call >10 tokens
cut      = first_gap_centre(car, thr_db=-38, min_gap=0.06)             # after "fire."
reveal   = car[word_start(car[:cut]):cut]
out      = xfade_join(trim(lead), match_peak(reveal, lead), gap=0.45, fade=0.03)
```
Rules: 30 ms fades at both splice edges (matches video-editing-polish rule 5), match the reveal's peak to the
lead-in's, and keep the splice gap in the 0.28–0.50 s range. Then **re-run `sentence_spans`** on the joined audio, or
`timing.json` will be wrong and the visuals will drift. Budget 1–3 splices per 8–10 min video. **[H]**

## 6. Questions and lists

Measured final F0 movement over the last 0.4 s and 0.8 s: **[V]**

| Line | Last 0.4 s | Last 0.8 s |
|---|---|---|
| `So the probe is still out there.` | −4.65 st | −2.61 st |
| `So is the probe still out there?` (inverted) | **+0.71 st** | −4.21 st |
| `So the probe is still out there?` (declarative + `?`) | −3.86 st | +0.47 st |
| `So where is the probe now?` (wh-) | −6.05 st | −5.94 st |
| `It is still talking to us, right?` (tag) | −2.18 st | — |

Read it: **only an inverted yes/no question rises, and only by about 0.7 semitones.** A question mark on a
declarative sentence does not rise — it falls. Wh- questions fall hardest. So:
- For a hook or doubt beat that must *sound* like a question, write it inverted: `Is it still talking to us?`,
  not `It is still talking to us?`.
- Do not rely on `?` for the lift. Carry the question with word order, a 0.6 s beat after it, and the visual. **[H]**
- Lists: three items in one sentence get one melody arc; four or more flatten. Break a 4+ list into
  two sentences, or pull the last item into its own short sentence for the landing. **[H]**

## 7. Avoiding "same melody every sentence"

Measured honestly: four same-shaped sentences (`The Nth engine failed at <time>.`) gave a mean pairwise contour
correlation of **0.54**; four deliberately varied sentences gave **0.56**. **[V]** Rewriting sentence shape alone
did **not** measurably break the pattern. The levers that did move the numbers were sentence *length* (section 2)
and speed (section 3). So:

- [ ] Vary sentence **length** across a paragraph: one of 6–9 words, one of 14–18. Length changes the arc; syntax does not. **[V]**
- [ ] Never run three sentences with the same word count in a row. **[H]**
- [ ] Change the **final word's** stress pattern between neighbours — a one-syllable landing then a three-syllable one. **[H]**
- [ ] Put the varied pause lengths of section 4 between them; identical gaps are what the ear hears as a metronome.
- [ ] Spend the 1–3 splices of section 5 on the three highest-stakes lines: hook, mid-video re-hook, final payoff.
- [ ] Spot-check: split the render by `timing.json` spans, correlate the F0 contours pairwise. Above **0.65** mean
      is audible sameness **[H]**; our current paragraph renders sit at 0.18–0.56. **[V]**

## Sources
- https://github.com/hexgrad/kokoro
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/README.md
- https://github.com/thewh1teagle/kokoro-onnx
- https://github.com/hexgrad/misaki/blob/main/EN_PHONES.md
