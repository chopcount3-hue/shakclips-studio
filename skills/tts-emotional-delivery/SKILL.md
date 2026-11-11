---
name: tts-emotional-delivery
description: Map Shak Clips script beats to Kokoro delivery without changing the narrator voice. Six beats, the four real levers, a per-sentence delivery tag for script.json, and the over-acting traps to avoid.
---

# TTS emotional delivery

Use when a script's beats are written and you need each one to *sound* like itself — after tts-script-writing, with tts-prosody-control.

Legend: **[V]** verified on an official source or measured locally on am_michael @ 1.0 · **[H]** heuristic, ear-check it.

## 1. What Kokoro can and cannot do

There is no emotion input. The model takes `tokens`, a 256-dim `style` vector and a scalar `speed`. **[V]** Predicted
duration is `sigmoid(...)/speed`, so speed changes timing and never pitch. **[V]** Emotion here is an *illusion
assembled from four levers*, and the voice itself is fixed at `am_michael` 1.0 (tts-voice-casting §1):

| Lever | Range available | Owned by |
|---|---|---|
| Speed, per spliced sentence | 0.90–1.04 | tts-prosody-control §3 |
| Pause before and after the line | 0.30–1.50 s | tts-breath-and-pacing §4 |
| Punctuation | effectively two values: `,` ≈0.30 s, everything else ≈0.40 s **[V]** | tts-prosody-control §4 |
| Sentence length and word choice | 4–18 words | tts-script-writing |
| *(proposal)* prosody-half blend | dims 128–255 of the style vector **[V]** | tts-voice-casting §3 |

The fifth lever exists but is not wired in: the style vector splits into timbre (dims 0–127, to the decoder) and
prosody (dims 128–255, to the duration/F0/energy predictor). **[V]** Blending only the prosody half with
`am_fenrir:0.2` measured +7% pitch movement (8.75 → 9.12 semitones) with the timbre unchanged (centroid 2837 → 2833
Hz). **[V]** That is the one way to add expression without recasting the voice — flag it to the owner, do not ship it
unilaterally.

## 2. The six beats

Speeds and pauses below are **[H]** recipes built from the measured ranges; the measured facts they rest on are cited.

| Beat | Speed | Pause before / after | Sentence shape | Punctuation |
|---|---|---|---|---|
| **Suspense** | 0.96 | 0.75 / **1.20** | 6–10 words, key word last | period, never `!` |
| **Wonder** | 0.94 | 0.60 / 0.90 | 12–18 words, one long arc | commas only |
| **Humour** | 1.04 then **1.0** | 0.30 / 0.60 | setup long, punchline 3–6 words | period on the punchline |
| **Gravity** | 0.92 | 0.90 / 1.00 | 8–12 words, plain nouns | period; no ellipsis |
| **Urgency** | 1.0 (house) | 0.30 / 0.30 | 4–9 words, two or three in a row | periods, no commas |
| **Warmth** | 0.96 | 0.60 / 0.75 | 10–14 words, second person | commas |

Why these work, with the evidence:
- **Suspense** is a pause, not a tone. The ellipsis gives no extra beat — measured `…` = 0.38–0.41 s versus `.` =
  0.44 s. **[V]** The 1.20 s has to be inserted silence.
- **Wonder** needs the long melody arc, so it must stay inside one paragraph call: the same words in context
  measured a **10.5** semitone spread versus 7.26 alone. **[V]**
- **Humour** lives on the speed *change* between setup and punchline, and the punchline must ride in the same
  paragraph or it hits the short-utterance weakness. **[V]**
- **Gravity** is slow and *flat*. Resist adding pitch movement; see §4.
- **Urgency** is the only beat that uses short gaps. It is also the only one where the house 1.0 is already right.
- **Warmth** comes from word choice ("you", "we") far more than from any audio lever. **[H]**

## 3. A `delivery` tag for script.json

One optional array, parallel to `sentences`, that the pipeline *could* read. Adding it changes nothing until the
code reads it, so it is safe to start writing today:

```json
{
  "paragraphs": ["...", "..."],
  "sentences": ["In nineteen seventy-seven, NASA launched a probe the size of a small car.", "..."],
  "pause_after_paragraph": [0.8, 0.6],
  "delivery": [
    {"beat": "wonder",   "speed": 0.94, "pause_after": 0.90},
    {"beat": "neutral"},
    {"beat": "suspense", "speed": 0.96, "pause_after": 1.20, "splice": true},
    {"beat": "gravity",  "speed": 0.92, "pause_after": 1.00, "emphasis": "forty"}
  ]
}
```

| Field | Meaning | Default |
|---|---|---|
| `beat` | one of the six, or `neutral` | `neutral` |
| `speed` | per-sentence speed; only honoured when `splice` is true | 1.0 |
| `pause_after` | **total** silence after this sentence, including the native ≈0.44 s | 0.44 |
| `splice` | render this sentence in its own call and splice it in | `false` |
| `emphasis` | one word to render slower from a carrier (tts-prosody-control §5) | none |

Implementation contract for whoever wires it up:
- Entry count **must** equal `len(sentences)`, which `kokoro_tts.py` already derives per paragraph. **[V]**
- A `neutral` entry with no fields must produce **byte-identical** audio to today's render. The tag is additive.
- `splice: true` costs the paragraph melody, so cap it at **3 per video**; everything else stays in its paragraph call.
- After any splice, re-run `sentence_spans` on the joined audio — `timing.json` drives every visual cue. **[V]**
- Unknown `beat` values fall back to `neutral` and log a warning. Never fail a daily run over a tag.

## 4. What not to do

- **Do not over-act.** The whole measured range is 0.90–1.04 in speed and about 1 semitone of pitch movement. A
  0.85 speed on a "dramatic" line does not read as drama; it reads as a slowed recording, which is exactly the
  "wasn't smooth" failure the shak-voiceover skill was written to stop. **[V]** No `atempo`, ever.
- **Do not stack levers on one sentence.** Slower speed *and* a 1.4 s pause *and* a splice *and* an emphasis word is
  four signals on one line; the ear reads it as a glitch. Two levers maximum. **[H]**
- **Do not use `!`**. Measured, `!` gives 0.41–0.42 s of pause — the same as a period — and no extra energy. **[V]**
  It only risks a shouty reading. Carry excitement with sentence length.
- **Do not fake a question rise.** A `?` on a declarative sentence measured **−3.86 st** over the final 0.4 s — it
  falls. Only inverted yes/no questions rose, and only +0.71 st. **[V]** Write the inversion.
- **No fake emotion on tragedies.** Deaths, disasters, war and crime get `gravity`: 0.92, plain nouns, a 1.0 s
  pause, no ellipsis, no music swell under the number of casualties. Do not use `suspense` on a real death, do not
  put a "take a guess" beat on a body count, and never a humour beat anywhere in the paragraph. **[H]** The
  retention trick is not worth it, and ad suitability is a separate reason to keep it plain.
- **No mock sincerity.** `warmth` on a sponsor read or a subscribe ask sounds like a sales voice. Keep those neutral.
- **One beat per paragraph.** Beats are paragraph-scale; mixing wonder and urgency inside four sentences cancels both. **[H]**

## 5. Disclosure, honestly

YouTube's altered-or-synthetic-content page requires disclosure for realistic content that makes "a real person
appear to say or do something they didn't do", alters footage of a real event, or shows a realistic scene that did
not occur. It explicitly does **not** require disclosure for "Production assistance, like using generative AI tools
to create or improve a video outline, script" or for "Cloning one's own voice to create voice overs or dubs", and it
notes that labels may appear for "non-music AI-generated audio". **[V]** The page **does not** directly address a
synthetic narrator reading factual commentary in its own invented voice. **[V]**

So: this channel's narration is a synthetic voice that impersonates nobody. **[H]** The safe, cheap position is to
answer the "AI use" question in YouTube Studio honestly for the voice, and to keep the narration from ever implying
it is a named real person — no "I was there", no first-person eyewitness claims, no imitation of a public figure's
voice or cadence. That is a delivery rule, not just a policy one. Owner decides the Studio toggle; do not guess it.

## 6. Delivery QC

- [ ] Every paragraph has exactly one beat, written down.
- [ ] Splices ≤3 per long-form; `timing.json` spans re-derived after each.
- [ ] No sentence carries more than two levers.
- [ ] No `!` in voiced text; every intended question is syntactically inverted.
- [ ] Tragedy and casualty paragraphs are `gravity`, with no music swell and no guess beat.
- [ ] A `neutral`-only render matches today's output exactly (regression check on the tag).
- [ ] Effective wpm still inside the band from tts-breath-and-pacing §2 after all beats are applied.
- [ ] The three highest-stakes lines (hook, re-hook, final payoff) went to the owner as a 30 s sample.

## Sources
- https://github.com/hexgrad/kokoro
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/README.md
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- https://support.google.com/youtube/answer/14328491
- https://github.com/espeak-ng/espeak-ng
