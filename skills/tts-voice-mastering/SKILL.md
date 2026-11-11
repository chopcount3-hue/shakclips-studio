---
name: tts-voice-mastering
description: "Master the Kokoro voice stem for Shak Clips with ffmpeg: keep the chosen voice.sh chain, add a tested loudness and limiter tail, room tone, phone-speaker check, and optional A/B variants."
---

# TTS voice mastering (ffmpeg, voice stem only)

Use when the voice stem sounds harsh, thin or uneven, when the mix clips, or before changing anything in `engine/voice.sh`.
Legend: **[V]** = measured here or read on an official doc (see Sources). **[H]** = heuristic, unverified.
Scope: the **voice stem** between `kokoro_tts.py` and `engine/mix.sh`. Voice choice is `tts-voice-casting`; the final
mix, music ducking and the -14 LUFS master are `video-editing-polish`. Never edit `engine/voice.sh` without the owner's say.

## 1. The default is the owner's chain. Do not replace it.
In a blind listen the owner picked **am_michael at speed 1.0 with the current chain** over a warmer alternative
(+2.5 dB low-shelf 180 Hz, -1.5 dB at 320 Hz, -2 dB at 3.2 kHz). That chain is the house sound:
```
highpass=f=70,equalizer=f=3500:t=q:w=1.0:g=2,deesser=i=0.4,
acompressor=threshold=0.18:ratio=2.2:attack=8:release=150:makeup=1.3,
aecho=0.85:0.9:38|67:0.07|0.05,aresample=48000
```
Everything below is **additive**: a tail after this chain, or an A/B the owner may accept or reject. Keep clarity and presence.

## 2. What is and is not harsh (measured, not guessed) **[V]**
Long-term average spectrum of 37 s of am_michael, speech frames only, band energy relative to 60 Hz-12 kHz:

| Band | Raw Kokoro | After the current chain | Chain with the de-esser removed |
|---|---|---|---|
| 60-150 Hz | -6.3 dB | -5.9 dB | -6.3 dB |
| 300-600 Hz | -4.5 dB | -4.4 dB | -4.7 dB |
| 2.5-4.5 kHz | -13.9 dB | **-15.5 dB** | -11.6 dB |
| 4.5-7 kHz | -14.7 dB | **-18.3 dB** | -13.4 dB |
| 7-10 kHz | -21.0 dB | -22.6 dB | -20.1 dB |

So the "+2 dB presence boost" is **not** what makes a Kokoro render edgy: `deesser=i=0.4` removes 3.9 dB more at
4.5-7 kHz than the 3.5 kHz bell adds, and the chain is net *darker* than the raw file. Edge in a Kokoro render is
usually a bad sentence (see `tts-artifact-qa`), not the EQ. Do not "fix" harshness by cutting more treble first.

## 3. The one thing the chain is missing: headroom before the mix **[V]**
`mix.sh` applies `volume=9.5dB` and mixes mono into stereo (a further +6.5 dB of sample peak in the measurement here).
With the current stem, `mix_pre.wav` hit 0 dBFS with 21 clipped samples in 21 s, loudnorm pass 1 measured
`input_tp = +0.05 dBTP`, and the second pass fell back to **dynamic** mode. That is a real defect and it is
inaudible on laptop speakers. Fixing it needs no EQ change.

## 4. The tested tail (add after the chain, before mix.sh) **[V]**
Target the stem at **-25.0 LUFS integrated, true peak <= -11 dBFS**, with a floor of room tone so gaps are not digital silence.
```bash
# 1. measure the chain output
I=$(ffmpeg -hide_banner -i voice/pre.wav -af ebur128 -f null - 2>&1 | awk '/^ +I:/{print $2}' | tail -1)
G=$(python3 -c "print(round(-25.0 - ($I), 2))")
# 2. normalise, limit, add room tone  (THE TESTED STRING)
ffmpeg -v error -y -i voice/pre.wav -filter_complex \
"[0:a]volume=${G}dB,alimiter=limit=-11dB:attack=5:release=60:level=0:latency=1[v];\
anoisesrc=r=48000:c=pink:a=0.0013:seed=7,highpass=f=100,lowpass=f=4000[rt];\
[v][rt]amix=inputs=2:duration=first:normalize=0[o]" -map "[o]" -c:a pcm_s16le voice/voice_proc.wav
```
Measured on three renders (am_michael 19 s and 37 s, af_heart 18 s):

| | am_michael 37 s | af_heart (louder voice) |
|---|---|---|
| Chain output | -25.3 LUFS, peak -5.0 dBFS | -22.0 LUFS, peak -3.7 dBFS |
| After tail | **-25.7 LUFS, LRA 1.7 LU, peak -10.9 dBFS** | -25.2 LUFS, LRA 1.6 LU, peak -10.9 dBFS |
| Limiter work | 8.1% of 5 ms frames > 1 dB GR, 1.3% > 3 dB, max 6.3 dB | 2.0% / 0.2% / max 4.2 dB |
| Latency added | 0.00 ms (`latency=1` compensates, so timing.json stays valid) | 0.00 ms |
| Gap floor | -62 to -76 dBFS (was -240 dBFS, i.e. true silence, in paragraph gaps) | - |
| In `mix_pre.wav` | **0 clipped samples, input_tp -4.41 dBTP, pass 2 ran linear** (was 21 clipped, +0.05, dynamic) | - |
| Final master | I = -13.9 LUFS, TP -2.24 dBFS, passes the house QC | - |

Limiter notes: `level=0` is required or `alimiter` auto-levels back up to 0 dBFS; `-13dB` instead of `-11dB` more than
doubled gain reduction (22.5% of frames > 1 dB) and is too much. Room tone at `a=0.0013` measures about -76 dBFS RMS
after the band-pass **[V]**; raise to `0.0025` only if the owner still hears "dead air" between paragraphs **[H]**.

## 5. Optional A/B variants (offer, never swap in) **[V]**
Render the same 30 s script three ways, send all three unlabelled, keep what the owner picks. Both keep the chain's shape.

| Variant | Change | Measured |
|---|---|---|
| **House** (default) | unchanged | -25.3 LUFS; 2.5-4.5k -15.5 dB; phone-sim loss 3.0 LU |
| **Darker** | add `lowshelf=f=180:g=1` after `highpass`, bell `g=2` -> `g=1` | -25.1 LUFS; 60-150 Hz -5.5 dB; 2.5-4.5k -16.4 dB; phone-sim loss 3.3 LU |
| **Brighter** | bell `g=2` -> `g=3`, append `highshelf=f=6000:g=1` | -25.2 LUFS; 2.5-4.5k -14.7 dB; 7-10k -22.0 dB; phone-sim loss 2.9 LU |

The rejected warm alternative measured a **3.7 LU** phone-sim loss, the worst of the four: on a phone speaker the
owner's chain is the most intelligible of the set. Say that if warmth comes up again.

## 6. Phone-speaker check (run on every long video) **[V]**
A phone speaker throws away everything under about 300 Hz, so check what is left:
```bash
ffmpeg -v error -y -i voice/voice_proc.wav -af "highpass=f=300:poles=2,highpass=f=300:poles=2,lowpass=f=8000" voice/phone.wav
ffmpeg -hide_banner -i voice/phone.wav -af ebur128 -f null - 2>&1 | awk '/^ +I:/{print}' | tail -1
```
Pass: the filtered file is **no more than 3.5 LU quieter** than the stem (house chain measures 3.0 LU). More than that
means the body of the voice sits too low to survive a phone, which is a warmth problem, not a presence problem.

## 7. Stem QC gate (all must pass before `mix.sh`)
- [ ] I = -25.0 +-0.7 LUFS, LRA <= 3 LU, true peak <= -11 dBFS (`ebur128=peak=true`).
- [ ] Limiter gain reduction over 3 dB on under 3% of frames; no frame over 8 dB.
- [ ] `voice_proc.wav` duration equals `timing.json` total +-0.02 s (any tail that shifts time breaks caption sync).
- [ ] No digital silence: every paragraph gap sits between -80 and -55 dBFS.
- [ ] Phone-sim loss <= 3.5 LU; `mix_pre.wav` has zero samples at full scale and loudnorm pass 2 reports `linear`.
- [ ] 48 kHz, mono, `pcm_s16le`; ffmpeg exited 0 and wrote to a temp name first.

## 8. Things not to do
- No `atempo`, `rubberband` or any time-stretch on TTS audio: it is the original "not smooth" bug (`shak-voiceover`).
- No `crystalizer`, `aexciter`, `dialoguenhance` or `speechnorm` on the stem. They chase loudness and add the metallic
  edge this skill exists to avoid **[H]**.
- No second compressor. `acompressor` plus `alimiter` is already two stages; the mix adds ducking on top.
- No reverb beyond the existing `aecho` tail. A soothing read comes from the script and the voice, not from a room.
- Do not run `loudnorm` on the stem. One loudness normalisation happens in `mix.sh`, on the full mix.

## Sources
- ffmpeg filter reference (`alimiter level`, `anoisesrc`, `deesser`, `acompressor`, `ebur128`): https://ffmpeg.org/ffmpeg-filters.html
- EBU R 128 loudness: https://tech.ebu.ch/docs/r/r128.pdf
- YouTube loudness normalisation behaviour: https://support.google.com/youtube/answer/6375112
- Kokoro-82M (Apache-2.0 weights, 24 kHz output): https://huggingface.co/hexgrad/Kokoro-82M
- In-repo: `engine/voice.sh`, `engine/mix.sh`, `tts/kokoro_tts.py`, `skills/video-editing-polish/SKILL.md`
- All numbers in sections 2-6 were measured with ffmpeg 6.1.1 and numpy on renders made by `tts/kokoro_tts.py`.
