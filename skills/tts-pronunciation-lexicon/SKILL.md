---
name: tts-pronunciation-lexicon
description: Build and grow the Shak Clips pronunciation lexicon for Kokoro. The script.json pron field, espeak IPA overrides, acronyms, numbers and units, a listen test loop, and 40 checked starter entries.
---

# TTS pronunciation lexicon

Use when a script contains a name, acronym, number, unit or foreign word — i.e. on every video, before synthesis.

Legend: **[V]** verified on an official source or run locally through espeak-ng 1.53.0 / Kokoro v1.0 · **[H]** heuristic.

## 1. The one override mechanism that works here

`script.json` carries a `"pron"` map of word → IPA. `kokoro_tts.py` loads it into `PRON` and substitutes the IPA
for whole-word matches before phonemizing the rest with espeak. **[V]** This is the only override that works.

```json
{"pron": {"Nvidia": "ɛnvˈɪdiə", "Nvidia's": "ɛnvˈɪdiəz", "Kuiper": "kˈaɪpɚ"}}
```

| Mechanism | Works here? | Evidence |
|---|---|---|
| `script.json` `"pron"` | **Yes** | 40/40 starter entries substituted correctly in the phonemized output **[V]** |
| misaki inline `[Kuiper](/kˈaɪpɚ/)` | **No** | The pipeline uses espeak directly, not misaki. Rendered literally as "kuiper slash kay stress a smallcap I pee shwa hook slash" **[V]** |
| misaki stress links `[word](+1)`, `[word](-0.5)` | **No** | Same reason. The syntax is real in `hexgrad/misaki` (`LINK_REGEX`, integer and ±0.5 features) but misaki is not in this pipeline **[V]** |
| espeak `[[kirshenbaum]]` input | Yes, but avoid | `[[b'i:t@ldZu:z]]` → `bˈiːɾəldʒuːz` **[V]**. Mixes a second notation into the script; use `"pron"` IPA instead |
| Phonetic respelling in the voiced text | Yes, last resort | `wah way` → `wˈɑː wˈeɪ` **[V]**. Breaks captions, so keep `display_sentences` (see video-editing-polish) |

Rules: match the exact surface form — add a separate entry for each inflection (`Nvidia`, `Nvidia's`). Longest key
wins, so `Nvidia's` is safe alongside `Nvidia`. **[V]** Only characters in Kokoro's 114-symbol vocab survive; all 40
entries below were checked clean. **[V]**

## 2. Finding out what espeak will do

```bash
/home/claude/tts/espeak/bin/espeak-ng -q --ipa  -v en-us "Betelgeuse"   # bˈiːɾəldʒˌuːs
/home/claude/tts/espeak/bin/espeak-ng -q --ipa=1 -v en-us "Betelgeuse"  # phoneme-separated, for editing
/home/claude/tts/espeak/bin/espeak-ng -q -x    -v en-us "Betelgeuse"    # mnemonics
```
`--ipa` writes IPA; `-x` writes mnemonics; `-q` suppresses audio. **[V]** espeak's own symbols all sit inside
Kokoro's vocab (`oʊ eɪ aɪ aʊ ɔɪ dʒ tʃ ɚ ɜː ɾ ː ᵻ ɐ`), so an espeak-shaped IPA string is a valid `"pron"` value even
though Kokoro trained on misaki's alphabet (`O A I W Y ʤ ʧ əɹ ɜɹ`). **[V]** Measured: converting a whole paragraph to
the misaki alphabet changed duration, median F0 and pitch spread by **under 1%**, so do not bother converting. **[V]**

## 3. Acronyms: letters or word

espeak reads an all-caps token letter by letter when it has no dictionary entry, and as a word when it does. **[V]**

| Want | Write it as | Checked output |
|---|---|---|
| Letters: NASA as a word | leave `NASA` | `nˈæsɐ` ✓ **[V]** |
| Letters: ESA, GDP, FBI, CEO, TSMC | leave as caps | `ˌiːˌɛsˈeɪ`, `dʒˌiːdˌiːpˈiː`, `ˌɛfbˌiːˈaɪ`, `sˌiːˌiːˈoʊ`, `tˌiːˌɛsˌɛmsˈiː` ✓ **[V]** |
| FAQ as letters | **override** | espeak says `fˈæk` — wrong. Use `ˌɛfˌeɪkjˈuː` **[V]** |
| GIF, SCOTUS, LIDAR, NATO as words | leave as caps | `ɡˈɪf`, `skˈoʊɾəs`, `lˈaɪdɑːɹ`, `nˈeɪɾoʊ` ✓ **[V]** |
| Possessive acronym | add its own entry | `ESA's` → `ˌiːˌɛsˈeɪz` ✓ **[V]** |

Never write an acronym in caps for *emphasis* — it will be spelled out. (Same rule as tts-script-writing.)

## 4. Numbers, dates and units — spell them in the text, not in `pron`

tts-script-writing already requires numbers as words. These checks show why that rule is non-negotiable: **[V]**

| Written | espeak says | Problem |
|---|---|---|
| `$4.2 billion` | "dollar four point two billion" | currency read **before** the number |
| `1,250 km` | "one thousand two hundred fifty kay em" | unit spelled as letters |
| `-40°C` | "forty degrees C" | **the minus sign is silently dropped** — a factual error on screen |
| `2026-2027` | "two thousand twenty six dash two thousand twenty seven" | "dash" voiced |
| `0.5%`, `3rd`, `21st` | "zero point five percent", "third", "twenty first" | correct, but write "half a percent" for the ear **[H]** |
| `1963` | "one thousand nine hundred sixty three" | write `nineteen sixty-three` |

So: write `four point two billion dollars`, `twelve hundred fifty kilometers`, `minus forty degrees Celsius`,
`twenty twenty-six to twenty twenty-seven`. Keep the exact digits in the `labels` entries for the on-screen text.

## 5. Starter lexicon — 40 entries, every one checked

All 40 are in-vocab and verified to substitute through the pipeline's `PRON` path. **[V]** Entries marked ✓ are
espeak's own output kept as a lock against a future espeak upgrade; the rest are corrections to a wrong reading.

**Tech and companies** — `Nvidia` `ɛnvˈɪdiə` (espeak doubled the stress) · `Huawei` `hwˈɑːwˈeɪ` (was "hyoo-a-way")
· `Xiaomi` `ʃˈaʊmi` (was "zy-a-oh-mee") · `Qualcomm` `kwˈɑːlkɑːm` ✓ · `Nadella` `nədˈɛlə` (was `neɪdˈɛlə`)
· `Elon` `ˈiːlɑːn` (was `ᵻlˈɑːn`) · `Huang` `hwˈɑːŋ` ✓ · `Adidas` `ədˈiːdəs` (espeak gave the UK stress)
· `FAQ` `ˌɛfˌeɪkjˈuː` (was `fˈæk`) · `Hyundai` `hˈʌndeɪ` ✓

**Space** — `Uranus` `jˈʊɹənəs` (was `jˈʊɹɹænəs`) · `Io` `ˈaɪoʊ` (was "ee-oh") · `Europa` `jʊɹˈoʊpə` (doubled r)
· `Enceladus` `ɛnsˈɛlədəs` (was `ɛnsˈɛlædəs`) · `Betelgeuse` `bˈiːɾəldʒˌuːz` (ended voiceless) · `Kuiper` `kˈaɪpɚ`
(was "kwy-per") · `Oort` `ˈɔːɹt` (was "oo-uht") · `Chandrasekhar` `tʃˌʌndɹəsˈeɪkɑːɹ` · `Roscosmos` `ɹɑːskˈɑːzmoʊs`
· `Sputnik` `spˈʊtnɪk` (was `spˈʌtnɪk`)

**History** — `Copernicus` `kəpˈɜːnɪkəs` (stress was on syllable 1) · `Ptolemy` `tˈɑːləmi` (was `tˈoʊlmi`)
· `Charlemagne` `ʃˈɑːɹləmˌeɪn` (was "charly-magny") · `Versailles` `vɛɹsˈaɪ` (final s was voiced)
· `Thucydides` `θuːsˈɪdɪdiːz` · `Hatshepsut` `hætʃˈɛpsʊt` · `Tutankhamun` `tˌuːtənkˈɑːmən` · `Pompeii` `pɑːmpˈeɪ`
(extra vowel) · `Nagasaki` `nˌɑːɡəsˈɑːki` (flat a) · `Chernobyl` `tʃɚnˈoʊbəl` (was `tʃˈɜːnəbˌɪl`)
· `Boudica` `bˈuːdɪkə` ✓ · `Xerxes` `zˈɜːksᵻz` ✓ · `Worcestershire` `wˈʊstɚʃɚ` ✓ — espeak gets this one right

**Places and people** — `Kyiv` `kˈiːv` (was "kyiv") · `Reykjavik` `ɹˈeɪkjəvˌiːk` (was "rake-jav-ick")
· `Tiananmen` `tjˌɛnənmˈɛn` · `Qatar` `kˈɑːtɑːɹ` (flapped t) · `Nguyen` `wˈɪn` (was `nˈuːjɛn`)
· `Putin` `pˈuːtɪn` (was "pyoo-tin") · `Fermi` `fˈɛɹmi` (was "fur-mee")

Already in the repo's nvidia example and worth keeping: `Nasdaq` `nˈæzdæk`, `Ms.` `mˈɪz`, `AI` `ˌeɪˈaɪ`,
`CEO` `sˌiːˌiːˈoʊ`. **[V]**

## 6. The test loop — isolate, carrier, listen

Never render a word on its own to judge it: under 10–20 tokens Kokoro's own page says voices are weak **[V]**, and a
bare word measured 1.05 s with a 7.3-semitone spread versus 1.23 s and 10.5 st in context. **[V]** Use a carrier:

```bash
# one word, in a carrier sentence that clears the token floor (~50 tokens)
echo '{"pron":{"Kuiper":"kˈaɪpɚ"},"paragraphs":["They called it Kuiper, and nobody forgot the name."]}' > w.json
THREADS=2 nice python3 /home/claude/shakclips-studio/tts/kokoro_tts.py w.json lab/ am_michael 1.0
```
1. Run espeak on the word first (section 2). If the IPA already looks right, add a ✓ lock entry anyway.
2. Write the candidate IPA into `"pron"`, render the carrier, listen.
3. Still wrong? Edit one symbol at a time — stress mark (`ˈ` `ˌ`) first, then the vowel, then the consonant.
4. Still wrong after three tries? Fall back to a phonetic respelling in the voiced text plus a `display_sentences`
   entry with the real spelling, so captions and the description stay correct.
5. Commit the entry to the channel lexicon with the date and the video it came from. **One lexicon, append-only.**

## 7. Growing it, one video at a time

- [ ] Before synthesis, list every proper noun, acronym, unit and foreign word in the script.
- [ ] Any word not already in the channel lexicon gets an espeak check; add a ✓ lock or a correction.
- [ ] Re-use the channel lexicon as the base of every new `script.json` `"pron"` — never start empty.
- [ ] Add inflections you actually use: possessive, plural, verb forms.
- [ ] After upload, scan comments for "it's pronounced…" and fix the entry the same week. **[H]**
- [ ] If espeak-ng is ever rebuilt, re-run the whole lexicon through section 6; ✓ lock entries catch regressions.

## Sources
- https://github.com/espeak-ng/espeak-ng
- https://man.archlinux.org/man/espeak-ng.1.en
- https://github.com/hexgrad/misaki
- https://github.com/hexgrad/misaki/blob/main/EN_PHONES.md
- https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
