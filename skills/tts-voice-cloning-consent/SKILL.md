---
name: tts-voice-cloning-consent
description: "Clone only the owner's own voice for Shak Clips: consent and YouTube disclosure rules, phone recording steps, commercial-OK zero-shot engines, quality checks, sample storage and revocation."
---

# Cloning the owner's own voice, responsibly

Use when the owner asks for narration in their own voice, or when a cloning engine comes up for a monetized channel.
Legend: **[V]** = read on an official page or repo (see Sources). **[H]** = heuristic, unverified.
The owner's own voice is the most realistic option available and the cheapest to license, because the owner owns it.
Engine licences and CPU feasibility are `tts-engine-evaluation`; the audio chain is `tts-voice-mastering`.

## 1. The rules, before any recording
1. **Only the owner's voice.** Never clone, fine-tune on, or approximate anyone else: not a family member, not a
   YouTuber, not a celebrity, not a voice "that sounds like" someone. No exceptions for a test or a joke.
2. **Written consent from the owner, even for themselves.** One line in the project, dated: who, what the voice may be
   used for, and that it may be withdrawn. It is the record that the sample was not taken from somewhere else.
3. **Revocable.** If the owner withdraws consent, stop using the model, delete the sample and the embeddings, and note
   the date. Already-published videos stay up unless the owner asks otherwise.
4. **No other voice in the reference recording.** A clean solo read, no background TV, no family audible.
5. **A cloned voice is not a free pass on content.** Everything the voice says is still the channel's statement.

## 2. YouTube disclosure: what is and is not required **[V]**
- Cloning **your own voice for voice-overs or dubs is explicitly listed as exempt** from the altered-or-synthetic-content
  disclosure. So the owner narrating in a clone of their own voice does not need the label **[V]**.
- Disclosure **is** required for realistic content that makes a real person appear to say something they did not say,
  alters footage of a real event, or shows a realistic scene that did not happen **[V]**.
- Non-realistic and animated content is exempt, which is what a stick-figure explainer is **[V]**.
- Labels appear on the player for photorealistic or AI-music content, and in the expanded description for non-music AI
  audio or animated content **[V]**.
- A person can ask YouTube to remove realistic synthetic audio of themselves; reviewers weigh whether viewers were told
  it was synthetic, whether the person is uniquely identifiable, and whether it is realistic **[V]**. Likeness detection
  covers faces today, with audio planned for 2026 **[V]**.
- **House rule anyway [H]:** put one line in every description - *"Narration is a synthetic voice built from the
  channel owner's own recordings."* It costs nothing, it is true, and it removes the argument entirely. Tick the
  Studio altered-content box whenever you are unsure; an unnecessary label has never hurt a channel.

## 3. Recording the reference on a phone (exact steps)
Target: **60-180 seconds** of clean solo speech. More is not better; clean is better.

| Step | Do this |
|---|---|
| Room | smallest carpeted room with soft furnishings; a clothes-filled wardrobe or a bed with pillows around works. Avoid kitchens, bathrooms, bare rooms, anything with a hard echo |
| Time | when the street and the house are quiet; turn off fans, AC, fridge if possible, and anything with a hum |
| Phone | airplane mode, notifications off, remove the case if it rattles. Hold or mount it, do not rest it on a hard desk |
| Distance | **15-20 cm** (a hand's width) from the mouth, slightly **off to the side** so breath does not hit the mic **[H]** |
| App | iOS Voice Memos with Audio Quality set to **Lossless** in Settings (not the default compressed mode) **[H]**; Android: any recorder that writes WAV or FLAC, 48 kHz, 16-bit or better **[H]** |
| Settings | no noise reduction, no "voice enhancement", no auto-gain if it can be turned off; these smear the voice the model needs to copy **[H]** |
| Format | **WAV or FLAC, 48 kHz, mono.** Never record the reference as MP3, m4a or a voice-note codec **[H]** |
| What to read | the owner's own narration style: read 2-3 paragraphs from an existing Shak Clips script at normal narration pace, plus two questions and one short sentence. Not a poem, not a list of words |
| Delivery | the voice the channel should have: calm, level, unhurried. The clone copies the mood of the reference, so a tired read makes a tired channel voice |
| Takes | record 3 takes of the same text, keep the best; do not splice takes together |
| Do not | cough, laugh, slap the desk, let a chair creak, or stop and restart mid-sentence |

Afterwards, before using it: `ffmpeg -i ref.wav -af ebur128=peak=true -f null -` and
`ffmpeg -i ref.wav -af astats -f null -`.

## 4. Reference quality gate (reject and re-record if any line fails)
| Check | Pass | Why |
|---|---|---|
| Duration | 60-180 s of speech | enough for zero-shot, short enough to stay clean |
| Peak | -6 to -1.5 dBFS, no samples at full scale | clipping cannot be undone and the clone copies it |
| Noise floor | at least **45 dB below** the speech level (measure a 2 s silent pause) | a noisy reference clones the noise |
| Hum | no spike at 50/60 Hz or its harmonics | mains hum follows the clone into every render |
| Room | clap once: no audible ring or slap tail | reverb in a reference cannot be removed |
| Content | one voice only, no music, no other speaker | a second voice can end up blended into the clone |
| Sibilance | no distorted or spitty "s" | a plosive-damaged reference needs a new take, not a de-esser |
Do **not** "fix" a reference with noise reduction, EQ or a de-esser before cloning. Re-record instead: processing
artefacts become part of the cloned voice **[H]**.

## 5. Commercial-OK zero-shot engines, and what each needs **[V]**
| Engine | Weights licence | Reference needed | Runs where | Notes |
|---|---|---|---|---|
| **Chatterbox Nano** (Resemble) | MIT, code MIT | 10 s+ | CPU: "3x faster than realtime on 8 cores" | best CPU option; **every output carries a Perth watermark**; repo retired and unmaintained since Aug 2026 |
| **Chatterbox Turbo** | MIT, code MIT | ~5 s **[H]** | GPU in practice **[H]** | 350M, paralinguistic tags; same watermark |
| **Kitten TTS 2** | Stellon Labs Community License: commercial free **until $1M annual revenue or cumulative funding**, attribution required | 5-30 s, single speaker | CPU (GGUF via a llama.cpp fork) | re-read the licence before the channel nears that revenue |
| **StyleTTS 2** | custom: you must tell listeners the speech is synthesized unless you have permission for the voice - the owner's own voice *is* that permission | reference clip | CPU slow **[H]**; needs a GPL phonemizer kept out of the repo | |
| **Kyutai TTS** | weights CC-BY 4.0, but cloning is limited to **pre-computed embeddings** from their voice repo | cannot use an arbitrary new voice | GPU examples | so it cannot clone the owner at all |
| **F5-TTS** | **CC-BY-NC: disqualified** | - | - | non-commercial weights, monetized channel |
| **XTTS-v2** | **Coqui Public Model License, non-commercial: disqualified** | - | - | "no direct or indirect payment" |
Kokoro cannot clone: it has a fixed voice bank **[V]**. So cloning always means a second engine, which means
`tts-engine-evaluation`'s two gates first, and remember this shell reaches **github.com only** - Hugging Face weights
have to be fetched by the owner and dropped into a new empty directory under `/home/claude/untrusted/`.

## 6. Quality checks on the cloned voice
1. **A/B against the real thing.** Render the same 45-60 s script with the clone and have the owner read it live. Both
   through `engine/voice.sh` and the `tts-voice-mastering` tail, both at -25.0 LUFS, shuffled and unlabelled.
2. **Run `tts-artifact-qa` unchanged.** A clone fails differently from Kokoro: watch checks 3 (metallic sentences),
   4 (cut endings) and 9 (pitch monotony), and compare the clone's median F0 against the reference's.
3. **Identity drift.** Render the same paragraph 5 times. If the owner can hear it is "a different person" between
   takes, the reference is too short or too varied.
4. **The phone-speaker check** from `tts-voice-mastering`: pass is at most 3.5 LU loss.
5. **The 60-second listen** from `tts-artifact-qa`, on phone earbuds.
6. Ship a pilot on **one** long video, keep Kokoro configured as the fallback, and read the comments for a week before
   switching the daily run.

## 7. Storing and protecting the sample
- One directory, outside the published repo, listed in `.gitignore`: **the reference recording never goes into git** and
  never into a public repo, a Drive link, a Discord message or an issue.
- Keep exactly what you need: the chosen take, the licence/consent note, and any derived embeddings. Delete the other takes.
- Name it with the date and a version (`ref_voice_2026-11-11_v1.wav`) and record in the project log: date, device, room,
  duration, and which engine it was used with.
- Treat the embedding like the recording: it reconstructs the voice, so it is the same secret.
- Never upload the sample to a third-party cloning service or API to "test" it. A local engine with a licence you have
  read is the whole point.
- On withdrawal of consent: delete the recording, the embeddings and any cached model files, note the date, and revert
  the pipeline to Kokoro.

## 8. Disclosure wording to reuse
- Description line: *"Narration uses a synthetic voice created from the channel owner's own voice recordings."*
- If a video ever includes any synthetic audio of someone else, it does not ship. There is no wording for that.
- Pinned-comment answer: *"Yes, the voice is synthesized. It is built from my own recordings, not anyone else's, and I
  write every script."*
- Keep one line in the project: who consented, when, for what, and that it can be withdrawn.

## Sources
- YouTube altered or synthetic content disclosure, including the own-voice exemption and the exempt categories: https://support.google.com/youtube/answer/14328491
- YouTube privacy guidelines, simulated-voice complaints and how they are reviewed: https://support.google.com/youtube/answer/7671399
- Likeness detection, faces now and audio planned for 2026: https://support.google.com/youtube/answer/16440338
- Chatterbox: https://github.com/resemble-ai/chatterbox, https://huggingface.co/ResembleAI/chatterbox-nano, https://www.resemble.ai/learn/models/chatterbox-nano
- Kitten TTS 2 licence: https://huggingface.co/KittenML/kitten-tts-2 and https://github.com/KittenML/KittenTTS
- StyleTTS 2 pre-trained model terms: https://github.com/yl4579/StyleTTS2
- Kyutai TTS weights and voice-embedding licences: https://huggingface.co/kyutai/tts-1.6b-en_fr and https://huggingface.co/kyutai/tts-voices
- F5-TTS (CC-BY-NC weights): https://github.com/SWivid/F5-TTS ; XTTS-v2 licence: https://coqui.ai/cpml
- Kokoro (fixed voice bank, Apache-2.0): https://huggingface.co/hexgrad/Kokoro-82M
- ffmpeg measurement filters: https://ffmpeg.org/ffmpeg-filters.html
