---
name: youtube-multilanguage-dubbing
description: "Reach non-English viewers: check auto-dubbing, add Kokoro dub tracks and translated titles in Studio, pick languages honestly, fit dubs to sentence timings, QA them and disclose AI voices."
---

# YouTube Multi-language Dubbing (Shak Clips)

Use when deciding whether to localise a video, adding a dubbed audio track or a translated title, or building a Kokoro dub in another language.
Legend: **[V]** = checked on an official page on 2026-11-11 (see Sources). **[H]** = heuristic, source named. **[A]** = a planning assumption to replace with real numbers.

## 0. Blockers and honest expectations
- Your own audio tracks need **advanced features** **[V]**. That's the same verification blocker as `youtube-community-engagement` §0, so do that first.
- At 7 subscribers, language isn't the bottleneck. English packaging and retention are. A dub multiplies what a video already earns, and 0 multiplied is still 0. Dub only evergreen videos that have passed about 1,000 English views **[A]**.
- YouTube says creators who uploaded multi-language audio saw over 25% of watch time come from non-primary-language views **[V]**. That's an average across the creators who use it, not a forecast for us.

## 1. What YouTube offers (as of 2026-11-11)
| Feature | What it does | Limits |
|---|---|---|
| Automatic dubbing **[V]** | YouTube creates AI dubs; it's on by default for eligible creators. Press reports say it reached all creators on 4 Feb 2026 **[H: Social Media Today]** | From English into 20 languages, incl. Spanish, Portuguese, Hindi, French, Italian, Japanese, Bengali, Tamil, Telugu. You can't edit a dub; fix the source instead. Videos over 120 min, with little speech, overly fast speech or copyrighted content are ineligible |
| Your own dub track **[V]** | Upload an audio track per language, on a long video **or a Short** | Desktop Studio only. Audio-only file, "roughly the same length" as the video. Delete any auto-dub for that language first |
| Translated title and description **[V]** | Search can return the video in the viewer's language | Per language, in Studio |
| Localised thumbnails **[V]** | Long-form viewers see the thumbnail that matches their language | Long-form only |
- Viewers **[V]**: audio defaults to the viewer's preferred language (from watch history), and they can switch track in the player. Auto-dubs are marked "auto-dubbed" in the description.
- "Expressive speech" (keeps pitch and intonation) exists for Spanish, Portuguese, Hindi, French, German, Italian and Indonesian **[V]**. Lip sync is experimental, for select channels only **[V]**.

## 2. Step 1 is free: let auto-dubbing run, then measure
1. Studio on a computer → Settings → Channel → Advanced settings → check "Allow automatic dubbing" is ticked **[V]**.
2. In the Studio app: profile → Settings → Automatic dubbing → **Publish manually** **[V]**. Review each dub before it's published (Content → Languages → Audio column), especially "alleged" stories.
3. After 28 days, open Analytics: views and watch time by audio language **[V]**. Log them in `log.md`.
4. Build our own Kokoro dub for a language only if one of these is true:
   - (a) auto-dub doesn't cover that video;
   - (b) it mangles names or terms we can't fix in the source;
   - (c) the language already brings 5% or more of the video's watch time **[A]**.
- Auto may simply sound better. Kokoro's Spanish and Brazilian Portuguese voices have **no published grade**, Hindi voices are C and French is B- **[V]**. Test both on one video with a native listener.

## 3. Choosing languages (honest reasoning)
| Language | For | Against | Kokoro voices **[V]** | Verdict |
|---|---|---|---|---|
| Spanish `es` | Fits the US target (US Spanish speakers plus Latin America) **[H]**; expressive auto-dub | Ungraded voices; needs a paid or volunteer reviewer | ef_dora, em_alex | 1st if a native reviewer is lined up |
| Hindi `hi` | The owner may be able to QA it for free if he reads Hindi; history, science and what-if travel well | Ad rates far below the US: the repo gives finance RPM as $0.50–1.50 in India vs $15–25 in the US **[H: agricidaniel]**; US-news topics don't travel | hf_alpha, hf_beta, hm_omega, hm_psi (C) | 1st if the owner reviews |
| Portuguese `pt-br` | Brazil is a large YouTube market **[H]** | Ungraded voices; needs a reviewer | pf_dora, pm_alex | 2nd |
| French `fr-fr` | Best-graded non-English voice | Only 1 voice, under 11 h of training data **[V]** | ff_siwis (B-) | later |
| Japanese, Mandarin | Big markets | Kokoro needs misaki[ja]/[zh] G2P **[V]**, and our espeak-only setup can't install it (pip is blocked) | — | leave to auto-dub |
- Rule: run **one language at a time for 4 weeks**, on evergreen slots only (Tue history, Thu what-if, Sat top-5). News explainers go stale and are US-specific **[H]**.

## 4. Pipeline: a Kokoro dub as an extra track on the same video
The video file doesn't change, so the dub must fit the English timing. Never re-time the picture for a track.
1. **Freeze.** Copy `$P/script.json` and `$P/voice/timing.json` into `$P/dub/<lang>/` as `en_script.json` and `en_timing.json`.
2. **Translate sentence by sentence**, keeping the sentence count 1:1 (the span check and the engine's `S(i)`/`E(i)` depend on it).
   - Keep the hedges: alleged/reportedly → *presuntamente* (es), *supostamente* (pt), *कथित तौर पर* (hi).
   - Write numbers as words (`tts-script-writing`). Spoken numbers must match the on-screen ones: say "300 millas (unos 480 km)", never just "480 km".
   - No new claims and no new opinions; Shak's take is translated, not rewritten.
3. **Phonemes.** `tts/kokoro_tts.py` calls `phonemize(text)` with the default `en-us`. Patch it to read `KOKORO_LANG` and pass it to `ipa()`; the espeak codes are `es`, `pt-br`, `hi`, `fr-fr`, `it` **[V]**. Test the patch on 3 sentences before a full run.
4. **Voice and speed**: es → em_alex, pt-br → pm_alex, hi → hm_omega (or the female voice). Speed 0.88–1.00. **Never use atempo** (the `shak-voiceover` rule).
5. **Synthesize** paragraph by paragraph with the same script; it writes the dub's own `timing.json`. Spans must equal sentences.
6. **Fit each paragraph** into its English slot, i.e. from the English paragraph's first `S(i)` to the next paragraph's first `S(i)`:
   - Shorter: place it at the English start and pad the end with silence.
   - Longer by up to 6% **[A]**: raise the speed by 0.03 (to 1.00 at most) and re-synthesize.
   - Still longer: shorten the translation by cutting adjectives and merging clauses. Never compress the audio.
   - Accept when every dub sentence starts within ±0.5 s of its English `S(i)` **[A]** and no line lands after its number reveal or quote card.
7. **Assemble** the paragraphs at the English starts (ffmpeg `adelay` + `amix`). Total length = video length ±0.1 s.
8. **Full mix.** The track replaces *all* audio, so rebuild it with the same music and SFX stems, ducking and two-pass loudnorm to −14 LUFS (`video-editing-polish`). Export audio only.
- A separate localised re-upload with translated on-screen text is the wrong tool. YouTube's spam policy names "high volumes of similar content with minimal changes" **[V]**. Use tracks.

## 5. On-screen text
- A track keeps the English on-screen text, so design for it: numbers, maps, icons and dates read in any language. Keep labels at 6 words or fewer.
- Translated subtitles: build an SRT from the translated sentences plus the dub's `timing.json` (the `youtube-seo-metadata` SRT method). Upload it under the same language in Studio → Languages.
- Quote cards keep the speaker's real words in the original language. The narration gives the translation ("en sus palabras…"). Never put translated words on a card as if the person said them.
- Localised thumbnail: translate the 0–3 words with `youtube-thumbnail-design`, same art.

## 6. QA (native speaker when possible)
- [ ] A native speaker listens to the whole dub at 1x: the owner for Hindi if fluent; otherwise a paid reviewer from a freelance marketplace or a trusted bilingual viewer.
- [ ] Every claim matches the English; hedges are kept; nothing is added.
- [ ] Names and places sound right. If not, respell them phonetically in the script and redo the synthesis.
- [ ] Numbers, dates and units match the screen.
- [ ] Spans = sentences, no clipped words, −14 LUFS ±1, true peak ≤ −1.5 dB.
- [ ] Translated title and description make the same promise as the English, and the RESEARCH & SOURCES block is kept.
- **No reviewer, no upload.** Leave auto-dub on for that language instead.

## 7. Upload (owner, desktop Studio, about 5 min per language) [V]
1. Studio → **Languages** (some help pages still say Subtitles) → click the video. Confirm the video language (English) if asked.
2. If an auto-dub exists for the language, delete it under Audio.
3. **Add language** → next to "Dub" click **Add** → Select file → **Publish**.
4. Same language row: Title and description → **Add** → paste → **Publish**. Then add the subtitle file.
5. Log the video, language, voice, reviewer and date in `log.md`.
- To replace a track: Delete next to the language under Audio, then upload again. Trims made to the original carry over to the tracks **[V]**.

## 8. AI-voice disclosure
- YouTube requires disclosure for **realistic** synthetic content, e.g. making a real person appear to say something they didn't **[V]**. Clearly unrealistic animation doesn't need it, and cloning your own voice for dubs is listed as not needing it **[V]**.
- Our stick figures with a generic Kokoro voice usually mean "AI use: No" (our reading, **[H]**). Choose **Yes** (upload → Attributes → AI use **[V]**) if a dub voices a real person's words in the first person or sounds like them.
- House rule anyway: every language's description says "Narration and dubs: AI voice (Kokoro TTS). Translation checked by a native speaker."
- Never clone anyone's voice. For TikTok and Instagram AI labels, see `youtube-repurposing-distribution`.

## 9. Measure, then scale or stop
- Check 28 days after each dub, by audio language **[V]**.
- Scale: if a language brings 5% or more of watch time on 4 of its first 8 dubbed videos **[A]**, dub every evergreen video in it.
- Stop: under 1% after 8 videos **[A]** → stop our own dubs and leave auto-dub on.
- Main cost per dub: the review; synthesis and mixing are free **[H]**.

## Sources
- Multi-language audio: https://support.google.com/youtube/answer/13338784
- Automatic dubbing: https://support.google.com/youtube/answer/15569972 and https://blog.youtube/creator-and-artist-stories/youtube-auto-dubbing-explained/ (15 May 2026)
- Press, auto-dubbing for all creators (4 Feb 2026, not official): https://www.socialmediatoday.com/news/youtube-expands-auto-dubbing-to-all-creators/811375/
- Translate titles and descriptions: https://support.google.com/youtube/answer/6289575
- AI disclosure: https://support.google.com/youtube/answer/14328491
- Spam policy (mass-produced similar content): https://support.google.com/youtube/answer/2801973
- Kokoro voices, grades and G2P: https://huggingface.co/hexgrad/Kokoro-82M/blame/main/VOICES.md. All 54 voices are in our local `voices-v1.0.bin`; the espeak `es`, `hi`, `pt` dictionaries are built.
- RPM heuristic: MIT repo agricidaniel/claude-youtube `references/monetization-guide.md` (Copyright (c) 2025 Daniel Agrici), rewritten.
